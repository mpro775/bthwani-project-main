import { AmaniStatus } from '../entities/amani.entity';

export class AmaniStatusChangedEvent {
  constructor(
    public readonly amaniId: string,
    public readonly oldStatus: AmaniStatus,
    public readonly newStatus: AmaniStatus,
    public readonly changedBy?: string,
  ) {}
}
