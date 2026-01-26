# دليل الاختبارات - تطبيق التجار

## نظرة عامة

هذا المجلد يحتوي على جميع اختبارات التطبيق المكتوبة باستخدام Jest و React Native Testing Library.

## هيكل الاختبارات

```
__tests__/
├── components/          # اختبارات المكونات
├── screens/            # اختبارات الشاشات
├── hooks/              # اختبارات React Hooks
├── utils/              # اختبارات الوظائف المساعدة
├── constants/          # اختبارات الثوابت
├── setup.ts            # إعدادات إضافية للاختبارات
└── README.md           # هذا الملف
```

## تشغيل الاختبارات

### تشغيل جميع الاختبارات
```bash
npm test
```

### تشغيل الاختبارات في وضع المراقبة
```bash
npm run test:watch
```

### تشغيل الاختبارات مع تقرير التغطية
```bash
npm run test:coverage
```

### تشغيل الاختبارات في بيئة CI
```bash
npm run test:ci
```

## أنواع الاختبارات

### 1. اختبارات المكونات (Component Tests)
- اختبارات التصيير
- اختبارات التفاعل (النقر، الكتابة)
- اختبارات Props
- اختبارات الحالات المختلفة

### 2. اختبارات الشاشات (Screen Tests)
- اختبارات التنقل
- اختبارات النماذج
- اختبارات API calls
- اختبارات إدارة الحالة

### 3. اختبارات Hooks
- اختبارات Custom Hooks
- اختبارات React Hooks الأساسية
- اختبارات إدارة الحالة

### 4. اختبارات Utils
- اختبارات الوظائف المساعدة
- اختبارات التحقق من صحة البيانات
- اختبارات تنسيق البيانات

## أفضل الممارسات

### 1. تسمية الاختبارات
- استخدم أسماء وصفية وواضحة
- اتبع نمط "should" أو "it"
- اكتب الاختبارات باللغة العربية

### 2. تنظيم الاختبارات
- استخدم `describe` لتجميع الاختبارات ذات الصلة
- استخدم `beforeEach` و `afterEach` للتنظيف
- اكتب اختبارات منفصلة لكل سيناريو

### 3. Mocking
- استخدم Mocks للمكتبات الخارجية
- استخدم Mocks للـ API calls
- استخدم Mocks للـ Navigation

### 4. Assertions
- استخدم assertions واضحة ومحددة
- اختبر السلوك وليس التنفيذ
- استخدم `waitFor` للعمليات غير المتزامنة

## أمثلة على الاختبارات

### اختبار مكون بسيط
```typescript
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Button } from '../Button';

describe('Button Component', () => {
  it('should render correctly', () => {
    const { getByText } = render(<Button title="اضغط هنا" />);
    expect(getByText('اضغط هنا')).toBeTruthy();
  });

  it('should call onPress when pressed', () => {
    const mockOnPress = jest.fn();
    const { getByText } = render(
      <Button title="اضغط هنا" onPress={mockOnPress} />
    );
    
    fireEvent.press(getByText('اضغط هنا'));
    expect(mockOnPress).toHaveBeenCalled();
  });
});
```

### اختبار Hook
```typescript
import { renderHook, waitFor } from '@testing-library/react-native';
import { useCounter } from '../useCounter';

describe('useCounter Hook', () => {
  it('should increment counter', async () => {
    const { result } = renderHook(() => useCounter());
    
    result.current.increment();
    
    await waitFor(() => {
      expect(result.current.count).toBe(1);
    });
  });
});
```

## إعدادات Jest

### الملفات المطلوبة
- `jest.config.js` - إعدادات Jest الرئيسية
- `jest.setup.js` - إعدادات إضافية و Mocks
- `__tests__/setup.ts` - إعدادات خاصة بالاختبارات

### Mocks المطلوبة
- AsyncStorage
- expo-font
- react-navigation
- expo-router
- react-native-maps
- react-native-chart-kit

## تقرير التغطية

### معايير التغطية
- **Branches**: 70%
- **Functions**: 70%
- **Lines**: 70%
- **Statements**: 70%

### عرض التغطية
```bash
npm run test:coverage
```

سيتم إنشاء مجلد `coverage/` يحتوي على تقرير مفصل للتغطية.

## استكشاف الأخطاء

### مشاكل شائعة
1. **خطأ في Mock**: تأكد من أن جميع المكتبات الخارجية مموكة
2. **خطأ في Navigation**: استخدم `jest.mock` لـ `@react-navigation`
3. **خطأ في Async**: استخدم `waitFor` للعمليات غير المتزامنة
4. **خطأ في Font**: تأكد من Mock `expo-font`

### نصائح للتطوير
- اكتب الاختبارات أثناء تطوير الميزات
- ركز على اختبار السلوك وليس التنفيذ
- استخدم `console.log` للتصحيح في الاختبارات
- اكتب اختبارات شاملة تغطي جميع السيناريوهات

## موارد إضافية

- [React Native Testing Library](https://callstack.github.io/react-native-testing-library/)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Expo Testing Guide](https://docs.expo.dev/guides/testing/)
