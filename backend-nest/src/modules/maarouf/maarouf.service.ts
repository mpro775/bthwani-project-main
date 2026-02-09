import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import * as fs from 'fs';
import * as path from 'path';
import type { Model } from 'mongoose';
import { Types } from 'mongoose';
import { Maarouf, MaaroufKind, MaaroufStatus } from './entities/maarouf.entity';
import type CreateMaaroufDto from './dto/create-maarouf.dto';
import type UpdateMaaroufDto from './dto/update-maarouf.dto';

@Injectable()
export class MaaroufService {
  private readonly logger = new Logger(MaaroufService.name);

  constructor(
    @InjectModel(Maarouf.name) private readonly model: Model<Maarouf>,
    private readonly configService: ConfigService,
  ) {}

  async create(dto: CreateMaaroufDto) {
    const payload: Record<string, unknown> = { ...dto };
    if (dto.expiresAt) {
      payload.expiresAt = new Date(dto.expiresAt);
    }
    const doc = new this.model(payload);
    return await doc.save();
  }

  async findAll(opts: {
    cursor?: string;
    userId?: string;
    category?: string;
    hasReward?: boolean;
    near?: string;
    radius?: number;
  }) {
    const limit = 25;
    const filter: Record<string, unknown> = {};
    // المسودة تظهر فقط لصاحب الطلب: إما غير مسودة، أو مسودة ومملوكة للمستخدم الحالي
    if (opts?.userId && Types.ObjectId.isValid(opts.userId)) {
      filter.$or = [
        { status: { $ne: 'draft' } },
        { status: 'draft', ownerId: new Types.ObjectId(opts.userId) },
      ];
    } else {
      filter.status = { $ne: 'draft' };
    }
    if (opts?.cursor && Types.ObjectId.isValid(opts.cursor)) {
      filter._id = { $lt: new Types.ObjectId(opts.cursor) };
    }
    if (opts?.category) {
      filter.category = opts.category;
    }
    if (opts?.hasReward === true) {
      filter.reward = { $gt: 0 };
    }

    // Geo-Matching: فلتر حسب الموقع الجغرافي
    let query = this.model.find(filter);
    if (opts?.near) {
      const [lat, lng] = opts.near.split(',').map(Number);
      if (!isNaN(lat) && !isNaN(lng)) {
        const radiusKm = opts.radius || 10; // افتراضي 10 كم
        const radiusMeters = radiusKm * 1000;
        query = this.model.find({
          ...filter,
          location: {
            $near: {
              $geometry: {
                type: 'Point',
                coordinates: [lng, lat], // GeoJSON: [longitude, latitude]
              },
              $maxDistance: radiusMeters,
            },
          },
        });
      }
    } else {
      query = this.model.find(filter);
    }

    const items = await query.sort({ _id: -1 }).limit(limit).exec();
    const nextCursor =
      items.length === limit ? String(items[items.length - 1]._id) : null;
    return { items, nextCursor };
  }

  async findOne(id: string) {
    const doc = await this.model
      .findById(id)
      .populate('ownerId', 'name email phone')
      .exec();
    if (!doc) throw new NotFoundException('Not found');

    // إخفاء phone عند isAnonymous
    if (
      doc.isAnonymous &&
      doc.ownerId &&
      typeof doc.ownerId === 'object' &&
      doc.ownerId !== null
    ) {
      (doc.ownerId as any).phone = undefined;
      (doc.ownerId as any).name = (doc.ownerId as any).name || 'مستخدم';
    }

    return doc;
  }

