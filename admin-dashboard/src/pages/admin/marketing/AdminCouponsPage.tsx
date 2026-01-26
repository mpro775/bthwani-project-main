// src/pages/admin/marketing/AdminCouponsPage.tsx
import { useEffect, useMemo, useState, useCallback } from "react";
import {
  Box,
  Paper,
  Grid,
  TextField,
  MenuItem,
  Button,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  Stack,
  IconButton,
  Tooltip,
  Divider,
  Snackbar,
  Alert,
  InputAdornment,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import SearchIcon from "@mui/icons-material/Search";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import api from "../../../utils/axios"; // ⬅️ غيّر المسار لو مختلف
import { isAxiosError } from "axios";

type Coupon = {
  _id?: string;
  code: string;
  type: "percentage" | "fixed" | "free_shipping";
  value: number;
  expiryDate?: string | null;
  assignedTo?: string;
  usageLimit?: number;
  usedCount?: number;
  createdAt?: string;
};

export default function AdminCouponsPage() {
  const [form, setForm] = useState<Coupon>({
    code: "",
    type: "fixed",
    value: 100,
    expiryDate: "",
    assignedTo: "",
    usageLimit: 1,
  });
  const [q, setQ] = useState("");
  const [rows, setRows] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [snack, setSnack] = useState<{
    open: boolean;
    msg: string;
    sev: "success" | "error";
  }>({ open: false, msg: "", sev: "success" });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("admin/wallet/coupons", {
        params: { q: q || undefined },
      });
      setRows(res.data || []);
    } catch (e: unknown) {
      const message = isAxiosError(e)
        ? ((e.response?.data as unknown as { message?: string })?.message ?? e.message)
        : e instanceof Error
        ? e.message
        : "فشل في جلب الكوبونات";
      setSnack({
        open: true,
        
        msg: message,
        sev: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [q]);

  useEffect(() => {
    load();
  }, [load]);

  const create = async () => {
    if (!form.code?.trim()) {
      setSnack({ open: true, msg: "أدخل كود الكوبون", sev: "error" });
      return;
    }
    if (form.type !== "free_shipping" && (!form.value || form.value <= 0)) {
      setSnack({ open: true, msg: "أدخل قيمة صحيحة", sev: "error" });
      return;
    }
    setSaving(true);
    try {
      await api.post("/wallet/coupons", {
        code: form.code.trim(),
        type: form.type,
        value: Number(form.value || 0),
        expiryDate: form.expiryDate ? new Date(form.expiryDate) : null,
        assignedTo: form.assignedTo?.trim() || undefined,
        usageLimit: form.usageLimit ? Number(form.usageLimit) : undefined,
      });
      setForm({
        code: "",
        type: "fixed",
        value: 100,
        expiryDate: "",
        assignedTo: "",
        usageLimit: 1,
      });
      setSnack({ open: true, msg: "تم إنشاء الكوبون", sev: "success" });
      await load();
    } catch (e: unknown) {
      const message = isAxiosError(e)
        ? (((e.response?.data as unknown as { error?: string; message?: string })?.error) ||
            (e.response?.data as unknown as { error?: string; message?: string })?.message ||
            e.message)
        : e instanceof Error
        ? e.message
        : "فشل إنشاء الكوبون";
      setSnack({
        open: true,
        msg: message,
        sev: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  const filtered = useMemo(() => rows, [rows]);

  return (
    <Box>
      <Stack direction="row" alignItems="center" spacing={1} mb={2}>
        <LocalOfferIcon />
        <Typography variant="h5" fontWeight={700}>
          إدارة الكوبونات
        </Typography>
      </Stack>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 3 }}>
            <TextField
              label="الكود"
              fullWidth
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 2 }}>
            <TextField
              label="النوع"
              fullWidth
              select
              value={form.type}
              onChange={(e) =>
                setForm({ ...form, type: e.target.value as Coupon["type"] })
              }
            >
              <MenuItem value="fixed">مبلغ ثابت</MenuItem>
              <MenuItem value="percentage">نسبة %</MenuItem>
              <MenuItem value="free_shipping">شحن مجاني</MenuItem>
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, md: 2 }}>
            <TextField
              label="القيمة"
              type="number"
              fullWidth
              disabled={form.type === "free_shipping"}
              value={form.value}
              onChange={(e) =>
                setForm({ ...form, value: Number(e.target.value) })
              }
            />
          </Grid>
          <Grid size={{ xs: 12, md: 2 }}>
            <TextField
              label="تاريخ الانتهاء"
              type="date"
              fullWidth
              value={form.expiryDate || ""}
              onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 1.5 }}>
            <TextField
              label="حد الاستخدام"
              type="number"
              fullWidth
              value={form.usageLimit ?? ""}
              onChange={(e) =>
                setForm({ ...form, usageLimit: Number(e.target.value) })
              }
            />
          </Grid>
          <Grid size={{ xs: 12, md: 1.5 }}>
            <TextField
              label="مخصص لـ (UserId)"
              fullWidth
              value={form.assignedTo || ""}
              onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Stack direction="row" spacing={1}>
              <Button variant="contained" onClick={create} disabled={saving}>
                {saving ? "جارٍ الحفظ..." : "إنشاء كوبون"}
              </Button>
              <Button
                variant="outlined"
                onClick={load}
                startIcon={<RefreshIcon />}
                disabled={loading}
              >
                تحديث
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 2 }}>
        <Stack direction="row" spacing={1} alignItems="center" mb={2}>
          <TextField
            placeholder="بحث بالكود"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            size="small"
          />
          <Button onClick={load} variant="outlined">
            بحث
          </Button>
        </Stack>

        <Divider sx={{ mb: 2 }} />

        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>الكود</TableCell>
              <TableCell>النوع</TableCell>
              <TableCell>القيمة</TableCell>
              <TableCell>الحد</TableCell>
              <TableCell>المستخدم</TableCell>
              <TableCell>الانتهاء</TableCell>
              <TableCell>المتبقي</TableCell>
              <TableCell>الحالة</TableCell>
              <TableCell align="right">—</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map((c) => {
              const used = c.usedCount ?? 0;
              const limit = c.usageLimit ?? 0;
              const remaining = limit ? Math.max(limit - used, 0) : "غير محدد";
              const expired = c.expiryDate
                ? new Date(c.expiryDate) < new Date()
                : false;
              return (
                <TableRow key={c._id || c.code}>
                  <TableCell>
                    <Typography fontFamily="monospace">{c.code}</Typography>
                  </TableCell>
                  <TableCell>{c.type}</TableCell>
                  <TableCell>
                    {c.type === "free_shipping" ? "-" : c.value}
                  </TableCell>
                  <TableCell>{limit || "-"}</TableCell>
                  <TableCell>{c.assignedTo || "-"}</TableCell>
                  <TableCell>
                    {c.expiryDate
                      ? new Date(c.expiryDate).toLocaleDateString("ar-YE")
                      : "-"}
                  </TableCell>
                  <TableCell>{remaining}</TableCell>
                  <TableCell>
                    {expired ? (
                      <Chip size="small" color="error" label="منتهي" />
                    ) : (
                      <Chip size="small" color="success" label="ساري" />
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="تحديث">
                      <span>
                        <IconButton
                          size="small"
                          onClick={load}
                          disabled={loading}
                        >
                          <RefreshIcon fontSize="small" />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              );
            })}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={9}>
                  <Typography align="center" color="text.secondary">
                    لا توجد كوبونات
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>

      <Snackbar
        open={snack.open}
        autoHideDuration={3000}
        onClose={() => setSnack({ ...snack, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={snack.sev}
          variant="filled"
          onClose={() => setSnack({ ...snack, open: false })}
        >
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
