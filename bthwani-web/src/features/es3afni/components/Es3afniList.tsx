// src/features/es3afni/components/Es3afniList.tsx
import React from 'react';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Container,
} from '@mui/material';
import {
  Add as AddIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import Es3afniCard from './Es3afniCard';
import Es3afniFilters from './Es3afniFilters';
import { useEs3afniList } from '../hooks/useEs3afniList';
import type { Es3afniItem } from '../types';

interface Es3afniListProps {
  onViewItem?: (item: Es3afniItem) => void;
  onCreateItem?: () => void;
  showFilters?: boolean;
  showCreateButton?: boolean;
}

const Es3afniList: React.FC<Es3afniListProps> = ({
  onViewItem,
  onCreateItem,
  showFilters = true,
  showCreateButton = true,
}) => {
  const {
    items,
    loading,
    loadingMore,
    hasMore,
    error,
    filters,
    updateFilters,
    resetFilters,
    loadMore,
    refresh,
  } = useEs3afniList();

  const handleViewItem = (item: Es3afniItem) => {
    onViewItem?.(item);
  };

  const handleCreateItem = () => {
    onCreateItem?.();
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              اسعفني
            </Typography>
            <Typography variant="body1" color="text.secondary">
              شبكة تبرع بالدم عاجلة - ساعد في إنقاذ حياة
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={refresh}
              disabled={loading}
            >
              تحديث
            </Button>

            {showCreateButton && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleCreateItem}
                color="error"
              >
                بلاغ عاجل
              </Button>
            )}
          </Box>
        </Box>

        {/* Emergency Notice */}
        <Alert severity="error" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>تنبيه هام:</strong> إذا كنت بحاجة ماسة للتبرع بالدم، يرجى الاتصال بالمستشفيات أو بنوك الدم مباشرة.
            هذه الخدمة للمساعدة في تنسيق التبرعات بين المتبرعين والمحتاجين.
          </Typography>
        </Alert>

        {/* Filters */}
        {showFilters && (
          <Es3afniFilters
            filters={filters}
            onFiltersChange={updateFilters}
            onReset={resetFilters}
            loading={loading}
          />
        )}

        {/* Error Message */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Loading State */}
        {loading && items.length === 0 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {/* Items List */}
        {!loading && items.length === 0 && !error && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              لا توجد بلاغات
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              كن أول من ينشر بلاغ تبرع بالدم عاجل
            </Typography>
            {showCreateButton && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleCreateItem}
                color="error"
              >
                إنشاء بلاغ عاجل
              </Button>
            )}
          </Box>
        )}

        {/* Items */}
        {items.length > 0 && (
          <Box>
            {items.map((item) => (
              <Es3afniCard
                key={item._id}
                item={item}
                onView={onViewItem ? handleViewItem : undefined}
              />
            ))}
          </Box>
        )}

        {/* Load More */}
        {hasMore && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <Button
              variant="outlined"
              onClick={loadMore}
              disabled={loadingMore}
              startIcon={loadingMore ? <CircularProgress size={16} /> : null}
            >
              {loadingMore ? 'جاري التحميل...' : 'تحميل المزيد'}
            </Button>
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default Es3afniList;
