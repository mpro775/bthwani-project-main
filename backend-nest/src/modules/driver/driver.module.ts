import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { DriverController } from './driver.controller';
import { DriverService } from './driver.service';
import { Driver, DriverSchema } from './entities/driver.entity';
import { Withdrawal, WithdrawalSchema } from '../withdrawal/entities/withdrawal.entity';
import { Order, OrderSchema } from '../order/entities/order.entity';
import { WalletModule } from '../wallet/wallet.module';
import { OrderModule } from '../order/order.module';
import { GatewaysModule } from '../../gateways/gateways.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Driver.name, schema: DriverSchema },
      { name: Withdrawal.name, schema: WithdrawalSchema },
      { name: Order.name, schema: OrderSchema }, // ✅ إضافة Order Schema
    ]),
    JwtModule.register({}),
    forwardRef(() => WalletModule),
    forwardRef(() => OrderModule), // ✅ ربط مع OrderModule
    forwardRef(() => GatewaysModule), // ✅ إضافة GatewaysModule للإشعارات الفورية
  ],
  controllers: [DriverController],
  providers: [DriverService],
  exports: [DriverService],
})
export class DriverModule {}
