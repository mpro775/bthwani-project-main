// src/features/amani/components/AmaniList.tsx
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
import AmaniCard from './AmaniCard';
import AmaniFilters from './AmaniFilters';
import { useAmaniList } from '../hooks/useAmaniList';
import type { AmaniItem } from '../types';

interface AmaniListProps {
  onViewItem?: (item: AmaniItem) => void;
  onCreateItem?: () => void;
  showFilters?: boolean;
  showCreateButton?: boolean;
}

const AmaniList: React.FC<AmaniListProps> = ({
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
  } = useAmaniList();

  const handleViewItem = (item: AmaniItem) => {
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
              الأماني
            </Typography>
            <Typography variant="body1" color="text.secondary">
              النقل النسائي الآمن للعائلات
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
                sx={{ backgroundColor: '#e91e63', '&:hover': { backgroundColor: '#c2185b' } }}
              >
                طلب نقل جديد
              </Button>
            )}
          </Box>
        </Box>

        {/* Safety Notice */}
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>خدمة آمنة:</strong> جميع السائقات في خدمة الأماني حاصلات على رخصة قيادة نسائية وخضعن للتدريبات اللازمة.
          </Typography>
        </Alert>

        {/* Filters */}
        {showFilters && (
          <AmaniFilters
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
              لا توجد طلبات نقل نسائي
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              ابدأ بإنشاء طلب نقل نسائي آمن جديد
            </Typography>
            {showCreateButton && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleCreateItem}
                sx={{ backgroundColor: '#e91e63', '&:hover': { backgroundColor: '#c2185b' } }}
              >
                إنشاء طلب نقل جديد
              </Button>
            )}
          </Box>
        )}

        {/* Items */}
        {items.length > 0 && (
          <Box>
            {items.map((item) => (
              <AmaniCard
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

export default AmaniList;
