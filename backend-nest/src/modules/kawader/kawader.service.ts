import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import type { Model } from 'mongoose';
import { Types } from 'mongoose';
import * as fs from 'fs';
import * as path from 'path';
import { Kawader } from './entities/kawader.entity';
import { KawaderApplication, KawaderApplicationStatus } from './entities/kawader-application.entity';
import { KawaderPortfolio } from './entities/kawader-portfolio.entity';
import { KawaderReview } from './entities/kawader-review.entity';
import { KawaderMedia } from './entities/kawader-media.entity';
import type CreateKawaderDto from './dto/create-kawader.dto';
import type UpdateKawaderDto from './dto/update-kawader.dto';
import type ApplyKawaderDto from './dto/apply-kawader.dto';
import type CreatePortfolioItemDto from './dto/create-portfolio-item.dto';
import type CreateReviewDto from './dto/create-review.dto';

const DEFAULT_LIMIT = 25;

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

@Injectable()
export class KawaderService {
  constructor(
    @InjectModel(Kawader.name) private readonly model: Model<Kawader>,
    @InjectModel(KawaderApplication.name) private readonly applicationModel: Model<KawaderApplication>,
    @InjectModel(KawaderPortfolio.name) private readonly portfolioModel: Model<KawaderPortfolio>,
    @InjectModel(KawaderReview.name) private readonly reviewModel: Model<KawaderReview>,
    @InjectModel(KawaderMedia.name) private readonly mediaModel: Model<KawaderMedia>,
    private readonly configService: ConfigService,
  ) {} 

  async create(dto: CreateKawaderDto) {
    const doc = new this.model(dto);
    return await doc.save();
  }

  async findAll(opts: { cursor?: string; offerType?: string; jobType?: string; location?: string } = {}) {
    const limit = DEFAULT_LIMIT;
    const baseQuery: Record<string, unknown> = {};
    if (opts.cursor) baseQuery._id = { $lt: new Types.ObjectId(opts.cursor) };
    if (opts.offerType) baseQuery.offerType = opts.offerType;
    if (opts.jobType) baseQuery.jobType = opts.jobType;
    if (opts.location?.trim()) baseQuery.location = new RegExp(escapeRegex(opts.location.trim()), 'i');
    const query = this.model.find(baseQuery).sort({ _id: -1 }).limit(limit);
    const items = await query.exec();
    const nextCursor = items.length === limit ? String(items[items.length - 1]._id) : null;
    return { items, nextCursor };
  }

  /**
   * عروض المستخدم الحالي فقط (بلاغاتي)
   */
  async findMy(userId: string, opts: { cursor?: string; limit?: number } = {}) {
    const limit = Math.min(opts.limit ?? DEFAULT_LIMIT, 50);
    const ownerId = new Types.ObjectId(userId);
    const baseQuery: Record<string, unknown> = { ownerId };
    if (opts.cursor) {
      baseQuery._id = { $lt: new Types.ObjectId(opts.cursor) };
    }
    const query = this.model
      .find(baseQuery)
      .populate('ownerId', 'name email phone')
      .sort({ _id: -1 })
      .limit(limit + 1);
    const items = await query.exec();
    const hasNextPage = items.length > limit;
    const resultItems = hasNextPage ? items.slice(0, -1) : items;
    const nextCursor = hasNextPage ? String(resultItems[resultItems.length - 1]._id) : null;
    return { items: resultItems, nextCursor };
  }