  async list(filters: any = {}, cursor?: string, limit: number = 25) {
    const query = this.model
      .find()
      .populate('ownerId', 'name email phone')
      .sort({ _id: -1 });

    // Apply filters
    if (filters.status) query.where('status').equals(filters.status);
    if (filters.kind) query.where('kind').equals(filters.kind);
    if (filters.ownerId) query.where('ownerId').equals(filters.ownerId);
    if (filters.tags && filters.tags.length > 0) {
      query.where('tags').in(filters.tags);
    }
    if (filters.category) query.where('category').equals(filters.category);
    if (filters.hasReward === true) query.where('reward').gt(0);
    if (filters.createdAfter)
      query.where('createdAt').gte(filters.createdAfter);
    if (filters.createdBefore)
      query.where('createdAt').lte(filters.createdBefore);
    if (filters.search) {
      query.or([
        { title: { $regex: filters.search, $options: 'i' } },
        { description: { $regex: filters.search, $options: 'i' } },
      ]);
    }

    if (cursor && Types.ObjectId.isValid(cursor)) {
      query.where('_id').lt(new Types.ObjectId(cursor) as any);
    }

    query.limit(limit + 1); // +1 to check if there are more items

    const items = await query.exec();
    const hasNextPage = items.length > limit;
    const resultItems = hasNextPage ? items.slice(0, -1) : items;
    const nextCursor = hasNextPage
      ? String(resultItems[resultItems.length - 1]._id)
      : null;

    return { items: resultItems, nextCursor };
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

    const kindStats = await this.model.aggregate([
      {
        $group: {
          _id: '$kind',
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
      lost: 0,
      found: 0,
    };

    stats.forEach((stat) => {
      result.total += stat.count;
      result[stat._id] = stat.count;
    });

    kindStats.forEach((stat) => {
      result[stat._id] = stat.count;
    });

    return result;
  }

  /**
   * تعيين معرف طلب التوصيل المرتبط بإعلان معروف
   */
  async assignDelivery(id: string, deliveryId: string) {
    if (!Types.ObjectId.isValid(id) || !Types.ObjectId.isValid(deliveryId)) {
      throw new NotFoundException('معرف غير صالح');
    }

    const doc = await this.model
      .findByIdAndUpdate(
        id,
        { $set: { deliveryId: new Types.ObjectId(deliveryId) } },
        { new: true },
      )
      .exec();

    if (!doc) {
      throw new NotFoundException('Not found');
    }

    return doc;
  }

  /**
   * إرجاع قائمة طلبات التوصيل الخاصة بمعروف للسائقين
   * - إن تم تمرير driverId: يعيد الطلبات المعينة لهذه السائقة
   * - إن لم يُمرر: يعيد كل الإعلانات التي عليها deliveryToggle=true
   */
  async findDeliveryTasks(driverId?: string) {
    const filter: Record<string, unknown> = {
      deliveryToggle: true,
      status: { $in: ['pending', 'confirmed'] },
    };

    if (driverId && Types.ObjectId.isValid(driverId)) {
      filter.deliveryId = new Types.ObjectId(driverId);
    }

    return this.model.find(filter).sort({ createdAt: -1 }).exec();
  }

  async update(id: string, dto: UpdateMaaroufDto) {
    const payload: Record<string, unknown> = { ...dto };
    if (dto.expiresAt) {
      payload.expiresAt = new Date(dto.expiresAt);
    }
    const doc = await this.model
      .findByIdAndUpdate(id, payload, { new: true })
      .exec();
    if (!doc) throw new NotFoundException('Not found');
    return doc;
  }

  async remove(id: string) {
    const doc = await this.model.findByIdAndDelete(id).exec();
    if (!doc) throw new NotFoundException('Not found');
    return { ok: true };
  }

  async uploadImage(file: Express.Multer.File): Promise<{ url: string }> {
    const uploadPath =
      this.configService.get<string>('UPLOAD_PATH') || './uploads';
    const dir = path.join(uploadPath, 'maarouf');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const ext = path.extname(file.originalname) || '.jpg';
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
    const filepath = path.join(dir, filename);
    fs.writeFileSync(filepath, file.buffer);
    const baseUrl =
      this.configService.get<string>('API_BASE_URL') ||
      `http://localhost:${this.configService.get<number>('PORT') || 3000}`;
    const url = `${baseUrl}/uploads/maarouf/${filename}`;
    return { url };
  }

  /**
   * Match Service: البحث عن إعلانات مطابقة (lost ↔ found)
   * يبحث بالـ category + tags + location قريب
   */
  async findMatches(maaroufId: string, maxDistanceKm: number = 5) {
    if (!Types.ObjectId.isValid(maaroufId)) {
      throw new BadRequestException('معرف غير صالح');
    }

    const source = await this.model.findById(maaroufId).exec();
    if (!source) {
      throw new NotFoundException('الإعلان غير موجود');
    }

    // البحث عن إعلانات من النوع المعاكس (lost → found, found → lost)
    const oppositeKind =
      source.kind === MaaroufKind.LOST ? MaaroufKind.FOUND : MaaroufKind.LOST;

    const matchFilter: Record<string, unknown> = {
      _id: { $ne: new Types.ObjectId(maaroufId) },
      kind: oppositeKind,
      status: { $in: [MaaroufStatus.PENDING, MaaroufStatus.CONFIRMED] },
    };

    // مطابقة التصنيف
    if (source.category) {
      matchFilter.category = source.category;
    }

    // مطابقة العلامات (tags) - على الأقل tag واحد مشترك
    if (source.tags && source.tags.length > 0) {
      matchFilter.tags = { $in: source.tags };
    }

    let query = this.model.find(matchFilter);

    // مطابقة جغرافية إذا وُجد موقع
    if (source.location && source.location.coordinates) {
      const [lng, lat] = source.location.coordinates;
      const maxDistanceMeters = maxDistanceKm * 1000;

      query = this.model.find({
        ...matchFilter,
        location: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [lng, lat],
            },
            $maxDistance: maxDistanceMeters,
          },
        },
      });
    }

    const matches = await query
      .limit(20)
      .populate('ownerId', 'name')
      .sort({ createdAt: -1 })
      .exec();

    return { matches, source };
  }

