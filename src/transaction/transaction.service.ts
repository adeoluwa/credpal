/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from './transaction.entity';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { TransactionFilterDto } from './dto/transaction-filter.dto';
import { TransactionStatus } from './transaction.entity';

@Injectable()
export class TransactionService {
  constructor(
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
  ) {}

  async createTransaction(createTransactionDto: CreateTransactionDto) {
    const transaction = this.transactionRepository.create({
      type: createTransactionDto.type,
      amount: createTransactionDto.amount.amount,
      currency: createTransactionDto.amount.currency,
      convertedAmount: createTransactionDto.convertedAmount?.amount,
      convertedCurrency: createTransactionDto.convertedAmount?.currency,
      exchangeRate: createTransactionDto.exchangeRate,
      status: createTransactionDto.status,
      description: createTransactionDto.description,
      reference: createTransactionDto.reference,
      user: { id: createTransactionDto.userId },
      wallet: createTransactionDto.walletId
        ? { id: createTransactionDto.walletId }
        : undefined,
    });
    return this.transactionRepository.save(transaction);
  }

  async updateTransactionStatus(id: number, status: TransactionStatus) {
    await this.transactionRepository.update(id, { status });
  }

  async getUserTransactions(
    userId: number,
    _walletId?: number,
    _filterDto?: TransactionFilterDto,
    _page?: number,
    _limit?: number,
  ) {
    return this.transactionRepository.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
    });
  }
}
