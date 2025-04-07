import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { ConfigModule } from '@nestjs/config';
import { OrdersController } from './orders.controller';

@Module({
  imports: [ConfigModule.forRoot({
    isGlobal: true
  })],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService]
})
export class OrdersModule { }