  /**
   * بحث في العروض: نص في العنوان/الوصف/المهارات + فلترة
   */
  async search(opts: {
    q?: string;
    status?: string;
    offerType?: string;
    jobType?: string;
    location?: string;
    budgetMin?: number;
    budgetMax?: number;
    cursor?: string;
    limit?: number;
  } = {}) {
    const limit = Math.min(opts.limit ?? DEFAULT_LIMIT, 50);
    const baseQuery: Record<string, unknown> = {};

    if (opts.q?.trim()) {
      const regex = new RegExp(escapeRegex(opts.q.trim()), 'i');
      baseQuery.$or = [
        { title: regex },
        { description: regex },
        { 'metadata.skills': { $in: [regex] } },
      ];
    }
    if (opts.status) baseQuery.status = opts.status;
    if (opts.offerType) baseQuery.offerType = opts.offerType;
    if (opts.jobType) baseQuery.jobType = opts.jobType;
    if (opts.location?.trim()) baseQuery.location = new RegExp(escapeRegex(opts.location.trim()), 'i');
    if (opts.budgetMin != null || opts.budgetMax != null) {
      baseQuery.budget = {};
      if (opts.budgetMin != null) (baseQuery.budget as Record<string, number>).$gte = opts.budgetMin;
      if (opts.budgetMax != null) (baseQuery.budget as Record<string, number>).$lte = opts.budgetMax;
    }
    if (opts.cursor) {
      baseQuery._id = { $lt: new Types.ObjectId(opts.cursor) };
    }

    const query = this.model
      .find(baseQuery)
      .populate('ownerId', 'name email phone')
      .sort({ _id: -1 })
      .limit(limit + 1);
    const items = await query.exec();
    const hasNextPage = items.length > limit;
    const resultItems = hasNextPage ? items.slice(0, -1) : items;
    const nextCursor = hasNextPage ? String(resultItems[resultItems.length - 1]._id) : null;
    return { items: resultItems, nextCursor };
  }

  async findOne(id: string) {
    const doc = await this.model.findById(id).populate('ownerId', 'name email phone').exec();
    if (!doc) throw new NotFoundException('Not found');
    return doc;
  }

  async list(filters: any = {}, cursor?: string, limit: number = 25) {
    // Build base query with cursor
    const baseQuery: any = {};
    if (cursor) {
      baseQuery._id = { $lt: new Types.ObjectId(cursor) };
    }

    // Apply filters
    if (filters.status) baseQuery.status = filters.status;
    if (filters.ownerId) baseQuery.ownerId = filters.ownerId;
    if (filters.offerType) baseQuery.offerType = filters.offerType;
    if (filters.jobType) baseQuery.jobType = filters.jobType;
    if (filters.location?.trim()) baseQuery.location = new RegExp(escapeRegex(String(filters.location).trim()), 'i');
    if (filters.budgetMin || filters.budgetMax) {
      baseQuery.budget = {};
      if (filters.budgetMin) baseQuery.budget.$gte = filters.budgetMin;
      if (filters.budgetMax) baseQuery.budget.$lte = filters.budgetMax;
    }
    if (filters.createdAfter || filters.createdBefore) {
      baseQuery.createdAt = {};
      if (filters.createdAfter) baseQuery.createdAt.$gte = new Date(filters.createdAfter);
      if (filters.createdBefore) baseQuery.createdAt.$lte = new Date(filters.createdBefore);
    }

    const query = this.model.find(baseQuery).populate('ownerId', 'name email phone').sort({ _id: -1 });

    query.limit(limit + 1); // +1 to check if there are more items

    const items = await query.exec();
    const hasNextPage = items.length > limit;
    const resultItems = hasNextPage ? items.slice(0, -1) : items;
    const nextCursor = hasNextPage ? String(resultItems[resultItems.length - 1]._id) : null;

    return { items: resultItems, nextCursor };
  }

  async getStats() {
    const stats = await this.model.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const result: Record<string, number> = {
      total: 0,
      draft: 0,
      pending: 0,
      confirmed: 0,
      completed: 0,
      cancelled: 0
    };

    stats.forEach(stat => {
      result.total += stat.count;
      result[stat._id] = stat.count;
    });

    return result;
  }

  async update(id: string, dto: UpdateKawaderDto, userId?: string) {
    const doc = await this.model.findById(id).exec();
    if (!doc) throw new NotFoundException('Not found');
    if (userId != null) {
      const ownerStr = doc.ownerId?.toString?.() ?? doc.ownerId;
      if (ownerStr !== userId) throw new ForbiddenException('غير مصرح بتعديل هذا العرض');
    }
    const updated = await this.model.findByIdAndUpdate(id, dto, { new: true }).populate('ownerId', 'name email phone').exec();
    return updated!;
  }

  async remove(id: string, userId?: string) {
    const doc = await this.model.findById(id).exec();
    if (!doc) throw new NotFoundException('Not found');
    if (userId != null) {
      const ownerStr = doc.ownerId?.toString?.() ?? doc.ownerId;
      if (ownerStr !== userId) throw new ForbiddenException('غير مصرح بحذف هذا العرض');
    }
    await this.model.findByIdAndDelete(id).exec();
    return { ok: true };
  }

