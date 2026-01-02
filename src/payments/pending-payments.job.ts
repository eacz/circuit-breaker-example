import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from './entities/payment.entity';
import { PaymentsApiService } from './payments-api.service';

@Injectable()
export class PendingPaymentsJob {
  constructor(
    @InjectRepository(Payment)
    private readonly repo: Repository<Payment>,
    private readonly api: PaymentsApiService,
  ) {}

  @Cron('*/5 * * * * *') // cada 5 segundos
  async processPending() {
    const pendings = await this.repo.find({
      where: { status: 'PENDING' },
    });

    if (!pendings.length) {
      return;
    }

    console.log(`🔄 Reintentando ${pendings.length} pagos`);

    for (const payment of pendings) {
      try {
        await this.api.charge(payment.amount);
        payment.status = 'PAID';
        await this.repo.save(payment);
        console.log('✅ Pago confirmado', payment.id);
      } catch {
        console.log('⏳ Sigue fallando', payment.id);
      }
    }
  }
}
