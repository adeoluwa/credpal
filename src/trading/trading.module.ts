import { Module } from '@nestjs/common';
import { TradingService } from './trading.service';
import { TradingController } from './trading.controller';
import { WalletModule } from '../wallet/wallet.module';
import { FxRateModule } from '../fx_rate/fx-rate.module';
import { TransactionModule } from '../transaction/transaction.module';

@Module({
  imports: [WalletModule, FxRateModule, TransactionModule],
  providers: [TradingService],
  controllers: [TradingController],
})
export class TradingModule {}
