// src/pages/drivers/schema.ts
import { z } from "zod";
import { validationUtils } from "../../utils/validation";
import { ERROR_MESSAGES } from "../../utils/errorMessages";

// Base schema لإنشاء سائق (يحتوي .pipe على fullName؛ Zod لا يسمح بـ .omit() على مثل هذه الـ schemas)
export const createDriverSchema = z.object({
  fullName: z
    .string({ error: ERROR_MESSAGES.DRIVER.FULL_NAME_REQUIRED })
    .min(1, ERROR_MESSAGES.DRIVER.FULL_NAME_REQUIRED)
    .max(100, ERROR_MESSAGES.DRIVER.FULL_NAME_TOO_LONG),

  phone: validationUtils.yemenPhone(ERROR_MESSAGES.DRIVER.PHONE_INVALID),

  email: validationUtils.email(ERROR_MESSAGES.DRIVER.EMAIL_INVALID),

  password: validationUtils.strongPassword(),

  role: validationUtils.enum(
    ["rider_driver", "light_driver", "women_driver"] as const,
    ERROR_MESSAGES.DRIVER.ROLE_INVALID
  ),

  vehicleType: validationUtils.enum(
    ["motor", "bike", "car"] as const,
    ERROR_MESSAGES.DRIVER.VEHICLE_TYPE_INVALID
  ),

  driverType: validationUtils.enum(
    ["primary", "joker"] as const,
    ERROR_MESSAGES.DRIVER.DRIVER_TYPE_INVALID
  ),

  residenceLocation: z.object({
    address: validationUtils.required(ERROR_MESSAGES.DRIVER.ADDRESS_REQUIRED),
    city: validationUtils.required(ERROR_MESSAGES.DRIVER.CITY_REQUIRED),
    governorate: validationUtils.required(ERROR_MESSAGES.DRIVER.GOVERNORATE_REQUIRED),
    lat: z.number()
      .min(-90, ERROR_MESSAGES.DRIVER.LATITUDE_INVALID)
      .max(90, ERROR_MESSAGES.DRIVER.LATITUDE_INVALID),
    lng: z.number()
      .min(-180, ERROR_MESSAGES.DRIVER.LONGITUDE_INVALID)
      .max(180, ERROR_MESSAGES.DRIVER.LONGITUDE_INVALID),
  }),

  jokerFrom: z.string().optional(),
  jokerTo: z.string().optional(),

  isFemaleDriver: z.boolean().optional(),
  isVerified: z.boolean().optional(),
  isAvailable: z.boolean().optional(),
  isBanned: z.boolean().optional(),
}).refine((data) => {
  if (data.driverType === "joker") {
    if (!data.jokerFrom || !data.jokerTo) return false;
    const fromDate = new Date(data.jokerFrom);
    const toDate = new Date(data.jokerTo);
    if (toDate <= fromDate) return false;
  }
  return true;
}, {
  message: ERROR_MESSAGES.DRIVER.JOKER_INVALID_PERIOD,
  path: ["jokerFrom"],
});

// Schema لتحديث بيانات السائق (بدون كلمة المرور) — معرف يدوياً لأن .omit() لا يعمل مع schemas فيها refine/pipe
export const updateDriverSchema = z.object({
  fullName: z.string().min(1, "اسم السائق مطلوب").max(100, "اسم السائق يجب ألا يزيد عن 100 حرف").optional(),
  phone: z.string().regex(/^7[1378]\d{7}$/, "رقم الجوال يجب أن يكون 9 أرقام ويبدأ بـ 77 أو 78 أو 71 أو 73").optional(),
  email: z.string().email("البريد الإلكتروني غير صالح").optional(),
  role: z.enum(["rider_driver", "light_driver", "women_driver"]).optional(),
  vehicleType: z.enum(["motor", "bike", "car"]).optional(),
  driverType: z.enum(["primary", "joker"]).optional(),
  residenceLocation: z.object({
    address: z.string().min(1, "عنوان السكن مطلوب"),
    city: z.string().min(1, "المدينة مطلوبة"),
    governorate: z.string().min(1, "المحافظة مطلوبة"),
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
  }).optional(),
  jokerFrom: z.string().optional(),
  jokerTo: z.string().optional(),
  isFemaleDriver: z.boolean().optional(),
  isVerified: z.boolean().optional(),
  isAvailable: z.boolean().optional(),
  isBanned: z.boolean().optional(),
}).refine((data) => {
  if (data.driverType === "joker") {
    if (!data.jokerFrom || !data.jokerTo) return false;
    const fromDate = new Date(data.jokerFrom);
    const toDate = new Date(data.jokerTo);
    if (toDate <= fromDate) return false;
  }
  return true;
}, {
  message: "تاريخ نهاية الجوكر يجب أن يكون بعد تاريخ البداية",
  path: ["jokerFrom"],
});

