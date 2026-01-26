// src/orders/components/BulkActionsBar.tsx
import { useMemo, useState } from "react";
import {
  Box,
  Paper,
  Stack,
  Typography,
  Button,
  Snackbar,
  Tooltip,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  Badge,
} from "@mui/material";
import {
  Replay,
  LocalShipping,
  DoneAll,
  AssignmentTurnedIn,
  Cancel,
  HistoryEdu,
} from "@mui/icons-material";
import { statusLabels, type OrderRow, type OrderStatus } from "../types";
import { OrdersApi } from "../services/ordersApi";

// 👇 لو كان هذا الملف داخل /components، فإن AsyncSearchSelect بجواره
import AsyncSearchSelect from "./AsyncSearchSelect";
import { DriversApi, type DriverLite } from "../services/driversApi";

export default function BulkActionsBar({
  selected,

  setRows,
  refresh,
}: {
  selected: string[];
  rows: OrderRow[];
  setRows: React.Dispatch<React.SetStateAction<OrderRow[]>>;
  refresh: () => void;
}) {
  const selectedCount = selected.length;

  const [snack, setSnack] = useState<{
    open: boolean;
    message: string;
    undo?: () => void;
  }>({ open: false, message: "" });
  const closeSnack = () => setSnack({ open: false, message: "" });

  // حوار السائق
  const [driverDlgOpen, setDriverDlgOpen] = useState(false);
  const [driverOpt, setDriverOpt] = useState<DriverLite | null>(null);

  // حوار تأكيد الإلغاء/الإرجاع
  const [confirmDlg, setConfirmDlg] = useState<{
    open: boolean;
    status?: OrderStatus;
    reason: string;
  }>({ open: false, reason: "" });

  // حالات مختصرة (للعرض فقط)
  const hasSelection = selectedCount > 0;
  const selectedBadge = useMemo(
    () => (
      <Badge
        color="primary"
        badgeContent={selectedCount}
        invisible={!hasSelection}
        anchorOrigin={{ vertical: "top", horizontal: "left" }}
      >
        <Typography
          variant="subtitle2"
          fontWeight={800}
          sx={{ display: "flex", alignItems: "center", gap: 0.75 }}
        >
          <AssignmentTurnedIn fontSize="small" /> إجراءات جماعية
        </Typography>
      </Badge>
    ),
    [selectedCount, hasSelection]
  );

  const applyOptimistic = (
    mutate: (r: OrderRow) => OrderRow,
    api: () => Promise<void>,
    label: string
  ) => {
    if (!hasSelection) return;
    const prev = new Map<string, OrderRow>();
    setRows((old) =>
      old.map((r) => {
        if (selected.includes(r._id)) {
          prev.set(r._id, r);
          return mutate(r);
        }
        return r;
      })
    );

    let undone = false;
    const undo = async () => {
      undone = true;
      setRows((cur) => cur.map((r) => prev.get(r._id) || r));
      // إعادة الحالة القديمة إلى الخادم
      for (const [id, pr] of prev.entries()) {
        try {
          await OrdersApi.changeStatus(id, { status: pr.status });
        } catch {
          // ignore
        }
      }
    };

    setSnack({ open: true, message: label, undo });

    (async () => {
      try {
        await api();
        if (!undone) refresh();
      } catch {
        undo();
      }
    })();
  };

  const bulkStatus = (status: OrderStatus, opts?: { confirm?: boolean }) => {
    if (!hasSelection) return;

    // للحالات الحساسة، افتح حوار تأكيد
    if (opts?.confirm) {
      setConfirmDlg({ open: true, status, reason: "" });
      return;
    }

    runBulkStatus(status);
  };

  const runBulkStatus = (status: OrderStatus, reason?: string) =>
    applyOptimistic(
      (r) => ({ ...r, status }),
      async () => {
        for (const id of selected) {
          await OrdersApi.changeStatus(id, {
            status,
            reason,
            returnBy: reason ? "admin" : undefined,
          });
        }
      },
      `تم تحديث ${selectedCount} إلى ${statusLabels[status]}`
    );

  const bulkAssignDriver = () => {
    if (!hasSelection) return;
    setDriverDlgOpen(true);
  };

  const confirmAssignDriver = () => {
    if (!driverOpt) return;
    applyOptimistic(
      (r) => r, // ممكن تحدث العرض محليًا لو عندك حقل driver في الجدول
      async () => {
        for (const id of selected) {
          await OrdersApi.assignDriver(id, driverOpt._id);
        }
      },
      `تعيين السائق ${driverOpt.fullName} لعدد ${selectedCount}`
    );
    setDriverDlgOpen(false);
    setDriverOpt(null);
  };

  return (
    <>
      <Paper
        className="rounded-2xl"
        sx={(theme) => ({
          mb: 1.25,
          p: 1.25,
          border: "1px solid",
          borderColor: "divider",
          boxShadow: "0px 8px 28px rgba(0,0,0,0.06)",
          background:
            theme.palette.mode === "light"
              ? "linear-gradient(180deg, rgba(250,250,252,0.9) 0%, rgba(255,255,255,0.95) 100%)"
              : undefined,
          position: "sticky",
          top: 8,
          zIndex: 2,
        })}
      >
        <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap">
          <Box sx={{ px: 1 }}>{selectedBadge}</Box>

          {/* أزرار الحالة على شكل كبسولات */}
          <Chip
            label="قيد المراجعة"
            onClick={() => bulkStatus("under_review")}
            disabled={!hasSelection}
            variant="outlined"
            sx={{ borderRadius: 999 }}
          />
          <Chip
            label="للتحضير"
            onClick={() => bulkStatus("preparing")}
            disabled={!hasSelection}
            variant="outlined"
            sx={{ borderRadius: 999 }}
          />
          <Chip
            label="للخروج"
            onClick={() => bulkStatus("out_for_delivery")}
            disabled={!hasSelection}
            variant="outlined"
            sx={{ borderRadius: 999 }}
          />
          <Chip
            icon={<DoneAll sx={{ mr: 0.5 }} />}
            label="تم التوصيل"
            color="success"
            onClick={() => bulkStatus("delivered")}
            disabled={!hasSelection}
            sx={{ borderRadius: 999 }}
          />

          <Divider flexItem orientation="vertical" sx={{ mx: 0.5 }} />

          <Tooltip title="إرجاع (سيُطلب سبب)">
            <span>
              <Chip
                icon={<HistoryEdu sx={{ mr: 0.5 }} />}
                label="إرجاع"
                color="warning"
                onClick={() => bulkStatus("returned", { confirm: true })}
                disabled={!hasSelection}
                sx={{ borderRadius: 999 }}
              />
            </span>
          </Tooltip>
          <Tooltip title="إلغاء (سيُطلب سبب)">
            <span>
              <Chip
                icon={<Cancel sx={{ mr: 0.5 }} />}
                label="إلغاء"
                color="error"
                onClick={() => bulkStatus("cancelled", { confirm: true })}
                disabled={!hasSelection}
                sx={{ borderRadius: 999 }}
              />
            </span>
          </Tooltip>

          <Box sx={{ flex: 1 }} />

          <Tooltip title="تعيين سائق">
            <span>
              <Button
                size="small"
                startIcon={<LocalShipping />}
                onClick={bulkAssignDriver}
                disabled={!hasSelection}
                sx={{ borderRadius: 2 }}
              >
                تعيين سائق
              </Button>
            </span>
          </Tooltip>
        </Stack>
      </Paper>

      {/* Snackbar مع التراجع */}
      <Snackbar
        open={snack.open}
        autoHideDuration={5000}
        onClose={closeSnack}
        message={snack.message}
        action={
          snack.undo && (
            <Button
              color="inherit"
              size="small"
              startIcon={<Replay />}
              onClick={() => {
                snack.undo?.();
                closeSnack();
              }}
            >
              تراجع
            </Button>
          )
        }
      />

      {/* حوار تعيين السائق */}
      <Dialog
        open={driverDlgOpen}
        onClose={() => setDriverDlgOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>تعيين سائق</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            طبّق على <b>{selectedCount}</b> طلب.
          </Typography>
          <AsyncSearchSelect<DriverLite>
            label="السائق"
            value={driverOpt}
            onChange={setDriverOpt}
            fetchOptions={DriversApi.search}
            getOptionLabel={(o) =>
              (o?.fullName || "") + (o?.phone ? ` • ${o.phone}` : "")
            }
            placeholder="ابحث باسم السائق أو هاتفه"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDriverDlgOpen(false)}>إلغاء</Button>
          <Button
            variant="contained"
            onClick={confirmAssignDriver}
            disabled={!driverOpt}
          >
            حفظ
          </Button>
        </DialogActions>
      </Dialog>

      {/* حوار تأكيد الإلغاء/الإرجاع */}
      <Dialog
        open={confirmDlg.open}
        onClose={() => setConfirmDlg((s) => ({ ...s, open: false }))}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          تأكيد{" "}
          {confirmDlg.status ? statusLabels[confirmDlg.status] : "الإجراء"}
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            سيتم تطبيق الإجراء على <b>{selectedCount}</b> طلب.
          </Typography>
          <TextField
            label="سبب (اختياري)"
            value={confirmDlg.reason}
            onChange={(e) =>
              setConfirmDlg((s) => ({ ...s, reason: e.target.value }))
            }
            fullWidth
            multiline
            minRows={2}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDlg((s) => ({ ...s, open: false }))}>
            إلغاء
          </Button>
          <Button
            variant="contained"
            color={confirmDlg.status === "cancelled" ? "error" : "warning"}
            onClick={() => {
              if (confirmDlg.status) {
                runBulkStatus(
                  confirmDlg.status,
                  confirmDlg.reason?.trim() || undefined
                );
              }
              setConfirmDlg({ open: false, reason: "" });
            }}
          >
            تأكيد
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
