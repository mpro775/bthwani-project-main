import { OrderItem } from '../../entities/order.entity';

export class CreateOrderCommand {
  constructor(
    public readonly userId: string,
    public readonly items: OrderItem[],
    public readonly address: {
      label: string;
      street: string;
      city: string;
      location: { lat: number; lng: number };
    },
    public readonly paymentMethod: string,
    public readonly price: number,
    public readonly deliveryFee: number,
    public readonly companyShare: number,
    public readonly platformShare: number,
    public readonly walletUsed?: number,
    public readonly couponCode?: string,
  ) {}
}
