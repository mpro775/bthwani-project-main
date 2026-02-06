import React from "react";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Container,
  Grid,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { Storefront, Favorite } from "@mui/icons-material";
import KenzCard from "./KenzCard";
import { useKenzFavorites } from "../hooks/useKenzFavorites";
import { useKenzFavoriteIds } from "../hooks/useKenzFavoriteIds";
import type { KenzItem } from "../types";

interface KenzFavoritesViewProps {
  onViewItem?: (item: KenzItem) => void;
}

const KenzFavoritesView: React.FC<KenzFavoritesViewProps> = ({
  onViewItem,
}) => {
  const navigate = useNavigate();
  const { items, loading, loadingMore, hasMore, error, loadMore, removeItem } =
    useKenzFavorites();
  const { isFavorited, toggle } = useKenzFavoriteIds(true);

  const handleFavoriteToggle = async (item: KenzItem) => {
    try {
      await toggle(item._id);
      removeItem(item._id);
    } catch {
      // فشل الطلب، لا نزيل من القائمة
    }
  };

  return (
    <Box
      sx={{ minHeight: "100vh", backgroundColor: "background.default", pb: 10 }}
    >
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
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Favorite sx={{ color: "error.main", fontSize: 28 }} />
          <Box>
            <Typography
              variant="h5"
              sx={{ fontWeight: 700, color: "primary.main" }}
            >
              إعلاناتي المفضلة
            </Typography>
            <Typography variant="body2" color="text.secondary">
              الإعلانات التي حفظتها
            </Typography>
          </Box>
        </Box>
        <Button variant="text" onClick={() => navigate("/kenz")}>
          العودة للقائمة
        </Button>
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
              py: 8,
            }}
          >
            <CircularProgress sx={{ color: "primary.main" }} />
            <Typography sx={{ mt: 2, color: "text.secondary" }}>
              جاري تحميل المفضلة...
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
            <Storefront sx={{ fontSize: 64, color: "grey.400" }} />
            <Typography variant="h6" sx={{ mt: 2, fontWeight: 600 }}>
              لا توجد إعلانات في المفضلة
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mb: 3, textAlign: "center" }}
            >
              تصفح الإعلانات وأضف ما يعجبك إلى المفضلة
            </Typography>
            <Button variant="contained" onClick={() => navigate("/kenz")}>
              تصفح كنز
            </Button>
          </Box>
        ) : (
          <>
            <Grid container spacing={2}>
              {items.map((item) => (
                <Grid key={item._id} size={{ xs: 12, sm: 6 }}>
                  <KenzCard
                    item={item}
                    onView={onViewItem ? () => onViewItem(item) : undefined}
                    isFavorited={isFavorited(item._id)}
                    onFavoriteToggle={handleFavoriteToggle}
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

export default KenzFavoritesView;
