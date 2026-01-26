// hooks/useAuthGate.ts
import { useAuth } from "../hooks/useAuth";
import { useState, useEffect, useRef } from "react";

export const useAuthGate = () => {
  const { isAuthenticated } = useAuth();
  const [askAuthOpen, setAskAuthOpen] = useState(false);
  const pendingCallback = useRef<(() => void) | null>(null);

  // Execute pending callback when user becomes authenticated
  useEffect(() => {
    if (isAuthenticated && pendingCallback.current) {
      pendingCallback.current();
      pendingCallback.current = null;
    }
  }, [isAuthenticated]);

  const ensureAuth = (callback: () => void) => {
    if (isAuthenticated) {
      callback();
    } else {
      pendingCallback.current = callback;
      setAskAuthOpen(true);
    }
  };

  return { ensureAuth, askAuthOpen, setAskAuthOpen };
};
