import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  FormControlLabel,
  Checkbox,
  Grid,
  Divider,
  Chip,
  FormGroup,
} from '@mui/material';
import {
  ModuleName,
  type ModulePermissions,
  MODULE_PERMISSIONS,
  AdminRole,
} from '../types/adminUsers';

interface RoleMatrixProps {
  permissions: Partial<Record<ModuleName, ModulePermissions>>;
  onPermissionChange: (module: ModuleName, permission: keyof ModulePermissions, checked: boolean) => void;
  disabled?: boolean;
  showRoleLabels?: boolean;
  selectedRoles?: AdminRole[];
}

const RoleMatrix: React.FC<RoleMatrixProps> = ({
  permissions,
  onPermissionChange,
  disabled = false,
  showRoleLabels = true,
  selectedRoles = [],
}) => {
  const handlePermissionChange = (
    module: ModuleName,
    permission: keyof ModulePermissions,
    checked: boolean
  ) => {
    if (disabled) return;
    onPermissionChange(module, permission, checked);
  };

  const getPermissionValue = (module: ModuleName, permission: keyof ModulePermissions): boolean => {
    return permissions[module]?.[permission] === true;
  };

  const getModulePermissionCount = (module: ModuleName): number => {
    const modulePermissions = permissions[module];
    if (!modulePermissions) return 0;
    return Object.values(modulePermissions).filter(Boolean).length;
  };

  const renderModuleCard = (moduleName: ModuleName) => {
    const moduleDef = MODULE_PERMISSIONS[moduleName];
    const permissionCount = getModulePermissionCount(moduleName);

    return (
      <Grid  size={{ xs: 12, md: 6, lg: 4 }} key={moduleName}>
        <Card variant="outlined" sx={{ height: '100%' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ flexGrow: 1 }}>
                {moduleDef.displayNameAr}
              </Typography>
              <Chip
                label={`${permissionCount} صلاحية`}
                size="small"
                color={permissionCount > 0 ? "primary" : "default"}
                variant={permissionCount > 0 ? "filled" : "outlined"}
              />
            </Box>

            {showRoleLabels && selectedRoles.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  الأدوار المحددة:
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {selectedRoles.map((role) => (
                    <Chip
                      key={role}
                      label={role}
                      size="small"
                      variant="outlined"
                    />
                  ))}
                </Box>
              </Box>
            )}

            <Divider sx={{ my: 2 }} />

            <FormGroup>
              {moduleDef.permissions.map((perm) => (
                <FormControlLabel
                  key={perm.key}
                  control={
                    <Checkbox
                      checked={getPermissionValue(moduleName, perm.key)}
                      onChange={(e) =>
                        handlePermissionChange(moduleName, perm.key, e.target.checked)
                      }
                      disabled={disabled}
                      size="small"
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body2">
                        {perm.displayNameAr}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {perm.displayName}
                      </Typography>
                    </Box>
                  }
                />
              ))}
            </FormGroup>
          </CardContent>
        </Card>
      </Grid>
    );
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        مصفوفة الصلاحيات
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        حدد الصلاحيات المطلوبة لكل موديول من النظام
      </Typography>

      <Grid container spacing={3}>
        {Object.values(ModuleName).map(renderModuleCard)}
      </Grid>

      {disabled && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: 'rgba(255, 255, 255, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
          }}
        >
          <Typography color="text.secondary">
            غير مسموح بتعديل الصلاحيات
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default RoleMatrix;
