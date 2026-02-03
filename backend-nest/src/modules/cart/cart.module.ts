import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CartController } from './cart.controller';
import { CartService } from './services/cart.service';
import { SheinCartService } from './services/shein-cart.service';
import { Cart, CartSchema } from './entities/cart.entity';
import { SheinCart, SheinCartSchema } from './entities/shein-cart.entity';
import { AuthModule } from '../auth/auth.module';
import { RolesGuard } from '../../common/guards/roles.guard';
import { PricingStrategyModule } from '../pricing-strategy/pricing-strategy.module';
import { UserModule } from '../user/user.module';
import { StoreModule } from '../store/store.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Cart.name, schema: CartSchema },
      { name: SheinCart.name, schema: SheinCartSchema },
    ]),
    AuthModule,
    PricingStrategyModule,
    UserModule,
    StoreModule,
  ],
  controllers: [CartController],
  providers: [CartService, SheinCartService, RolesGuard],
  exports: [CartService, SheinCartService],
})
export class CartModule {}
