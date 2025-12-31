import { Module } from '@nestjs/common';
import { DemoDbService } from './demodb.service';
import { DemoDbController } from './demodb.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Item } from './entities/demodb-entity';

@Module({
  controllers: [DemoDbController],
  providers: [DemoDbService],
  imports: [TypeOrmModule.forFeature([Item])],
})
export class DemodbModule {}
