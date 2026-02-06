// مطابق لـ app-user KenzListScreen
import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Container,
  Chip,
  Grid,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import {
  Add as AddIcon,
  Storefront as StoreIcon,
  Search as SearchIcon,
  Favorite as FavoriteIcon,
  ChatBubbleOutline as ChatIcon,
} from "@mui/icons-material";
import KenzCard from "./KenzCard";
import { useKenzList, type KenzSortOption } from "../hooks/useKenzList";
import { useKenzCategories } from "../hooks/useKenzCategories";
import { KENZ_YEMEN_CITIES } from "../types";
import type { KenzItem } from "../types";

const SORT_OPTIONS: { value: KenzSortOption; label: string }[] = [
  { value: "newest", label: "الأحدث" },
  { value: "price_asc", label: "السعر (أقل أولاً)" },
  { value: "price_desc", label: "السعر (أعلى أولاً)" },
  { value: "views_desc", label: "الأكثر مشاهدة" },
];

interface KenzListProps {
  onViewItem?: (item: KenzItem) => void;
  onCreateItem?: () => void;
  isFavorited?: (id: string) => boolean;
  onFavoriteToggle?: (item: KenzItem) => void;
  onNavigateToFavorites?: () => void;
}

const KenzList: React.FC<KenzListProps> = ({
  onViewItem,
  onCreateItem,
  isFavorited,
  onFavoriteToggle,
  onNavigateToFavorites,
  onNavigateToChat,
}) => {
  const {
    items,
    loading,
    loadingMore,
    hasMore,
    error,
    selectedCategory,
    selectedCity,
    selectedCondition,
    selectedDeliveryOption,
    searchQuery,
    sortOption,
    handleCategoryChange,
    handleCityChange,
    handleConditionChange,
    handleDeliveryOptionChange,
    handleSearchChange,
    handleSortChange,
    loadMore,
  } = useKenzList();
  const [searchInput, setSearchInput] = useState(searchQuery ?? "");
  const { flatOptions: categoryOptions } = useKenzCategories();

  return (
    <Box
      sx={{ minHeight: "100vh", backgroundColor: "background.default", pb: 10 }}
    >
      {/* Header - مطابق لـ app-user */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 2.5,
          py: 2,
          backgroundColor: "background.paper",
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        <Box>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              color: "primary.main",
              fontFamily: "Cairo, sans-serif",
              mb: 0.5,
            }}
          >
            كنز
          </Typography>
          <Typography variant="body2" color="text.secondary">
            السوق المفتوح
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          {onNavigateToChat && (
            <Button
              variant="text"
              onClick={onNavigateToChat}
              sx={{ p: 0.5, minWidth: 0 }}
              title="محادثاتي"
            >
              <ChatIcon sx={{ fontSize: 26, color: "primary.main" }} />
            </Button>
          )}
          {onNavigateToFavorites && (
            <Button
              variant="text"
              onClick={onNavigateToFavorites}
              sx={{ p: 0.5, minWidth: 0 }}
              title="إعلاناتي المفضلة"
            >
              <FavoriteIcon sx={{ fontSize: 26, color: "primary.main" }} />
            </Button>
          )}
          <Button
            variant="text"
            onClick={onCreateItem}
            sx={{ p: 0.5, minWidth: 0 }}
          >
            <AddIcon sx={{ fontSize: 28, color: "primary.main" }} />
          </Button>
        </Box>
      </Box>

      {/* Category Filter - مطابق لـ app-user */}
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 1,
          px: 2,
          py: 1.5,
          backgroundColor: "background.paper",
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        <Chip
          label="الكل"
          onClick={() => handleCategoryChange(undefined)}
          sx={{
            backgroundColor: !selectedCategory ? "primary.main" : "transparent",
            color: !selectedCategory ? "white" : "text.secondary",
            borderColor: "divider",
            border: 1,
          }}
        />
        {categoryOptions.slice(0, 6).map((opt) => (
          <Chip
            key={opt.value}
            label={opt.label}
            onClick={() => handleCategoryChange(opt.value)}
            sx={{
              backgroundColor:
                selectedCategory === opt.value ? "primary.main" : "transparent",
              color:
                selectedCategory === opt.value ? "white" : "text.secondary",
              borderColor: "divider",
              border: 1,
            }}
          />
        ))}
      </Box>

      {/* Search & Sort */}
      <Box
        sx={{
          px: 2,
          py: 1.5,
          backgroundColor: "background.paper",
          borderBottom: 1,
          borderColor: "divider",
          display: "flex",
          flexWrap: "wrap",
          gap: 2,
          alignItems: "center",
        }}
      >
        <TextField
          size="small"
          placeholder="بحث في العناوين والوصف..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={(e) =>
            e.key === "Enter" &&
            handleSearchChange(searchInput.trim() || undefined)
          }
          onBlur={() => handleSearchChange(searchInput.trim() || undefined)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
          sx={{ minWidth: 220 }}
        />
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel>الترتيب</InputLabel>
          <Select
            value={sortOption}
            label="الترتيب"
            onChange={(e) => handleSortChange(e.target.value as KenzSortOption)}
          >
            {SORT_OPTIONS.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Condition Filter - حالة السلعة */}
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 1,
          px: 2,
          py: 1.25,
          backgroundColor: "background.paper",
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        <Chip
          label="كل الحالات"
          onClick={() => handleConditionChange(undefined)}
          sx={{
            backgroundColor: !selectedCondition
              ? "primary.main"
              : "transparent",
            color: !selectedCondition ? "white" : "text.secondary",
            borderColor: "divider",
            border: 1,
          }}
        />
        {[
          { value: "new" as const, label: "جديد" },
          { value: "used" as const, label: "مستعمل" },
          { value: "refurbished" as const, label: "مجدد" },
        ].map((opt) => (
          <Chip
            key={opt.value}
            label={opt.label}
            onClick={() => handleConditionChange(opt.value)}
            sx={{
              backgroundColor:
                selectedCondition === opt.value
                  ? "primary.main"
                  : "transparent",
              color:
                selectedCondition === opt.value ? "white" : "text.secondary",
              borderColor: "divider",
              border: 1,
            }}
          />
        ))}
      </Box>

      {/* Delivery Option Filter - طريقة التسليم */}
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 1,
          px: 2,
          py: 1.25,
          backgroundColor: "background.paper",
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        <Chip
          label="الكل"
          onClick={() => handleDeliveryOptionChange(undefined)}
          sx={{
            backgroundColor: !selectedDeliveryOption
              ? "primary.main"
              : "transparent",
            color: !selectedDeliveryOption ? "white" : "text.secondary",
            borderColor: "divider",
            border: 1,
          }}
        />
        {[
          { value: "meetup" as const, label: "لقاء" },
          { value: "delivery" as const, label: "توصيل" },
          { value: "both" as const, label: "لقاء وتوصيل" },
        ].map((opt) => (
          <Chip
            key={opt.value}
            label={opt.label}
            onClick={() => handleDeliveryOptionChange(opt.value)}
            sx={{
              backgroundColor:
                selectedDeliveryOption === opt.value
                  ? "primary.main"
                  : "transparent",
              color:
                selectedDeliveryOption === opt.value
                  ? "white"
                  : "text.secondary",
              borderColor: "divider",
              border: 1,
            }}
          />
        ))}
      </Box>

      {/* City Filter - مطابق لـ app-user */}
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 1,
          px: 2,
          py: 1.25,
          backgroundColor: "background.paper",
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        <Chip
          label="كل المدن"
          onClick={() => handleCityChange(undefined)}
          sx={{
            backgroundColor: !selectedCity ? "primary.main" : "transparent",
            color: !selectedCity ? "white" : "text.secondary",
            borderColor: "divider",
            border: 1,
          }}
        />
        {KENZ_YEMEN_CITIES.slice(0, 5).map((city) => (
          <Chip
            key={city}
            label={city}
            onClick={() => handleCityChange(city)}
            sx={{
              backgroundColor:
                selectedCity === city ? "primary.main" : "transparent",
              color: selectedCity === city ? "white" : "text.secondary",
              borderColor: "divider",
              border: 1,
            }}
          />
        ))}
      </Box>

      <Container maxWidth="md" sx={{ py: 2 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {loading && items.length === 0 ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              py: 8,
            }}
          >
            <CircularProgress sx={{ color: "primary.main" }} />
            <Typography sx={{ mt: 2, color: "text.secondary" }}>
              جاري تحميل الإعلانات...
            </Typography>
          </Box>
        ) : !loading && items.length === 0 ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              py: 6,
            }}
          >
            <StoreIcon sx={{ fontSize: 64, color: "grey.400" }} />
            <Typography variant="h6" sx={{ mt: 2, fontWeight: 600 }}>
              لا توجد إعلانات
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mb: 3, textAlign: "center" }}
            >
              لا توجد إعلانات في هذه الفئة حالياً
            </Typography>
            {onCreateItem && (
              <Button
                variant="contained"
                onClick={onCreateItem}
                sx={{ backgroundColor: "primary.main" }}
              >
                إضافة إعلان جديد
              </Button>
            )}
          </Box>
        ) : (
          <>
            <Grid container spacing={2}>
              {items.map((item) => (
                <Grid key={item._id} size={{ xs: 12, sm: 6 }}>
                  <KenzCard
                    item={item}
                    onView={onViewItem ? () => onViewItem(item) : undefined}
                    isFavorited={isFavorited?.(item._id)}
                    onFavoriteToggle={onFavoriteToggle}
                  />
                </Grid>
              ))}
            </Grid>

            {hasMore && (
              <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
                <Button
                  variant="outlined"
                  onClick={loadMore}
                  disabled={loadingMore}
                  startIcon={
                    loadingMore ? (
                      <CircularProgress size={16} color="inherit" />
                    ) : null
                  }
                >
                  {loadingMore ? "جاري التحميل..." : "تحميل المزيد"}
                </Button>
              </Box>
            )}
          </>
        )}
      </Container>
    </Box>
  );
};

export default KenzList;
