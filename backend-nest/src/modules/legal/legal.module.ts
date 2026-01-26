import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { LegalController } from './legal.controller';
import { LegalService } from './legal.service';
import {
  PrivacyPolicy,
  PrivacyPolicySchema,
} from './entities/privacy-policy.entity';
import {
  TermsOfService,
  TermsOfServiceSchema,
} from './entities/terms-of-service.entity';
import { UserConsent, UserConsentSchema } from './entities/user-consent.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PrivacyPolicy.name, schema: PrivacyPolicySchema },
      { name: TermsOfService.name, schema: TermsOfServiceSchema },
      { name: UserConsent.name, schema: UserConsentSchema },
    ]),
    JwtModule,
  ],
  controllers: [LegalController],
  providers: [LegalService],
  exports: [LegalService],
})
export class LegalModule {}
