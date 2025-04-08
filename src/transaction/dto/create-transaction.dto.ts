import {
  IsEnum,
  IsNumber,
  IsPositive,
  IsString,
  IsOptional,
  ValidateNested,
  IsNotEmpty,
  IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TransactionType, TransactionStatus } from '../transaction.entity';
import { SUPPORTED_CURRENCIES } from '../../wallet/constants';

export class TransactionAmountDto {
  @IsNumber()
  @IsPositive()
  amount!: number;

  @IsString()
  @IsIn(SUPPORTED_CURRENCIES)
  currency!: string;
}

export class CreateTransactionDto {
  @IsEnum(TransactionType)
  type!: TransactionType;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => TransactionAmountDto)
  amount!: TransactionAmountDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => TransactionAmountDto)
  convertedAmount?: TransactionAmountDto;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  exchangeRate?: number;

  @IsEnum(TransactionStatus)
  status: TransactionStatus = TransactionStatus.PENDING;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  @IsNotEmpty()
  reference!: string;

  @IsNumber()
  @IsPositive()
  userId!: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  walletId?: number;
}
