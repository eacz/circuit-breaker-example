import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

export type PaymentStatus = 'PENDING' | 'PAID';

@Entity()
export class Payment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  amount: number;

  @Column({ type: 'varchar' })
  status: PaymentStatus;

  @CreateDateColumn()
  createdAt: Date;
}
