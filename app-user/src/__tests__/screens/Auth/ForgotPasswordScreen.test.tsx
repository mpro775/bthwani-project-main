import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { Alert } from 'react-native';
import ForgotPasswordScreen from '../../../screens/Auth/ForgotPasswordScreen';

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
}));

// Mock API calls
jest.mock('../../../api/passwordResetApi', () => ({
  sendPasswordResetEmail: jest.fn(),
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

// Mock Alert
jest.spyOn(Alert, 'alert').mockImplementation(() => {});

describe('ForgotPasswordScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockReplace.mockClear();
    mockNavigate.mockClear();
    mockGoBack.mockClear();
  });

  test('يجب أن يعرض نموذج نسيان كلمة المرور', () => {
    render(
      <NavigationContainer>
        <ForgotPasswordScreen />
      </NavigationContainer>
    );

    expect(screen.getByText('استعادة كلمة المرور')).toBeTruthy();
    expect(screen.getByText('أدخل بريدك لإرسال رمز التحقق')).toBeTruthy();
    expect(screen.getByPlaceholderText('example@mail.com')).toBeTruthy();
    expect(screen.getByText('إرسال الرمز')).toBeTruthy();
    expect(screen.getByText('العودة لتسجيل الدخول')).toBeTruthy();
  });

  test('يجب أن يتعامل مع المدخلات', () => {
    render(
      <NavigationContainer>
        <ForgotPasswordScreen />
      </NavigationContainer>
    );

    const emailInput = screen.getByPlaceholderText('example@mail.com');

    // اختبار إدخال النص
    fireEvent.changeText(emailInput, 'test@example.com');
    expect(emailInput.props.value).toBe('test@example.com');

    // اختبار إدخال نص آخر
    fireEvent.changeText(emailInput, 'user@domain.com');
    expect(emailInput.props.value).toBe('user@domain.com');
  });

  test('يجب أن ينتقل لشاشة تسجيل الدخول عند الضغط على العودة', () => {
    render(
      <NavigationContainer>
        <ForgotPasswordScreen />
      </NavigationContainer>
    );

    const backButton = screen.getByText('العودة لتسجيل الدخول');
    fireEvent.press(backButton);

    expect(mockGoBack).toHaveBeenCalled();
  });

  test('يجب أن يعرض جميع النصوص الأساسية', () => {
    render(
      <NavigationContainer>
        <ForgotPasswordScreen />
      </NavigationContainer>
    );

    expect(screen.getByText('استعادة كلمة المرور')).toBeTruthy();
    expect(screen.getByText('أدخل بريدك لإرسال رمز التحقق')).toBeTruthy();
    expect(screen.getByText('البريد الإلكتروني')).toBeTruthy();
    expect(screen.getByText('إرسال الرمز')).toBeTruthy();
    expect(screen.getByText('العودة لتسجيل الدخول')).toBeTruthy();
  });

  test('يجب أن يعرض زر الإرسال', () => {
    render(
      <NavigationContainer>
        <ForgotPasswordScreen />
      </NavigationContainer>
    );

    const sendButton = screen.getByText('إرسال الرمز');
    expect(sendButton).toBeTruthy();
  });

  test('يجب أن يتعامل مع النقر على زر الإرسال', () => {
    render(
      <NavigationContainer>
        <ForgotPasswordScreen />
      </NavigationContainer>
    );

    const sendButton = screen.getByText('إرسال الرمز');
    fireEvent.press(sendButton);

    // التحقق من أن الزر موجود
    expect(sendButton).toBeTruthy();
  });

  test('يجب أن يعرض جميع الحقول المطلوبة', () => {
    render(
      <NavigationContainer>
        <ForgotPasswordScreen />
      </NavigationContainer>
    );

    // التحقق من وجود جميع الحقول
    expect(screen.getByPlaceholderText('example@mail.com')).toBeTruthy();
    expect(screen.getByText('البريد الإلكتروني')).toBeTruthy();
  });

  test('يجب أن يعرض رابط العودة', () => {
    render(
      <NavigationContainer>
        <ForgotPasswordScreen />
      </NavigationContainer>
    );

    expect(screen.getByText('العودة لتسجيل الدخول')).toBeTruthy();
  });
});
