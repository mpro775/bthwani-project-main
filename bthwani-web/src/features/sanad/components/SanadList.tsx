// src/features/sanad/components/SanadList.tsx
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
import SanadCard from './SanadCard';
import SanadFilters from './SanadFilters';
import { useSanadList } from '../hooks/useSanadList';
import type { SanadItem } from '../types';

interface SanadListProps {
  onViewItem?: (item: SanadItem) => void;
  onCreateItem?: () => void;
  showFilters?: boolean;
  showCreateButton?: boolean;
  myOnly?: boolean; // لعرض طلبات المستخدم فقط
}

const SanadList: React.FC<SanadListProps> = ({
  onViewItem,
  onCreateItem,
  showFilters = true,
  showCreateButton = true,
  myOnly = false,
}) => {
  const {
    items,
    loading,
    loadingMore,
    hasMore,
    error,
    filters,
    searchQuery,
    updateFilters,
    resetFilters,
    performSearch,
    loadMore,
    refresh,
  } = useSanadList({ myOnly });

  const handleViewItem = (item: SanadItem) => {
    onViewItem?.(item);
  };

  const handleCreateItem = () => {
    onCreateItem?.();
  };

  const getTitle = () => {
    if (myOnly) return 'طلباتي';
    return 'السند';
  };

  const getSubtitle = () => {
    if (myOnly) return 'طلباتك الشخصية';
    return 'خدمات متخصصة + فزعة + خيري';
  };

  const getEmptyMessage = () => {
    if (myOnly) return 'لا توجد طلبات شخصية';
    return 'لا توجد طلبات سند';
  };

  const getEmptyDescription = () => {
    if (myOnly) return 'ابدأ بإنشاء طلب سند جديد';
    return 'ابدأ بإنشاء طلب خدمة متخصصة أو فزعة أو خيري';
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              {getTitle()}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {getSubtitle()}
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
                sx={{ backgroundColor: '#9c27b0', '&:hover': { backgroundColor: '#7b1fa2' } }}
              >
                طلب سند جديد
              </Button>
            )}
          </Box>
        </Box>

        {/* Emergency Alert */}
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>فزعة طوارئ:</strong> للحالات الطارئة، يرجى الاتصال بالطوارئ مباشرة أو استخدم خدمة الفزعة للحصول على مساعدة فورية.
          </Typography>
        </Alert>

        {/* Filters */}
        {showFilters && (
          <SanadFilters
            filters={filters}
            searchQuery={searchQuery}
            onFiltersChange={updateFilters}
            onSearchChange={performSearch}
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
              {getEmptyMessage()}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {getEmptyDescription()}
            </Typography>
            {showCreateButton && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleCreateItem}
                sx={{ backgroundColor: '#9c27b0', '&:hover': { backgroundColor: '#7b1fa2' } }}
              >
                إنشاء طلب سند جديد
              </Button>
            )}
          </Box>
        )}

        {/* Items */}
        {items.length > 0 && (
          <Box>
            {items.map((item) => (
              <SanadCard
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

export default SanadList;
