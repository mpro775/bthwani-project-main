import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import HomeScreen from 'screens/HomeScreen';

// Mock للتنقل
const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
};

// Mock للسياق
const mockCartContext = {
  cartItems: [],
  addToCart: jest.fn(),
  removeFromCart: jest.fn(),
  updateQuantity: jest.fn(),
  cartTotal: 0,
};

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => mockNavigation,
}));

jest.mock('context/CartContext', () => ({
  useCart: () => mockCartContext,
}));

// Mock للـ LinearGradient
jest.mock('expo-linear-gradient', () => ({
  LinearGradient: ({ children, ...props }: any) => <div {...props}>{children}</div>,
}));

// Mock للـ MaterialCommunityIcons
jest.mock('@expo/vector-icons', () => ({
  MaterialCommunityIcons: ({ name, size, color, ...props }: any) => (
    <div data-testid={`icon-${name}`} {...props}>
      {name}
    </div>
  ),
}));

describe('HomeScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('يتم عرض الشاشة بشكل صحيح', async () => {
    const { getByText } = render(<HomeScreen />);
    
    await waitFor(() => {
      // البحث عن النص الكامل بدلاً من النص المقسم
      expect(getByText('أهلًا بك في\nبثواني')).toBeTruthy();
    });
  });

  it('يتم عرض الخدمات الأساسية', async () => {
    const { getByText } = render(<HomeScreen />);
    
    await waitFor(() => {
      expect(getByText('الخدمات الأساسية')).toBeTruthy();
      expect(getByText('تسوق وتوصيل')).toBeTruthy();
      expect(getByText('السوق المفتوح')).toBeTruthy();
      expect(getByText('مهنتي')).toBeTruthy();
    });
  });

  it('يتم عرض الإحصائيات', async () => {
    const { getByText } = render(<HomeScreen />);
    
    await waitFor(() => {
      expect(getByText('50+')).toBeTruthy();
      expect(getByText('خدمة مكتملة')).toBeTruthy();
      expect(getByText('4.9')).toBeTruthy();
      expect(getByText('تقييم عام')).toBeTruthy();
    });
  });

  it('يتم عرض رسالة الترحيب', async () => {
    const { getByText } = render(<HomeScreen />);
    
    await waitFor(() => {
      expect(getByText('كل شئ يوصلك بثواني')).toBeTruthy();
    });
  });

  it('يتم عرض جميع الخدمات', async () => {
    const { getByText } = render(<HomeScreen />);
    
    await waitFor(() => {
      expect(getByText('تسوق وتوصيل')).toBeTruthy();
      expect(getByText('السوق المفتوح')).toBeTruthy();
      expect(getByText('مهنتي')).toBeTruthy();
      expect(getByText(' ساعدني بالدم')).toBeTruthy();
      expect(getByText(' المفقودات')).toBeTruthy();
      expect(getByText('وصلني')).toBeTruthy();
      expect(getByText('عروض وحجوزات')).toBeTruthy();
      expect(getByText('شي إن')).toBeTruthy();
      expect(getByText('التسديد والشحن')).toBeTruthy();
      expect(getByText('الأعمال الخيرية')).toBeTruthy();
      expect(getByText('أبشر')).toBeTruthy();
      expect(getByText('المحفظة')).toBeTruthy();
    });
  });
});
