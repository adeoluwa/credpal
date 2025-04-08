import {
  Controller,
  Post,
  Body,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { TradingService } from './trading.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';
import { User } from '../user/user.entity';
import { CreateTradeDto } from './dto/create-trade.dto';
import { WalletService } from '../wallet/wallet.service';

@Controller('trading')
@UseGuards(JwtAuthGuard)
export class TradingController {
  constructor(
    private readonly tradingService: TradingService,
    private readonly walletService: WalletService,
  ) {}

  @Post('exchange')
  async exchangeCurrency(
    @GetUser() user: User,
    @Body() CreateTradeDto: CreateTradeDto,
  ) {
    const wallet = await this.walletService.getWalletByCurrency(
      user.id,
      CreateTradeDto.fromCurrency,
    );

    if (!wallet) {
      throw new NotFoundException(
        `No ${CreateTradeDto.fromCurrency} wallet found for user`,
      );
    }

    return this.tradingService.exchangeCurrency(
      user.id,
      CreateTradeDto.fromCurrency,
      CreateTradeDto.toCurrency,
      CreateTradeDto.amount,
      wallet.id,
    );
  }
}
