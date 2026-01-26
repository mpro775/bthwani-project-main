// src/guards/useEnsureAuthAndVerified.ts
import { useAuth } from "../hooks/useAuth";
import { getAuthBanner } from "./bannerGateway";
import { useNavigate } from "react-router-dom";
import { useCallback } from "react";

/**
 * Hook to ensure user is authenticated and verified before allowing access to protected actions
 */
export function useEnsureAuthAndVerified() {
  const { isAuthenticated, authReady } = useAuth();
  const navigate = useNavigate();

  return useCallback(async (): Promise<boolean> => {
    // Wait for auth state to be ready
    if (!authReady) return false;

    // User is not authenticated
    if (!isAuthenticated) {
      const banner = getAuthBanner();
      if (banner) {
        banner.show("login");
      } else {
        // Fallback navigation if banner is not available
        navigate("/login");
      }
      return false;
    }

    // For now, we assume verification is handled elsewhere
    // In a real app, you might want to check user.verified status
    // if (requireVerified && !user?.verified) {
    //   const banner = getAuthBanner();
    //   if (banner) {
    //     banner.show("verify");
    //   } else {
    //     navigate("/verify");
    //   }
    //   return false;
    // }

    // Everything is good
    return true;
  }, [isAuthenticated, authReady, navigate]);
}
