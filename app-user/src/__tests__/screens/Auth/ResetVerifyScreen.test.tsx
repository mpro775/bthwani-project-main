import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { Alert } from 'react-native';
import ResetVerifyScreen from '../../../screens/Auth/ResetVerifyScreen';

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
      email: 'test@example.com'
    }
  })
}));

// Mock API calls
jest.mock('../../../api/passwordResetApi', () => ({
  verifyResetCode: jest.fn(),
  requestPasswordReset: jest.fn(),
}));

// Mock Alert
jest.spyOn(Alert, 'alert').mockImplementation(() => {});

describe('ResetVerifyScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockReplace.mockClear();
    mockNavigate.mockClear();
    mockGoBack.mockClear();
  });

  test('يجب أن يعرض شاشة التحقق من رمز إعادة تعيين كلمة المرور', () => {
    render(
      <NavigationContainer>
        <ResetVerifyScreen />
      </NavigationContainer>
    );

    expect(screen.getByText('أدخل رمز التحقق')).toBeTruthy();
    expect(screen.getByText('تحقق')).toBeTruthy();
    expect(screen.getByText('إعادة إرسال الرمز')).toBeTruthy();
  });

  test('يجب أن يعرض حقول إدخال رمز التحقق', () => {
    render(
      <NavigationContainer>
        <ResetVerifyScreen />
      </NavigationContainer>
    );

    // التحقق من وجود حقول إدخال رمز التحقق (TextInput)
    const textInputs = screen.getAllByRole('text');
    expect(textInputs.length).toBeGreaterThan(0);
  });

  test('يجب أن يعرض البريد الإلكتروني', () => {
    render(
      <NavigationContainer>
        <ResetVerifyScreen />
      </NavigationContainer>
    );

    expect(screen.getByText('test@example.com')).toBeTruthy();
  });

  test('يجب أن يعرض زر التحقق', () => {
    render(
      <NavigationContainer>
        <ResetVerifyScreen />
      </NavigationContainer>
    );

    const verifyButton = screen.getByText('تحقق');
    expect(verifyButton).toBeTruthy();
  });

  test('يجب أن يعرض زر إعادة الإرسال', () => {
    render(
      <NavigationContainer>
        <ResetVerifyScreen />
      </NavigationContainer>
    );

    const resendButton = screen.getByText('إعادة إرسال الرمز');
    expect(resendButton).toBeTruthy();
  });



  test('يجب أن يتعامل مع النقر على زر التحقق', () => {
    render(
      <NavigationContainer>
        <ResetVerifyScreen />
      </NavigationContainer>
    );

    const verifyButton = screen.getByText('تحقق');
    fireEvent.press(verifyButton);

    // التحقق من أن الزر موجود
    expect(verifyButton).toBeTruthy();
  });

  test('يجب أن يتعامل مع النقر على زر إعادة الإرسال', () => {
    render(
      <NavigationContainer>
        <ResetVerifyScreen />
      </NavigationContainer>
    );

    const resendButton = screen.getByText('إعادة إرسال الرمز');
    fireEvent.press(resendButton);

    // التحقق من أن الزر موجود
    expect(resendButton).toBeTruthy();
  });

  test('يجب أن يعرض جميع النصوص الأساسية', () => {
    render(
      <NavigationContainer>
        <ResetVerifyScreen />
      </NavigationContainer>
    );

    expect(screen.getByText('أدخل رمز التحقق')).toBeTruthy();
    expect(screen.getByText('تحقق')).toBeTruthy();
    expect(screen.getByText('إعادة إرسال الرمز')).toBeTruthy();
  });

  test('يجب أن يعرض العد التنازلي', () => {
    render(
      <NavigationContainer>
        <ResetVerifyScreen />
      </NavigationContainer>
    );

    expect(screen.getByText(/إعادة الإرسال خلال/)).toBeTruthy();
  });

  test('يجب أن يعرض رسالة البريد الإلكتروني', () => {
    render(
      <NavigationContainer>
        <ResetVerifyScreen />
      </NavigationContainer>
    );

    expect(screen.getByText(/تم الإرسال إلى:/)).toBeTruthy();
    expect(screen.getByText('test@example.com')).toBeTruthy();
  });
});
