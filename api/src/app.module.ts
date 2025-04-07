import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { OrdersModule } from "./orders/orders.module";
import { AppController } from "./app.controller";
import { AuthModule } from "./auth/auth.module";
import { AuthController } from "./auth/auth.controller";

@Module({
  imports: [ConfigModule.forRoot({isGlobal: true}), OrdersModule, AuthModule],
  controllers: [AppController, AuthController],
  providers: [],
})
export class AppModule {}