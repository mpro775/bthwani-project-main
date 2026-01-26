import { OrderStatus } from '../../enums/order-status.enum';

export class UpdateOrderStatusCommand {
  constructor(
    public readonly orderId: string,
    public readonly status: OrderStatus,
    public readonly changedBy: string,
    public readonly reason?: string,
  ) {}
}
