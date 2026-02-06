import { Injectable, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import type { Model } from 'mongoose';
import { Types } from 'mongoose';
import { Kenz } from './entities/kenz.entity';
import { KenzReport } from './entities/kenz-report.entity';
import { KenzFavorite } from './entities/kenz-favorite.entity';
import { KenzBoost, KenzBoostType, KenzBoostStatus } from './entities/kenz-boost.entity';
import type CreateKenzDto from './dto/create-kenz.dto';
import type UpdateKenzDto from './dto/update-kenz.dto';
import type ReportKenzDto from './dto/report-kenz.dto';
import type CreateKenzBoostDto from './dto/create-kenz-boost.dto';

const ARCHIVE_DAYS = 90;

/** قيم الترتيب المدعومة لـ GET /kenz */
export type KenzSortOption = 'newest' | 'price_asc' | 'price_desc' | 'views_desc';

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

@Injectable()
export class KenzService {
  constructor(
    @InjectModel(Kenz.name) private readonly model: Model<Kenz>,
    @InjectModel(KenzReport.name) private readonly reportModel: Model<KenzReport>,
    @InjectModel(KenzFavorite.name) private readonly favoriteModel: Model<KenzFavorite>,
    @InjectModel(KenzBoost.name) private readonly boostModel: Model<KenzBoost>,
  ) {}

  async create(dto: CreateKenzDto) {
    const doc = new this.model(dto);
    return await doc.save();
  }

  async findAll(opts: { cursor?: string }) {
    const limit = 25;
    const query = this.model.find().sort({ _id: -1 }).limit(limit);
    if (opts?.cursor) {
      query.where('_id').lt(Number(opts.cursor));
    }
    const items = await query.exec();
    const nextCursor =
      items.length === limit ? String(items[items.length - 1]._id) : null;
    return { items, nextCursor };
  }

  async findOne(id: string) {
    const doc = await this.model
      .findByIdAndUpdate(id, { $inc: { viewCount: 1 } }, { new: true })
      .populate('ownerId', 'name email phone')
      .populate('postedOnBehalfOfUserId', 'name phone')
      .exec();
    if (!doc) throw new NotFoundException('Not found');
    const boostMap = await this.getActiveBoostsForKenzIds([id]);
    const boost = boostMap.get(id);
    const obj = doc.toObject ? doc.toObject() : { ...doc };
    obj.isBoosted = !!boost;
    obj.boostType = boost?.boostType ?? null;
    return obj;
  }

  async list(
    filters: any = {},
    cursor?: string,
    limit: number = 25,
    sortOption?: KenzSortOption,
  ) {
    const sort: KenzSortOption = sortOption ?? filters.sort ?? 'newest';
    const query = this.model.find()
      .populate('ownerId', 'name email phone')
      .populate('postedOnBehalfOfUserId', 'name phone');

    // استبعاد المؤرشفة (إعلانات مباعة أقدم من 90 يوم) من القائمة الافتراضية
    if (filters.includeArchived !== true) {
      query.where({ $or: [{ archivedAt: { $exists: false } }, { archivedAt: null }] });
    }

    // Search: title, description, keywords (case-insensitive)
    if (filters.search && String(filters.search).trim()) {
      const q = escapeRegex(String(filters.search).trim());
      const regex = new RegExp(q, 'i');
      query.where({
        $or: [
          { title: regex },
          { description: regex },
          { keywords: { $elemMatch: { $regex: q, $options: 'i' } } },
        ],
      });
    }

    // Apply filters
    if (filters.status) query.where('status').equals(filters.status);
    if (filters.ownerId) query.where('ownerId').equals(filters.ownerId);
    if (filters.category) query.where('category').equals(filters.category);
    if (filters.categoryId) query.where('categoryId').equals(filters.categoryId);
    if (filters.city) query.where('city').equals(filters.city);
    if (filters.condition) query.where('condition').equals(filters.condition);
    if (filters.deliveryOption) {
      if (filters.deliveryOption === 'delivery') {
        query.where('deliveryOption').in(['delivery', 'both']);
      } else if (filters.deliveryOption === 'meetup') {
        query.where('deliveryOption').in(['meetup', 'both']);
      } else {
        query.where('deliveryOption').equals(filters.deliveryOption);
      }
    }
    if (filters.priceMin != null) query.where('price').gte(filters.priceMin);
    if (filters.priceMax != null) query.where('price').lte(filters.priceMax);
    if (filters.createdAfter)
      query.where('createdAt').gte(filters.createdAfter);
    if (filters.createdBefore)
      query.where('createdAt').lte(filters.createdBefore);

    // Sort
    switch (sort) {
      case 'price_asc':
        query.sort({ price: 1, _id: 1 });
        break;
      case 'price_desc':
        query.sort({ price: -1, _id: -1 });
        break;
      case 'views_desc':
        query.sort({ viewCount: -1, _id: -1 });
        break;
      default:
        query.sort({ _id: -1 });
    }

    if (cursor) {
      try {
        query.where('_id').lt(new Types.ObjectId(cursor));
      } catch {
        // invalid cursor ignored
      }
    }

    query.limit(limit + 1);

    const items = await query.exec();
    const hasNextPage = items.length > limit;
    const resultItems = hasNextPage ? items.slice(0, -1) : items;

    const boostMap = await this.getActiveBoostsForKenzIds(
      resultItems.map((i) => String(i._id)),
    );
    const boostOrder: Record<string, number> = {
      [KenzBoostType.TOP]: 0,
      [KenzBoostType.PIN]: 1,
      [KenzBoostType.HIGHLIGHT]: 2,
    };
    const toPlain = (doc: any) => {
      const obj = doc.toObject ? doc.toObject() : { ...doc };
      const boost = boostMap.get(String(obj._id));
      obj.isBoosted = !!boost;
      obj.boostType = boost?.boostType ?? null;
      return obj;
    };
    const enriched = resultItems.map(toPlain);
    enriched.sort((a, b) => {
      const aOrder = a.isBoosted ? boostOrder[a.boostType] ?? 3 : 4;
      const bOrder = b.isBoosted ? boostOrder[b.boostType] ?? 3 : 4;
      if (aOrder !== bOrder) return aOrder - bOrder;
      return 0;
    });

    const nextCursor = hasNextPage
      ? String(enriched[enriched.length - 1]._id)
      : null;

    return { items: enriched, nextCursor };
  }

  /** خريطة الترويج النشط الحالي لكل إعلان (لدمج في القائمة) */
  async getActiveBoostsForKenzIds(kenzIds: string[]): Promise<Map<string, { boostType: string }>> {
    if (!kenzIds.length) return new Map();
    const now = new Date();
    const boosts = await this.boostModel
      .find({
        kenzId: { $in: kenzIds.map((id) => new Types.ObjectId(id)) },
        status: KenzBoostStatus.ACTIVE,
        startDate: { $lte: now },
        endDate: { $gte: now },
      })
      .sort({ boostType: 1 })
      .lean()
      .exec();
    const map = new Map<string, { boostType: string }>();
    for (const b of boosts) {
      const id = String(b.kenzId);
      if (!map.has(id)) map.set(id, { boostType: (b as any).boostType });
    }
    return map;
  }

  /** إنشاء ترويج إعلان (للأدمن) */
  async createBoost(dto: CreateKenzBoostDto, createdBy?: string) {
    const kenz = await this.model.findById(dto.kenzId).exec();
    if (!kenz) throw new NotFoundException('Kenz ad not found');
    const start = new Date(dto.startDate);
    const end = new Date(dto.endDate);
    if (end <= start) throw new ConflictException('endDate must be after startDate');
    const boost = new this.boostModel({
      kenzId: new Types.ObjectId(dto.kenzId),
      startDate: start,
      endDate: end,
      boostType: dto.boostType ?? KenzBoostType.HIGHLIGHT,
      createdBy: createdBy ? new Types.ObjectId(createdBy) : undefined,
      status: KenzBoostStatus.ACTIVE,
    });
    await boost.save();
    return boost;
  }

  /** إلغاء ترويج (للأدمن) */
  async cancelBoost(boostId: string) {
    const boost = await this.boostModel
      .findByIdAndUpdate(
        boostId,
        { status: KenzBoostStatus.CANCELLED },
        { new: true },
      )
      .exec();
    if (!boost) throw new NotFoundException('Boost not found');
    return { success: true, boost };
  }

  /** قائمة الترويجات (للأدمن) مع فلترة */
  async listBoosts(
    filters: { status?: string; kenzId?: string } = {},
    cursor?: string,
    limit: number = 25,
  ) {
    const query = this.boostModel
      .find()
      .populate('kenzId', 'title status ownerId')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });
    if (filters.status) query.where('status').equals(filters.status);
    if (filters.kenzId) query.where('kenzId').equals(new Types.ObjectId(filters.kenzId));
    if (cursor) {
      try {
        query.where('_id').lt(new Types.ObjectId(cursor));
      } catch {
        // ignore
      }
    }
    query.limit(limit + 1);
    const items = await query.exec();
    const hasNext = items.length > limit;
    const list = hasNext ? items.slice(0, -1) : items;
    const nextCursor = hasNext ? String(list[list.length - 1]._id) : null;
    return { items: list, nextCursor };
  }

  async getStats() {
    const stats = await this.model.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const result: Record<string, number> = {
      total: 0,
      draft: 0,
      pending: 0,
      confirmed: 0,
      completed: 0,
      cancelled: 0,
    };

    stats.forEach((stat) => {
      result.total += stat.count;
      result[stat._id] = stat.count;
    });

    return result;
  }

  async update(id: string, dto: UpdateKenzDto) {
    const doc = await this.model
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();
    if (!doc) throw new NotFoundException('Not found');
    return doc;
  }

  async remove(id: string) {
    const doc = await this.model.findByIdAndDelete(id).exec();
    if (!doc) throw new NotFoundException('Not found');
    return { ok: true };
  }

  /** تعليم الإعلان كمباع (للمالك فقط) */
  async markAsSold(id: string, userId: string) {
    const doc = await this.model.findById(id).exec();
    if (!doc) throw new NotFoundException('Not found');
    const ownerStr = String(doc.ownerId);
    if (ownerStr !== userId) throw new ForbiddenException('Only the owner can mark this ad as sold');
    const updated = await this.model
      .findByIdAndUpdate(
        id,
        { status: 'completed' as const, soldAt: new Date() },
        { new: true },
      )
      .populate('ownerId', 'name email phone')
      .exec();
    return updated;
  }

  /** الإبلاغ عن إعلان (مستخدم مصادق، مرة واحدة لكل إعلان) */
  async report(kenzId: string, reporterId: string, dto: ReportKenzDto) {
    const kenz = await this.model.findById(kenzId).exec();
    if (!kenz) throw new NotFoundException('Kenz ad not found');
    const existing = await this.reportModel
      .findOne({ kenzId: new Types.ObjectId(kenzId), reporterId: new Types.ObjectId(reporterId) })
      .exec();
    if (existing) throw new ConflictException('You have already reported this ad');
    const report = new this.reportModel({
      kenzId: new Types.ObjectId(kenzId),
      reporterId: new Types.ObjectId(reporterId),
      reason: dto.reason,
      notes: dto.notes,
    });
    await report.save();
    return { success: true, message: 'Report submitted', reportId: report._id };
  }

  /**
   * أرشفة الإعلانات المباعة الأقدم من 90 يوماً (يُستدعى يومياً عبر Cron)
   */
  async archiveOldCompleted(): Promise<{ archived: number }> {
    const cutoff = new Date(Date.now() - ARCHIVE_DAYS * 24 * 60 * 60 * 1000);
    const result = await this.model.updateMany(
      {
        status: 'completed',
        archivedAt: { $in: [null, undefined] },
        $or: [
          { soldAt: { $lt: cutoff } },
          { soldAt: { $exists: false }, updatedAt: { $lt: cutoff } },
        ],
      },
      { $set: { archivedAt: new Date() } },
    );
    return { archived: result.modifiedCount };
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async archiveOldCompletedJob() {
    try {
      const { archived } = await this.archiveOldCompleted();
      if (archived > 0) {
        // يمكن تسجيل النتيجة في logger إن رغبت
      }
    } catch (e) {
      // تجاهل خطأ الـ Cron لعدم إيقاف التطبيق
    }
  }

  /** إضافة إعلان للمفضلة (مستخدم مصادق) */
  async addFavorite(kenzId: string, userId: string) {
    const kenz = await this.model.findById(kenzId).exec();
    if (!kenz) throw new NotFoundException('Kenz ad not found');
    const existing = await this.favoriteModel
      .findOne({ userId: new Types.ObjectId(userId), kenzId: new Types.ObjectId(kenzId) })
      .exec();
    if (existing) return { success: true, message: 'Already in favorites' };
    await this.favoriteModel.create({
      userId: new Types.ObjectId(userId),
      kenzId: new Types.ObjectId(kenzId),
    });
    return { success: true, message: 'Added to favorites' };
  }

  /** إزالة إعلان من المفضلة */
  async removeFavorite(kenzId: string, userId: string) {
    const result = await this.favoriteModel
      .deleteOne({ userId: new Types.ObjectId(userId), kenzId: new Types.ObjectId(kenzId) })
      .exec();
    return { success: true, removed: (result?.deletedCount ?? 0) > 0 };
  }

  /** قائمة إعلانات المستخدم المفضلة (مع التصفح) */
  async listFavorites(userId: string, cursor?: string, limit: number = 25) {
    const query = this.favoriteModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ _id: -1 })
      .populate('kenzId');
    if (cursor) {
      try {
        query.where('_id').lt(new Types.ObjectId(cursor));
      } catch {
        // ignore invalid cursor
      }
    }
    const favs = await query.limit(limit + 1).exec();
    const hasNext = favs.length > limit;
    const list = hasNext ? favs.slice(0, -1) : favs;
    const nextCursor = hasNext ? String(list[list.length - 1]._id) : null;
    const items = list
      .map((f) => (f as any).kenzId)
      .filter(Boolean)
      .map((k: any) => (k?.toObject ? k.toObject() : k));
    return { items, nextCursor };
  }

  /** معرفات الإعلانات المفضلة للمستخدم (لدمج isFavorited في القائمة) */
  async getFavoritedKenzIds(userId: string): Promise<string[]> {
    const favs = await this.favoriteModel
      .find({ userId: new Types.ObjectId(userId) })
      .select('kenzId')
      .lean()
      .exec();
    return favs.map((f) => String(f.kenzId));
  }

  /** قائمة البلاغات (للأدمن) */
  async listReports(filters: { status?: string } = {}, cursor?: string, limit: number = 25) {
    const query = this.reportModel
      .find()
      .populate('kenzId', 'title status ownerId')
      .populate('reporterId', 'name email phone')
      .sort({ createdAt: -1 });
    if (filters.status) query.where('status').equals(filters.status);
    if (cursor) {
      try {
        query.where('_id').lt(new Types.ObjectId(cursor));
      } catch {
        // ignore invalid cursor
      }
    }
    query.limit(limit + 1);
    const items = await query.exec();
    const hasNext = items.length > limit;
    const list = hasNext ? items.slice(0, -1) : items;
    const nextCursor = hasNext ? String(list[list.length - 1]._id) : null;
    return { items: list, nextCursor };
  }
}
