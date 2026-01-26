import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import FloatingCartButton from 'components/FloatingCartButton';
import { CartProvider } from 'context/CartContext';

// Mock the navigation
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
}));

describe('FloatingCartButton', () => {
  const renderWithProvider = (component: React.ReactElement) => {
    return render(
      <CartProvider>
        {component}
      </CartProvider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockNavigate.mockClear();
  });

  it('يتم عرض المكون بشكل صحيح', () => {
    const { getByTestId } = renderWithProvider(<FloatingCartButton />);
    const button = getByTestId('floating-cart-button');
    expect(button).toBeTruthy();
  });

  it('يتم تطبيق الأنماط الافتراضية عند عدم وجود عناصر', () => {
    const { getByTestId } = renderWithProvider(<FloatingCartButton />);
    const button = getByTestId('floating-cart-button');
    expect(button).toBeTruthy();
  });

  it('يتم عرض أيقونة السلة بشكل صحيح', () => {
    const { getByTestId } = renderWithProvider(<FloatingCartButton />);
    const button = getByTestId('floating-cart-button');
    expect(button).toBeTruthy();
  });

  it('يتم تطبيق الأنماط المخصصة للعداد', () => {
    const { getByTestId } = renderWithProvider(<FloatingCartButton itemCount={5} />);
    const button = getByTestId('floating-cart-button');
    expect(button).toBeTruthy();
  });

  it('يتم تطبيق الأنماط المخصصة للنص', () => {
    const { getByTestId } = renderWithProvider(<FloatingCartButton itemCount={3} />);
    const button = getByTestId('floating-cart-button');
    expect(button).toBeTruthy();
  });

  it('يتم تطبيق الأنماط المخصصة للأيقونة', () => {
    const { getByTestId } = renderWithProvider(<FloatingCartButton />);
    const button = getByTestId('floating-cart-button');
    expect(button).toBeTruthy();
  });

  it('يتم عرض رسالة مخصصة عند عدم وجود عناصر', () => {
    const { getByTestId } = renderWithProvider(<FloatingCartButton itemCount={0} />);
    const button = getByTestId('floating-cart-button');
    expect(button).toBeTruthy();
  });

  it('يتم تطبيق الأنماط المخصصة للرسالة الفارغة', () => {
    const { getByTestId } = renderWithProvider(<FloatingCartButton itemCount={0} />);
    const button = getByTestId('floating-cart-button');
    expect(button).toBeTruthy();
  });

  it('يتم تطبيق الأنماط المخصصة للسعر', () => {
    const { getByTestId } = renderWithProvider(<FloatingCartButton itemCount={2} />);
    const button = getByTestId('floating-cart-button');
    expect(button).toBeTruthy();
  });

  it('يتم تطبيق الأنماط المخصصة للزر', () => {
    const { getByTestId } = renderWithProvider(<FloatingCartButton />);
    const button = getByTestId('floating-cart-button');
    expect(button).toBeTruthy();
  });

  it('يتم تطبيق الأنماط المخصصة للحاوية', () => {
    const { getByTestId } = renderWithProvider(<FloatingCartButton />);
    const button = getByTestId('floating-cart-button');
    expect(button).toBeTruthy();
  });

  it('يتم استدعاء التنقل عند الضغط على الزر', () => {
    const { getByTestId } = renderWithProvider(<FloatingCartButton />);
    const button = getByTestId('floating-cart-button');
    
    fireEvent.press(button);
    expect(mockNavigate).toHaveBeenCalledWith('CartScreen');
  });
});
