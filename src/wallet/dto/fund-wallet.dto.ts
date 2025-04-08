import { IsString, IsNumber, Min, IsIn } from 'class-validator';
import { SUPPORTED_CURRENCIES } from '../constants';

export class FundWalletDto {
  @IsString()
  @IsIn(SUPPORTED_CURRENCIES)
  currency!: string;

  @IsNumber()
  @Min(0.01)
  amount!: number;
}
