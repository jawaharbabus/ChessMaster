import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ChatGateway } from './chat/chat.gateway';
import PeerService from './peer/peer.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, ChatGateway, PeerService],
})
export class AppModule {}
