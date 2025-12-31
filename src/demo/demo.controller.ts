import { Controller, Get } from '@nestjs/common';
import { ProtectedApiService } from '../protected-api/protected-api.service';

@Controller('demo')
export class DemoController {
  constructor(private readonly api: ProtectedApiService) {}

  @Get()
  async test() {
    return this.api.getData();
  }
}
