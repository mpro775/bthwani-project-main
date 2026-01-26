export * from './create-order.handler';
export * from './update-order-status.handler';
export * from './assign-driver.handler';
export * from './cancel-order.handler';

import { CreateOrderHandler } from './create-order.handler';
import { UpdateOrderStatusHandler } from './update-order-status.handler';
import { AssignDriverHandler } from './assign-driver.handler';
import { CancelOrderHandler } from './cancel-order.handler';

export const OrderCommandHandlers = [
  CreateOrderHandler,
  UpdateOrderStatusHandler,
  AssignDriverHandler,
  CancelOrderHandler,
];
