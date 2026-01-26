import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { Kenz, KenzSchema } from '../kenz/entities/kenz.entity';
import { KenzConversation, KenzConversationSchema } from './entities/kenz-conversation.entity';
import { KenzMessage, KenzMessageSchema } from './entities/kenz-message.entity';
import { KenzChatController } from './kenz-chat.controller';
import { KenzChatService } from './kenz-chat.service';
import { KenzChatGateway } from './kenz-chat.gateway';

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
      { name: Kenz.name, schema: KenzSchema },
      { name: KenzConversation.name, schema: KenzConversationSchema },
      { name: KenzMessage.name, schema: KenzMessageSchema },
    ]),
  ],
  controllers: [KenzChatController],
  providers: [KenzChatService, KenzChatGateway],
  exports: [KenzChatService],
})
export class KenzChatModule {}
