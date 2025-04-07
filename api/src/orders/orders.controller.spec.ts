import { Test, TestingModule } from '@nestjs/testing';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';

describe('OrdersController', () => {
  let controller: OrdersController;
  let service: OrdersService;

  const mockOrdersService = {
    createOrder: jest.fn(dto => ({
      id: '123',
      createdAt: new Date().toISOString(),
      ...dto,
    })),
    getAllOrders: jest.fn(() => [{ id: '123', userId: 'user1', items: [], status: 'created', createdAt: new Date().toISOString() }]),
    getOrderById: jest.fn(id => ({ id, userId: 'user1', items: [], status: 'created', createdAt: new Date().toISOString() })),
    deleteOrder: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [
        {
          provide: OrdersService,
          useValue: mockOrdersService,
        },
      ],
    }).compile();

    controller = module.get<OrdersController>(OrdersController);
    service = module.get<OrdersService>(OrdersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create an order', () => {
    const dto = { userId: 'user1', items: [{ productId: 'prod1', quantity: 2 }], status: 'created' };
    expect(controller.createOrder(dto)).toEqual({
      id: '123',
      createdAt: expect.any(String),
      ...dto,
    });
    expect(mockOrdersService.createOrder).toHaveBeenCalledWith(dto);
  });

  it('should return all orders', () => {
    expect(controller.getAllOrders()).toEqual([
      { id: '123', userId: 'user1', items: [], status: 'created', createdAt: expect.any(String) },
    ]);
    expect(mockOrdersService.getAllOrders).toHaveBeenCalled();
  });

  it('should return an order by id', () => {
    expect(controller.getOrderById('123')).toEqual({
      id: '123',
      userId: 'user1',
      items: [],
      status: 'created',
      createdAt: expect.any(String),
    });
    expect(mockOrdersService.getOrderById).toHaveBeenCalledWith('123');
  });

  it('should delete an order', () => {
    controller.deleteOrder('123');
    expect(mockOrdersService.deleteOrder).toHaveBeenCalledWith('123');
  });
});
