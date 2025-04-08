import { ApiProperty } from '@nestjs/swagger';
import { TransactionType, TransactionStatus } from '../transaction.entity';

export class TransactionDto {
  @ApiProperty()
  id!: number;

  @ApiProperty({ enum: TransactionType })
  type!: TransactionType;

  @ApiProperty()
  amount!: number;

  @ApiProperty()
  currency!: string;

  @ApiProperty({ required: false })
  convertedAmount?: number;

  @ApiProperty({ required: false })
  convertedCurrency?: string;

  @ApiProperty({ required: false })
  exchangeRate?: number;

  @ApiProperty({ enum: TransactionStatus })
  status!: TransactionStatus;
}
