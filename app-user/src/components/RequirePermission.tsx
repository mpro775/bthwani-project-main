// src/components/RequirePermission.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAbility } from '../hooks/useAbility';

interface RequirePermissionProps {
  children: React.ReactNode;
  module: string;
  action: string;
  fallback?: React.ReactNode;
  showFallback?: boolean;
  mode?: 'hide' | 'disable';
  disabledOpacity?: number;
}

export const RequirePermission: React.FC<RequirePermissionProps> = ({
  children,
  module,
  action,
  fallback,
  showFallback = true,
  mode = 'hide',
  disabledOpacity = 0.5,
}) => {
  const { can } = useAbility();

  const hasPermission = can(module, action);

  if (hasPermission) {
    return <>{children}</>;
  }

  if (mode === 'disable' && showFallback) {
    // For disable mode, we'll wrap the children with disabled styling
    return (
      <View style={{ opacity: disabledOpacity }} pointerEvents="none">
        {children}
      </View>
    );
  }

  if (!showFallback) {
    return null;
  }

  return (
    <>
      {fallback || (
        <View style={styles.fallbackContainer}>
          <Text style={styles.fallbackText}>
            ليس لديك صلاحية للوصول إلى هذا المحتوى
          </Text>
        </View>
      )}
    </>
  );
};

// Convenience wrapper for common permission checks
export const RequireRole: React.FC<{
  children: React.ReactNode;
  role: string | string[];
  fallback?: React.ReactNode;
}> = ({ children, role, fallback }) => {
  const { hasRole, hasAnyRole } = useAbility();

  const hasRequiredRole = Array.isArray(role)
    ? hasAnyRole(role)
    : hasRole(role);

  if (hasRequiredRole) {
    return <>{children}</>;
  }

  return (
    <>
      {fallback || (
        <View style={styles.fallbackContainer}>
          <Text style={styles.fallbackText}>
            هذه الميزة متاحة للمستخدمين المحددين فقط
          </Text>
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  fallbackContainer: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    margin: 8,
  },
  fallbackText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});

export default RequirePermission;
