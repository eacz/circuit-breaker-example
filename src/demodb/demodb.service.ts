import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as CircuitBreaker from 'opossum';
import { Item } from './entities/demodb-entity';

@Injectable()
export class DemoDbService implements OnModuleInit {
  private breaker: CircuitBreaker<Item[]>;

  constructor(
    @InjectRepository(Item)
    private readonly repo: Repository<Item>,
  ) {}

  onModuleInit() {
    this.breaker = new CircuitBreaker(
      () => this.repo.find(),
      {
        timeout: 2000,
        errorThresholdPercentage: 50,
        resetTimeout: 5000,
      },
    );

    this.breaker.on('open', () => console.log('🔴 DB Circuit OPEN'));
    this.breaker.on('halfOpen', () => console.log('🟡 DB Circuit HALF-OPEN'));
    this.breaker.on('close', () => console.log('🟢 DB Circuit CLOSED'));

    this.breaker.fallback(() => {
      return [];
    });
  }

  async findAll() {
    return this.breaker.fire();
  }
}
