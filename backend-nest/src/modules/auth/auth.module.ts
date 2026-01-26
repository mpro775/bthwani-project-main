import { Module } from '@nestjs/common';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ConsentService } from './services/consent.service';
import { User, UserSchema } from './entities/user.entity';
import { UserConsent, UserConsentSchema } from './entities/user-consent.entity';
import { Driver, DriverSchema } from '../driver/entities/driver.entity';
import { JwtStrategy } from './strategies/jwt.strategy';
import { FirebaseStrategy } from './strategies/firebase.strategy';
import { UnifiedAuthGuard } from '../../common/guards/unified-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import {
  ConsentGuard,
  PrivacyPolicyConsentGuard,
  TermsOfServiceConsentGuard,
} from '../../common/guards/consent.guard';

@Module({
  imports: [
    // Mongoose - User Model & Consent Model & Driver Model
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: UserConsent.name, schema: UserConsentSchema },
      { name: Driver.name, schema: DriverSchema },
    ]),

    // Passport
    PassportModule.register({ defaultStrategy: 'jwt' }),

    // JWT Module
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const expiresIn = configService.get<string>('jwt.expiresIn') || '7d';
        return {
          secret: configService.get<string>('jwt.secret') || 'default-secret',
          signOptions: {
            expiresIn,
          },
        } as JwtModuleOptions;
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    ConsentService,
    JwtStrategy,
    FirebaseStrategy,
    UnifiedAuthGuard,
    RolesGuard,
    ConsentGuard,
    PrivacyPolicyConsentGuard,
    TermsOfServiceConsentGuard,
  ],
  exports: [
    AuthService,
    ConsentService,
    JwtStrategy,
    FirebaseStrategy,
    UnifiedAuthGuard,
    ConsentGuard,
    PrivacyPolicyConsentGuard,
    TermsOfServiceConsentGuard,
  ],
})
export class AuthModule {}
