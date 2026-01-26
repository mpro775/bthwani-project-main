import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { StoreController } from './store.controller';
import { DeliveryStoreController } from './delivery-store.controller';
import { StoreService } from './store.service';
import { Store, StoreSchema } from './entities/store.entity';
import { Product, ProductSchema } from './entities/product.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Store.name, schema: StoreSchema },
      { name: Product.name, schema: ProductSchema },
    ]),
    JwtModule.register({}),
  ],
  controllers: [StoreController, DeliveryStoreController],
  providers: [StoreService],
  exports: [StoreService],
})
export class StoreModule {}
