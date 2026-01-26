import { useState } from "react";
import { CapabilitiesContext } from "./context";

// =============== CONTEXT PROVIDER COMPONENT ===============
// This file exports ONLY React components
export function CapabilitiesProvider({
  children,
  initial,
}: {
  children: React.ReactNode;
  initial?: string[];
}) {
  const [caps, setCaps] = useState<string[]>(initial ?? []);
  const can = (cap: string): boolean =>
    caps.includes(cap) || caps.includes("*");
  return (
    <CapabilitiesContext.Provider
      value={{ capabilities: caps, can, setCapabilities: setCaps }}
    >
      {children}
    </CapabilitiesContext.Provider>
  );
}
