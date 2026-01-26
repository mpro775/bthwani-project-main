// src/pages/admin/reports/MerchantReportsPage.tsx
import { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Stack,
  TextField,
  MenuItem,
  Typography,
  CircularProgress,
  Alert,
} from "@mui/material";
import axios from "../../../utils/axios";

type Period = "daily" | "monthly";
type Resp = {
  period: Period;
  since: string;
  totalRevenue: number;
  ordersCount: number;
};

export default function MerchantReportsPage() {
  const [period, setPeriod] = useState<Period>("daily");
  const [data, setData] = useState<Resp | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      setErr(null);
      const { data } = await axios.get<Resp>("/merchant/reports", {
        params: { period },
      });
      setData(data);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "فشل جلب التقرير");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [period]);

  return (
    <Box p={2}>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        mb={2}
      >
        <Typography variant="h5">تقرير المتجر</Typography>
        <TextField
          select
          size="small"
          label="الفترة"
          value={period}
          onChange={(e) => setPeriod(e.target.value as Period)}
          sx={{ minWidth: 160 }}
        >
          <MenuItem value="daily">يومي</MenuItem>
          <MenuItem value="monthly">شهري</MenuItem>
        </TextField>
      </Stack>

      <Paper sx={{ p: 2 }}>
        {loading ? (
          <Box py={6} textAlign="center">
            <CircularProgress size={22} />
          </Box>
        ) : err ? (
          <Alert severity="error">{err}</Alert>
        ) : !data ? (
          <Typography variant="caption" color="text.secondary">
            لا توجد بيانات
          </Typography>
        ) : (
          <Stack spacing={1}>
            <Typography variant="body2">
              منذ: {new Date(data.since).toLocaleString()}
            </Typography>
            <Typography variant="h6">
              الإيراد الإجمالي: {data.totalRevenue.toLocaleString()}
            </Typography>
            <Typography variant="h6">
              عدد الطلبات: {data.ordersCount.toLocaleString()}
            </Typography>
          </Stack>
        )}
      </Paper>
    </Box>
  );
}
