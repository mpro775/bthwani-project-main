import { createContext } from 'react';
import type { User } from '../types';

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  authReady: boolean;
  login: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; data?: User; error?: string }>;
  register: (
    email: string,
    password: string,
    fullName: string,
    phone: string
  ) => Promise<{ success: boolean; data?: User; error?: string }>;
  logout: () => void;
  updateUser: (userData: User) => void;
  updateProfile: (profileData: Partial<User>) => Promise<void>;
  isAuthenticated: boolean;
}

export const AuthContext = createContext<AuthContextType | null>(null);
