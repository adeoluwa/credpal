import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  Index,
} from 'typeorm';
import { User } from '../user/user.entity';
import { Transaction } from '../transaction/transaction.entity';

@Entity()
@Index(['userId', 'currency'], { unique: true })
export class Wallet {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 3 })
  currency!: string; // ISO 4217 currency code (NGN, USD, EUR, etc.)

  @Column('decimal', {
    precision: 19,
    scale: 4,
    default: 0,
  })
  balance!: number;

  @Column()
  userId!: number;

  @ManyToOne(() => User, (user) => user.wallets, { onDelete: 'CASCADE' })
  user!: User;

  @OneToMany(() => Transaction, (transaction) => transaction.wallet)
  transactions!: Transaction[];

  @Column({ default: false })
  isLocked!: boolean; // For transaction safety
}
