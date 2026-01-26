// __tests__/localization.test.ts
import i18n from 'localization/i18n';

describe('Localization Tests', () => {
  beforeEach(() => {
    // إعادة تعيين اللغة إلى العربية
    i18n.changeLanguage('ar');
  });

  describe('Arabic Language', () => {
    test('يعرض النصوص باللغة العربية', () => {
      expect(i18n.t('common.add')).toBe('إضافة');
      expect(i18n.t('common.delete')).toBe('حذف');
      expect(i18n.t('common.save')).toBe('حفظ');
      expect(i18n.t('common.cancel')).toBe('إلغاء');
    });

    test('يعرض رسائل الخطأ باللغة العربية', () => {
      expect(i18n.t('errors.network')).toBe('خطأ في الاتصال بالشبكة');
      expect(i18n.t('errors.invalidEmail')).toBe('البريد الإلكتروني غير صحيح');
      expect(i18n.t('errors.required')).toBe('هذا الحقل مطلوب');
    });

    test('يعرض رسائل النجاح باللغة العربية', () => {
      expect(i18n.t('success.saved')).toBe('تم الحفظ بنجاح');
      expect(i18n.t('success.deleted')).toBe('تم الحذف بنجاح');
      expect(i18n.t('success.updated')).toBe('تم التحديث بنجاح');
    });
  });

  describe('English Language', () => {
    beforeEach(() => {
      i18n.changeLanguage('en');
    });

    test('يعرض النصوص باللغة الإنجليزية', () => {
      expect(i18n.t('common.add')).toBe('Add');
      expect(i18n.t('common.delete')).toBe('Delete');
      expect(i18n.t('common.save')).toBe('Save');
      expect(i18n.t('common.cancel')).toBe('Cancel');
    });

    test('يعرض رسائل الخطأ باللغة الإنجليزية', () => {
      expect(i18n.t('errors.network')).toBe('Network error');
      expect(i18n.t('errors.invalidEmail')).toBe('Invalid email');
      expect(i18n.t('errors.required')).toBe('This field is required');
    });

    test('يعرض رسائل النجاح باللغة الإنجليزية', () => {
      expect(i18n.t('success.saved')).toBe('Saved successfully');
      expect(i18n.t('success.deleted')).toBe('Deleted successfully');
      expect(i18n.t('success.updated')).toBe('Updated successfully');
    });
  });

  describe('Language Switching', () => {
    test('يتحول بين اللغات بشكل صحيح', () => {
      // بداية بالعربية
      expect(i18n.t('common.add')).toBe('إضافة');
      
      // التحول للإنجليزية
      i18n.changeLanguage('en');
      expect(i18n.t('common.add')).toBe('Add');
      
      // العودة للعربية
      i18n.changeLanguage('ar');
      expect(i18n.t('common.add')).toBe('إضافة');
    });

    test('يحتفظ باللغة المحددة', () => {
      i18n.changeLanguage('en');
      expect(i18n.language).toBe('en');
      
      i18n.changeLanguage('ar');
      expect(i18n.language).toBe('ar');
    });
  });

  describe('Missing Translations', () => {
    test('يتعامل مع النصوص المفقودة', () => {
      // نص غير موجود
      expect(i18n.t('missing.key')).toBe('missing.key');
      
      // نص مع قيمة افتراضية
      expect(i18n.t('missing.key', { defaultValue: 'قيمة افتراضية' })).toBe('قيمة افتراضية');
    });

    test('يتعامل مع المفاتيح الفارغة', () => {
      expect(i18n.t('')).toBe('');
      expect(i18n.t(null as any)).toBe('');
      expect(i18n.t(undefined as any)).toBe('');
    });
  });

  describe('Pluralization', () => {
    test('يتعامل مع الجمع في اللغة العربية', () => {
      i18n.changeLanguage('ar');
      
      expect(i18n.t('cart.items', { count: 0 })).toBe('لا توجد منتجات');
      expect(i18n.t('cart.items', { count: 1 })).toBe('منتج واحد');
      expect(i18n.t('cart.items', { count: 2 })).toBe('منتجان');
      expect(i18n.t('cart.items', { count: 10 })).toBe('10 منتجات');
    });

    test('يتعامل مع الجمع في اللغة الإنجليزية', () => {
      i18n.changeLanguage('en');
      
      expect(i18n.t('cart.items', { count: 0 })).toBe('No items');
      expect(i18n.t('cart.items', { count: 1 })).toBe('1 item');
      expect(i18n.t('cart.items', { count: 2 })).toBe('2 items');
      expect(i18n.t('cart.items', { count: 10 })).toBe('10 items');
    });
  });

  describe('Interpolation', () => {
    test('يستبدل المتغيرات في النصوص', () => {
      i18n.changeLanguage('ar');
      
      expect(i18n.t('welcome.message', { name: 'أحمد' })).toBe('مرحباً أحمد');
      expect(i18n.t('order.status', { orderNumber: '12345' })).toBe('طلب رقم 12345');
    });

    test('يتعامل مع المتغيرات المفقودة', () => {
      i18n.changeLanguage('ar');
      
      expect(i18n.t('welcome.message', { name: undefined })).toBe('مرحباً ');
      expect(i18n.t('order.status', {})).toBe('طلب رقم {{orderNumber}}');
    });
  });

  describe('Date and Number Formatting', () => {
    test('يُنسق التواريخ حسب اللغة', () => {
      const date = new Date('2024-01-15');
      
      i18n.changeLanguage('ar');
      expect(i18n.t('date.format', { date })).toBe('Mon Jan 15 2024 03:00:00 GMT+0300 (التوقيت العربي الرسمي)');
      
      i18n.changeLanguage('en');
      expect(i18n.t('date.format', { date })).toBe('Mon Jan 15 2024 03:00:00 GMT+0300 (التوقيت العربي الرسمي)');
    });

    test('يُنسق الأرقام حسب اللغة', () => {
      i18n.changeLanguage('ar');
      const arResult = i18n.t('number.format', { value: 1234.56 });
      expect(arResult).toBe('1,234.56');
      
      i18n.changeLanguage('en');
      const enResult = i18n.t('number.format', { value: 1234.56 });
      expect(enResult).toBe('1,234.56');
    });
  });
});
