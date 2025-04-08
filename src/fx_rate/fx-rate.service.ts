import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { FxRate } from './fx-rate.entity';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class FxRateService {
  private readonly logger = new Logger(FxRateService.name);
  private readonly cache = new Map<string, { rate: number; expiresAt: Date }>();
  private readonly CACHE_TTL = 300000; // 5 minutes

  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
    @InjectRepository(FxRate)
    private fxRateRepository: Repository<FxRate>,
  ) {}

  async getExchangeRate(
    fromCurrency: string,
    toCurrency: string,
  ): Promise<number> {
    const cacheKey = `${fromCurrency}_${toCurrency}`;

    // Check in-memory cache
    const cachedRate = this.cache.get(cacheKey);
    if (cachedRate && new Date() < cachedRate.expiresAt) {
      return cachedRate.rate;
    }

    // Check database cache
    const dbRate = await this.fxRateRepository.findOne({
      where: {
        fromCurrency,
        toCurrency,
        expiresAt: MoreThan(new Date()),
      },
    });

    if (dbRate) {
      this.cache.set(cacheKey, {
        rate: dbRate.rate,
        expiresAt: dbRate.expiresAt,
      });
      return dbRate.rate;
    }

    // Fetch from API
    return this.fetchAndCacheRate(fromCurrency, toCurrency);
  }

  private async fetchAndCacheRate(
    fromCurrency: string,
    toCurrency: string,
  ): Promise<number> {
    try {
      const apiKey: string =
        this.configService.get<string>('FX_API_KEY') ??
        (() => {
          throw new Error('FX_API_KEY is not defined in the configuration');
        })();
      const response = await firstValueFrom(
        this.httpService.get(
          `https://api.example.com/convert?from=${fromCurrency}&to=${toCurrency}`,
          { headers: { Authorization: `Bearer ${apiKey}` } },
        ),
      );

      const rate = (response as { data: { rate: number } }).data.rate;
      const expiresAt = new Date(Date.now() + this.CACHE_TTL);

      // Update caches
      this.cache.set(`${fromCurrency}_${toCurrency}`, { rate, expiresAt });

      await this.fxRateRepository.save({
        fromCurrency,
        toCurrency,
        rate,
        expiresAt,
      });

      return rate;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to fetch FX rate: ${errorMessage}`);
      throw new Error('Failed to fetch exchange rate');
    }
  }
}
