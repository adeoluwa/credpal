import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Wallet } from '../wallet/wallet.entity';
import { Transaction } from '../transaction/transaction.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string;

  @Column({ default: false })
  isVerified!: boolean;

  @Column({ name: 'verification_token_hash', nullable: true, length: 255 })
  verificationTokenHash?: string;

  @Column({ name: 'verification_token_expires', nullable: true })
  verificationTokenExpires?: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @OneToMany(() => Wallet, (wallet) => wallet.user)
  wallets!: Wallet[];
  @OneToMany(() => Transaction, (transaction) => transaction.user)
  transactions!: Transaction[];
}
