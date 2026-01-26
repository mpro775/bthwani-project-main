import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { MerchantController } from './merchant.controller';
import { MerchantService } from './services/merchant.service';
import { Merchant, MerchantSchema } from './entities/merchant.entity';
import {
  MerchantProduct,
  MerchantProductSchema,
} from './entities/merchant-product.entity';
import {
  ProductCatalog,
  ProductCatalogSchema,
} from './entities/product-catalog.entity';
import {
  MerchantCategory,
  MerchantCategorySchema,
} from './entities/merchant-category.entity';
import { Attribute, AttributeSchema } from './entities/attribute.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Merchant.name, schema: MerchantSchema },
      { name: MerchantProduct.name, schema: MerchantProductSchema },
      { name: ProductCatalog.name, schema: ProductCatalogSchema },
      { name: MerchantCategory.name, schema: MerchantCategorySchema },
      { name: Attribute.name, schema: AttributeSchema },
    ]),
    JwtModule.register({}),
  ],
  controllers: [MerchantController],
  providers: [MerchantService],
  exports: [MerchantService],
})
export class MerchantModule {}
