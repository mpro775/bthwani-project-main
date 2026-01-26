// src/utils/errorMessages.ts
// رسائل الخطأ الموحدة للتحقق من المدخلات

export const ERROR_MESSAGES = {
  // رسائل عامة
  REQUIRED: "هذا الحقل مطلوب",
  INVALID_FORMAT: "التنسيق غير صحيح",
  TOO_SHORT: (min: number) => `يجب أن يكون ${min} أحرف على الأقل`,
  TOO_LONG: (max: number) => `يجب ألا يزيد عن ${max} حرف`,

  // رسائل خاصة بالسائقين
  DRIVER: {
    FULL_NAME_REQUIRED: "اسم السائق مطلوب",
    FULL_NAME_TOO_LONG: "اسم السائق يجب ألا يزيد عن 100 حرف",
    PHONE_REQUIRED: "رقم الجوال مطلوب",
    PHONE_INVALID: "رقم الجوال يجب أن يكون 10 أرقام ويبدأ بـ 05",
    EMAIL_REQUIRED: "البريد الإلكتروني مطلوب",
    EMAIL_INVALID: "البريد الإلكتروني غير صالح",
    PASSWORD_REQUIRED: "كلمة المرور مطلوبة",
    PASSWORD_TOO_WEAK: "كلمة المرور يجب أن تكون 8 أحرف على الأقل وتحتوي على حرف كبير وصغير ورقم",
    ROLE_REQUIRED: "نوع السائق مطلوب",
    ROLE_INVALID: "نوع السائق يجب أن يكون أحد القيم: موصل، لايت، نسائي",
    VEHICLE_TYPE_REQUIRED: "نوع المركبة مطلوب",
    VEHICLE_TYPE_INVALID: "نوع المركبة يجب أن يكون أحد القيم: متر، دراجة، سيارة",
    DRIVER_TYPE_REQUIRED: "نوع السائق مطلوب",
    DRIVER_TYPE_INVALID: "نوع السائق يجب أن يكون أحد القيم: أساسي، جوكر",
    ADDRESS_REQUIRED: "عنوان السكن مطلوب",
    CITY_REQUIRED: "المدينة مطلوبة",
    GOVERNORATE_REQUIRED: "المحافظة مطلوبة",
    LATITUDE_INVALID: "خط العرض يجب أن يكون بين -90 و 90",
    LONGITUDE_INVALID: "خط الطول يجب أن يكون بين -180 و 180",
    JOKER_FROM_REQUIRED: "تاريخ بداية الجوكر مطلوب",
    JOKER_TO_REQUIRED: "تاريخ نهاية الجوكر مطلوب",
    JOKER_INVALID_PERIOD: "تاريخ نهاية الجوكر يجب أن يكون بعد تاريخ البداية",
  },

  // رسائل خاصة بالمشرفين
  ADMIN: {
    NAME_REQUIRED: "اسم المشرف مطلوب",
    NAME_TOO_LONG: "اسم المشرف يجب ألا يزيد عن 100 حرف",
    EMAIL_REQUIRED: "البريد الإلكتروني مطلوب",
    EMAIL_INVALID: "البريد الإلكتروني غير صالح",
    PASSWORD_REQUIRED: "كلمة المرور مطلوبة",
    PASSWORD_TOO_WEAK: "كلمة المرور يجب أن تكون 8 أحرف على الأقل وتحتوي على حرف كبير وصغير ورقم",
    ROLE_REQUIRED: "دور المشرف مطلوب",
    ROLE_INVALID: "دور المشرف يجب أن يكون أحد القيم: سوبر أدمن، أدمن، مدير، دعم",
    STATUS_REQUIRED: "حالة المشرف مطلوبة",
    STATUS_INVALID: "حالة المشرف يجب أن تكون نشط أو معطل",
  },

  // رسائل خاصة بالمتاجر
  STORE: {
    NAME_REQUIRED: "اسم المتجر مطلوب",
    NAME_TOO_LONG: "اسم المتجر يجب ألا يزيد عن 100 حرف",
    DESCRIPTION_TOO_LONG: "وصف المتجر يجب ألا يزيد عن 500 حرف",
    PHONE_REQUIRED: "رقم الهاتف مطلوب",
    PHONE_INVALID: "رقم الهاتف يجب أن يكون 10 أرقام ويبدأ بـ 05",
    EMAIL_REQUIRED: "البريد الإلكتروني مطلوب",
    EMAIL_INVALID: "البريد الإلكتروني غير صالح",
    CATEGORY_REQUIRED: "فئة المتجر مطلوبة",
    ADDRESS_REQUIRED: "عنوان المتجر مطلوب",
    CITY_REQUIRED: "المدينة مطلوبة",
    GOVERNORATE_REQUIRED: "المحافظة مطلوبة",
    LATITUDE_INVALID: "خط العرض يجب أن يكون بين -90 و 90",
    LONGITUDE_INVALID: "خط الطول يجب أن يكون بين -180 و 180",
  },

  // رسائل خاصة بالطلبات
  ORDER: {
    CUSTOMER_NAME_REQUIRED: "اسم العميل مطلوب",
    CUSTOMER_PHONE_REQUIRED: "رقم هاتف العميل مطلوب",
    CUSTOMER_PHONE_INVALID: "رقم هاتف العميل يجب أن يكون 10 أرقام ويبدأ بـ 05",
    DELIVERY_ADDRESS_REQUIRED: "عنوان التوصيل مطلوب",
    ITEMS_REQUIRED: "يجب اختيار منتج واحد على الأقل",
    QUANTITY_INVALID: "الكمية يجب أن تكون أكبر من صفر",
    PRICE_INVALID: "السعر يجب أن يكون أكبر من صفر",
    NOTES_TOO_LONG: "الملاحظات يجب ألا تزيد عن 500 حرف",
  },

  // رسائل خاصة بالكوبونات
  COUPON: {
    CODE_REQUIRED: "كود الكوبون مطلوب",
    CODE_INVALID: "كود الكوبون يجب أن يكون أحرف وأرقام فقط",
    CODE_TOO_LONG: "كود الكوبون يجب ألا يزيد عن 20 حرف",
    DISCOUNT_TYPE_REQUIRED: "نوع الخصم مطلوب",
    DISCOUNT_TYPE_INVALID: "نوع الخصم يجب أن يكون نسبة مئوية أو مبلغ ثابت",
    DISCOUNT_VALUE_INVALID: "قيمة الخصم يجب أن تكون أكبر من صفر",
    MIN_ORDER_AMOUNT_INVALID: "الحد الأدنى للطلب يجب أن يكون أكبر من صفر",
    MAX_DISCOUNT_INVALID: "الحد الأقصى للخصم يجب أن يكون أكبر من صفر",
    USAGE_LIMIT_INVALID: "حد الاستخدام يجب أن يكون أكبر من صفر",
    EXPIRY_DATE_INVALID: "تاريخ الانتهاء يجب أن يكون في المستقبل",
  },
};

