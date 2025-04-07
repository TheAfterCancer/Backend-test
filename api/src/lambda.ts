import { Handler, Context, Callback } from 'aws-lambda';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import * as express from 'express';
import * as awsServerlessExpress from 'aws-serverless-express';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './exception-filter/exception.filter';

let server: any;

async function bootstrapServer(): Promise<any> {
  const expressApp = express();
  const app = await NestFactory.create(AppModule, new ExpressAdapter(expressApp));
  app.useGlobalFilters(new AllExceptionsFilter());
  await app.init();

  return awsServerlessExpress.createServer(expressApp);
}

export const handler: Handler = async (event: any, context: Context, callback: Callback) => {
  server = server ?? (await bootstrapServer());
  return awsServerlessExpress.proxy(server, event, context, 'PROMISE').promise;
};