  /**
   * ربط يدوي بين lost و found
   */
  async linkMatch(maaroufId: string, matchedToId: string) {
    if (
      !Types.ObjectId.isValid(maaroufId) ||
      !Types.ObjectId.isValid(matchedToId)
    ) {
      throw new BadRequestException('معرف غير صالح');
    }

    const source = await this.model.findById(maaroufId).exec();
    const target = await this.model.findById(matchedToId).exec();

    if (!source || !target) {
      throw new NotFoundException('أحد الإعلانات غير موجود');
    }

    // التحقق من أن النوعين معاكسين
    if (source.kind === target.kind) {
      throw new BadRequestException('لا يمكن ربط إعلانين من نفس النوع');
    }

    // ربط في كلا الاتجاهين
    source.matchedToId = new Types.ObjectId(matchedToId);
    target.matchedToId = new Types.ObjectId(maaroufId);

    // تحديث الحالة إلى completed
    source.status = MaaroufStatus.COMPLETED;
    target.status = MaaroufStatus.COMPLETED;

    await Promise.all([source.save(), target.save()]);

    return { source, target };
  }

  /**
   * Auto-expiry: تحديث status إعلانات expiresAt < now إلى expired
   * يعمل يومياً في منتصف الليل
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async expireOldListings() {
    try {
      const now = new Date();
      const result = await this.model.updateMany(
        {
          expiresAt: { $exists: true, $lte: now },
          status: {
            $nin: [
              MaaroufStatus.COMPLETED,
              MaaroufStatus.CANCELLED,
              MaaroufStatus.EXPIRED,
            ],
          },
        },
        {
          $set: { status: MaaroufStatus.EXPIRED },
        },
      );

      if (result.modifiedCount > 0) {
        this.logger.log(`تم انتهاء صلاحية ${result.modifiedCount} إعلان`);
      }
    } catch (error) {
      this.logger.error('فشل في تحديث الإعلانات المنتهية الصلاحية:', error);
    }
  }
}
