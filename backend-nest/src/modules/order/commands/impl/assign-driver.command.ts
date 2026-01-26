export class AssignDriverCommand {
  constructor(
    public readonly orderId: string,
    public readonly driverId: string,
    public readonly assignedBy: string = 'admin',
  ) {}
}
