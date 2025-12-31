import { Injectable, OnModuleInit } from '@nestjs/common';
import * as CircuitBreaker from 'opossum';
import { ExternalApiService } from '../external-api/external-api.service';

@Injectable()
export class ProtectedApiService implements OnModuleInit {
  private breaker: CircuitBreaker;

  constructor(private readonly externalApi: ExternalApiService) {}

  onModuleInit() {
    this.breaker = new CircuitBreaker(
      () => this.externalApi.getData(),
      {
        timeout: 3000,               // tiempo máximo de espera
        errorThresholdPercentage: 50, // % de fallos para abrir el circuito
        resetTimeout: 10000,          // tiempo antes de pasar a HALF-OPEN
      },
    );

    // Logs de estados (clave para entenderlo)
    this.breaker.on('open', () => console.log('🔴 Circuit OPEN'));
    this.breaker.on('halfOpen', () => console.log('🟡 Circuit HALF-OPEN'));
    this.breaker.on('close', () => console.log('🟢 Circuit CLOSED'));

    this.breaker.fallback(() => {
      console.log('fallbacken2');
      
      return 'Fallback response';
    });
    
  }

  async getData(): Promise<string> {
    return this.breaker.fire() as Promise<string>;
  }
}
