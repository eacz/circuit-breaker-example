import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ExternalApiService } from './external-api/external-api.service';
import { ProtectedApiService } from './protected-api/protected-api.service';
import { DemoController } from './demo/demo.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DemodbModule } from './demodb/demodb.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'test',
      password: 'test',
      database: 'cb_demo',
      autoLoadEntities: true,
      synchronize: true,
    }),
    DemodbModule,
  ],
  controllers: [AppController, DemoController],
  providers: [AppService, ExternalApiService, ProtectedApiService],
})
export class AppModule {}
