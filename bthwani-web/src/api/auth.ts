import axios from "axios";
import axiosInstance from "./axios-instance";
import { storage } from "../utils/storage";
import type { AuthResponse } from "../types";

const API_KEY = "AIzaSyDcj9GF6Jsi7aIWHoOmH9OKwdOs2pRswS0";
const BASE_URL = "https://identitytoolkit.googleapis.com/v1";
const SECURE_TOKEN_URL = "https://securetoken.googleapis.com/v1/token";

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
  password: string
): Promise<AuthResponse> => {
  const endpoint = `${BASE_URL}/accounts:signUp?key=${API_KEY}`;
  const payload = { email, password, returnSecureToken: true };
  const response = await axios.post<AuthResponse>(endpoint, payload);
  return response.data;
};

// Login with email
export const loginWithEmail = async (
  email: string,
  password: string
): Promise<AuthResponse> => {
  const { data } = await axios.post<AuthResponse>(
    `${BASE_URL}/accounts:signInWithPassword?key=${API_KEY}`,
    { email, password, returnSecureToken: true }
  );

  const expiresInMs = parseInt(data.expiresIn, 10) * 1000;
  const expiryTime = Date.now() + expiresInMs;

  storage.setIdToken(data.idToken);
  storage.setRefreshToken(data.refreshToken);
  storage.setExpiryTime(String(expiryTime));

  return data;
};

// Refresh ID token
export const refreshIdToken = async (): Promise<string | null> => {
  try {
    const refreshToken = cleanToken(storage.getRefreshToken());
    const expiryTimeStr = storage.getExpiryTime() || "";
    const storedIdToken = cleanToken(storage.getIdToken()) || null;

    if (!refreshToken) {
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

    // Otherwise, refresh
    const params = new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    });

    const { data } = await axios.post(
      `${SECURE_TOKEN_URL}?key=${API_KEY}`,
      params.toString(),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    const newIdToken: string = data.id_token;
    const newRefreshToken: string = data.refresh_token;
    const newExpiry = Date.now() + parseInt(data.expires_in, 10) * 1000;

    storage.setIdToken(newIdToken);
    storage.setRefreshToken(newRefreshToken);
    storage.setExpiryTime(String(newExpiry));

    return newIdToken;
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

// Store Firebase tokens
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

// Clear tokens
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
