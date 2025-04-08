import { ApiProperty } from '@nestjs/swagger';
import { TransactionDto } from './transaction.dto';

export class TransactionDetailDto extends TransactionDto {
  @ApiProperty({ required: false })
  description?: string;

  @ApiProperty()
  reference!: string;

  @ApiProperty()
  createdAt!: Date;
}
