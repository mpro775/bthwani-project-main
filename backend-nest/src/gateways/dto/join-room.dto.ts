import { IsString, IsNotEmpty, IsMongoId } from 'class-validator';

export class JoinOrderDto {
  @IsNotEmpty({ message: 'Order ID is required' })
  @IsMongoId({ message: 'Invalid order ID format' })
  orderId: string;
}

export class JoinDriverRoomDto {
  @IsNotEmpty({ message: 'Driver ID is required' })
  @IsString()
  driverId: string;
}

