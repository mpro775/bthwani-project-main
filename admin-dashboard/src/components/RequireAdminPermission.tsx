import React from 'react';
import { Box, Typography, Button, Alert, Tooltip } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAdminUser } from '../hook/useAdminUser';
import {
  useCanReadAdmins, useCanWriteAdmins, useCanEditAdmins, useCanDeleteAdmins,
  useCanReadNotifications, useCanWriteNotifications, useCanEditNotifications, useCanDeleteNotifications, useCanSendNotifications,
  useCanReadDrivers, useCanWriteDrivers, useCanEditDrivers, useCanDeleteDrivers, useCanManageDrivers,
  useCanReadVendors, useCanWriteVendors, useCanEditVendors, useCanDeleteVendors, useCanModerateVendors,
  useCanReadReports, useCanExportReports,
  useCanReadFinance, useCanWriteFinance, useCanApproveFinance,
  useCanReadWallet, useCanWriteWallet, useCanManageWallet,
  useCanReadSettings, useCanWriteSettings,
  useCanReadCms, useCanWriteCms, useCanEditCms, useCanDeleteCms,
  useCanReadCommissions, useCanWriteCommissions, useCanEditCommissions,
  useCanReadEr, useCanWriteEr, useCanManageEr,
  useCanReadSupport, useCanWriteSupport, useCanManageSupport,
  useCanReadAnalytics
} from '../hook/useCapabilities';

interface RequireAdminPermissionProps {
  children: React.ReactNode;
  permission?: string; // More flexible - can be any permission string like "admin.users:read"
  fallback?: React.ReactNode;
  showFallback?: boolean;
  mode?: 'hide' | 'disable'; // New: hide or disable instead of showing error
  tooltip?: string;
  disabledTooltip?: string;
}

