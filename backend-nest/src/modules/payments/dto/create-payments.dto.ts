export default interface CreatePaymentsDto {
  ownerId: string;
  title: string;
  description?: string;
  
  metadata?: Record<string, any>;
  status?: string;
}
