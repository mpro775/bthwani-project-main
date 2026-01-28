import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { UserController } from './user.controller';
import { UserCompatController } from './user-compat.controller';
import { UserService } from './user.service';
import { User, UserSchema } from '../auth/entities/user.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    JwtModule.register({}),
    AuthModule,
  ],
  controllers: [UserController, UserCompatController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
