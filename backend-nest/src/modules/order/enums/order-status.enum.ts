export enum OrderStatus {
  CREATED = 'created',
  CONFIRMED = 'confirmed',
  PREPARING = 'preparing',
  READY = 'ready',
  PICKED_UP = 'picked_up',
  ON_THE_WAY = 'on_the_way',
  ARRIVED = 'arrived',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  RETURNED = 'returned',
  REFUNDED = 'refunded',
  FAILED = 'failed',
}

export enum OrderType {
  MARKETPLACE = 'marketplace', // طلب من المتاجر
  ERRAND = 'errand', // طلب توصيل (مهمة)
  UTILITY = 'utility', // خدمات (غاز، ماء)
}

export enum PaymentMethod {
  CASH = 'cash',
  WALLET = 'wallet',
  CARD = 'card',
  MIXED = 'mixed',
}
