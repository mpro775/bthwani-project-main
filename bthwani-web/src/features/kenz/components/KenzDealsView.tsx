import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  Chip,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import {
  AccountBalanceWallet as EscrowIcon,
  CheckCircle as ConfirmIcon,
  Cancel as CancelIcon,
} from "@mui/icons-material";
import {
  getMyKenzDeals,
  confirmKenzDealReceived,
  cancelKenzDeal,
  type KenzDealItem,
  type KenzDealStatus,
} from "../api";

const dealStatusLabels: Record<KenzDealStatus, string> = {
  pending: "قيد الانتظار",
  completed: "مكتملة",
  cancelled: "ملغاة",
};

interface KenzDealsViewProps {
  onViewKenz?: (kenzId: string) => void;
}

const KenzDealsView: React.FC<KenzDealsViewProps> = ({ onViewKenz }) => {
  const [items, setItems] = useState<KenzDealItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState<"buyer" | "seller" | "">("");
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const nextCursorRef = useRef<string | null>(null);
  nextCursorRef.current = nextCursor;
  const [loadingMore, setLoadingMore] = useState(false);
  const [actioningId, setActioningId] = useState<string | null>(null);

  const loadDeals = useCallback(
    async (loadMore = false) => {
      try {
        if (loadMore) setLoadingMore(true);
        else setLoading(true);

        const params: { cursor?: string; role?: "buyer" | "seller" } = {};
        if (roleFilter) params.role = roleFilter;

        if (loadMore) {
          const cur = nextCursorRef.current;
          if (!cur) {
            setLoadingMore(false);
            return;
          }
          params.cursor = cur;
        }

        const res = await getMyKenzDeals(params);
        if (loadMore) {
          setItems((prev) => [...prev, ...res.items]);
        } else {
          setItems(res.items);
        }
        setNextCursor(res.nextCursor ?? null);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [roleFilter]
  );

  useEffect(() => {
    setNextCursor(null);
    loadDeals();
  }, [roleFilter, loadDeals]);

  const getKenzId = (item: KenzDealItem) =>
    typeof item.kenzId === "object" &&
    item.kenzId !== null &&
    "_id" in item.kenzId
      ? (item.kenzId as { _id: string })._id
      : String(item.kenzId);

  const getKenzTitle = (item: KenzDealItem) =>
    typeof item.kenzId === "object" &&
    item.kenzId !== null &&
    "title" in item.kenzId
      ? (item.kenzId as { title?: string }).title || "—"
      : "—";

  const formatCurrency = (amount: number) =>
    `${amount.toLocaleString("ar-SA")} ر.ي`;

  const formatDate = (d?: string) =>
    d
      ? new Date(d).toLocaleDateString("ar-SA", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "—";

  const handleConfirm = async (dealId: string) => {
    setActioningId(dealId);
    try {
      await confirmKenzDealReceived(dealId);
      loadDeals();
    } finally {
      setActioningId(null);
    }
  };

  const handleCancel = async (dealId: string) => {
    setActioningId(dealId);
    try {
      await cancelKenzDeal(dealId);
      loadDeals();
    } finally {
      setActioningId(null);
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: "auto", p: 2, pb: 4 }}>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 2 }}>
        صفقاتي (الإيكرو)
      </Typography>

      <Paper sx={{ p: 2, mb: 2 }}>
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel>عرض</InputLabel>
          <Select
            value={roleFilter}
            label="عرض"
            onChange={(e) =>
              setRoleFilter(e.target.value as "buyer" | "seller" | "")
            }
          >
            <MenuItem value="">الكل</MenuItem>
            <MenuItem value="buyer">كمشتري</MenuItem>
            <MenuItem value="seller">كبائع</MenuItem>
          </Select>
        </FormControl>
      </Paper>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
          <CircularProgress />
        </Box>
      ) : items.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <EscrowIcon sx={{ fontSize: 64, color: "grey.400", mb: 2 }} />
          <Typography color="text.secondary">لا توجد صفقات إيكرو</Typography>
        </Paper>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {items.map((item) => {
            const kenzId = getKenzId(item);
            return (
              <Paper key={item._id} sx={{ p: 2 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    flexWrap: "wrap",
                    gap: 1,
                  }}
                >
                  <Box>
                    <Typography variant="subtitle1" fontWeight={600}>
                      {getKenzTitle(item)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      المبلغ: {formatCurrency(item.amount)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatDate(item.createdAt)}
                    </Typography>
                  </Box>
                  <Chip
                    label={dealStatusLabels[item.status]}
                    size="small"
                    color={
                      item.status === "pending"
                        ? "warning"
                        : item.status === "completed"
                        ? "success"
                        : "default"
                    }
                  />
                </Box>
                <Box sx={{ display: "flex", gap: 1, mt: 2, flexWrap: "wrap" }}>
                  {onViewKenz && (
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => onViewKenz(kenzId)}
                    >
                      عرض الإعلان
                    </Button>
                  )}
                  {item.status === "pending" && (
                    <>
                      <Button
                        size="small"
                        variant="contained"
                        color="success"
                        startIcon={<ConfirmIcon />}
                        disabled={actioningId === item._id}
                        onClick={() => handleConfirm(item._id)}
                      >
                        تم الاستلام
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        startIcon={<CancelIcon />}
                        disabled={actioningId === item._id}
                        onClick={() => handleCancel(item._id)}
                      >
                        إلغاء
                      </Button>
                    </>
                  )}
                </Box>
              </Paper>
            );
          })}
        </Box>
      )}

      {nextCursor && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
          <Button
            variant="outlined"
            onClick={() => loadDeals(true)}
            disabled={loadingMore}
            startIcon={loadingMore ? <CircularProgress size={16} /> : null}
          >
            {loadingMore ? "جاري التحميل..." : "تحميل المزيد"}
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default KenzDealsView;