// Schema للبحث في السائقين
export const driverSearchSchema = z.object({
  q: z.string().optional(),
  role: z.enum(["rider_driver", "light_driver", "women_driver"]).optional(),
  vehicleType: z.enum(["motor", "bike", "car"]).optional(),
  driverType: z.enum(["primary", "joker"]).optional(),
  isAvailable: z.boolean().optional(),
  isVerified: z.boolean().optional(),
  isBanned: z.boolean().optional(),
  page: z.number().min(1).optional(),
  perPage: z.number().min(1).max(100).optional(),
});

// Schema لتحديث حالة السائق
export const updateDriverStatusSchema = z.object({
  isAvailable: z.boolean().optional(),
  isVerified: z.boolean().optional(),
  isBanned: z.boolean().optional(),
});

// Schema لتحديث كلمة المرور
export const updateDriverPasswordSchema = z.object({
  currentPassword: validationUtils.strongPassword(),
  newPassword: validationUtils.strongPassword(),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "كلمات المرور غير متطابقة",
  path: ["confirmPassword"],
});

// Schema لتحديث موقع السائق الحالي
export const updateDriverLocationSchema = z.object({
  lat: z.number()
    .min(-90, ERROR_MESSAGES.DRIVER.LATITUDE_INVALID)
    .max(90, ERROR_MESSAGES.DRIVER.LATITUDE_INVALID),
  lng: z.number()
    .min(-180, ERROR_MESSAGES.DRIVER.LONGITUDE_INVALID)
    .max(180, ERROR_MESSAGES.DRIVER.LONGITUDE_INVALID),
});

// Schema لتحديث عنوان السكن
export const updateDriverResidenceSchema = z.object({
  address: validationUtils.required(ERROR_MESSAGES.DRIVER.ADDRESS_REQUIRED),
  city: validationUtils.required(ERROR_MESSAGES.DRIVER.CITY_REQUIRED),
  governorate: validationUtils.required(ERROR_MESSAGES.DRIVER.GOVERNORATE_REQUIRED),
  lat: z.number()
    .min(-90, ERROR_MESSAGES.DRIVER.LATITUDE_INVALID)
    .max(90, ERROR_MESSAGES.DRIVER.LATITUDE_INVALID),
  lng: z.number()
    .min(-180, ERROR_MESSAGES.DRIVER.LONGITUDE_INVALID)
    .max(180, ERROR_MESSAGES.DRIVER.LONGITUDE_INVALID),
});

// Schema لإنشاء طلب إجازة للسائق
export const createDriverLeaveRequestSchema = z.object({
  driverId: z.string().min(1, "معرف السائق مطلوب"),
  startDate: z.date({ message: "تاريخ البداية مطلوب" }),
  endDate: z.date({ message: "تاريخ النهاية مطلوب" }),
  reason: validationUtils.required("سبب الإجازة مطلوب"),
}).refine((data) => data.endDate > data.startDate, {
  message: "تاريخ النهاية يجب أن يكون بعد تاريخ البداية",
  path: ["endDate"],
});

// استنتاج أنواع البيانات من الـ schemas
export type CreateDriverData = z.infer<typeof createDriverSchema>;
export type UpdateDriverData = z.infer<typeof updateDriverSchema>;
export type DriverSearchData = z.infer<typeof driverSearchSchema>;
export type UpdateDriverStatusData = z.infer<typeof updateDriverStatusSchema>;
export type UpdateDriverPasswordData = z.infer<typeof updateDriverPasswordSchema>;
export type UpdateDriverLocationData = z.infer<typeof updateDriverLocationSchema>;
export type UpdateDriverResidenceData = z.infer<typeof updateDriverResidenceSchema>;
export type CreateDriverLeaveRequestData = z.infer<typeof createDriverLeaveRequestSchema>;
