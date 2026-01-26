import React, {
  useState,
  useEffect,
  type ReactNode,
} from "react";
import {
  loginWithEmail,
  registerWithEmail,
  logout as authLogout,
} from "../api/auth";
import { fetchUserProfile, updateUserProfile } from "../api/user";
import { storage } from "../utils/storage";
import toast from "react-hot-toast";
import type { User } from "../types";
import { AuthContext, type AuthContextType } from "./context";
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = storage.getIdToken();
      const userData = storage.getUserData();

      if (token && userData) {
        setUser(userData);
      }
    } catch (error) {
      console.error("Auth check error:", error);
    } finally {
      setLoading(false);
      setAuthReady(true);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      await loginWithEmail(email, password);

      // Fetch user profile
      const profile = await fetchUserProfile();

      setUser(profile);
      storage.setUserData(profile);

      toast.success("تم تسجيل الدخول بنجاح");
      return { success: true, data: profile };
    } catch (error: unknown) {
      console.error("Login error:", error);
      const message =
        (error as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message || "فشل تسجيل الدخول";
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const register = async (
    email: string,
    password: string,
    fullName: string,
    phone: string
  ) => {
    try {
      await registerWithEmail(email, password);

      // Auto login after registration
      const loginResult = await login(email, password);

      if (loginResult.success && loginResult.data) {
        // Update user profile with additional information
        try {
          await updateUserProfile({
            fullName,
            phone,
          });
          // Update local user data with the new information
          const updatedUser = { ...loginResult.data, fullName, phone };
          setUser(updatedUser);
          storage.setUserData(updatedUser);
        } catch (profileError) {
          console.warn("Failed to update profile:", profileError);
        }

        toast.success("تم إنشاء الحساب بنجاح");
      }

      return loginResult;
    } catch (error: unknown) {
      console.error("Register error:", error);
      const message =
        (error as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message || "فشل إنشاء الحساب";
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const logout = () => {
    authLogout();
    setUser(null);
    toast.success("تم تسجيل الخروج بنجاح");
  };

  const updateUser = (userData: User) => {
    setUser(userData);
    storage.setUserData(userData);
  };

  const updateProfile = async (profileData: Partial<User>) => {
    try {
      const updatedProfile = await updateUserProfile(profileData);

      // Update local user data
      if (user) {
        const newUser = { ...user, ...updatedProfile };
        setUser(newUser);
        storage.setUserData(newUser);
      }

      toast.success("تم تحديث الملف الشخصي بنجاح");
    } catch (error: unknown) {
      console.error("Update profile error:", error);
      const message =
        (error as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message || "فشل تحديث الملف الشخصي";
      toast.error(message);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    authReady,
    login,
    register,
    logout,
    updateUser,
    updateProfile,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};


