// ==================== REACT COMPONENTS ONLY ====================
// This file exports ONLY React components for Fast Refresh compatibility

export { AdminsListPage } from "./AdminsListPage";
export { AdminUpsertDrawer } from "./AdminUpsertDrawer";
export { AdminDetailsRoute } from "./AdminDetailsRoute";
export { AdminCreateRoute } from "./AdminCreateRoute";
export { default as RoleMatrix } from "./RoleMatrix";

// Context provider component (React-related)
export {
  CapabilitiesProvider,
} from "./CapabilitiesContext";

// Hooks and guard component (React-related)
export {
  useCapabilities,
  CapGuard,
} from "./CapabilitiesHooks";

// Context object (for advanced usage)
export {
  CapabilitiesContext,
} from "./context";
