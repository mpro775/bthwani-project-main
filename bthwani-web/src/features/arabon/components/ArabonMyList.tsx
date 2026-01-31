// مطابق لـ app-user ArabonMyListScreen
import React from "react";
import {
  Box,
  Typography,
  Button,
  IconButton,
  CircularProgress,
  Alert,
  Container,
} from "@mui/material";
import { ArrowBack, AccountBalanceWallet } from "@mui/icons-material";
import ArabonCard from "./ArabonCard";
import { useArabonMyList } from "../hooks/useArabonMyList";
import type { ArabonItem } from "../types";

interface ArabonMyListProps {
  onBack: () => void;
  onViewItem?: (item: ArabonItem) => void;
}

const ArabonMyList: React.FC<ArabonMyListProps> = ({
  onBack,
  onViewItem,
}) => {
  const {
    items,
    stats,
    loading,
    loadingMore,
    hasMore,
    error,
    loadMore,
  } = useArabonMyList();

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "background.default", pb: 10 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          px: 2,
          py: 1.5,
          backgroundColor: "background.paper",
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        <IconButton onClick={onBack} sx={{ mr: 1 }}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h6" sx={{ flex: 1, textAlign: "center" }}>
          عربوناتي
        </Typography>
        <Box sx={{ width: 40 }} />
      </Box>

      {stats && (
        <Box
          sx={{
            mx: 2,
            mt: 2,
            display: "flex",
            justifyContent: "space-around",
            alignItems: "center",
            py: 1.5,
            px: 2,
            backgroundColor: "grey.100",
            borderRadius: 2,
          }}
        >
          <Box sx={{ flex: 1, textAlign: "center" }}>
            <Typography variant="h6" fontWeight={700} color="primary.main">
              {stats.total ?? 0}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              المجموع
            </Typography>
          </Box>
          <Box sx={{ width: 1, height: 30, backgroundColor: "divider" }} />
          <Box sx={{ flex: 1, textAlign: "center" }}>
            <Typography variant="h6" fontWeight={700} color="primary.main">
              {stats.pending ?? 0}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              في الانتظار
            </Typography>
          </Box>
          <Box sx={{ width: 1, height: 30, backgroundColor: "divider" }} />
          <Box sx={{ flex: 1, textAlign: "center" }}>
            <Typography variant="h6" fontWeight={700} color="primary.main">
              {(stats.totalDepositAmount ?? 0).toFixed(0)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              إجمالي ريال
            </Typography>
          </Box>
        </Box>
      )}

      <Container maxWidth="md" sx={{ py: 2 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {loading && items.length === 0 ? (
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", py: 8 }}>
            <CircularProgress color="primary" />
            <Typography sx={{ mt: 2, color: "text.secondary" }}>
              جاري تحميل عربوناتك...
            </Typography>
          </Box>
        ) : !loading && items.length === 0 ? (
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", py: 8 }}>
            <AccountBalanceWallet sx={{ fontSize: 64, color: "grey.400" }} />
            <Typography variant="h6" sx={{ mt: 2, fontWeight: 600 }}>
              لا توجد عربونات خاصة بك
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1, textAlign: "center" }}>
              أضف عربوناً جديداً من القائمة الرئيسية
            </Typography>
            <Button variant="contained" sx={{ mt: 3 }} onClick={onBack}>
              العودة للقائمة
            </Button>
          </Box>
        ) : (
          <>
            {items.map((item) => (
              <ArabonCard
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

export default ArabonMyList;
