import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { PaymentsApiService } from './payments-api.service';
import { Payment } from './entities/payment.entity';
import { PaymentsController } from './payment.controller';
import { PaymentsService } from './payment.service';
import { PendingPaymentsJob } from './pending-payments.job';

@Module({
  imports: [TypeOrmModule.forFeature([Payment])],
  providers: [PaymentsApiService, PaymentsService, PendingPaymentsJob],
  controllers: [PaymentsController],
})
export class PaymentsModule {}
