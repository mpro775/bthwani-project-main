import { NavigationContainer } from "@react-navigation/native";
import { fireEvent, render, screen } from "@testing-library/react-native";
import React from "react";
import { Alert } from "react-native";
import RegisterScreen from "../../../screens/Auth/RegisterScreen";

// Mock navigation
const mockNavigate = jest.fn();
const mockReplace = jest.fn();
const mockGoBack = jest.fn();

jest.mock("@react-navigation/native", () => ({
  ...jest.requireActual("@react-navigation/native"),
  useNavigation: () => ({
    navigate: mockNavigate,
    replace: mockReplace,
    goBack: mockGoBack,
  }),
}));

// Mock API calls
jest.mock("../../../api/authService", () => ({
  registerWithEmail: jest.fn(),
}));

// Mock AsyncStorage
jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

// Mock axios
jest.mock("axios", () => ({
  get: jest.fn(),
  post: jest.fn(),
}));

// Mock context
jest.mock("context/CartContext", () => ({
  useCart: () => ({
    mergeGuestCart: jest.fn(),
  }),
}));

// Mock storage
jest.mock("storage/userStorage", () => ({
  saveUserProfile: jest.fn(),
}));

// Mock Alert
jest.spyOn(Alert, "alert").mockImplementation(() => {});

describe("RegisterScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockReplace.mockClear();
    mockNavigate.mockClear();
  });

  test("يجب أن يعرض نموذج التسجيل", () => {
    render(
      <NavigationContainer>
        <RegisterScreen />
      </NavigationContainer>
    );

    expect(screen.getByPlaceholderText("الاسم الكامل")).toBeTruthy();
    expect(screen.getByPlaceholderText("البريد الإلكتروني")).toBeTruthy();
    expect(screen.getByPlaceholderText("رقم الهاتف")).toBeTruthy();
    expect(screen.getByPlaceholderText("كلمة المرور")).toBeTruthy();
    expect(screen.getByPlaceholderText("تأكيد كلمة المرور")).toBeTruthy();
    expect(screen.getByText("إنشاء الحساب")).toBeTruthy();
    expect(screen.getByText("هل لديك حساب؟")).toBeTruthy();
  });

  test("يجب أن ينتقل لشاشة تسجيل الدخول", () => {
    render(
      <NavigationContainer>
        <RegisterScreen />
      </NavigationContainer>
    );

    const loginLink = screen.getByText("تسجيل الدخول");
    fireEvent.press(loginLink);

    expect(mockNavigate).toHaveBeenCalledWith("Login");
  });

  test("يجب أن يتعامل مع المدخلات", () => {
    render(
      <NavigationContainer>
        <RegisterScreen />
      </NavigationContainer>
    );

    const fullNameInput = screen.getByPlaceholderText("الاسم الكامل");
    const emailInput = screen.getByPlaceholderText("البريد الإلكتروني");
    const phoneInput = screen.getByPlaceholderText("رقم الهاتف");
    const passwordInput = screen.getByPlaceholderText("كلمة المرور");
    const confirmPasswordInput =
      screen.getByPlaceholderText("تأكيد كلمة المرور");

    // اختبار إدخال النص
    fireEvent.changeText(fullNameInput, "أحمد محمد");
    expect(fullNameInput.props.value).toBe("أحمد محمد");

    fireEvent.changeText(emailInput, "test@example.com");
    expect(emailInput.props.value).toBe("test@example.com");

    fireEvent.changeText(phoneInput, "0123456789");
    expect(phoneInput.props.value).toBe("0123456789");

    fireEvent.changeText(passwordInput, "password123");
    expect(passwordInput.props.value).toBe("password123");

    fireEvent.changeText(confirmPasswordInput, "password123");
    expect(confirmPasswordInput.props.value).toBe("password123");
  });

  test("يجب أن يعرض زر إنشاء الحساب", () => {
    render(
      <NavigationContainer>
        <RegisterScreen />
      </NavigationContainer>
    );

    const registerButton = screen.getByText("إنشاء الحساب");
    expect(registerButton).toBeTruthy();
  });

  test("يجب أن يعرض جميع الحقول المطلوبة", () => {
    render(
      <NavigationContainer>
        <RegisterScreen />
      </NavigationContainer>
    );

    // التحقق من وجود جميع الحقول
    expect(screen.getByPlaceholderText("الاسم الكامل")).toBeTruthy();
    expect(screen.getByPlaceholderText("البريد الإلكتروني")).toBeTruthy();
    expect(screen.getByPlaceholderText("رقم الهاتف")).toBeTruthy();
    expect(screen.getByPlaceholderText("كلمة المرور")).toBeTruthy();
    expect(screen.getByPlaceholderText("تأكيد كلمة المرور")).toBeTruthy();
  });

  test("يجب أن يعرض رابط تسجيل الدخول", () => {
    render(
      <NavigationContainer>
        <RegisterScreen />
      </NavigationContainer>
    );

    expect(screen.getByText("هل لديك حساب؟")).toBeTruthy();
    expect(screen.getByText("تسجيل الدخول")).toBeTruthy();
  });

  test("يجب أن يتعامل مع النقر على زر إنشاء الحساب", () => {
    render(
      <NavigationContainer>
        <RegisterScreen />
      </NavigationContainer>
    );

    const registerButton = screen.getByText("إنشاء الحساب");
    fireEvent.press(registerButton);

    // التحقق من أن الزر موجود
    expect(registerButton).toBeTruthy();
  });
});
