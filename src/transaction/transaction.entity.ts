/* eslint-disable @typescript-eslint/no-unsafe-return */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { User } from '../user/user.entity';
import { Wallet } from '../wallet/wallet.entity';

export enum TransactionType {
  DEPOSIT = 'deposit',
  WITHDRAWAL = 'withdrawal',
  EXCHANGE = 'exchange',
  TRANSFER = 'transfer',
}

export enum TransactionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REVERSED = 'reversed',
}

@Entity('transaction')
@Index(['userId', 'createdAt'])
@Index(['reference', 'status'])
export class Transaction {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({
    type: 'enum',
    enum: TransactionType,
  })
  type!: TransactionType;

  @Column('decimal', { precision: 19, scale: 4 })
  amount!: number;

  @Column({ length: 3 })
  currency!: string;

  @Column('decimal', {
    precision: 19,
    scale: 4,
    nullable: true,
  })
  convertedAmount!: number;

  @Column({ length: 3, nullable: true })
  convertedCurrency!: string;

  @Column('decimal', {
    precision: 19,
    scale: 6,
    nullable: true,
  })
  exchangeRate!: number;

  @Column({
    type: 'enum',
    enum: TransactionStatus,
    default: TransactionStatus.PENDING,
  })
  status!: TransactionStatus;

  @Column({ nullable: true })
  description?: string;

  @Column({ unique: true })
  reference!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @Column()
  userId!: number;

  @ManyToOne(() => User, (user) => user.transactions)
  user!: User;

  @Column({ nullable: true })
  walletId!: number;

  @ManyToOne(() => Wallet, (wallet) => wallet.transactions)
  wallet!: Wallet;
  length: any;
}
