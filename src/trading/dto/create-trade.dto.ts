import { IsString, IsNumber, Min, IsIn } from 'class-validator';
import { SUPPORTED_CURRENCIES } from '../../wallet/constants';

export class CreateTradeDto {
  @IsString()
  @IsIn(SUPPORTED_CURRENCIES)
  fromCurrency!: string;

  @IsString()
  @IsIn(SUPPORTED_CURRENCIES)
  toCurrency!: string;

  @IsNumber()
  @Min(0.01)
  amount!: number;
}