  // ---------- التقديم على العروض (Applications) ----------

  async apply(kawaderId: string, userId: string, dto: ApplyKawaderDto) {
    const kid = new Types.ObjectId(kawaderId);
    const uid = new Types.ObjectId(userId);
    const kawader = await this.model.findById(kid).exec();
    if (!kawader) throw new NotFoundException('العرض غير موجود');
    const ownerStr = kawader.ownerId?.toString?.() ?? kawader.ownerId;
    if (ownerStr === userId) throw new BadRequestException('لا يمكنك التقديم على عرضك الخاص');
    const existing = await this.applicationModel.findOne({ kawaderId: kid, userId: uid }).exec();
    if (existing) throw new BadRequestException('لقد قدّمت على هذا العرض مسبقاً');
    const app = new this.applicationModel({
      kawaderId: kid,
      userId: uid,
      coverNote: dto.coverNote ?? '',
      status: KawaderApplicationStatus.PENDING,
    });
    const saved = await app.save();
    return this.applicationModel
      .findById(saved._id)
      .populate('kawaderId', 'title budget scope status')
      .populate('userId', 'name email phone')
      .exec();
  }

  async getApplicationsByKawader(kawaderId: string, ownerId: string) {
    const kawader = await this.model.findById(kawaderId).exec();
    if (!kawader) throw new NotFoundException('العرض غير موجود');
    const ownerStr = kawader.ownerId?.toString?.() ?? kawader.ownerId;
    if (ownerStr !== ownerId) throw new ForbiddenException('غير مصرح بعرض تقديمات هذا العرض');
    const items = await this.applicationModel
      .find({ kawaderId: new Types.ObjectId(kawaderId) })
      .populate('userId', 'name email phone')
      .sort({ createdAt: -1 })
      .exec();
    return { items };
  }

  async getMyApplications(userId: string, opts: { cursor?: string; limit?: number } = {}) {
    const limit = Math.min(opts.limit ?? DEFAULT_LIMIT, 50);
    const uid = new Types.ObjectId(userId);
    const baseQuery: Record<string, unknown> = { userId: uid };
    if (opts.cursor) baseQuery._id = { $lt: new Types.ObjectId(opts.cursor) };
    const query = this.applicationModel
      .find(baseQuery)
      .populate('kawaderId', 'title description scope budget status offerType jobType location salary')
      .populate('userId', 'name email phone')
      .sort({ _id: -1 })
      .limit(limit + 1);
    const items = await query.exec();
    const hasNextPage = items.length > limit;
    const resultItems = hasNextPage ? items.slice(0, -1) : items;
    const nextCursor = hasNextPage ? String(resultItems[resultItems.length - 1]._id) : null;
    return { items: resultItems, nextCursor };
  }

  async updateApplicationStatus(applicationId: string, ownerId: string, status: KawaderApplicationStatus.ACCEPTED | KawaderApplicationStatus.REJECTED) {
    const app = await this.applicationModel.findById(applicationId).populate('kawaderId').exec();
    if (!app) throw new NotFoundException('التقديم غير موجود');
    const kawader = app.kawaderId as any;
    const kawaderOwnerStr = kawader?.ownerId?.toString?.() ?? kawader?.ownerId;
    if (kawaderOwnerStr !== ownerId) throw new ForbiddenException('غير مصرح بتحديث حالة هذا التقديم');
    app.status = status;
    await app.save();
    return this.applicationModel
      .findById(applicationId)
      .populate('kawaderId', 'title budget scope status')
      .populate('userId', 'name email phone')
      .exec();
  }

  // ---------- معرض الأعمال (Portfolio) ----------

  async uploadPortfolioImage(file: Express.Multer.File, userId: string): Promise<{ id: string }> {
    const uploadPath = this.configService.get<string>('UPLOAD_PATH') || './uploads';
    const dir = path.join(uploadPath, 'kawader');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const ext = path.extname(file.originalname) || '.jpg';
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
    const filepath = path.join(dir, filename);
    fs.writeFileSync(filepath, file.buffer);
    const baseUrl = this.configService.get<string>('API_BASE_URL') || `http://localhost:${this.configService.get<number>('PORT') || 3000}`;
    const url = `${baseUrl}/uploads/kawader/${filename}`;
    const doc = new this.mediaModel({ url, userId: new Types.ObjectId(userId) });
    const saved = await doc.save();
    return { id: saved._id.toString() };
  }

