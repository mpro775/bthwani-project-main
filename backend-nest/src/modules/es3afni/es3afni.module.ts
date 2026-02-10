import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { Es3afni, Es3afniSchema } from './entities/es3afni.entity';
import { Es3afniDonor, Es3afniDonorSchema } from './entities/es3afni-donor.entity';
import { Es3afniDonorAlert, Es3afniDonorAlertSchema } from './entities/es3afni-donor-alert.entity';
import { Es3afniController } from './es3afni.controller';
import { Es3afniService } from './es3afni.service';
import { Es3afniDonorService } from './es3afni-donor.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Es3afni.name, schema: Es3afniSchema },
      { name: Es3afniDonor.name, schema: Es3afniDonorSchema },
      { name: Es3afniDonorAlert.name, schema: Es3afniDonorAlertSchema },
    ]),
    JwtModule.register({}),
  ],
  controllers: [Es3afniController],
  providers: [Es3afniService, Es3afniDonorService],
  exports: [Es3afniService, Es3afniDonorService],
})
export class Es3afniModule {} 
