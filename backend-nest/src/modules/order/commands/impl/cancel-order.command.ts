export class CancelOrderCommand {
  constructor(
    public readonly orderId: string,
    public readonly reason: string,
    public readonly canceledBy: string,
    public readonly userId?: string, // للتحقق من الصلاحية
  ) {}
}
