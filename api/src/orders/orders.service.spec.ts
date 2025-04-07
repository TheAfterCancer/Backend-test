import { Test, TestingModule } from '@nestjs/testing';
import { OrdersService } from './orders.service';

describe('OrdersService', () => {
  let service: OrdersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OrdersService],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create an order', async () => {
    const orderData = {
      userId: 'user1',
      items: [{ productId: 'prod1', quantity: 2 }],
      status: 'created', // although status is set automatically in the service
    };
    const order = await service.createOrder(orderData);
    expect(order).toHaveProperty('id');
    expect(order).toHaveProperty('createdAt');
    expect(order.userId).toEqual(orderData.userId);
    expect(order.items).toEqual(orderData.items);

  });

  it('should return an order by id', async () => {
    const orderData = {
      userId: 'user2',
      items: [{ productId: 'prod2', quantity: 1 }],
      status: 'created',
    };
    const order = await service.createOrder(orderData);
    const foundOrder = await service.getOrderById(order.id);
    expect(foundOrder).toEqual(order);
  });

  it('should delete an order', async () => {
    const orderData = {
      userId: 'user3',
      items: [{ productId: 'prod3', quantity: 5 }],
      status: 'created',
    };
    const order = await service.createOrder(orderData);
    await service.deleteOrder(order.id);
    const foundOrder = await service.getOrderById(order.id);
    expect(foundOrder).toBeNull();
  });
});
