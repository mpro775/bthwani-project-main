export * from './order-owner.guard';
export * from './order-driver.guard';

// Export as array for providers
import { OrderOwnerGuard } from './order-owner.guard';
import { OrderDriverGuard } from './order-driver.guard';

export default [OrderOwnerGuard, OrderDriverGuard];
