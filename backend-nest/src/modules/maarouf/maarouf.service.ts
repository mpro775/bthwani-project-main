import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Model } from 'mongoose';
import { Types } from 'mongoose';
import { Maarouf } from './entities/maarouf.entity';
import type CreateMaaroufDto from './dto/create-maarouf.dto';
import type UpdateMaaroufDto from './dto/update-maarouf.dto';

@Injectable()
export class MaaroufService {
  constructor(@InjectModel(Maarouf.name) private readonly model: Model<Maarouf>) {} 

  async create(dto: CreateMaaroufDto) {
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
    const nextCursor = items.length === limit ? String(items[items.length - 1]._id) : null;
    return { items, nextCursor };
  }

  async findOne(id: string) {
    const doc = await this.model.findById(id).populate('ownerId', 'name email phone').exec();
    if (!doc) throw new NotFoundException('Not found');
    return doc;
  }

  async list(filters: any = {}, cursor?: string, limit: number = 25) {
    const query = this.model.find().populate('ownerId', 'name email phone').sort({ _id: -1 });

    // Apply filters
    if (filters.status) query.where('status').equals(filters.status);
    if (filters.kind) query.where('kind').equals(filters.kind);
    if (filters.ownerId) query.where('ownerId').equals(filters.ownerId);
    if (filters.tags && filters.tags.length > 0) {
      query.where('tags').in(filters.tags);
    }
    if (filters.createdAfter) query.where('createdAt').gte(filters.createdAfter);
    if (filters.createdBefore) query.where('createdAt').lte(filters.createdBefore);
    if (filters.search) {
      query.or([
        { title: { $regex: filters.search, $options: 'i' } },
        { description: { $regex: filters.search, $options: 'i' } }
      ]);
    }

    if (cursor) {
      query.where('_id').lt(Number(cursor));
    }

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

    const kindStats = await this.model.aggregate([
      {
        $group: {
          _id: '$kind',
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
      cancelled: 0,
      lost: 0,
      found: 0
    };

    stats.forEach(stat => {
      result.total += stat.count;
      result[stat._id] = stat.count;
    });

    kindStats.forEach(stat => {
      result[stat._id] = stat.count;
    });

    return result;
  }

  async update(id: string, dto: UpdateMaaroufDto) {
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
