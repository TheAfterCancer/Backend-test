import { Injectable } from '@nestjs/common';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { v4 as uuidv4 } from 'uuid';
import { Order } from './order.interface';


@Injectable()
export class OrdersService {
  private readonly docClient: DocumentClient;
  private readonly tableName: string;

  constructor() {
    this.docClient = new DocumentClient({
      region: process.env.AWS_REGION || 'eu-north-1',
      endpoint: process.env.DYNAMODB_ENDPOINT || 'http://localhost:8000',
    });
    this.tableName = process.env.DYNAMODB_TABLE || 'Orders';
  }

  async getAllOrders(): Promise<Order[]> {
    try {
      const result = await this.docClient.scan({ TableName: this.tableName }).promise();
      return result.Items as Order[];
    } catch (error) {
      throw new Error(`Failed to get orders: ${error.message}`);
    }
  }

  async getOrderById(id: string): Promise<Order | null> {
    try {
      const result = await this.docClient.get({
        TableName: this.tableName,
        Key: { id }
      }).promise();
      return result.Item as Order || null;
    } catch (error) {
      throw new Error(`Failed to get order ${id}: ${error.message}`);
    }
  }

  async deleteOrder(id: string): Promise<void> {
    try {
      await this.docClient.delete({
        TableName: this.tableName,
        Key: { id }
      }).promise();
    } catch (error) {
      throw new Error(`Failed to delete order ${id}: ${error.message}`);
    }
  }

  async createOrder(order: Omit<Order, 'id' | 'createdAt'>): Promise<Order> {
    try {
      const newOrder: Order = {
        ...order,
        id: uuidv4(),
        createdAt: new Date().toISOString()
      };

      await this.docClient.put({
        TableName: this.tableName,
        Item: newOrder
      }).promise();

      return newOrder;
    } catch (error) {
      throw new Error(`Failed to create order: ${error.message}`);
    }
  }

  async updateOrder(id: string, order: Omit<Order, 'id' | 'createdAt'>): Promise<Order> {
    try {
      const result = await this.docClient.update({
        TableName: this.tableName,
        Key: { id },
        UpdateExpression:
          'set #status = :status',
        ExpressionAttributeNames: {
          '#status': 'status',
        },
        ExpressionAttributeValues: {
          ':status': order.status,
        },
        ReturnValues: 'ALL_NEW',
      })
      .promise();

      return result.Attributes as Order;
    } catch (error) {
      throw new Error(`Failed to update order ${id}: ${error.message}`);
    }
  }
}
