import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { AkhdimniController } from './akhdimni.controller';
import { AkhdimniService } from './services/akhdimni.service';
import { ErrandOrder, ErrandOrderSchema } from './entities/errand-order.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ErrandOrder.name, schema: ErrandOrderSchema },
    ]),
    JwtModule.register({}),
  ],
  controllers: [AkhdimniController],
  providers: [AkhdimniService],
  exports: [AkhdimniService],
})
export class AkhdimniModule {}
