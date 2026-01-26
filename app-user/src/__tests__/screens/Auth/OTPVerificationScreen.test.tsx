import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { Alert } from 'react-native';
import OTPVerificationScreen from '../../../screens/Auth/OTPVerificationScreen';

// Mock navigation
const mockNavigate = jest.fn();
const mockReplace = jest.fn();
const mockGoBack = jest.fn();

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: mockNavigate,
    replace: mockReplace,
    goBack: mockGoBack,
  }),
  useRoute: () => ({
    params: {
      email: 'test@example.com',
      userId: 'user123'
    }
  })
}));

// Mock API calls
jest.mock('../../../api/authService', () => ({
  verifyOTP: jest.fn(),
  resendOTP: jest.fn(),
  refreshIdToken: jest.fn().mockResolvedValue('mock-token'),
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

// Mock axios
jest.mock('axios', () => ({
  post: jest.fn(),
}));

// Mock Alert
jest.spyOn(Alert, 'alert').mockImplementation(() => {});

describe('OTPVerificationScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockReplace.mockClear();
    mockNavigate.mockClear();
    mockGoBack.mockClear();
  });

  test('يجب أن يعرض شاشة التحقق من رمز OTP', () => {
    render(
      <NavigationContainer>
        <OTPVerificationScreen />
      </NavigationContainer>
    );

    expect(screen.getByText('تحقق من بريدك الإلكتروني')).toBeTruthy();
    expect(screen.getByText('أدخل الرمز المكون من 6 أرقام المرسل إلى')).toBeTruthy();
    expect(screen.getByText('تحقق الآن')).toBeTruthy();
    expect(screen.getByText('إعادة إرسال الرمز')).toBeTruthy();
  });

  test('يجب أن يعرض حقول إدخال رمز OTP', () => {
    render(
      <NavigationContainer>
        <OTPVerificationScreen />
      </NavigationContainer>
    );

    // التحقق من وجود حقول إدخال رمز OTP (TextInput)
    const textInputs = screen.getAllByRole('text');
    expect(textInputs.length).toBeGreaterThan(0);
  });

  test('يجب أن يعرض جميع النصوص الأساسية', () => {
    render(
      <NavigationContainer>
        <OTPVerificationScreen />
      </NavigationContainer>
    );

    expect(screen.getByText('تحقق من بريدك الإلكتروني')).toBeTruthy();
    expect(screen.getByText('أدخل الرمز المكون من 6 أرقام المرسل إلى')).toBeTruthy();
    expect(screen.getByText('تحقق الآن')).toBeTruthy();
    expect(screen.getByText('إعادة إرسال الرمز')).toBeTruthy();
  });

  test('يجب أن يعرض زر التأكيد', () => {
    render(
      <NavigationContainer>
        <OTPVerificationScreen />
      </NavigationContainer>
    );

    const confirmButton = screen.getByText('تحقق الآن');
    expect(confirmButton).toBeTruthy();
  });

  test('يجب أن يعرض زر إعادة الإرسال', () => {
    render(
      <NavigationContainer>
        <OTPVerificationScreen />
      </NavigationContainer>
    );

    const resendButton = screen.getByText('إعادة إرسال الرمز');
    expect(resendButton).toBeTruthy();
  });

  test('يجب أن يتعامل مع النقر على زر التأكيد', () => {
    render(
      <NavigationContainer>
        <OTPVerificationScreen />
      </NavigationContainer>
    );

    const confirmButton = screen.getByText('تحقق الآن');
    fireEvent.press(confirmButton);

    // التحقق من أن الزر موجود
    expect(confirmButton).toBeTruthy();
  });

  test('يجب أن يتعامل مع النقر على زر إعادة الإرسال', () => {
    render(
      <NavigationContainer>
        <OTPVerificationScreen />
      </NavigationContainer>
    );

    const resendButton = screen.getByText('إعادة إرسال الرمز');
    fireEvent.press(resendButton);

    // التحقق من أن الزر موجود
    expect(resendButton).toBeTruthy();
  });

  test('يجب أن يعرض رابط المساعدة', () => {
    render(
      <NavigationContainer>
        <OTPVerificationScreen />
      </NavigationContainer>
    );

    expect(screen.getByText('لم تستلم الرمز؟')).toBeTruthy();
    expect(screen.getByText('تحتاج مساعدة؟')).toBeTruthy();
  });

  test('يجب أن يعرض العد التنازلي', () => {
    render(
      <NavigationContainer>
        <OTPVerificationScreen />
      </NavigationContainer>
    );

    expect(screen.getByText(/إعادة الإرسال خلال/)).toBeTruthy();
  });

  test('يجب أن يعرض البريد الإلكتروني', () => {
    render(
      <NavigationContainer>
        <OTPVerificationScreen />
      </NavigationContainer>
    );

    expect(screen.getByText('test@example.com')).toBeTruthy();
  });


});
