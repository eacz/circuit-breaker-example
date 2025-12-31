import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ExternalApiService } from './external-api/external-api.service';
import { ProtectedApiService } from './protected-api/protected-api.service';
import { DemoController } from './demo/demo.controller';

@Module({
  imports: [],
  controllers: [AppController, DemoController],
  providers: [AppService, ExternalApiService, ProtectedApiService],
})
export class AppModule {}
