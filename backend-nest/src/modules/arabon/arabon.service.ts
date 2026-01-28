import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Model } from 'mongoose';
import { Types } from 'mongoose';
import { Arabon, ArabonStatus } from './entities/arabon.entity';
import { ArabonStatusLog } from './entities/arabon-status-log.entity';
import type CreateArabonDto from './dto/create-arabon.dto';
import type UpdateArabonDto from './dto/update-arabon.dto';
import { User } from '../auth/entities/user.entity';

const LIST_LIMIT = 25;
const VALID_STATUSES = Object.values(ArabonStatus);

function parseCursor(cursor: string | undefined): Types.ObjectId | null {
  if (!cursor || typeof cursor !== 'string') return null;
  if (!Types.ObjectId.isValid(cursor)) return null;
  return new Types.ObjectId(cursor);
}

@Injectable()
export class ArabonService {
  constructor(
    @InjectModel(Arabon.name) private readonly model: Model<Arabon>,
    @InjectModel(ArabonStatusLog.name) private readonly statusLogModel: Model<ArabonStatusLog>,
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  async create(dto: CreateArabonDto) {
    const doc = new this.model(dto);
    return await doc.save();
  }

  async findAll(opts: { cursor?: string; status?: string; ownerId?: string }) {
    const filter: Record<string, unknown> = {};
    if (opts?.status && VALID_STATUSES.includes(opts.status as ArabonStatus)) {
      filter.status = opts.status;
    }
    if (opts?.ownerId) {
      if (Types.ObjectId.isValid(opts.ownerId)) {
        filter.ownerId = new Types.ObjectId(opts.ownerId);
      }
    }

    const cursorId = parseCursor(opts?.cursor);
    const queryFilter: any = { ...filter };
    if (cursorId) {
      queryFilter._id = { $lt: cursorId };
    }
    const query = this.model.find(queryFilter).sort({ _id: -1 }).limit(LIST_LIMIT + 1);
    const items = await query.exec();
    const hasMore = items.length > LIST_LIMIT;
    const resultItems = hasMore ? items.slice(0, -1) : items;
    const nextCursor = hasMore && resultItems.length
      ? String(resultItems[resultItems.length - 1]._id)
      : null;
    return { items: resultItems, nextCursor };
  }

  async findByOwner(ownerId: string, opts: { cursor?: string; status?: string }) {
    if (!Types.ObjectId.isValid(ownerId)) {
      return { items: [], nextCursor: null };
    }
    const filter: Record<string, unknown> = { ownerId: new Types.ObjectId(ownerId) };
    if (opts?.status && VALID_STATUSES.includes(opts.status as ArabonStatus)) {
      filter.status = opts.status;
    }

    const cursorId = parseCursor(opts?.cursor);
    const queryFilter: any = { ...filter };
    if (cursorId) {
      queryFilter._id = { $lt: cursorId };
    }
    const query = this.model.find(queryFilter).sort({ _id: -1 }).limit(LIST_LIMIT + 1);
    const items = await query.exec();
    const hasMore = items.length > LIST_LIMIT;
    const resultItems = hasMore ? items.slice(0, -1) : items;
    const nextCursor = hasMore && resultItems.length
      ? String(resultItems[resultItems.length - 1]._id)
      : null;
    return { items: resultItems, nextCursor };
  }

  // Deprecated: Firebase UID lookup removed - use findByOwner with user ID instead
  // async findByOwnerFirebaseUid(
  //   firebaseUid: string,
  //   opts: { cursor?: string; status?: string },
  // ) {
  //   const user = await this.userModel.findOne({ firebaseUID: firebaseUid }).select('_id').lean().exec();
  //   if (!user?._id) return { items: [], nextCursor: null };
  //   return this.findByOwner(String(user._id), opts);
  // }

  async search(
    q: string,
    opts: { cursor?: string; status?: string } = {},
  ) {
    const searchFilter: Record<string, unknown> = {
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
      ],
    };
    if (opts?.status && VALID_STATUSES.includes(opts.status as ArabonStatus)) {
      searchFilter.status = opts.status;
    }

    const cursorId = parseCursor(opts?.cursor);
    const queryFilter: any = { ...searchFilter };
    if (cursorId) {
      queryFilter._id = { $lt: cursorId };
    }
    const query = this.model.find(queryFilter).sort({ _id: -1 }).limit(LIST_LIMIT + 1);
    const items = await query.exec();
    const hasMore = items.length > LIST_LIMIT;
    const resultItems = hasMore ? items.slice(0, -1) : items;
    const nextCursor = hasMore && resultItems.length
      ? String(resultItems[resultItems.length - 1]._id)
      : null;
    return { items: resultItems, nextCursor };
  }

