export class AmaniDriverAssignedEvent {
  constructor(
    public readonly amaniId: string,
    public readonly driverId: string,
    public readonly ownerId: string,
  ) {}
}
