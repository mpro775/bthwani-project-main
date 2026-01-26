import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { GetUserOrdersQuery } from '../impl/get-user-orders.query';
import { Order } from '../../entities/order.entity';

@QueryHandler(GetUserOrdersQuery)
export class GetUserOrdersHandler implements IQueryHandler<GetUserOrdersQuery> {
  constructor(@InjectModel(Order.name) private orderModel: Model<Order>) {}

  async execute(query: GetUserOrdersQuery) {
    const mongoQuery: Record<string, any> = {
      user: new Types.ObjectId(query.userId),
    };

    if (query.pagination.cursor) {
      mongoQuery._id = { $gt: new Types.ObjectId(query.pagination.cursor) };
    }

    const limit = query.pagination.limit || 20;
    const items = await this.orderModel
      .find(mongoQuery)
      .sort({ createdAt: -1 })
      .limit(limit + 1)
      .populate('driver', 'fullName phone profileImage')
      .lean();

    const hasMore = items.length > limit;
    const results = hasMore ? items.slice(0, -1) : items;

    return {
      data: results,
      pagination: {
        nextCursor: hasMore
          ? String(
              (results[results.length - 1] as unknown as { _id: string })._id,
            )
          : null,
        hasMore,
        limit,
      },
    };
  }
}
