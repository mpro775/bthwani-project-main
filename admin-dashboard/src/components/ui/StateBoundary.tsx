import React from 'react';
import { Box } from '@mui/material';
import PageLoader from './PageLoader';
import EmptyState from './EmptyState';
import ErrorState from './ErrorState';

interface StateBoundaryProps {
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
  showSkeleton?: boolean;
  skeletonRows?: number;
  children: React.ReactNode;
}

export const StateBoundary: React.FC<StateBoundaryProps> = ({
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
  showSkeleton = false,
  skeletonRows = 3,
  children
}) => {
  // Show loading state
  if (isLoading) {
    return (
      <PageLoader
        message={loadingMessage}
        showSkeleton={showSkeleton}
        skeletonRows={skeletonRows}
      />
    );
  }

  // Show error state
  if (isError) {
    return (
      <ErrorState
        title={errorTitle}
        message={errorMessage}
        onRetry={onRetry}
      />
    );
  }

  // Show empty state
  if (isEmpty) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        actionLabel={emptyActionLabel}
        onAction={emptyOnAction}
      />
    );
  }

  // Show children (normal content)
  return <Box>{children}</Box>;
};

export default StateBoundary;