// دالة للحصول على رسالة خطأ بناءً على نوع الخطأ
export const getErrorMessage = (field: string, errorType: string, params?: Record<string, number | undefined>): string => {
  // البحث في رسائل الأخطاء الخاصة بالكيانات أولاً
  const entityKeys = ['DRIVER', 'ADMIN', 'STORE', 'ORDER', 'COUPON'];

  for (const entityKey of entityKeys) {
    const entityMessages = ERROR_MESSAGES[entityKey as keyof typeof ERROR_MESSAGES];
    if (entityMessages && typeof entityMessages === 'object' && !Array.isArray(entityMessages) && field in entityMessages) {
      const message = (entityMessages as Record<string, string | ((param: number) => string)>)[field];
      if (typeof message === 'function') {
        return message(params?.value || params?.min || params?.max || 0);
      }
      return message;
    }
  }

  // إذا لم نجد رسالة محددة، نستخدم رسائل عامة
  switch (errorType) {
    case 'required':
      return ERROR_MESSAGES.REQUIRED;
    case 'min':
      return ERROR_MESSAGES.TOO_SHORT(params?.min || 0);
    case 'max':
      return ERROR_MESSAGES.TOO_LONG(params?.max || 100);
    case 'email':
      return ERROR_MESSAGES.ADMIN.EMAIL_INVALID;
    case 'pattern':
      return ERROR_MESSAGES.INVALID_FORMAT;
    default:
      return ERROR_MESSAGES.INVALID_FORMAT;
  }
};
