import { Controller, Get } from '@nestjs/common';
import { DemoDbService } from './demodb.service';

@Controller('items')
export class DemoDbController {
  constructor(private readonly service: DemoDbService) {}

  @Get()
  getAll() {
    return this.service.findAll();
  }
}
