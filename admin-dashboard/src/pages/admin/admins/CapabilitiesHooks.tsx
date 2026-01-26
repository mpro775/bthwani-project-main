import { useContext } from "react";
import { CapabilitiesContext } from "./context";
import type { CapabilitiesContextType } from "./types";

// Hook for using capabilities
export function useCapabilities(): CapabilitiesContextType {
  return useContext(CapabilitiesContext);
}

// Guard component for permissions
export function CapGuard({
  require,
  children,
  fallback,
}: {
  require: string | string[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const { can } = useCapabilities();
  const ok = Array.isArray(require)
    ? require.every((c) => can(c))
    : can(require);
  return ok ? <>{children}</> : <>{fallback ?? null}</>;
}
