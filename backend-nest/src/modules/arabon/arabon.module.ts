import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { Arabon, ArabonSchema } from './entities/arabon.entity';
import { ArabonStatusLog, ArabonStatusLogSchema } from './entities/arabon-status-log.entity';
import { ArabonRequest, ArabonRequestSchema } from './entities/arabon-request.entity';
import { BookingSlot, BookingSlotSchema } from './entities/booking-slot.entity';
import { Booking, BookingSchema } from './entities/booking.entity';
import { User, UserSchema } from '../auth/entities/user.entity';
import { WalletModule } from '../wallet/wallet.module';
import { FinanceModule } from '../finance/finance.module';
import { ArabonController } from './arabon.controller';
import { ArabonService } from './arabon.service';
import { BookingSlotService } from './booking-slot.service';
import { BookingService } from './booking.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Arabon.name, schema: ArabonSchema },
      { name: ArabonStatusLog.name, schema: ArabonStatusLogSchema },
      { name: ArabonRequest.name, schema: ArabonRequestSchema },
      { name: BookingSlot.name, schema: BookingSlotSchema },
      { name: Booking.name, schema: BookingSchema },
      { name: User.name, schema: UserSchema },
    ]),
    JwtModule.register({}),
    WalletModule,
    FinanceModule,
  ],
  controllers: [ArabonController],
  providers: [ArabonService, BookingSlotService, BookingService],
  exports: [ArabonService, BookingSlotService, BookingService],
})
export class ArabonModule {}
