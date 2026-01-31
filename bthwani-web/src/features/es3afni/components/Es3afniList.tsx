// مطابق لـ app-user Es3afniListScreen
import React from "react";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Container,
} from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";
import { WaterDrop } from "@mui/icons-material";
import Es3afniCard from "./Es3afniCard";
import { useEs3afniList } from "../hooks/useEs3afniList";
import type { Es3afniItem } from "../types";

interface Es3afniListProps {
  onViewItem?: (item: Es3afniItem) => void;
  onCreateItem?: () => void;
}

const Es3afniList: React.FC<Es3afniListProps> = ({
  onViewItem,
  onCreateItem,
}) => {
  const {
    items,
    loading,
    loadingMore,
    hasMore,
    error,
    loadMore,
  } = useEs3afniList();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "background.default",
        pb: 10,
      }}
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
              color: "error.main",
              fontFamily: "Cairo, sans-serif",
              mb: 0.5,
            }}
          >
            اسعفني
          </Typography>
          <Typography variant="body2" color="text.secondary">
            شبكة تبرع بالدم عاجلة
          </Typography>
        </Box>
        <Button variant="text" onClick={onCreateItem} sx={{ p: 0.5, minWidth: 0 }}>
          <AddIcon sx={{ fontSize: 28, color: "error.main" }} />
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
              justifyContent: "center",
              py: 8,
            }}
          >
            <CircularProgress sx={{ color: "error.main" }} />
            <Typography sx={{ mt: 2, color: "text.secondary" }}>
              جاري تحميل طلبات التبرع...
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
            <WaterDrop sx={{ fontSize: 64, color: "grey.400" }} />
            <Typography variant="h6" sx={{ mt: 2, fontWeight: 600 }}>
              لا توجد طلبات تبرع
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mb: 3, textAlign: "center" }}
            >
              لا توجد طلبات تبرع بالدم في الوقت الحالي
            </Typography>
            {onCreateItem && (
              <Button
                variant="contained"
                color="error"
                onClick={onCreateItem}
              >
                إنشاء طلب تبرع
              </Button>
            )}
          </Box>
        ) : (
          <>
            <Box>
              {items.map((item) => (
                <Es3afniCard
                  key={item._id}
                  item={item}
                  onView={onViewItem ? () => onViewItem(item) : undefined}
                />
              ))}
            </Box>

            {hasMore && (
              <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
                <Button
                  variant="outlined"
                  color="error"
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

export default Es3afniList;
