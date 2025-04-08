import { Injectable, BadRequestException } from '@nestjs/common';
import { WalletService } from '../wallet/wallet.service';
import { TransactionService } from '../transaction/transaction.service';
import { FxRateService } from '../fx_rate/fx-rate.service';
import {
  TransactionStatus,
  TransactionType,
} from '../transaction/transaction.entity';

@Injectable()
export class TradingService {
  constructor(
    private walletService: WalletService,
    private fxRateService: FxRateService,
    private transactionService: TransactionService,
  ) {}

  async exchangeCurrency(
    userId: number,
    fromCurrency: string,
    toCurrency: string,
    amount: number,
    walletId: number,
  ) {
    // Validate amount
    if (amount <= 0) {
      throw new BadRequestException('Amount must be positive');
    }

    // Get current rate
    const rate = await this.fxRateService.getExchangeRate(
      fromCurrency,
      toCurrency,
    );
    const convertedAmount = amount * rate;

    // Check balance
    const balance = await this.walletService.getWalletBalance(
      userId,
      fromCurrency,
    );
    if (balance < amount) {
      throw new BadRequestException('Insufficient balance');
    }

    // Create transaction record
    const transaction = await this.transactionService.createTransaction({
      type: TransactionType.EXCHANGE,
      amount: {
        amount,
        currency: fromCurrency,
      },
      convertedAmount: {
        amount: convertedAmount,
        currency: toCurrency,
      },
      exchangeRate: rate,
      status: TransactionStatus.PENDING,
      walletId: walletId,
      reference: `EXCH-${Date.now()}`,
      userId,
    });

    try {
      // Execute the exchange
      await this.walletService.fundWallet(userId, fromCurrency, -amount);
      await this.walletService.fundWallet(userId, toCurrency, convertedAmount);

      // Update transaction status
      await this.transactionService.updateTransactionStatus(
        transaction?.id,
        TransactionStatus.COMPLETED,
      );

      return {
        fromAmount: amount,
        fromCurrency,
        toAmount: convertedAmount,
        toCurrency,
        rate,
        timestamp: new Date(),
      };
    } catch (error) {
      await this.transactionService.updateTransactionStatus(
        transaction.id,
        TransactionStatus.FAILED,
      );
      throw error;
    }
  }
}
