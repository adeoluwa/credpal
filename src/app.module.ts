import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { WalletModule } from './wallet/wallet.module';
import { FxRateModule } from './fx_rate/fx-rate.module';
import { TransactionModule } from './transaction/transaction.module';
import { TradingModule } from './trading/trading.module';
import config from '../ormconfig';
import { User } from './user/user.entity';
import { Wallet } from './wallet/wallet.entity';
import { FxRate } from './fx_rate/fx-rate.entity';
import { Transaction } from './transaction/transaction.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot({
      ...config,
      entities: [User, Wallet, FxRate, Transaction],
      synchronize: false,
      logging: true,
    }),
    AuthModule,
    UserModule,
    WalletModule,
    FxRateModule,
    TransactionModule,
    TradingModule,
  ],
})
export class AppModule {}
