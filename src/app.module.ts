import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { NexbankModule } from './components/nexbank.module';

@Module({
  imports: [NexbankModule],
  controllers: [AppController],
  providers: [AppService],
  exports: [NexbankModule],
})
export class AppModule {}
