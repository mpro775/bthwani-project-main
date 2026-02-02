import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CqrsModule } from '@nestjs/cqrs';
import { JwtModule } from '@nestjs/jwt';
import { OrderController } from './order.controller';
import { OrderCqrsController } from './order-cqrs.controller';
import { OrderService } from './order.service';
import { Order, OrderSchema } from './entities/order.entity';
import { Driver, DriverSchema } from '../driver/entities/driver.entity';
import { GatewaysModule } from '../../gateways/gateways.module';
import { WalletModule } from '../wallet/wallet.module';
import { CartModule } from '../cart/cart.module';
import { UserModule } from '../user/user.module';

// CQRS - Commands & Queries
import { OrderCommandHandlers } from './commands/handlers';
import { OrderQueryHandlers } from './queries/handlers';
import { OrderEventHandlers } from './events/handlers';
import { OrderOwnerGuard, OrderDriverGuard } from './guards';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Order.name, schema: OrderSchema },
      { name: Driver.name, schema: DriverSchema }, // ✅ إضافة Driver Schema
    ]),
    CqrsModule, // ⚡ CQRS Support
    GatewaysModule, // للـ WebSocket events
    JwtModule.register({}),
    forwardRef(() => WalletModule), // ✅ ربط مع WalletModule
    CartModule,
    UserModule,
  ],
  controllers: [
    OrderController, // Traditional REST
    OrderCqrsController, // CQRS-based (للعمليات المعقدة)
  ],
  providers: [
    OrderService,
    // CQRS Handlers
    ...OrderCommandHandlers,
    ...OrderQueryHandlers,
    ...OrderEventHandlers,
    // Guards
    OrderOwnerGuard,
    OrderDriverGuard,
  ],
  exports: [OrderService],
})
export class OrderModule {}
