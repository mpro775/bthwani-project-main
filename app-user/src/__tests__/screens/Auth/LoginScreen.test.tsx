import { NavigationContainer } from "@react-navigation/native";
import {
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react-native";
import React from "react";
import { Alert } from "react-native";
import LoginScreen from "../../../screens/Auth/LoginScreen";

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
  loginWithEmail: jest.fn(),
  refreshIdToken: jest.fn(),
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

// Mock expo-local-authentication
jest.mock("expo-local-authentication", () => ({
  hasHardwareAsync: jest.fn(),
  isEnrolledAsync: jest.fn(),
  authenticateAsync: jest.fn(),
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

describe("LoginScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockReplace.mockClear();
    mockNavigate.mockClear();
  });

  test("يجب أن يعرض نموذج تسجيل الدخول", () => {
    render(
      <NavigationContainer>
        <LoginScreen />
      </NavigationContainer>
    );

    expect(screen.getByPlaceholderText("أدخل بريدك الإلكتروني")).toBeTruthy();
    expect(screen.getByPlaceholderText("أدخل كلمة المرور")).toBeTruthy();
    expect(screen.getByText("تسجيل الدخول")).toBeTruthy();
    expect(screen.getByText("نسيت كلمة المرور؟")).toBeTruthy();
    expect(screen.getByText("ليس لديك حساب؟")).toBeTruthy();
  });

  test("يجب أن يتعامل مع أخطاء تسجيل الدخول", async () => {
    const mockLoginWithEmail =
      require("../../../api/authService").loginWithEmail;
    mockLoginWithEmail.mockRejectedValue({
      response: {
        data: {
          error: {
            message: "INVALID_PASSWORD",
          },
        },
      },
    });

    render(
      <NavigationContainer>
        <LoginScreen />
      </NavigationContainer>
    );

    const emailInput = screen.getByPlaceholderText("أدخل بريدك الإلكتروني");
    const passwordInput = screen.getByPlaceholderText("أدخل كلمة المرور");
    const loginButton = screen.getByText("تسجيل الدخول");

    fireEvent.changeText(emailInput, "test@example.com");
    fireEvent.changeText(passwordInput, "password123");
    fireEvent.press(loginButton);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        "خطأ في تسجيل الدخول",
        "كلمة المرور غير صحيحة"
      );
    });
  });

  test("يجب أن يتعامل مع تسجيل الدخول الناجح", async () => {
    const mockLoginWithEmail =
      require("../../../api/authService").loginWithEmail;
    const mockAxios = require("axios");

    mockLoginWithEmail.mockResolvedValue({
      idToken: "test-token",
      localId: "user123",
      displayName: "أحمد محمد",
      email: "test@example.com",
    });

    mockAxios.post.mockResolvedValue({});
    mockAxios.get.mockResolvedValue({
      data: {
        emailVerified: true,
        email: "test@example.com",
      },
    });

    render(
      <NavigationContainer>
        <LoginScreen />
      </NavigationContainer>
    );

    const emailInput = screen.getByPlaceholderText("أدخل بريدك الإلكتروني");
    const passwordInput = screen.getByPlaceholderText("أدخل كلمة المرور");
    const loginButton = screen.getByText("تسجيل الدخول");

    fireEvent.changeText(emailInput, "test@example.com");
    fireEvent.changeText(passwordInput, "password123");
    fireEvent.press(loginButton);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        "🎉 مرحبًا بك من جديد!",
        "تم تسجيل الدخول بنجاح."
      );
      expect(mockReplace).toHaveBeenCalledWith("MainApp");
    });
  });

  test("يجب أن ينتقل لشاشة إعادة تعيين كلمة المرور", () => {
    render(
      <NavigationContainer>
        <LoginScreen />
      </NavigationContainer>
    );

    const forgotPasswordLink = screen.getByText("نسيت كلمة المرور؟");
    fireEvent.press(forgotPasswordLink);

    expect(mockNavigate).toHaveBeenCalledWith("ForgotPassword");
  });

  test("يجب أن ينتقل لشاشة التسجيل", () => {
    render(
      <NavigationContainer>
        <LoginScreen />
      </NavigationContainer>
    );

    const registerLink = screen.getByText("إنشاء حساب جديد");
    fireEvent.press(registerLink);

    expect(mockNavigate).toHaveBeenCalledWith("Register");
  });

  test("يجب أن يتعامل مع البريد الإلكتروني غير المؤكد", async () => {
    const mockLoginWithEmail =
      require("../../../api/authService").loginWithEmail;
    const mockAxios = require("axios");

    mockLoginWithEmail.mockResolvedValue({
      idToken: "test-token",
      localId: "user123",
      displayName: "أحمد محمد",
      email: "test@example.com",
    });

    mockAxios.post.mockResolvedValue({});
    mockAxios.get.mockResolvedValue({
      data: {
        emailVerified: false,
        email: "test@example.com",
        _id: "user123",
      },
    });

    render(
      <NavigationContainer>
        <LoginScreen />
      </NavigationContainer>
    );

    const emailInput = screen.getByPlaceholderText("أدخل بريدك الإلكتروني");
    const passwordInput = screen.getByPlaceholderText("أدخل كلمة المرور");
    const loginButton = screen.getByText("تسجيل الدخول");

    fireEvent.changeText(emailInput, "test@example.com");
    fireEvent.changeText(passwordInput, "password123");
    fireEvent.press(loginButton);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        "تأكيد البريد",
        "أرسلنا لك رمز التحقق."
      );
      expect(mockReplace).toHaveBeenCalledWith("OTPVerification", {
        email: "test@example.com",
        userId: "user123",
      });
    });
  });

  test("يجب أن يتعامل مع المدخلات", () => {
    render(
      <NavigationContainer>
        <LoginScreen />
      </NavigationContainer>
    );

    const emailInput = screen.getByPlaceholderText("أدخل بريدك الإلكتروني");
    const passwordInput = screen.getByPlaceholderText("أدخل كلمة المرور");

    // اختبار إدخال النص
    fireEvent.changeText(emailInput, "test@example.com");
    expect(emailInput.props.value).toBe("test@example.com");

    fireEvent.changeText(passwordInput, "password123");
    expect(passwordInput.props.value).toBe("password123");
  });

  test("يجب أن يعرض زر تسجيل الدخول بالبصمة", () => {
    render(
      <NavigationContainer>
        <LoginScreen />
      </NavigationContainer>
    );

    expect(screen.getByText("تسجيل الدخول بالبصمة")).toBeTruthy();
  });

  test("يجب أن يعرض النصوص الأساسية", () => {
    render(
      <NavigationContainer>
        <LoginScreen />
      </NavigationContainer>
    );

    expect(screen.getByText("مرحباً بك مجدداً")).toBeTruthy();
    expect(screen.getByText("سجل دخولك للمتابعة")).toBeTruthy();
    expect(screen.getByText("البريد الإلكتروني")).toBeTruthy();
    expect(screen.getByText("كلمة المرور")).toBeTruthy();
    expect(screen.getByText("أو")).toBeTruthy();
  });
});
