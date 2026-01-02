import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as CircuitBreaker from 'opossum';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Payment } from './entities/payment.entity';
import { PaymentsApiService } from './payments-api.service';

@Injectable()
export class PaymentsService implements OnModuleInit {
  private breaker: CircuitBreaker;

  constructor(
    @InjectRepository(Payment)
    private readonly repo: Repository<Payment>,
    private readonly api: PaymentsApiService,
    private readonly events: EventEmitter2,
  ) {}

  onModuleInit() {
    this.breaker = new CircuitBreaker(
      async (payment: Payment) => {
        await this.api.charge(payment.amount);
        payment.status = 'PAID';
        return this.repo.save(payment);
      },
      {
        timeout: 2000,
        errorThresholdPercentage: 50,
        resetTimeout: 5000,
      },
    );

    this.breaker.on('open', () => console.log('🔴 Circuit OPEN'));
    this.breaker.on('halfOpen', () => console.log('🟡 Circuit HALF-OPEN'));
    this.breaker.on('close', () => console.log('🟢 Circuit CLOSED'));

    this.breaker.fallback(async (payment: Payment) => {
      console.log('📩 Encolando pago', payment.id);
      this.events.emit('payment.deferred', payment.id);
      return payment;
    });
  }

  async create(amount: number) {
    const payment = this.repo.create({
      amount,
      status: 'PENDING',
    });

    const saved = await this.repo.save(payment);

    return this.breaker.fire(saved);
  }
}
