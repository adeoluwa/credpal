import { IsString, IsIn } from 'class-validator';
import { SUPPORTED_CURRENCIES } from '../../wallet/constants';

export class GetRateDto {
  @IsString()
  @IsIn(SUPPORTED_CURRENCIES)
  fromCurrency!: string;

  @IsString()
  @IsIn(SUPPORTED_CURRENCIES)
  toCurrency!: string;
}
