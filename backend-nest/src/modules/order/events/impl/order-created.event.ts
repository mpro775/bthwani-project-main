import { OrderItem } from '../../entities/order.entity';

export class OrderCreatedEvent {
  constructor(
    public readonly orderId: string,
    public readonly userId: string,
    public readonly items: OrderItem[],
    public readonly totalAmount: number,
  ) {}
}
