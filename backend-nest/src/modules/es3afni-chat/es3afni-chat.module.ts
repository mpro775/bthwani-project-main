import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Es3afni, Es3afniSchema } from '../es3afni/entities/es3afni.entity';
import {
  Es3afniConversation,
  Es3afniConversationSchema,
} from './entities/es3afni-conversation.entity';
import {
  Es3afniMessage,
  Es3afniMessageSchema,
} from './entities/es3afni-message.entity';
import { Es3afniChatController } from './es3afni-chat.controller';
import { Es3afniChatService } from './es3afni-chat.service';

@Module({
  imports: [
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('jwt.secret'),
        signOptions: {
          expiresIn: (configService.get<string>('jwt.expiresIn') || '7d') as any,
        },
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([
      { name: Es3afni.name, schema: Es3afniSchema },
      { name: Es3afniConversation.name, schema: Es3afniConversationSchema },
      { name: Es3afniMessage.name, schema: Es3afniMessageSchema },
    ]),
  ],
  controllers: [Es3afniChatController],
  providers: [Es3afniChatService],
  exports: [Es3afniChatService],
})
export class Es3afniChatModule {}
