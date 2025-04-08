import {
  Controller,
  Get,
  Query,
  UseGuards,
  UseInterceptors,
  ClassSerializerInterceptor,
  Param,
  ParseIntPipe,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { GetUser } from '../common/decorators/get-user.decorator';
import { User } from '../user/user.entity';
import { TransactionFilterDto } from './dto/transaction-filter.dto';
import { TransactionsResponseDto } from './dto/transactions-response.dto';
import { TransactionDetailDto } from './dto/transaction-detail.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { TransactionDto } from './dto/transaction.dto';

@ApiTags('Transactions')
@ApiBearerAuth()
@Controller('transactions')
@UseGuards(JwtAuthGuard)
@UseInterceptors(ClassSerializerInterceptor)
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Get()
  @ApiOperation({ summary: 'Get user transaction history with filters' })
  @ApiResponse({
    status: 200,
    description: 'List of transactions',
    type: TransactionsResponseDto,
  })
  @ApiQuery({
    name: 'type',
    enum: ['deposit', 'withdrawal', 'exchange', 'transfer'],
    required: false,
  })
  @ApiQuery({
    name: 'status',
    enum: ['pending', 'completed', 'failed', 'reversed'],
    required: false,
  })
  @ApiQuery({
    name: 'startDate',
    type: String,
    required: false,
    example: '2023-01-01',
  })
  @ApiQuery({
    name: 'endDate',
    type: String,
    required: false,
    example: '2023-12-31',
  })
  @ApiQuery({ name: 'page', type: Number, required: false, example: 1 })
  @ApiQuery({ name: 'limit', type: Number, required: false, example: 10 })
  async getUserTransactions(
    @GetUser() user: User,
    @Query() filterDto: TransactionFilterDto,
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 10,
  ): Promise<TransactionsResponseDto> {
    if (page < 1) throw new BadRequestException('Page must be greater than 0');
    if (limit < 1 || limit > 100) {
      throw new BadRequestException('Limit must be between 1 and 100');
    }

    const [transactions, totalCount] =
      await this.transactionService.getUserTransactions(
        user.id,
        undefined, // Add walletId as undefined or appropriate value
        filterDto,
        page,
        limit,
      );

    return {
      data: Array.isArray(transactions)
        ? transactions.map(() => new TransactionDto())
        : [new TransactionDto()],
      meta: {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        total:
          typeof totalCount === 'number' ? totalCount : transactions.length,
        page,
        limit,
        totalPages: Math.ceil(
          (typeof totalCount === 'number' ? totalCount : transactions.length) /
            limit,
        ),
      },
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get transaction details' })
  @ApiResponse({
    status: 200,
    description: 'Transaction details',
    type: TransactionDetailDto,
  })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  async getTransactionDetail(
    @GetUser() user: User,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<TransactionDetailDto> {
    const transaction = await this.transactionService.getUserTransactions(
      user.id,
      undefined,
      { id } as TransactionFilterDto,
      1,
      10,
    );
    if (!transaction) {
      throw new NotFoundException(`Transaction with ID ${id} not found`);
    }

    return Array.isArray(transaction) && transaction.length > 0
      ? new TransactionDetailDto()
      : new TransactionDetailDto();
  }

  @Get('wallet/:walletId')
  @ApiOperation({ summary: 'Get transactions for a specific wallet' })
  @ApiResponse({
    status: 200,
    description: 'List of wallet transactions',
    type: TransactionsResponseDto,
  })
  @ApiParam({ name: 'walletId', type: Number, example: 1 })
  async getWalletTransactions(
    @GetUser() user: User,
    @Param('walletId', ParseIntPipe) walletId: number,
    @Query() filterDto: TransactionFilterDto,
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 10,
  ): Promise<TransactionsResponseDto> {
    const result = await this.transactionService.getUserTransactions(
      user.id,
      walletId,
      filterDto,
      page,
      limit,
    );

    const transactions = Array.isArray(result) ? result : result[0];
    const total = Array.isArray(result) ? result.length : result[1];

    return {
      data: transactions.map(() => new TransactionDto()),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
