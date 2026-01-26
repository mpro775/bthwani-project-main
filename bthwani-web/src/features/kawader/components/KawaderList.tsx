// src/features/kawader/components/KawaderList.tsx
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
import KawaderCard from './KawaderCard';
import KawaderFilters from './KawaderFilters';
import { useKawaderList } from '../hooks/useKawaderList';
import type { KawaderItem } from '../types';

interface KawaderListProps {
  onViewItem?: (item: KawaderItem) => void;
  onCreateItem?: () => void;
  showFilters?: boolean;
  showCreateButton?: boolean;
}

const KawaderList: React.FC<KawaderListProps> = ({
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
  } = useKawaderList();

  const handleViewItem = (item: KawaderItem) => {
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
              الكوادر
            </Typography>
            <Typography variant="body1" color="text.secondary">
              العروض الوظيفية والخدمات المهنية
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
              >
                عرض وظيفي جديد
              </Button>
            )}
          </Box>
        </Box>

        {/* Filters */}
        {showFilters && (
          <KawaderFilters
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
              لا توجد عروض وظيفية
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              ابدأ بنشر عرض وظيفي أو خدمة مهنية جديدة
            </Typography>
            {showCreateButton && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleCreateItem}
              >
                إنشاء عرض وظيفي جديد
              </Button>
            )}
          </Box>
        )}

        {/* Items */}
        {items.length > 0 && (
          <Box>
            {items.map((item) => (
              <KawaderCard
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

export default KawaderList;
