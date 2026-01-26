import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { Kawader, KawaderSchema } from '../kawader/entities/kawader.entity';
import { KawaderConversation, KawaderConversationSchema } from './entities/kawader-conversation.entity';
import { KawaderMessage, KawaderMessageSchema } from './entities/kawader-message.entity';
import { KawaderChatController } from './kawader-chat.controller';
import { KawaderChatService } from './kawader-chat.service';
import { KawaderChatGateway } from './kawader-chat.gateway';

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
      { name: Kawader.name, schema: KawaderSchema },
      { name: KawaderConversation.name, schema: KawaderConversationSchema },
      { name: KawaderMessage.name, schema: KawaderMessageSchema },
    ]),
  ],
  controllers: [KawaderChatController],
  providers: [KawaderChatService, KawaderChatGateway],
  exports: [KawaderChatService],
})
export class KawaderChatModule {}
