import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { Maarouf, MaaroufSchema } from '../maarouf/entities/maarouf.entity';
import { MaaroufConversation, MaaroufConversationSchema } from './entities/maarouf-conversation.entity';
import { MaaroufMessage, MaaroufMessageSchema } from './entities/maarouf-message.entity';
import { MaaroufChatController } from './maarouf-chat.controller';
import { MaaroufChatService } from './maarouf-chat.service';
import { MaaroufChatGateway } from './maarouf-chat.gateway';

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
      { name: Maarouf.name, schema: MaaroufSchema },
      { name: MaaroufConversation.name, schema: MaaroufConversationSchema },
      { name: MaaroufMessage.name, schema: MaaroufMessageSchema },
    ]),
  ],
  controllers: [MaaroufChatController],
  providers: [MaaroufChatService, MaaroufChatGateway],
  exports: [MaaroufChatService],
})
export class MaaroufChatModule {}
