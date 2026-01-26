// src/utils/validation.ts
import { z } from "zod";

// دوال مساعدة للتحقق من المدخلات
export const validationUtils = {
  // تحقق من رقم الهاتف السعودي (10 أرقام تبدأ بـ 05)
  saudiPhone: (message = "رقم الجوال يجب أن يكون 10 أرقام ويبدأ بـ 05") => {
    return z
      .string()
      .min(1, "رقم الجوال مطلوب")
      .regex(/^05\d{8}$/, message);
  },

  // تحقق من كلمة المرور القوية
  strongPassword: () => {
    return z
      .string()
      .min(8, "كلمة المرور يجب أن تكون 8 أحرف على الأقل")
      .regex(/[A-Z]/, "يجب أن تحتوي على حرف كبير واحد على الأقل")
      .regex(/[a-z]/, "يجب أن تحتوي على حرف صغير واحد على الأقل")
      .regex(/[0-9]/, "يجب أن تحتوي على رقم واحد على الأقل");
  },

  // تحقق من البريد الإلكتروني
  email: (message = "البريد الإلكتروني غير صالح") => {
    return z
      .string()
      .min(1, "البريد الإلكتروني مطلوب")
      .email(message);
  },

  // تحقق من الحقل المطلوب
  required: (message = "هذا الحقل مطلوب") => {
    return z.string().min(1, message);
  },

  // تحقق من الحد الأدنى لطول النص
  minLength: (min: number, message?: string) => {
    return z.string().min(min, message || `يجب أن يكون ${min} أحرف على الأقل`);
  },

  // تحقق من الحد الأقصى لطول النص
  maxLength: (max: number, message?: string) => {
    return z.string().max(max, message || `يجب ألا يزيد عن ${max} حرف`);
  },

  // تحقق من النطاق العددي
  numberRange: (min: number, max: number, message?: string) => {
    return z
      .number()
      .min(min, message || `يجب أن يكون أكبر من أو يساوي ${min}`)
      .max(max, message || `يجب أن يكون أقل من أو يساوي ${max}`);
  },

  // تحقق من القيم المحددة مسبقاً (enum)
  enum: <T extends readonly [string, ...string[]]>(
    values: T,
    message = `يجب أن تكون إحدى القيم التالية: ${values.join(", ")}`
  ) => {
    return z.enum(values, { message });
  },

  // تحقق من التاريخ
  date: (message = "التاريخ غير صالح") => {
    return z.date({ message });
  },

  // تحقق من الإحداثيات الجغرافية
  coordinates: (message = "الإحداثيات غير صالحة") => {
    return z.object({
      lat: z.number().min(-90).max(90, "خط العرض يجب أن يكون بين -90 و 90"),
      lng: z.number().min(-180).max(180, "خط الطول يجب أن يكون بين -180 و 180"),
    }, { message });
  },

  // تحقق من عنوان الموقع
  address: (message = "عنوان الموقع مطلوب") => {
    return z.object({
      address: z.string().min(1, message),
      city: z.string().min(1, "المدينة مطلوبة"),
      governorate: z.string().min(1, "المحافظة مطلوبة"),
      lat: z.number().min(-90).max(90),
      lng: z.number().min(-180).max(180),
    });
  },
};

// دالة للحصول على رسالة خطأ مفهومة من Zod error
export const getErrorMessage = (error: z.ZodError): string => {
  return error.issues[0]?.message || "خطأ في التحقق من البيانات";
};

// دالة للتحقق من البيانات وإرجاع رسالة خطأ واحدة
export const validateWithMessage = <T>(schema: z.ZodSchema<T>, data: unknown): {
  success: boolean;
  data?: T;
  message?: string;
} => {
  try {
    const result = schema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, message: getErrorMessage(error) };
    }
    return { success: false, message: "خطأ غير متوقع في التحقق" };
  }
};
