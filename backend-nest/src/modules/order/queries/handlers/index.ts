export * from './get-order.handler';
export * from './get-user-orders.handler';

import { GetOrderHandler } from './get-order.handler';
import { GetUserOrdersHandler } from './get-user-orders.handler';

export const OrderQueryHandlers = [GetOrderHandler, GetUserOrdersHandler];
