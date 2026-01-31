// مطابق لـ app-user KenzListScreen
import React from "react";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Container,
  Chip,
  Grid,
} from "@mui/material";
import { Add as AddIcon, Storefront as StoreIcon } from "@mui/icons-material";
import KenzCard from "./KenzCard";
import { useKenzList } from "../hooks/useKenzList";
import { KENZ_CATEGORIES, KENZ_YEMEN_CITIES } from "../types";
import type { KenzItem } from "../types";

interface KenzListProps {
  onViewItem?: (item: KenzItem) => void;
  onCreateItem?: () => void;
}

const KenzList: React.FC<KenzListProps> = ({
  onViewItem,
  onCreateItem,
}) => {
  const {
    items,
    loading,
    loadingMore,
    hasMore,
    error,
    selectedCategory,
    selectedCity,
    handleCategoryChange,
    handleCityChange,
    loadMore,
    refresh,
  } = useKenzList();

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "background.default", pb: 10 }}>
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
        <Button
          variant="text"
          onClick={onCreateItem}
          sx={{ p: 0.5, minWidth: 0 }}
        >
          <AddIcon sx={{ fontSize: 28, color: "primary.main" }} />
        </Button>
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
        {KENZ_CATEGORIES.slice(0, 4).map((category) => (
          <Chip
            key={category}
            label={category}
            onClick={() => handleCategoryChange(category)}
            sx={{
              backgroundColor:
                selectedCategory === category ? "primary.main" : "transparent",
              color:
                selectedCategory === category ? "white" : "text.secondary",
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
              backgroundColor: selectedCity === city ? "primary.main" : "transparent",
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