  async list(filters: Record<string, unknown> = {}, cursor?: string, limit: number = 25) {
    const cursorId = parseCursor(cursor);
    const queryFilter: any = { ...filters };
    if (cursorId) {
      queryFilter._id = { $lt: cursorId };
    }
    const query = this.model.find(queryFilter).sort({ _id: -1 }).limit(limit + 1);
    const items = await query.exec();
    const hasMore = items.length > limit;
    const resultItems = hasMore ? items.slice(0, -1) : items;
    const nextCursor = hasMore && resultItems.length
      ? String(resultItems[resultItems.length - 1]._id)
      : null;
    return { items: resultItems, nextCursor };
  }

  async findOne(id: string) {
    const doc = await this.model.findById(id).exec();
    if (!doc) throw new NotFoundException('Not found');
    return doc;
  }

  async update(id: string, dto: UpdateArabonDto, userId?: string) {
    const prev = await this.model.findById(id).lean<{ status?: string }>().exec();
    if (!prev) throw new NotFoundException('Not found');
    const doc = await this.model.findByIdAndUpdate(id, dto, { new: true }).exec();
    if (!doc) throw new NotFoundException('Not found');
    if (dto.status != null && String(prev.status) !== String(dto.status)) {
      await this.logStatusChange(id, prev.status, dto.status, userId);
    }
    return doc;
  }

  async updateStatus(id: string, status: string, userId?: string) {
    if (!VALID_STATUSES.includes(status as ArabonStatus)) {
      throw new BadRequestException('Invalid status');
    }
    const prev = await this.model.findById(id).lean<{ status?: string }>().exec();
    if (!prev) throw new NotFoundException('Not found');
    const doc = await this.model.findByIdAndUpdate(id, { status }, { new: true }).exec();
    if (!doc) throw new NotFoundException('Not found');
    if (String(prev.status) !== status) {
      await this.logStatusChange(id, prev.status, status, userId);
    }
    return doc;
  }

  private async logStatusChange(
    arabonId: string,
    oldStatus: string | undefined,
    newStatus: string,
    userId?: string,
  ) {
    await this.statusLogModel.create({
      arabonId: new Types.ObjectId(arabonId),
      oldStatus,
      newStatus,
      userId,
    });
  }

  async getActivity(arabonId: string, opts: { cursor?: string } = {}) {
    const cursorId = parseCursor(opts?.cursor);
    const queryFilter: any = { arabonId: new Types.ObjectId(arabonId) };
    if (cursorId) {
      queryFilter._id = { $lt: cursorId };
    }
    const query = this.statusLogModel
      .find(queryFilter)
      .sort({ createdAt: -1 })
      .limit(LIST_LIMIT + 1);
    const items = await query.lean().exec();
    const hasMore = items.length > LIST_LIMIT;
    const resultItems = hasMore ? items.slice(0, -1) : items;
    const nextCursor =
      hasMore && resultItems.length ? String((resultItems[resultItems.length - 1] as any)._id) : null;
    return { items: resultItems, nextCursor };
  }

  async remove(id: string) {
    const doc = await this.model.findByIdAndDelete(id).exec();
    if (!doc) throw new NotFoundException('Not found');
    return { ok: true };
  }

  async getStats(ownerId?: string): Promise<{
    total: number;
    draft: number;
    pending: number;
    confirmed: number;
    completed: number;
    cancelled: number;
    totalDepositAmount: number;
  }> {
    const match: Record<string, unknown> = {};
    if (ownerId && Types.ObjectId.isValid(ownerId)) {
      match.ownerId = new Types.ObjectId(ownerId);
    }
    const statusPipe = this.model.aggregate();
    const sumPipe = this.model.aggregate();
    if (Object.keys(match).length) {
      statusPipe.match(match);
      sumPipe.match(match);
    }
    const [statusGroups, sumResult] = await Promise.all([
      statusPipe.group({ _id: '$status', count: { $sum: 1 } }).exec(),
      sumPipe.group({ _id: null, total: { $sum: { $ifNull: ['$depositAmount', 0] } } }).exec(),
    ]);

    const result = {
      total: 0,
      draft: 0,
      pending: 0,
      confirmed: 0,
      completed: 0,
      cancelled: 0,
      totalDepositAmount: (sumResult[0]?.total as number) ?? 0,
    };
    for (const g of statusGroups) {
      result.total += g.count;
      if (g._id && typeof g._id === 'string' && g._id in result) {
        (result as Record<string, number>)[g._id] = g.count;
      }
    }
    return result;
  }

  // Deprecated: Firebase UID lookup removed - use getStatsForOwner with user ID instead
  async getStatsForFirebaseUid(firebaseUid: string) {
    // This method is deprecated - Firebase UID lookup is no longer supported
    // Use getStatsForOwner with user ID instead
    throw new Error('Firebase UID lookup is no longer supported. Use getStatsForOwner with user ID instead.');
    // const user = await this.userModel.findOne({ firebaseUID: firebaseUid }).select('_id').lean().exec();
    if (!user?._id) {
      return {
        total: 0,
        draft: 0,
        pending: 0,
        confirmed: 0,
        completed: 0,
        cancelled: 0,
        totalDepositAmount: 0,
      };
    }
    return this.getStats(String(user._id));
  }
}
