import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UserService } from './user.service';
import { WalletModule } from '../wallet/wallet.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), forwardRef(() => WalletModule)],
  providers: [UserService],
  exports: [UserService, TypeOrmModule],
})
export class UserModule {}
