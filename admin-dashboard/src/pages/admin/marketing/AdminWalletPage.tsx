// src/pages/admin/wallet/AdminWalletPage.tsx
import { useState } from "react";
import {
  Box,
  Paper,
  Stack,
  Typography,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  Chip,
  Snackbar,
  Alert,
  Avatar,
  Divider,
  InputAdornment,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddCardIcon from "@mui/icons-material/AddCard";
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";
import api from "../../../utils/axios"; // ⬅️ عدّل المسار لو لزم
import { isAxiosError } from "axios";

type UserRow = {
  _id: string;
  fullName?: string;
  email?: string;
  phone?: string;
  wallet?: { balance?: number; onHold?: number };
};

export default function AdminWalletPage() {
  const [q, setQ] = useState("");
  const [users, setUsers] = useState<UserRow[]>([]);
  const [selected, setSelected] = useState<UserRow | null>(null);
  const [amount, setAmount] = useState<number>(0);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [snack, setSnack] = useState<{
    open: boolean;
    msg: string;
    sev: "success" | "error";
  }>({ open: false, msg: "", sev: "success" });

  const search = async () => {
    setLoading(true);
    try {
      const res = await api.get<UserRow[]>("/admin/users/search", {
        params: { q },
      });
      setUsers(res.data || []);
    } catch (e: unknown) {
      const message = isAxiosError(e)
        ? ((e.response?.data as unknown as { message?: string })?.message ?? e.message)
        : e instanceof Error
        ? e.message
        : "فشل في البحث";
      setSnack({
        open: true,
        msg: message,
        sev: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const operate = async (kind: "credit" | "debit") => {
    if (!selected?._id || !amount || amount <= 0) {
      setSnack({
        open: true,
        msg: "اختر مستخدمًا وأدخل مبلغًا صحيحًا",
        sev: "error",
      });
      return;
    }
    try {
      const path =
        kind === "credit" ? "/admin/wallet/credit" : "/admin/wallet/debit";
      const res = await api.post(path, {
        userId: selected._id,
        amount: Number(amount),
        reason: reason || undefined,
      });
      const newBalance = res.data?.balance ?? selected.wallet?.balance ?? 0;
      setSelected({
        ...selected,
        wallet: { ...(selected.wallet || {}), balance: newBalance },
      });
      setSnack({ open: true, msg: "تمت العملية بنجاح", sev: "success" });
    } catch (e: unknown) {
      const message = isAxiosError(e)
        ? ((e.response?.data as unknown as { message?: string })?.message ?? e.message)
        : e instanceof Error
        ? e.message
        : "فشلت العملية";
      setSnack({
        open: true,
        msg: message,
        sev: "error",
      });
    }
  };

  return (
    <Box>
      <Stack direction="row" alignItems="center" spacing={1} mb={2}>
        <AddCardIcon />
        <Typography variant="h5" fontWeight={700}>
          محفظة العملاء
        </Typography>
      </Stack>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 8 }}>
            <TextField
              fullWidth
              placeholder="ابحث (ID | UID | بريد | هاتف | الاسم)"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Button
              fullWidth
              variant="contained"
              onClick={search}
              disabled={loading}
            >
              {loading ? "جارٍ البحث..." : "بحث"}
            </Button>
          </Grid>
        </Grid>

        <Grid container spacing={2} mt={1}>
          {users.map((u) => (
            <Grid size={{ xs: 12, md: 6, lg: 4 }} key={u._id}>
              <Card
                variant="outlined"
                onClick={() => setSelected(u)}
                sx={{
                  cursor: "pointer",
                  borderColor:
                    selected?._id === u._id ? "success.main" : "divider",
                }}
              >
                <CardContent>
                  <Stack
                    direction="row"
                    spacing={2}
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar>{(u.fullName || "?").slice(0, 1)}</Avatar>
                      <Box>
                        <Typography fontWeight={700}>
                          {u.fullName || "-"}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {u.email || u.phone || "-"}
                        </Typography>
                        <Typography variant="caption" color="text.disabled">
                          {u._id}
                        </Typography>
                      </Box>
                    </Stack>
                    <Stack alignItems="flex-end" spacing={0.5}>
                      <Chip
                        size="small"
                        color="primary"
                        label={`الرصيد: ${u.wallet?.balance ?? 0}`}
                      />
                      <Chip
                        size="small"
                        color="warning"
                        variant="outlined"
                        label={`محجوز: ${u.wallet?.onHold ?? 0}`}
                      />
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
          {users.length === 0 && (
            <Grid size={{ xs: 12 }}>
              <Typography align="center" color="text.secondary">
                لا نتائج
              </Typography>
            </Grid>
          )}
        </Grid>
      </Paper>

      <Paper sx={{ p: 2 }}>
        <Typography fontWeight={600} mb={2}>
          عملية على المحفظة
        </Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 3 }}>
            <TextField
              type="number"
              label="المبلغ"
              fullWidth
              value={amount || ""}
              onChange={(e) => setAmount(Number(e.target.value))}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 9 }}>
            <TextField
              label="السبب (اختياري)"
              fullWidth
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Stack direction="row" spacing={1}>
              <Button
                variant="contained"
                startIcon={<AddCardIcon />}
                disabled={!selected}
                onClick={() => operate("credit")}
              >
                شحن (إيداع)
              </Button>
              <Button
                color="error"
                variant="outlined"
                startIcon={<RemoveCircleIcon />}
                disabled={!selected}
                onClick={() => operate("debit")}
              >
                خصم
              </Button>
              {!selected && (
                <Typography
                  color="text.secondary"
                  sx={{ ml: 2, alignSelf: "center" }}
                >
                  اختر مستخدمًا أولاً
                </Typography>
              )}
            </Stack>
          </Grid>
          {selected && (
            <>
              <Grid size={{ xs: 12 }}>
                <Divider sx={{ my: 1 }} />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Typography variant="body2" color="text.secondary">
                    المستخدم المحدد:
                  </Typography>
                  <Chip label={selected.fullName || selected._id} />
                  <Chip
                    color="primary"
                    label={`الرصيد: ${selected.wallet?.balance ?? 0}`}
                  />
                  <Chip
                    color="warning"
                    variant="outlined"
                    label={`محجوز: ${selected.wallet?.onHold ?? 0}`}
                  />
                </Stack>
              </Grid>
            </>
          )}
        </Grid>
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
