export class GetVendorSettlementsHistoryResponseDto {
  data: any[]; // TODO: Create Settlement DTO
  total: number;
}

export class GetVendorFinancialsResponseDto {
  totalRevenue: number;
  pendingSettlements: number;
  paidSettlements: number;
}
