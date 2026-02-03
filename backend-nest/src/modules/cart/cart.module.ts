import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { CartController } from './cart.controller';
import { CartService } from './services/cart.service';
import { SheinCartService } from './services/shein-cart.service';
import { Cart, CartSchema } from './entities/cart.entity';
import { SheinCart, SheinCartSchema } from './entities/shein-cart.entity';
import { RolesGuard } from '../../common/guards/roles.guard';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      { name: Cart.name, schema: CartSchema },
      { name: SheinCart.name, schema: SheinCartSchema },
    ]),
    JwtModule.register({}),
  ],
  controllers: [CartController],
  providers: [CartService, SheinCartService, RolesGuard],
  exports: [CartService, SheinCartService],
})
export class CartModule {}
