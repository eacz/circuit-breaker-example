import { Body, Controller, Post } from '@nestjs/common';
import { PaymentsService } from './payment.service';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly service: PaymentsService) {}

  @Post()
  create(@Body('amount') amount: number) {
    return this.service.create(amount);
  }
}
