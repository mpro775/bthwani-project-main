import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Sanad, SanadSchema } from './entities/sanad.entity';
import { SanadController } from './sanad.controller';
import { SanadService } from './sanad.service';


@Module({
  imports: [
    MongooseModule.forFeature([{ name: Sanad.name, schema: SanadSchema }]),
    
  ],
  controllers: [SanadController],
  providers: [SanadService],
  exports: [SanadService],
})
export class SanadModule {} 
