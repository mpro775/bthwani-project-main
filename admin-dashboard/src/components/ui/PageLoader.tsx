import React from 'react';
import { Box, CircularProgress, Skeleton, Typography } from '@mui/material';

interface PageLoaderProps {
  message?: string;
  showSkeleton?: boolean;
  skeletonRows?: number;
}

export const PageLoader: React.FC<PageLoaderProps> = ({
  message = 'جارٍ التحميل...',
  showSkeleton = false,
  skeletonRows = 3
}) => {
  if (showSkeleton) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          <Skeleton width="40%" />
        </Typography>
        {Array.from({ length: skeletonRows }).map((_, index) => (
          <Box key={index} sx={{ mb: 2 }}>
            <Skeleton width="100%" height={60} />
          </Box>
        ))}
      </Box>
    );
  }

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="200px"
      p={3}
    >
      <CircularProgress size={40} sx={{ mb: 2 }} />
      <Typography variant="body1" color="text.secondary">
        {message}
      </Typography>
    </Box>
  );
};

export default PageLoader;