const RequireAdminPermission: React.FC<RequireAdminPermissionProps> = ({
  children,
  permission = 'admin.users:read',
  fallback,
  showFallback = true,
  mode = 'hide',
  tooltip,
  disabledTooltip
}) => {
  const navigate = useNavigate();
  const { user, loading } = useAdminUser();

  // استدعاء جميع الـ hooks في المستوى الأعلى
  const canReadAdmins         = useCanReadAdmins(user);
  const canWriteAdmins        = useCanWriteAdmins(user);
  const canEditAdmins         = useCanEditAdmins(user);
  const canDeleteAdmins       = useCanDeleteAdmins(user);
  const canReadNotifications  = useCanReadNotifications(user);
  const canWriteNotifications = useCanWriteNotifications(user);
  const canEditNotifications  = useCanEditNotifications(user);
  const canDeleteNotifications= useCanDeleteNotifications(user);
  const canSendNotifications  = useCanSendNotifications(user);

  // Additional hooks for granular permissions
  const canReadDrivers       = useCanReadDrivers(user);
  const canWriteDrivers      = useCanWriteDrivers(user);
  const canEditDrivers       = useCanEditDrivers(user);
  const canDeleteDrivers     = useCanDeleteDrivers(user);
  const canManageDrivers     = useCanManageDrivers(user);
  const canReadVendors       = useCanReadVendors(user);
  const canWriteVendors      = useCanWriteVendors(user);
  const canEditVendors       = useCanEditVendors(user);
  const canDeleteVendors     = useCanDeleteVendors(user);
  const canModerateVendors   = useCanModerateVendors(user);
  const canReadReports       = useCanReadReports(user);
  const canExportReports     = useCanExportReports(user);
  const canReadFinance       = useCanReadFinance(user);
  const canWriteFinance      = useCanWriteFinance(user);
  const canApproveFinance    = useCanApproveFinance(user);
  const canReadWallet        = useCanReadWallet(user);
  const canWriteWallet       = useCanWriteWallet(user);
  const canManageWallet      = useCanManageWallet(user);
  const canReadSettings      = useCanReadSettings(user);
  const canWriteSettings     = useCanWriteSettings(user);
  const canReadCms           = useCanReadCms(user);
  const canWriteCms          = useCanWriteCms(user);
  const canEditCms           = useCanEditCms(user);
  const canDeleteCms         = useCanDeleteCms(user);
  const canReadCommissions   = useCanReadCommissions(user);
  const canWriteCommissions  = useCanWriteCommissions(user);
  const canEditCommissions   = useCanEditCommissions(user);
  const canReadEr            = useCanReadEr(user);
  const canWriteEr           = useCanWriteEr(user);
  const canManageEr          = useCanManageEr(user);
  const canReadSupport       = useCanReadSupport(user);
  const canWriteSupport      = useCanWriteSupport(user);
  const canManageSupport     = useCanManageSupport(user);
  const canReadAnalytics     = useCanReadAnalytics(user);

  // قبل ما يخلص التحميل لا تعرض منع وصول بالخطأ
  if (loading) return null;

  const hasPermission = (() => {
    // Backward compatibility with old permission format
    if (permission.includes(':')) {
      // New format: module:action
      const [module, action] = permission.split(':');
      switch (module) {
        case 'admin.users':
          switch (action) {
            case 'read': return canReadAdmins;
            case 'write': return canWriteAdmins;
            case 'edit': return canEditAdmins;
            case 'delete': return canDeleteAdmins;
          }
          break;
        case 'admin.drivers':
          switch (action) {
            case 'read': return canReadDrivers;
            case 'write': return canWriteDrivers;
            case 'edit': return canEditDrivers;
            case 'delete': return canDeleteDrivers;
            case 'manage': return canManageDrivers;
          }
          break;
        case 'admin.vendors':
          switch (action) {
            case 'read': return canReadVendors;
            case 'write': return canWriteVendors;
            case 'edit': return canEditVendors;
            case 'delete': return canDeleteVendors;
            case 'moderate': return canModerateVendors;
          }
          break;
        case 'admin.notifications':
          switch (action) {
            case 'read': return canReadNotifications;
            case 'write': return canWriteNotifications;
            case 'edit': return canEditNotifications;
            case 'delete': return canDeleteNotifications;
            case 'send': return canSendNotifications;
          }
          break;
        case 'admin.reports':
          switch (action) {
            case 'read': return canReadReports;
            case 'export': return canExportReports;
          }
          break;
        case 'admin.finance':
          switch (action) {
            case 'read': return canReadFinance;
            case 'write': return canWriteFinance;
            case 'approve': return canApproveFinance;
          }
          break;
        case 'admin.wallet':
          switch (action) {
            case 'read': return canReadWallet;
            case 'write': return canWriteWallet;
            case 'manage': return canManageWallet;
          }
          break;
        case 'admin.settings':
          switch (action) {
            case 'read': return canReadSettings;
            case 'write': return canWriteSettings;
          }
          break;
        case 'admin.cms':
          switch (action) {
            case 'read': return canReadCms;
            case 'write': return canWriteCms;
            case 'edit': return canEditCms;
            case 'delete': return canDeleteCms;
          }
          break;
        case 'admin.commissions':
          switch (action) {
            case 'read': return canReadCommissions;
            case 'write': return canWriteCommissions;
            case 'edit': return canEditCommissions;
          }
          break;
        case 'admin.er':
          switch (action) {
            case 'read': return canReadEr;
            case 'write': return canWriteEr;
            case 'manage': return canManageEr;
          }
          break;
        case 'admin.support':
          switch (action) {
            case 'read': return canReadSupport;
            case 'write': return canWriteSupport;
            case 'manage': return canManageSupport;
          }
          break;
        case 'admin.analytics':
          switch (action) {
            case 'read': return canReadAnalytics;
          }
          break;
      }
      return false;
    }

    // Old format for backward compatibility
    switch (permission) {
      case 'read':  return canReadAdmins;
      case 'write': return canWriteAdmins;
      case 'edit':  return canEditAdmins;
      case 'delete':return canDeleteAdmins;
      case 'any':   return canReadAdmins || canWriteAdmins || canEditAdmins || canDeleteAdmins;
      case 'notifications:read':   return canReadNotifications;
      case 'notifications:write':  return canWriteNotifications;
      case 'notifications:edit':   return canEditNotifications;
      case 'notifications:delete': return canDeleteNotifications;
      case 'notifications:send':   return canSendNotifications;
      default: return false;
    }
  })();

  if (hasPermission) return <>{children}</>;

  // Handle different modes
  if (mode === 'disable' && showFallback) {
    return (
      <Tooltip title={disabledTooltip || tooltip || "ليس لديك صلاحية للوصول إلى هذا العنصر"}>
        <span>
          {React.cloneElement(children as React.ReactElement<React.HTMLAttributes<HTMLElement>>, {
            disabled: true,
            style: { opacity: 0.5, cursor: 'not-allowed' }
          } as React.HTMLAttributes<HTMLElement> & { disabled?: boolean })}
        </span>
      </Tooltip>
    );
  }

  if (!showFallback) return null;

  return <>{fallback ??
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        p: 3,
      }}
    >
      <Alert severity="warning" sx={{ maxWidth: 600, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          غير مسموح بالوصول
        </Typography>
        <Typography variant="body2" sx={{ mb: 2 }}>
          ليس لديك صلاحية كافية للوصول إلى هذه الصفحة أو المحتوى.
        </Typography>
        {permission && (
          <Typography variant="body2" sx={{ fontFamily: 'monospace', bgcolor: 'grey.100', p: 1, borderRadius: 1 }}>
            الصلاحية المطلوبة: <strong>{permission}</strong>
          </Typography>
        )}
        <Typography variant="body2" sx={{ mt: 2 }}>
          يرجى التواصل مع مدير النظام للحصول على الصلاحيات المطلوبة أو التحقق من إعدادات حسابك.
        </Typography>
      </Alert>

      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button
          variant="outlined"
          onClick={() => navigate(-1)}
        >
          العودة
        </Button>
        <Button
          variant="contained"
          onClick={() => navigate('/admin/dashboard')}
        >
          لوحة التحكم الرئيسية
        </Button>
      </Box>
    </Box>
  }</>;
};

export default RequireAdminPermission;
