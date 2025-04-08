import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';
import { User } from '../user/user.entity';

@Controller('wallets')
@UseGuards(JwtAuthGuard)
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get()
  async getUserWallets(@GetUser() user: User) {
    console.log(user);
    return this.walletService.getUserWallets(user.id);
  }

  @Get(':currency')
  async getWalletBalance(
    @GetUser() user: User,
    @Param('currency') currency: string,
  ) {
    return {
      balance: await this.walletService.getWalletBalance(user.id, currency),
      currency,
    };
  }

  @Post('fund')
  async fundWallet(
    @GetUser() user: User,
    @Body('currency') currency: string,
    @Body('amount') amount: number,
  ) {
    return this.walletService.fundWallet(user.id, currency, amount);
  }
}
