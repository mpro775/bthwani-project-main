import { useContext } from 'react';
import { AuthContext, type AuthContextType } from '../contexts/context';

/**
 * Custom hook to use auth context
 * Must be used within an AuthProvider
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
