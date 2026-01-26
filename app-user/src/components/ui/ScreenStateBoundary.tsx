import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import ScreenLoader from './ScreenLoader';
import ScreenEmpty from './ScreenEmpty';
import ScreenError from './ScreenError';

interface ScreenStateBoundaryProps {
  isLoading: boolean;
  isError: boolean;
  isEmpty: boolean;
  onRetry?: () => void;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyActionLabel?: string;
  emptyOnAction?: () => void;
  errorTitle?: string;
  errorMessage?: string;
  loadingMessage?: string;
  children: React.ReactNode;
}

export const ScreenStateBoundary: React.FC<ScreenStateBoundaryProps> = ({
  isLoading,
  isError,
  isEmpty,
  onRetry,
  emptyTitle = 'لا توجد بيانات',
  emptyDescription,
  emptyActionLabel,
  emptyOnAction,
  errorTitle,
  errorMessage,
  loadingMessage,
  children,
}) => {
  const { isConnected } = useNetworkStatus();

  // Handle offline state
  if (!isConnected) {
    return (
      <ScreenEmpty
        title="أنت غير متصل"
        description="يرجى التحقق من اتصالك بالإنترنت والمحاولة مرة أخرى"
        actionLabel="المحاولة لاحقًا"
        onAction={onRetry}
        iconName="cloud-offline-outline"
        iconColor="#ff6b6b"
      />
    );
  }

  // Show loading state
  if (isLoading) {
    return <ScreenLoader message={loadingMessage} />;
  }

  // Show error state
  if (isError) {
    return (
      <ScreenError
        title={errorTitle}
        message={errorMessage}
        onRetry={onRetry}
      />
    );
  }

  // Show empty state
  if (isEmpty) {
    return (
      <ScreenEmpty
        title={emptyTitle}
        description={emptyDescription}
        actionLabel={emptyActionLabel}
        onAction={emptyOnAction}
      />
    );
  }

  // Show children (normal content)
  return <View style={styles.container}>{children}</View>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default ScreenStateBoundary;
