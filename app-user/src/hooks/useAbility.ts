// src/hooks/useAbility.ts
import { useAuth } from '../auth/AuthContext';

export interface UserPermissions {
  [module: string]: {
    [action: string]: boolean;
  };
}

export interface AuthenticatedUser {
  uid: string;
  role?: string;
  permissions?: UserPermissions;
}

// Role-based permissions for mobile app
const ROLE_PERMISSIONS: Record<string, UserPermissions> = {
  admin: {
    orders: { read: true, write: true, edit: true, cancel: true },
    stores: { read: true, write: true, edit: true, manage: true },
    wallet: { read: true, write: true, transfer: true },
    support: { read: true, write: true },
    profile: { read: true, write: true, delete: true },
    delivery: { read: true, track: true, rate: true },
  },

  driver: {
    orders: { read: true, edit: true, update: true },
    delivery: { read: true, update: true, complete: true },
    earnings: { read: true },
    profile: { read: true, write: true },
    wallet: { read: true, withdraw: true },
  },

  vendor: {
    orders: { read: true, edit: true, manage: true },
    stores: { read: true, write: true, edit: true, manage: true },
    products: { read: true, write: true, edit: true, delete: true },
    earnings: { read: true },
    profile: { read: true, write: true },
    wallet: { read: true, withdraw: true },
    analytics: { read: true },
  },

  marketer: {
    campaigns: { read: true, write: true, edit: true },
    analytics: { read: true },
    profile: { read: true, write: true },
  },

  user: {
    orders: { read: true, write: true, cancel: true },
    stores: { read: true, favorite: true },
    wallet: { read: true, topup: true },
    support: { read: true, write: true },
    profile: { read: true, write: true },
    delivery: { read: true, track: true, rate: true },
  },
};

export const useAbility = () => {
  const { user } = useAuth();

  const can = (module: string, action: string): boolean => {
    if (!user) return false;

    // Super admin or admin has all permissions
    if (user.role === 'admin' || user.role === 'superadmin') {
      return true;
    }

    // Check specific permissions
    const userPermissions = user.permissions || {};
    const rolePermissions = ROLE_PERMISSIONS[user.role || 'user'] || {};

    // First check explicit permissions
    if (userPermissions[module]?.[action] === true) {
      return true;
    }

    // Then check role-based permissions
    if (rolePermissions[module]?.[action] === true) {
      return true;
    }

    return false;
  };

  const hasRole = (role: string): boolean => {
    return user?.role === role;
  };

  const hasAnyRole = (roles: string[]): boolean => {
    return user?.role ? roles.includes(user.role) : false;
  };

  return {
    can,
    hasRole,
    hasAnyRole,
    userRole: user?.role,
    userPermissions: user?.permissions,
  };
};

// Convenience hooks for common permissions
export const useOrderPermissions = () => {
  const { can } = useAbility();

  return {
    canViewOrders: can('orders', 'read'),
    canCreateOrders: can('orders', 'write'),
    canEditOrders: can('orders', 'edit'),
    canCancelOrders: can('orders', 'cancel'),
    canManageOrders: can('orders', 'manage'),
  };
};

export const useStorePermissions = () => {
  const { can } = useAbility();

  return {
    canViewStores: can('stores', 'read'),
    canCreateStores: can('stores', 'write'),
    canEditStores: can('stores', 'edit'),
    canManageStores: can('stores', 'manage'),
    canFavoriteStores: can('stores', 'favorite'),
  };
};

export const useWalletPermissions = () => {
  const { can } = useAbility();

  return {
    canViewWallet: can('wallet', 'read'),
    canTopup: can('wallet', 'topup'),
    canWithdraw: can('wallet', 'withdraw'),
    canTransfer: can('wallet', 'transfer'),
    canManageWallet: can('wallet', 'manage'),
  };
};

export const useSupportPermissions = () => {
  const { can } = useAbility();

  return {
    canViewSupport: can('support', 'read'),
    canCreateTickets: can('support', 'write'),
    canManageSupport: can('support', 'manage'),
  };
};

export const useProfilePermissions = () => {
  const { can } = useAbility();

  return {
    canViewProfile: can('profile', 'read'),
    canEditProfile: can('profile', 'write'),
    canDeleteAccount: can('profile', 'delete'),
  };
};
