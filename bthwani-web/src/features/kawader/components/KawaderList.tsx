// مطابق لـ app-user KawaderListScreen
import React from "react";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Container,
} from "@mui/material";
import { Add as AddIcon, Work as WorkIcon } from "@mui/icons-material";
import KawaderCard from "./KawaderCard";
import { useKawaderList } from "../hooks/useKawaderList";
import type { KawaderItem } from "../types";

interface KawaderListProps {
  onViewItem?: (item: KawaderItem) => void;
  onCreateItem?: () => void;
}

const KawaderList: React.FC<KawaderListProps> = ({
  onViewItem,
  onCreateItem,
}) => {
  const { items, loading, loadingMore, hasMore, error, loadMore } =
    useKawaderList();

  const stats = {
    total: items.length,
    completed: items.filter((i) => i.status === "completed").length,
    pending: items.filter((i) => i.status === "pending").length,
    totalBudget: items.reduce((sum, i) => sum + (i.budget || 0), 0),
  };

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
          p: 2.5,
          backgroundColor: "background.paper",
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        <Typography
          variant="h5"
          sx={{
            fontWeight: 700,
            textAlign: "center",
            fontFamily: "Cairo, sans-serif",
          }}
        >
          الكوادر
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ textAlign: "center", mt: 0.5 }}
        >
          الوظائف والخدمات المهنية
        </Typography>

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-around",
            alignItems: "center",
            mt: 2,
            py: 1.5,
            px: 2,
            backgroundColor: "grey.100",
            borderRadius: 2,
          }}
        >
          <Box sx={{ flex: 1, textAlign: "center" }}>
            <Typography variant="h6" fontWeight={700} color="primary.main">
              {stats.total}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              المجموع
            </Typography>
          </Box>
          <Box sx={{ width: 1, height: 30, backgroundColor: "divider" }} />
          <Box sx={{ flex: 1, textAlign: "center" }}>
            <Typography variant="h6" fontWeight={700} color="primary.main">
              {stats.pending}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              في الانتظار
            </Typography>
          </Box>
          <Box sx={{ width: 1, height: 30, backgroundColor: "divider" }} />
          <Box sx={{ flex: 1, textAlign: "center" }}>
            <Typography variant="h6" fontWeight={700} color="primary.main">
              {(stats.totalBudget / 1000).toFixed(0)}K
            </Typography>
            <Typography variant="caption" color="text.secondary">
              إجمالي ريال
            </Typography>
          </Box>
        </Box>

        {onCreateItem && (
          <Button
            variant="contained"
            fullWidth
            startIcon={<AddIcon />}
            onClick={onCreateItem}
            sx={{ mt: 2 }}
          >
            إضافة عرض وظيفي
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
              جاري تحميل العروض الوظيفية...
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
            <WorkIcon sx={{ fontSize: 64, color: "grey.400" }} />
            <Typography variant="h6" sx={{ mt: 2, fontWeight: 600 }}>
              لا توجد عروض وظيفية
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 1, textAlign: "center" }}
            >
              لا توجد عروض وظائف أو خدمات مهنية في الوقت الحالي
            </Typography>
          </Box>
        ) : (
          <>
            {items.map((item) => (
              <KawaderCard
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

export default KawaderList;
