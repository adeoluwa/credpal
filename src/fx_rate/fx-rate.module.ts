import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FxRate } from './fx-rate.entity';
import { FxRateService } from './fx-rate.service';
import { FxRateController } from './fx-rate.controller';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [TypeOrmModule.forFeature([FxRate]), HttpModule, ConfigModule],
  providers: [FxRateService],
  controllers: [FxRateController],
  exports: [FxRateService],
})
export class FxRateModule {}
