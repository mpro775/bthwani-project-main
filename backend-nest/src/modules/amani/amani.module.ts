import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Amani, AmaniSchema } from './entities/amani.entity';
import { AmaniController } from './amani.controller';
import { AmaniService } from './amani.service';
import { Driver, DriverSchema } from '../driver/entities/driver.entity';
import { AppSettings, AppSettingsSchema } from '../admin/entities/app-settings.entity';
import { BullModule } from '@nestjs/bull';
import { AmaniNotificationHandler } from './events/handlers/amani-notification.handler';
import { GatewaysModule } from '../../gateways/gateways.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Amani.name, schema: AmaniSchema },
      { name: Driver.name, schema: DriverSchema },
      { name: AppSettings.name, schema: AppSettingsSchema },
    ]),
    BullModule.registerQueue({
      name: 'notifications',
    }),
    // Import GatewaysModule to access AmaniGateway (with forwardRef to handle circular dependency)
    forwardRef(() => GatewaysModule),
  ],
  controllers: [AmaniController],
  providers: [AmaniService, AmaniNotificationHandler],
  exports: [AmaniService],
})
export class AmaniModule {} 
