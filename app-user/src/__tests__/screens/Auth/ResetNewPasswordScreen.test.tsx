import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { Alert } from 'react-native';
import ResetNewPasswordScreen from '../../../screens/Auth/ResetNewPasswordScreen';

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
      resetToken: 'test-reset-token',
      email: 'test@example.com'
    }
  })
}));

// Mock API calls
jest.mock('../../../api/passwordResetApi', () => ({
  resetPassword: jest.fn(),
}));

// Mock Alert
jest.spyOn(Alert, 'alert').mockImplementation(() => {});

describe('ResetNewPasswordScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockReplace.mockClear();
    mockNavigate.mockClear();
    mockGoBack.mockClear();
  });

  test('يجب أن يعرض شاشة تعيين كلمة مرور جديدة', () => {
    render(
      <NavigationContainer>
        <ResetNewPasswordScreen />
      </NavigationContainer>
    );

    expect(screen.getByText('تعيين كلمة مرور جديدة')).toBeTruthy();
    expect(screen.getByText('كلمة المرور الجديدة')).toBeTruthy();
    expect(screen.getByText('تأكيد كلمة المرور')).toBeTruthy();
    expect(screen.getByText('حفظ')).toBeTruthy();
  });

  test('يجب أن يعرض حقول إدخال كلمة المرور', () => {
    render(
      <NavigationContainer>
        <ResetNewPasswordScreen />
      </NavigationContainer>
    );

    const passwordInputs = screen.getAllByPlaceholderText(/••••••••/);
    expect(passwordInputs.length).toBeGreaterThan(0);

    const confirmInput = screen.getByPlaceholderText('تأكيد كلمة المرور');
    expect(confirmInput).toBeTruthy();
  });

  test('يجب أن يعرض البريد الإلكتروني', () => {
    render(
      <NavigationContainer>
        <ResetNewPasswordScreen />
      </NavigationContainer>
    );

    expect(screen.getByText('test@example.com')).toBeTruthy();
  });

  test('يجب أن يعرض زر الحفظ', () => {
    render(
      <NavigationContainer>
        <ResetNewPasswordScreen />
      </NavigationContainer>
    );

    const saveButton = screen.getByText('حفظ');
    expect(saveButton).toBeTruthy();
  });

  test('يجب أن يتعامل مع إدخال كلمة مرور صحيحة', () => {
    render(
      <NavigationContainer>
        <ResetNewPasswordScreen />
      </NavigationContainer>
    );

    const passwordInputs = screen.getAllByPlaceholderText(/••••••••/);
    const confirmInput = screen.getByPlaceholderText('تأكيد كلمة المرور');

    fireEvent.changeText(passwordInputs[0], 'password123');
    fireEvent.changeText(confirmInput, 'password123');

    expect(passwordInputs[0].props.value).toBe('password123');
    expect(confirmInput.props.value).toBe('password123');
  });

  test('يجب أن يعرض رسالة خطأ عند عدم تطابق كلمتي المرور', () => {
    render(
      <NavigationContainer>
        <ResetNewPasswordScreen />
      </NavigationContainer>
    );

    const passwordInputs = screen.getAllByPlaceholderText(/••••••••/);
    const confirmInput = screen.getByPlaceholderText('تأكيد كلمة المرور');

    fireEvent.changeText(passwordInputs[0], 'password123');
    fireEvent.changeText(confirmInput, 'password456');

    expect(screen.getByText('كلمتا المرور غير متطابقتين')).toBeTruthy();
  });

  test('يجب أن يعرض رسالة المساعدة', () => {
    render(
      <NavigationContainer>
        <ResetNewPasswordScreen />
      </NavigationContainer>
    );

    expect(screen.getByText('٦ أحرف على الأقل')).toBeTruthy();
  });

  test('يجب أن يتعامل مع النقر على زر الحفظ', () => {
    render(
      <NavigationContainer>
        <ResetNewPasswordScreen />
      </NavigationContainer>
    );

    const saveButton = screen.getByText('حفظ');
    fireEvent.press(saveButton);

    // التحقق من أن الزر موجود
    expect(saveButton).toBeTruthy();
  });

  test('يجب أن يعرض جميع النصوص الأساسية', () => {
    render(
      <NavigationContainer>
        <ResetNewPasswordScreen />
      </NavigationContainer>
    );

    expect(screen.getByText('تعيين كلمة مرور جديدة')).toBeTruthy();
    expect(screen.getByText('كلمة المرور الجديدة')).toBeTruthy();
    expect(screen.getByText('تأكيد كلمة المرور')).toBeTruthy();
    expect(screen.getByText('حفظ')).toBeTruthy();
    expect(screen.getByText('٦ أحرف على الأقل')).toBeTruthy();
  });


});
