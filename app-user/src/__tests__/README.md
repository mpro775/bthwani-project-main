# ملفات الاختبار - Test Files

هذا المجلد يحتوي على جميع ملفات الاختبار للتطبيق، منظمة حسب النوع والوظيفة.

## هيكل المجلدات - Directory Structure

```
src/__tests__/
├── api/                    # اختبارات API
│   ├── api.test.ts
│   ├── authService.test.ts
│   ├── favorites.service.test.ts
│   └── userApi.test.ts
├── components/            # اختبارات المكونات
│   ├── BusinessProductItem.test.tsx
│   ├── components.test.tsx
│   ├── DeliveryHeader.test.tsx
│   ├── DynamicFAB.test.tsx
│   ├── FAQSection.test.tsx
│   ├── FloatingCartButton.test.tsx
│   ├── RadioGroup.test.tsx
│   ├── RatingModal.test.tsx
│   ├── sanity.test.ts
│   ├── ScheduledDeliveryPicker.test.tsx
│   └── SkeletonBox.test.tsx
├── screens/              # اختبارات الشاشات
│   ├── BusinessDetailsScreen.test.tsx
│   ├── CartScreen.test.tsx
│   ├── DeliveryHomeScreen.test.tsx
│   ├── FavoritesScreen.test.tsx
│   ├── HomeScreen.test.tsx
│   ├── LoginScreen.test.tsx
│   └── OnboardingScreen.test.tsx
├── context/              # اختبارات السياق
│   ├── CartContext.test.tsx
│   └── ThemeContext.test.tsx
├── utils/                # اختبارات الأدوات المساعدة
│   └── utils.test.ts
└── integration/          # اختبارات التكامل
    ├── accessibility.test.tsx
    ├── integration.test.tsx
    ├── localization.test.ts
    ├── offline.test.ts
    ├── performance.test.tsx
    └── security.test.ts
```

## أنواع الاختبارات - Test Types

### 1. اختبارات API - API Tests

- اختبارات خدمات المصادقة
- اختبارات واجهات المستخدم
- اختبارات المفضلة
- اختبارات API عامة

### 2. اختبارات المكونات - Component Tests

- اختبارات مكونات واجهة المستخدم
- اختبارات المكونات التفاعلية
- اختبارات المكونات المركبة

### 3. اختبارات الشاشات - Screen Tests

- اختبارات شاشات المصادقة
- اختبارات الشاشات الرئيسية
- اختبارات شاشات التسوق
- اختبارات شاشات الملف الشخصي

### 4. اختبارات السياق - Context Tests

- اختبارات سياق السلة
- اختبارات سياق المظهر

### 5. اختبارات الأدوات المساعدة - Utility Tests

- اختبارات الدوال المساعدة
- اختبارات الأدوات المشتركة

### 6. اختبارات التكامل - Integration Tests

- اختبارات الأداء
- اختبارات الأمان
- اختبارات إمكانية الوصول
- اختبارات العمل دون اتصال
- اختبارات الترجمة

## تشغيل الاختبارات - Running Tests

```bash
# تشغيل جميع الاختبارات
npm test

# تشغيل اختبارات محددة
npm test -- --testPathPattern=api
npm test -- --testPathPattern=components
npm test -- --testPathPattern=screens

# تشغيل الاختبارات مع تغطية
npm test -- --coverage
```

## إضافة اختبارات جديدة - Adding New Tests

عند إضافة اختبارات جديدة، تأكد من وضعها في المجلد المناسب:

1. **اختبارات API**: ضعها في مجلد `api/`
2. **اختبارات المكونات**: ضعها في مجلد `components/`
3. **اختبارات الشاشات**: ضعها في مجلد `screens/`
4. **اختبارات السياق**: ضعها في مجلد `context/`
5. **اختبارات الأدوات**: ضعها في مجلد `utils/`
6. **اختبارات التكامل**: ضعها في مجلد `integration/`

## معايير التسمية - Naming Conventions

- استخدم `.test.ts` للملفات التي تحتوي على اختبارات TypeScript
- استخدم `.test.tsx` للملفات التي تحتوي على اختبارات React Components
- اتبع نمط التسمية: `[اسم_الملف].test.[امتداد]`

## ملاحظات مهمة - Important Notes

- تأكد من أن جميع الاختبارات تمر بنجاح قبل الدمج
- حافظ على تغطية الاختبارات عالية (80%+)
- اكتب اختبارات واضحة ومفهومة
- استخدم وصفات مناسبة للاختبارات
