import axios from "axios";
import axiosInstance from "./axios-instance";
import { storage } from "../utils/storage";
import type { AuthResponse, AuthApiResponse } from "../types";

const API_URL = import.meta.env.VITE_API_URL || "https://api.bthwani.com/api/v2";

const PREEMPT_REFRESH_MS = 5000;

const cleanToken = (token: string | null | undefined): string | null => {
  if (!token) return null;
  return token
    .replace(/^"(.*)"$/, "$1")
    .replace(/^'(.*)'$/, "$1")
    .trim();
};

// Register with email
export const registerWithEmail = async (
  email: string,
  password: string,
  fullName?: string,
  phone?: string
): Promise<AuthResponse> => {
  const response = await axios.post<{ success: boolean; data: AuthApiResponse }>(
    `${API_URL}/auth/register`,
    { email, password, fullName, phone }
  );

  const { token, user } = response.data.data;
  if (token?.accessToken) {
    storage.setIdToken(token.accessToken);
    // Calculate expiry time (default 7 days)
    const expiresInMs = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
    const expiryTime = Date.now() + expiresInMs;
    storage.setExpiryTime(String(expiryTime));
  }

  return {
    idToken: token?.accessToken || '',
    refreshToken: '', // JWT doesn't use refresh tokens the same way
    expiresIn: token?.expiresIn || '7d',
    localId: user?.id || '',
    email: user?.email || email,
  };
};

// Login with email
export const loginWithEmail = async (
  email: string,
  password: string
): Promise<AuthResponse> => {
  const response = await axios.post<{ success: boolean; data: AuthApiResponse }>(
    `${API_URL}/auth/login`,
    { email, password }
  );

  const { token, user } = response.data.data;
  
  if (token?.accessToken) {
    storage.setIdToken(token.accessToken);
    // Calculate expiry time (default 7 days)
    const expiresInMs = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
    const expiryTime = Date.now() + expiresInMs;
    storage.setExpiryTime(String(expiryTime));
  }

  return {
    idToken: token?.accessToken || '',
    refreshToken: '', // JWT doesn't use refresh tokens the same way
    expiresIn: token?.expiresIn || '7d',
    localId: user?.id || '',
    email: user?.email || email,
  };
};

// Refresh ID token (JWT tokens don't need refresh in the same way, but we check expiry)
export const refreshIdToken = async (): Promise<string | null> => {
  try {
    const expiryTimeStr = storage.getExpiryTime() || "";
    const storedIdToken = cleanToken(storage.getIdToken()) || null;

    if (!storedIdToken) {
      return null;
    }

    const now = Date.now();
    const expiry = parseInt(expiryTimeStr, 10);

    // If token is still valid, return it
    if (
      storedIdToken &&
      Number.isFinite(expiry) &&
      now < expiry - PREEMPT_REFRESH_MS
    ) {
      return storedIdToken;
    }

    // Token expired - user needs to login again
    // JWT tokens from backend don't have refresh tokens in the same way as Firebase
    console.warn("JWT token expired - user needs to login again");
    storage.clearTokens();
    return null;
  } catch (err) {
    console.warn("refreshIdToken error:", err);
    return null;
  }
};

// Get auth header
export const getAuthHeader = async (): Promise<Record<string, string>> => {
  const token = await refreshIdToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Store JWT tokens (renamed from storeFirebaseTokens)
export const storeFirebaseTokens = async (
  idToken: string,
  refreshToken: string,
  expiresIn: number
): Promise<void> => {
  const expiryTime = Date.now() + expiresIn * 1000;
  storage.setIdToken(idToken);
  storage.setRefreshToken(refreshToken);
  storage.setExpiryTime(String(expiryTime));
};

// Clear tokens (renamed from clearFirebaseTokens for backward compatibility)
export const clearFirebaseTokens = (): void => {
  storage.clearTokens();
};

// Logout
export const logout = (): void => {
  storage.clearAll();
};
export async function forgotPassword(payload: { emailOrPhone: string }) {
  return axiosInstance.post("/auth/forgot", payload);
}

export async function verifyResetCode(payload: {
  emailOrPhone: string;
  code: string;
}) {
  return axiosInstance.post("/auth/reset/verify", payload);
}

export async function resetPassword(payload: {
  emailOrPhone: string;
  code: string;
  newPassword: string;
}) {
  return axiosInstance.post("/auth/reset", payload);
}

export async function verifyOTP(payload: { code: string }) {
  return axiosInstance.post("/auth/verify-otp", payload);
}

export default {
  loginWithEmail,
  registerWithEmail,
  refreshIdToken,
  getAuthHeader,
  storeFirebaseTokens,
  clearFirebaseTokens,
  logout,
};
