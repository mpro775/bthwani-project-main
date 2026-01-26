export class DriverAssignedEvent {
  constructor(
    public readonly orderId: string,
    public readonly driverId: string,
    public readonly userId: string,
  ) {}
}
