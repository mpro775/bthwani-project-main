/**
 * سياسة الاسترداد للحجوزات (المرحلة 4 - No-Show والاسترداد)
 *
 * | الحالة     | الاسترداد               | المبلغ المحجوز      |
 * |------------|-------------------------|---------------------|
 * | cancelled  | استرداد كامل للمستخدم   | يُرجع للمستخدم      |
 * | completed  | -                       | يُحوّل للمالك       |
 * | no_show    | عدم استرداد             | يُحوّل للمالك       |
 *
 * ملاحظة: يمكن توسيع السياسة لاحقاً (مثلاً نسبة استرداد عند no_show حسب التوقيت).
 */
export const BOOKING_REFUND_POLICY = {
  cancelled: { refundRatio: 1, transferToOwner: false },
  completed: { refundRatio: 0, transferToOwner: true },
  no_show: { refundRatio: 0, transferToOwner: true },
} as const;
