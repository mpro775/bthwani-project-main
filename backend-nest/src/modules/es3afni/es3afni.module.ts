import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { Es3afni, Es3afniSchema } from './entities/es3afni.entity';
import { Es3afniController } from './es3afni.controller';
import { Es3afniService } from './es3afni.service';


@Module({
  imports: [
    MongooseModule.forFeature([{ name: Es3afni.name, schema: Es3afniSchema }]),
    JwtModule.register({}),
  ],
  controllers: [Es3afniController],
  providers: [Es3afniService],
  exports: [Es3afniService],
})
export class Es3afniModule {} 
