import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Wallet } from './wallet.entity';
import { User } from '../user/user.entity';

@Injectable()
export class WalletService {
  constructor(
    @InjectRepository(Wallet)
    private walletRepository: Repository<Wallet>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async createInitialWallet(userId: number): Promise<Wallet> {
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) throw new NotFoundException('User not found');

    return this.walletRepository.save({
      user,
      currency: 'NGN',
      balance: 10000.0,
    });
  }

  async getWalletBalance(userId: number, currency: string): Promise<number> {
    const wallet = await this.walletRepository.findOne({
      where: { user: { id: userId }, currency },
    });
    if (!wallet)
      throw new NotFoundException(`Wallet for currency ${currency} not found`);
    return wallet.balance;
  }

  async fundWallet(
    userId: number,
    currency: string,
    amount: number,
  ): Promise<Wallet> {
    let wallet = await this.walletRepository.findOne({
      where: { user: { id: userId }, currency },
      relations: ['user'],
    });

    if (!wallet) {
      const user = await this.userRepository.findOneBy({ id: userId });
      if (!user) {
        throw new NotFoundException('User not found');
      }
      wallet = this.walletRepository.create({
        user,
        currency,
        balance: amount,
      });
    } else {
      wallet.balance += amount;
    }

    return this.walletRepository.save(wallet);
  }

  async getUserWallets(userId: number): Promise<Wallet[]> {
    return this.walletRepository.find({
      where: { user: { id: userId } },
      relations: ['user'],
    });
  }
  async getWalletById(walletId: number): Promise<Wallet> {
    const wallet = await this.walletRepository.findOne({
      where: { id: walletId },
      relations: ['user'],
    });
    if (!wallet) throw new NotFoundException('Wallet not found');
    return wallet;
  }
  async updateWalletBalance(walletId: number, amount: number): Promise<Wallet> {
    const wallet = await this.getWalletById(walletId);
    wallet.balance += amount;
    return this.walletRepository.save(wallet);
  }
  async deductWalletBalance(walletId: number, amount: number): Promise<Wallet> {
    const wallet = await this.getWalletById(walletId);
    if (wallet.balance < amount) {
      throw new Error('Insufficient funds');
    }
    wallet.balance -= amount;
    return this.walletRepository.save(wallet);
  }

  async getWalletByCurrency(
    userId: number,
    currency: string,
  ): Promise<Wallet | null> {
    const wallet = await this.walletRepository.findOne({
      where: { user: { id: userId }, currency },
    });
    if (!wallet) throw new NotFoundException('Wallet not found');
    return wallet;
  }
}
