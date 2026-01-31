// مطابق لـ app-user ArabonListScreen
import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Container,
} from "@mui/material";
import { Add as AddIcon, Person as PersonIcon, Search as SearchIcon } from "@mui/icons-material";
import { AccountBalanceWallet } from "@mui/icons-material";
import ArabonCard from "./ArabonCard";
import { useArabonList } from "../hooks/useArabonList";
import type { ArabonItem, ArabonStatus } from "../types";

const STATUS_FILTERS: { key: ArabonStatus | ""; label: string }[] = [
  { key: "", label: "الكل" },
  { key: "draft", label: "مسودة" },
  { key: "pending", label: "في الانتظار" },
  { key: "confirmed", label: "مؤكد" },
  { key: "completed", label: "مكتمل" },
  { key: "cancelled", label: "ملغي" },
];

interface ArabonListProps {
  onViewItem?: (item: ArabonItem) => void;
  onCreateItem?: () => void;
  onMyList?: () => void;
  onSearch?: () => void;
}

const ArabonList: React.FC<ArabonListProps> = ({
  onViewItem,
  onCreateItem,
  onMyList,
  onSearch,
}) => {
  const [statusFilter, setStatusFilter] = useState<ArabonStatus | "">("");
  const {
    items,
    loading,
    loadingMore,
    hasMore,
    error,
    loadMore,
    refresh,
  } = useArabonList({ statusFilter });

  const stats = {
    total: items.length,
    completed: items.filter((i) => i.status === "completed").length,
    pending: items.filter((i) => i.status === "pending").length,
    totalAmount: items.reduce((sum, i) => sum + (i.depositAmount || 0), 0),
  };

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "background.default", pb: 10 }}>
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
          sx={{ fontWeight: 700, textAlign: "center", fontFamily: "Cairo, sans-serif" }}
        >
          العربون
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ textAlign: "center", mt: 0.5 }}
        >
          العروض والحجوزات بعربون
        </Typography>

        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 1,
            mt: 2,
            alignItems: "center",
          }}
        >
          {onMyList && (
            <Button
              variant="outlined"
              size="small"
              startIcon={<PersonIcon />}
              onClick={onMyList}
            >
              عربوناتي
            </Button>
          )}
          {onSearch && (
            <Button
              variant="outlined"
              size="small"
              startIcon={<SearchIcon />}
              onClick={onSearch}
            >
              بحث
            </Button>
          )}
          {onCreateItem && (
            <Button
              variant="contained"
              size="small"
              startIcon={<AddIcon />}
              onClick={onCreateItem}
            >
              إضافة عربون
            </Button>
          )}
        </Box>

        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 2 }}>
          {STATUS_FILTERS.map((f) => (
            <Chip
              key={f.key || "all"}
              label={f.label}
              onClick={() => setStatusFilter(f.key)}
              variant={statusFilter === f.key ? "filled" : "outlined"}
              color={statusFilter === f.key ? "primary" : "default"}
              size="small"
            />
          ))}
        </Box>

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
          <Box sx={{ alignItems: "center", flex: 1, textAlign: "center" }}>
            <Typography variant="h6" fontWeight={700} color="primary.main">
              {stats.total}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              المجموع
            </Typography>
          </Box>
          <Box sx={{ width: 1, height: 30, backgroundColor: "divider" }} />
          <Box sx={{ alignItems: "center", flex: 1, textAlign: "center" }}>
            <Typography variant="h6" fontWeight={700} color="primary.main">
              {stats.pending}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              في الانتظار
            </Typography>
          </Box>
          <Box sx={{ width: 1, height: 30, backgroundColor: "divider" }} />
          <Box sx={{ alignItems: "center", flex: 1, textAlign: "center" }}>
            <Typography variant="h6" fontWeight={700} color="primary.main">
              {(stats.totalAmount ?? 0).toFixed(0)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              إجمالي ريال
            </Typography>
          </Box>
        </Box>
      </Box>

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
              جاري تحميل العربونات...
            </Typography>
          </Box>
        ) : !loading && items.length === 0 ? (
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", py: 8 }}>
            <AccountBalanceWallet sx={{ fontSize: 64, color: "grey.400" }} />
            <Typography variant="h6" sx={{ mt: 2, fontWeight: 600 }}>
              لا توجد عربونات
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1, textAlign: "center" }}>
              لا توجد عروض أو حجوزات بعربون في الوقت الحالي
            </Typography>
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

export default ArabonList;