  async addPortfolioItem(userId: string, dto: CreatePortfolioItemDto) {
    const uid = new Types.ObjectId(userId);
    const mediaObjectIds = (dto.mediaIds ?? []).map((id) => new Types.ObjectId(id));
    const item = new this.portfolioModel({
      userId: uid,
      mediaIds: mediaObjectIds,
      caption: dto.caption ?? '',
    });
    const saved = await item.save();
    return this.portfolioModel
      .findById(saved._id)
      .populate('mediaIds')
      .exec();
  }

  async getPortfolioByUser(userId: string) {
    const uid = new Types.ObjectId(userId);
    const items = await this.portfolioModel
      .find({ userId: uid })
      .populate('mediaIds')
      .sort({ createdAt: -1 })
      .exec();
    return { items };
  }

  async getMyPortfolio(userId: string) {
    return this.getPortfolioByUser(userId);
  }

  async removePortfolioItem(itemId: string, userId: string) {
    const item = await this.portfolioModel.findById(itemId).exec();
    if (!item) throw new NotFoundException('عنصر المعرض غير موجود');
    const ownerStr = item.userId?.toString?.() ?? item.userId;
    if (ownerStr !== userId) throw new ForbiddenException('غير مصرح بحذف هذا العنصر');
    await this.portfolioModel.findByIdAndDelete(itemId).exec();
    return { ok: true };
  }

  // ---------- التقييمات والمراجعات (Reviews) ----------

  async createReview(kawaderId: string, reviewerId: string, dto: CreateReviewDto) {
    const kid = new Types.ObjectId(kawaderId);
    const rid = new Types.ObjectId(reviewerId);
    const kawader = await this.model.findById(kid).exec();
    if (!kawader) throw new NotFoundException('العرض غير موجود');
    const revieweeId = kawader.ownerId;
    const revieweeStr = revieweeId?.toString?.() ?? revieweeId;
    if (revieweeStr === reviewerId) throw new BadRequestException('لا يمكنك تقييم نفسك');
    const existing = await this.reviewModel.findOne({ kawaderId: kid, reviewerId: rid }).exec();
    if (existing) throw new BadRequestException('لديك مراجعة مسبقة على هذا العرض');
    const review = new this.reviewModel({
      kawaderId: kid,
      reviewerId: rid,
      revieweeId,
      rating: dto.rating,
      comment: dto.comment ?? '',
    });
    const saved = await review.save();
    return this.reviewModel
      .findById(saved._id)
      .populate('reviewerId', 'name email phone')
      .populate('revieweeId', 'name email phone')
      .populate('kawaderId', 'title')
      .exec();
  }

  async getAverageRating(revieweeId: string) {
    const result = await this.reviewModel
      .aggregate([
        { $match: { revieweeId: new Types.ObjectId(revieweeId) } },
        { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
      ])
      .exec();
    if (!result.length) return { averageRating: 0, reviewCount: 0 };
    return {
      averageRating: Math.round(result[0].avg * 100) / 100,
      reviewCount: result[0].count,
    };
  }

  async getReviewsByUser(revieweeId: string, opts: { cursor?: string; limit?: number } = {}) {
    const limit = Math.min(opts.limit ?? DEFAULT_LIMIT, 50);
    const revId = new Types.ObjectId(revieweeId);
    const baseQuery: Record<string, unknown> = { revieweeId: revId };
    if (opts.cursor) baseQuery._id = { $lt: new Types.ObjectId(opts.cursor) };
    const query = this.reviewModel
      .find(baseQuery)
      .populate('reviewerId', 'name email phone')
      .populate('kawaderId', 'title')
      .sort({ _id: -1 })
      .limit(limit + 1);
    const items = await query.exec();
    const hasNextPage = items.length > limit;
    const resultItems = hasNextPage ? items.slice(0, -1) : items;
    const nextCursor = hasNextPage ? String(resultItems[resultItems.length - 1]._id) : null;
    const stats = await this.getAverageRating(revieweeId);
    return { items: resultItems, nextCursor, ...stats };
  }
}
