// src/pages/admin/delivery/StoreStatsDialog.tsx
import  { useState } from "react";
import {
  Dialog, DialogTitle, DialogContent, FormControl,
  InputLabel, Select, MenuItem, Typography, CircularProgress, Alert, Box, Button
} from "@mui/material";
import { useStoreStats, type Period } from "../hooks/useStoreStats";
import * as XLSX from "xlsx";

interface Props {
  open: boolean;
  onClose: () => void;
  storeId: string;
}

export default function StoreStatsDialog({ open, onClose, storeId }: Props) {
  const [period, setPeriod] = useState<Period>("all");
  const { stats, loading, error } = useStoreStats(storeId, period);

  const exportExcel = () => {
    const wb = XLSX.utils.book_new();
    const wsData = [
      ["الفترة", period],
      ["عدد المنتجات", stats.productsCount],
      ["عدد الطلبات", stats.ordersCount],
      ["إجمالي الإيرادات", stats.totalRevenue],
    ];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    XLSX.utils.book_append_sheet(wb, ws, "Stats");
    XLSX.writeFile(wb, `Store_${storeId}_Stats_${period}.xlsx`);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>إحصائيات المتجر</DialogTitle>
      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <FormControl fullWidth>
          <InputLabel>الفترة</InputLabel>
          <Select value={period} label="الفترة" onChange={e => setPeriod(e.target.value as Period)}>
            <MenuItem value="daily">يومي</MenuItem>
            <MenuItem value="weekly">أسبوعي</MenuItem>
            <MenuItem value="monthly">شهري</MenuItem>
            <MenuItem value="all">إجمالي</MenuItem>
          </Select>
        </FormControl>

        {loading && <Box sx={{ textAlign: "center" }}><CircularProgress /></Box>}
        {error && <Alert severity="error">{error}</Alert>}

        {!loading && !error && (
          <>
            <Typography>عدد المنتجات: <strong>{stats.productsCount}</strong></Typography>
            <Typography>عدد الطلبات: <strong>{stats.ordersCount}</strong></Typography>
            <Typography>إجمالي الإيرادات: <strong>{stats.totalRevenue.toLocaleString()} ر.س</strong></Typography>
            <Button variant="outlined" onClick={exportExcel}>تصدير Excel</Button>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
