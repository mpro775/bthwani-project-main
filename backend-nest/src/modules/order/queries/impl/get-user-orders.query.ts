import { CursorPaginationDto } from '../../../../common/dto/pagination.dto';

export class GetUserOrdersQuery {
  constructor(
    public readonly userId: string,
    public readonly pagination: CursorPaginationDto,
  ) {}
}
