import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { Arabon, ArabonSchema } from './entities/arabon.entity';
import { ArabonStatusLog, ArabonStatusLogSchema } from './entities/arabon-status-log.entity';
import { ArabonRequest, ArabonRequestSchema } from './entities/arabon-request.entity';
import { User, UserSchema } from '../auth/entities/user.entity';
import { ArabonController } from './arabon.controller';
import { ArabonService } from './arabon.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Arabon.name, schema: ArabonSchema },
      { name: ArabonStatusLog.name, schema: ArabonStatusLogSchema },
      { name: ArabonRequest.name, schema: ArabonRequestSchema },
      { name: User.name, schema: UserSchema },
    ]),
    JwtModule.register({}),
  ],
  controllers: [ArabonController],
  providers: [ArabonService],
  exports: [ArabonService],
})
export class ArabonModule {}
