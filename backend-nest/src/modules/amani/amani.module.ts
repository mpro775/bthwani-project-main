import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Amani, AmaniSchema } from './entities/amani.entity';
import { AmaniController } from './amani.controller';
import { AmaniService } from './amani.service';
import { Driver, DriverSchema } from '../driver/entities/driver.entity';
import { BullModule } from '@nestjs/bull';
import { AmaniNotificationHandler } from './events/handlers/amani-notification.handler';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Amani.name, schema: AmaniSchema },
      { name: Driver.name, schema: DriverSchema },
    ]),
    BullModule.registerQueue({
      name: 'notifications',
    }),
  ],
  controllers: [AmaniController],
  providers: [AmaniService, AmaniNotificationHandler],
  exports: [AmaniService],
})
export class AmaniModule {} 
