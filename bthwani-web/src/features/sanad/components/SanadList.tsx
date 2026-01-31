// مطابق لـ app-user SanadListScreen
import React from "react";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Container,
} from "@mui/material";
import { Add as AddIcon, Description as DescriptionIcon } from "@mui/icons-material";
import SanadCard from "./SanadCard";
import { useSanadList } from "../hooks/useSanadList";
import type { SanadItem } from "../types";

interface SanadListProps {
  onViewItem?: (item: SanadItem) => void;
  onCreateItem?: () => void;
}

const SanadList: React.FC<SanadListProps> = ({
  onViewItem,
  onCreateItem,
}) => {
  const { items, loading, loadingMore, hasMore, error, loadMore } =
    useSanadList();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "background.default",
        pb: 10,
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          px: 2.5,
          py: 2,
          backgroundColor: "background.paper",
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        <Box sx={{ flex: 1 }}>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              fontFamily: "Cairo, sans-serif",
            }}
          >
            سند
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 0.5 }}
          >
            خدمات متخصصة + فزعة + خيري
          </Typography>
        </Box>
        {onCreateItem && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={onCreateItem}
          >
            إضافة طلب
          </Button>
        )}
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
            <CircularProgress color="primary" />
            <Typography sx={{ mt: 2, color: "text.secondary" }}>
              جاري تحميل الطلبات...
            </Typography>
          </Box>
        ) : !loading && items.length === 0 ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              py: 8,
            }}
          >
            <DescriptionIcon sx={{ fontSize: 64, color: "grey.400" }} />
            <Typography variant="h6" sx={{ mt: 2, fontWeight: 600 }}>
              لا توجد طلبات
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 1, textAlign: "center" }}
            >
              لا توجد طلبات سند في الوقت الحالي
            </Typography>
          </Box>
        ) : (
          <>
            {items.map((item) => (
              <SanadCard
                key={item._id}
                item={item}
                onView={onViewItem ? () => onViewItem(item) : undefined}
              />
            ))}
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

export default SanadList;
