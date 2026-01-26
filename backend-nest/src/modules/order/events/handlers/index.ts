export * from './order-created.handler';
export * from './order-status-changed.handler';
export * from './driver-assigned.handler';
export * from './order-cancelled.handler';

import { OrderCreatedHandler } from './order-created.handler';
import { OrderStatusChangedHandler } from './order-status-changed.handler';
import { DriverAssignedHandler } from './driver-assigned.handler';
import { OrderCancelledHandler } from './order-cancelled.handler';

export const OrderEventHandlers = [
  OrderCreatedHandler,
  OrderStatusChangedHandler,
  DriverAssignedHandler,
  OrderCancelledHandler,
];
