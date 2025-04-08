import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { FxRateService } from './fx-rate.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('fx-rates')
@UseGuards(JwtAuthGuard)
export class FxRateController {
  constructor(private readonly fxRateService: FxRateService) {}

  @Get()
  async getExchangeRate(
    @Query('from') fromCurrency: string,
    @Query('to') toCurrency: string,
  ) {
    const rate = await this.fxRateService.getExchangeRate(
      fromCurrency,
      toCurrency,
    );
    return { fromCurrency, toCurrency, rate, timestamp: new Date() };
  }
}
