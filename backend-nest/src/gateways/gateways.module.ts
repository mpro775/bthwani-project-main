import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { OrderGateway } from './order.gateway';
import { DriverGateway } from './driver.gateway';
import { NotificationGateway } from './notification.gateway';
import { AmaniGateway } from './amani.gateway';
import { Order, OrderSchema } from '../modules/order/entities/order.entity';
import { Amani, AmaniSchema } from '../modules/amani/entities/amani.entity';
import { DriverModule } from '../modules/driver/driver.module';
import { AmaniModule } from '../modules/amani/amani.module';

@Module({
  imports: [
    // JWT Module للمصادقة
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('jwt.secret'),
        signOptions: {
          expiresIn: (configService.get<string>('jwt.expiresIn') || '7d') as any,
        },
      }),
      inject: [ConfigService],
    }),
    // Mongoose Module للوصول للـ Order و Amani models
    MongooseModule.forFeature([
      { name: Order.name, schema: OrderSchema },
      { name: Amani.name, schema: AmaniSchema },
    ]),
    // Driver Module للوصول لـ DriverService
    DriverModule,
    // Amani Module للوصول لـ AmaniService
    AmaniModule,
  ],
  providers: [OrderGateway, DriverGateway, NotificationGateway, AmaniGateway],
  exports: [OrderGateway, DriverGateway, NotificationGateway, AmaniGateway],
})
export class GatewaysModule {}

