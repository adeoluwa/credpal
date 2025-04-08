import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  CreateDateColumn,
} from 'typeorm';

@Entity('fx_rate')
@Index(['fromCurrency', 'toCurrency', 'expiresAt'])
export class FxRate {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 3 })
  fromCurrency!: string;

  @Column({ length: 3 })
  toCurrency!: string;

  @Column('decimal', {
    precision: 19,
    scale: 6,
  })
  rate!: number;

  @Column('decimal', {
    precision: 19,
    scale: 6,
    nullable: true,
  })
  bidPrice!: number;

  @Column('decimal', {
    precision: 19,
    scale: 6,
    nullable: true,
  })
  askPrice?: number;

  @Column()
  expiresAt!: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @Column({ nullable: true })
  source!: string; // API provider name
}
