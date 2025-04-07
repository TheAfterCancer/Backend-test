import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Order } from './order.interface';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  /**
   * Retrieve all orders.
   *
   * @returns A Promise containing all orders.
   */
  @Get()
  getAllOrders(): Promise<Order[]> {
    return this.ordersService.getAllOrders();
  }

  /**
   * Retrieve an order by its ID.
   *
   * @param id The ID of the order to retrieve.
   * @returns A Promise containing the order.
   */
  @Get(':id')
  getOrderById(@Param('id') id: string): Promise<Order | null> {
    return this.ordersService.getOrderById(id);
  }

  /**
   * Delete an order by its ID.
   *
   * @param id The ID of the order to delete.
   * @returns A Promise indicating the result of the deletion.
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  deleteOrder(@Param('id') id: string): Promise<void> {
    return this.ordersService.deleteOrder(id);
  }

  /**
   * Create a new order.
   *
   * @returns A Promise containing the created order.
   */
  @Post()
  @UseGuards(JwtAuthGuard)
  createOrder(@Body() order: Omit<Order, 'id' | 'createdAt'>): Promise<Order> {
    return this.ordersService.createOrder(order);
  }

  /**
   * Update an existing order.
   *
   * @param id The ID of the order to update.
   * @param order The updated order data.
   * @returns A Promise containing the updated order.
   */
  @Put(':id')
  @UseGuards(JwtAuthGuard)
  updateOrder(@Param('id') id: string, @Body() order: Omit<Order, 'id' | 'createdAt'>): Promise<Order> {
    return this.ordersService.updateOrder(id, order);
  }
}
