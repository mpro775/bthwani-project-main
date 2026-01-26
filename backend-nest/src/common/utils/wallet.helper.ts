import { BadRequestException } from '@nestjs/common';

/**
 * Helper class لعمليات المحفظة
 * يوحد منطق الـ wallet operations عبر المشروع
 */
export class WalletHelper {
  /**
   * التحقق من كفاية الرصيد
   *
   * @throws BadRequestException إذا كان الرصيد غير كافٍ
   *
   * @example
   * ```typescript
   * WalletHelper.validateBalance(
   *   user.wallet.balance,
   *   user.wallet.onHold,
   *   amount
   * );
   * ```
   */
  static validateBalance(
    balance: number,
    onHold: number,
    requiredAmount: number,
  ): void {
    const availableBalance = this.getAvailableBalance(balance, onHold);

    if (availableBalance < requiredAmount) {
      throw new BadRequestException({
        code: 'INSUFFICIENT_BALANCE',
        message: 'Insufficient wallet balance',
        userMessage: 'الرصيد غير كافٍ لإتمام العملية',
        suggestedAction: 'يرجى شحن المحفظة أو تقليل المبلغ',
        details: {
          available: availableBalance,
          required: requiredAmount,
          shortfall: requiredAmount - availableBalance,
        },
      });
    }
  }

  /**
   * حساب الرصيد المتاح
   */
  static getAvailableBalance(balance: number, onHold: number): number {
    return Math.max(0, balance - onHold);
  }

  /**
   * إنشاء wallet update query لـ credit
   */
  static createCreditUpdate(amount: number): Record<string, unknown> {
    return {
      $inc: {
        'wallet.balance': amount,
        'wallet.totalEarned': amount,
      },
      $set: {
        'wallet.lastUpdated': new Date(),
      },
    };
  }

  /**
   * إنشاء wallet update query لـ debit
   */
  static createDebitUpdate(amount: number): Record<string, unknown> {
    return {
      $inc: {
        'wallet.balance': -amount,
        'wallet.totalSpent': amount,
      },
      $set: {
        'wallet.lastUpdated': new Date(),
      },
    };
  }

  /**
   * إنشاء wallet update query عام
   */
  static createWalletUpdate(
    amount: number,
    type: 'credit' | 'debit',
  ): Record<string, unknown> {
    if (type === 'credit') {
      return this.createCreditUpdate(amount);
    } else {
      return this.createDebitUpdate(amount);
    }
  }

  /**
   * إنشاء update query لحجز المبلغ (hold)
   */
  static createHoldUpdate(amount: number): Record<string, unknown> {
    return {
      $inc: {
        'wallet.onHold': amount,
      },
      $set: {
        'wallet.lastUpdated': new Date(),
      },
    };
  }

  /**
   * إنشاء update query لإطلاق المبلغ المحجوز (release)
   */
  static createReleaseUpdate(amount: number): Record<string, unknown> {
    return {
      $inc: {
        'wallet.onHold': -amount,
        'wallet.balance': -amount,
        'wallet.totalSpent': amount,
      },
      $set: {
        'wallet.lastUpdated': new Date(),
      },
    };
  }

  /**
   * إنشاء update query لإلغاء الحجز (refund held)
   */
  static createRefundHeldUpdate(amount: number): Record<string, unknown> {
    return {
      $inc: {
        'wallet.onHold': -amount,
      },
      $set: {
        'wallet.lastUpdated': new Date(),
      },
    };
  }

  /**
   * حساب نسبة من المبلغ
   */
  static calculatePercentage(amount: number, percentage: number): number {
    return Math.round((amount * percentage) / 100);
  }

  /**
   * تنسيق المبلغ للعرض
   */
  static formatAmount(amount: number, currency: string = 'YER'): string {
    return `${amount.toFixed(2)} ${currency}`;
  }

  /**
   * التحقق من صحة المبلغ
   */
  static validateAmount(amount: number, min: number = 0, max?: number): void {
    if (amount < min) {
      throw new BadRequestException({
        code: 'INVALID_AMOUNT',
        message: 'Amount is below minimum',
        userMessage: `المبلغ أقل من الحد الأدنى (${min})`,
      });
    }

    if (max && amount > max) {
      throw new BadRequestException({
        code: 'INVALID_AMOUNT',
        message: 'Amount exceeds maximum',
        userMessage: `المبلغ يتجاوز الحد الأقصى (${max})`,
      });
    }

    if (amount <= 0) {
      throw new BadRequestException({
        code: 'INVALID_AMOUNT',
        message: 'Amount must be positive',
        userMessage: 'المبلغ يجب أن يكون أكبر من صفر',
      });
    }
  }
}
