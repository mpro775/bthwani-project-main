import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Model } from 'mongoose';
import { Types } from 'mongoose';
import { Kawader } from './entities/kawader.entity';
import type CreateKawaderDto from './dto/create-kawader.dto';
import type UpdateKawaderDto from './dto/update-kawader.dto';

@Injectable()
export class KawaderService {
  constructor(@InjectModel(Kawader.name) private readonly model: Model<Kawader>) {} 

  async create(dto: CreateKawaderDto) {
    const doc = new this.model(dto);
    return await doc.save();
  }

  async findAll(opts: { cursor?: string }) {
    const limit = 25;
    const query = this.model.find(opts?.cursor ? { _id: { $lt: new Types.ObjectId(opts.cursor) } } : {}).sort({ _id: -1 }).limit(limit);
    const items = await query.exec();
    const nextCursor = items.length === limit ? String(items[items.length - 1]._id) : null;
    return { items, nextCursor };
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

    const result = {
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

  async update(id: string, dto: UpdateKawaderDto) {
    const doc = await this.model.findByIdAndUpdate(id, dto, { new: true }).exec();
    if (!doc) throw new NotFoundException('Not found');
    return doc;
  }

  async remove(id: string) {
    const doc = await this.model.findByIdAndDelete(id).exec();
    if (!doc) throw new NotFoundException('Not found');
    return { ok: true };
  }
}
