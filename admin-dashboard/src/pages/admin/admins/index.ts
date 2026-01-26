// ==================== EXPORTS ====================

// API functions
export {
  apiListAdmins,
  apiCreateAdmin,
  apiGetAdmin,
  apiPatchAdmin,
  apiPatchAdminStatus,
  apiGetModules,
} from "./api";

// Types and interfaces
export type {
  AdminStatus,
  AdminRole,
  ModuleDefinition,
  CapabilityGrant,
  AdminUser,
  AdminListItem,
  AdminsListResponse,
  UsersListParams,
  CreateAdminPayload,
  CapabilitiesContextType,
} from "./types";

// Utilities (non-React)
export {
  validatePassword,
  toFlatCaps,
  fromFlatCaps,
  countCaps,
  statusFromIsActive,
  isActiveFromStatus,
} from "./utils";

// React components
export { AdminsListPage } from "./AdminsListPage";
export { AdminDetailsRoute } from "./AdminDetailsRoute";
export { AdminCreateRoute } from "./AdminCreateRoute";