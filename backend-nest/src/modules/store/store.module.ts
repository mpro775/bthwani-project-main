import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { StoreController } from './store.controller';
import { DeliveryStoreController } from './delivery-store.controller';
import { DeliveryCategoriesController } from './delivery-categories.controller';
import { DeliverySubCategoriesController } from './delivery-subcategories.controller';
import { DeliveryProductsController } from './delivery-products.controller';
import { StoreService } from './store.service';
import { DeliveryCategoryService } from './delivery-category.service';
import { DeliverySubCategoryService } from './delivery-subcategory.service';
import { Store, StoreSchema } from './entities/store.entity';
import { Product, ProductSchema } from './entities/product.entity';
import { DeliveryCategory, DeliveryCategorySchema } from './entities/delivery-category.entity';
import { DeliverySubCategory, DeliverySubCategorySchema } from './entities/delivery-subcategory.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Store.name, schema: StoreSchema },
      { name: Product.name, schema: ProductSchema },
      { name: DeliveryCategory.name, schema: DeliveryCategorySchema },
      { name: DeliverySubCategory.name, schema: DeliverySubCategorySchema },
    ]),
    JwtModule.register({}),
  ],
  controllers: [
    StoreController,
    DeliveryStoreController,
    DeliveryCategoriesController,
    DeliverySubCategoriesController,
    DeliveryProductsController,
  ],
  providers: [StoreService, DeliveryCategoryService, DeliverySubCategoryService],
  exports: [StoreService, DeliveryCategoryService, DeliverySubCategoryService],
})
export class StoreModule {}
