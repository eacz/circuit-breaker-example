import { Injectable } from '@nestjs/common';

@Injectable()
export class PaymentsApiService {
  private down = false;

  setDown(value: boolean) {
    this.down = value;
  }

  async charge(data: any) {
    if (this.down) {
      throw new Error('Payments API DOWN');
    }

    return {
      status: 'PAID',
      amount: data.amount,
    };
  }
}
