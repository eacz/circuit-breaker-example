import { Injectable } from '@nestjs/common';

@Injectable()
export class ExternalApiService {
  async getData(): Promise<string> {
    // Simulamos fallos aleatorios
    const fail = Math.random() < 0.5;

    if (fail) {
      throw new Error('External API failed');
    }

    return 'Data from external service';
  }
}
