export default interface UpdatePaymentsDto {
  title?: string;
  description?: string;
  
  metadata?: Record<string, any>;
  status?: string;
}
