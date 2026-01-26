import { createContext } from "react";
import type { CapabilitiesContextType } from "./types";

// =============== CONTEXT DEFINITION ONLY ===============
// This file exports ONLY the context object, no components
export const CapabilitiesContext = createContext<CapabilitiesContextType>({
  capabilities: [],
  can: () => false,
  setCapabilities: () => undefined,
});
