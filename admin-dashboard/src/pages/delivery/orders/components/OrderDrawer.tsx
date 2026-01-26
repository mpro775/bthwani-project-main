// src/orders/OrderDrawer.tsx
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Drawer,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Paper,
  Select,
  Stack,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  AssignmentInd,
  LocalShipping,
  NoteAdd,
  TaskAlt,
} from "@mui/icons-material";
import dayjs from "dayjs";
import {
  type Note,
  type OrderRow,
  type OrderStatus,
  paymentLabels,
  statusLabels,
} from "../types";
import { OrdersApi } from "../services/ordersApi";
import { useAdminSocket } from "../hooks/useAdminSocket";
import RoomIcon from "@mui/icons-material/Room";
export default function OrderDrawer({
  open,
  onClose,
  orderId,
}: {
  open: boolean;
  onClose: () => void;
  orderId?: string;
}) {
  const [tab, setTab] = useState(0);
  const [order, setOrder] = useState<OrderRow | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [noteBody, setNoteBody] = useState("");
  const [noteVis, setNoteVis] = useState<"public" | "internal">("internal");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { ensure } = useAdminSocket();

  const load = useCallback(async () => {
    if (!orderId) return;
    setLoading(true);
    setError(null);
    try {
      const [o, n] = await Promise.all([
        OrdersApi.get(orderId),
        OrdersApi.listNotes(orderId, "all"),
      ]);
      setOrder(o);
      setNotes(n);
    } catch (e: unknown) {
      setError((e as { response?: { data?: { message?: string } } })?.response?.data?.message || "فشل في جلب التفاصيل");
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    if (!open || !orderId) return;
    load();
    (async () => {
      const s = await ensure();
      s.emit("order:subscribe", { orderId });
      const refresh = () => load();
      s.on("order.updated", refresh);
      s.on("order.status", refresh);
      s.on("order.sub.status", refresh);
      s.on("order.note.added", refresh);
      return () => {
        s.emit("order:unsubscribe", { orderId });
        s.off("order.updated", refresh);
        s.off("order.status", refresh);
        s.off("order.sub.status", refresh);
        s.off("order.note.added", refresh);
      };
    })();
  }, [open, orderId, ensure, load]);

  const addNote = async () => {
    if (!orderId || !noteBody.trim()) return;
    await OrdersApi.addNote(orderId, noteBody.trim(), noteVis);
    setNoteBody("");
    setNotes(await OrdersApi.listNotes(orderId, "all"));
  };

  const changeStatus = async (
    status: OrderStatus,
    opts?: { reason?: string; returnBy?: string }
  ) => {
    if (!orderId) return;
    await OrdersApi.changeStatus(orderId, {
      status,
      reason: opts?.reason,
      returnBy: opts?.returnBy,
    });
    await load();
  };

  const setPOD = async () => {
    if (!orderId) return;
    const deliveryReceiptNumber = prompt("رقم سند التسليم (POD)") || "";
    if (!deliveryReceiptNumber) return;
    await OrdersApi.setPOD(orderId, deliveryReceiptNumber);
    await load();
  };

  const timelineItems = useMemo(() => {
    const items: { ts: string; label: string; meta?: string }[] = [];
    order?.statusHistory?.forEach((h) =>
      items.push({
        ts: h.changedAt,
        label: `الحالة: ${
          statusLabels[h.status as OrderStatus] || (h.status as string)
        }`,
        meta: `بواسطة: ${h.changedBy}`,
      })
    );
    notes.forEach((n) =>
      items.push({
        ts: n.createdAt || "",
        label: `ملاحظة (${n.visibility === "internal" ? "داخلية" : "عامة"})`,
        meta: n.body,
      })
    );
    return items.sort((a, b) => +new Date(b.ts) - +new Date(a.ts));
  }, [order, notes]);

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { width: { xs: "100%", md: 560 } } }}
    >
      <Box
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          p: 4,
        }}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          mb={1}
        >
          <Typography variant="h6">تفاصيل الطلب</Typography>
          <Stack direction="row" spacing={1}>
            <Tooltip title="إضافة رقم POD">
              <Button onClick={setPOD}>
                <AssignmentInd />
              </Button>
            </Tooltip>
            <Tooltip title="تحويل إلى قيد المراجعة">
              <Button onClick={() => changeStatus("under_review")}>
                <TaskAlt />
              </Button>
            </Tooltip>
          </Stack>
        </Stack>

        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
          <Tab label="ملخص" />
          <Tab label="الطلبات الفرعية" />
          <Tab label="ملاحظات" />
          <Tab label="الخط الزمني / التدقيق" />
        </Tabs>

        {/* كتلة واحدة فقط تتبدل حسب الحالة */}
        <Box sx={{ flex: 1, overflow: "auto" }}>
          {loading ? (
            <Box textAlign="center" mt={4}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          ) : order ? (
            <>
              {tab === 0 && (
                <Stack spacing={1}>
                  <Typography>
                    <b>المعرف:</b> {order._id}
                  </Typography>
                  <Typography>
                    <b>العميل:</b>{" "}
                    {order.user?.fullName ||
                      order.user?.name ||
                      order.user?.email}
                  </Typography>
                  <Typography>
                    <b>الحالة:</b>{" "}
                    <Chip label={statusLabels[order.status]} color="primary" />
                  </Typography>
                  <Typography>
                    <b>الدفع:</b> {paymentLabels[order.paymentMethod]}
                  </Typography>
                  <Typography>
                    <b>الإجمالي:</b> {order.price?.toFixed(2)} ﷼
                  </Typography>
                  <Typography>
                    <b>رسوم التوصيل:</b> {order.deliveryFee?.toFixed(2)} ﷼
                  </Typography>
                  {typeof order.walletUsed === "number" && (
                    <Typography>
                      <b>من المحفظة:</b> {order.walletUsed} ﷼
                    </Typography>
                  )}
                  {typeof order.cashDue === "number" && (
                    <Typography>
                      <b>المتبقي نقدًا:</b> {order.cashDue} ﷼
                    </Typography>
                  )}
                  <Typography>
                    <b>العنوان:</b> {order.address?.label} -{" "}
                    {order.address?.street}, {order.address?.city}
                  </Typography>
                  <Typography color="text.secondary">
                    {dayjs(order.createdAt).format("YYYY/MM/DD HH:mm")}
                  </Typography>
                  {/* ✅ كتلة معلومات Utility */}
                  {order.orderType === "utility" && (
                    <Paper variant="outlined" sx={{ mt: 1, p: 2 }}>
                      <Typography fontWeight={700} gutterBottom>
                        تفاصيل الخدمة (غاز/وايت)
                      </Typography>
                      <Stack spacing={0.5}>
                        <Typography>
                          <b>النوع:</b>{" "}
                          {order.utility?.kind === "gas" ? "غاز" : "وايت الماء"}
                        </Typography>
                        {order.utility?.variant && (
                          <Typography>
                            <b>النوع/المقاس:</b> {order.utility.variant}
                          </Typography>
                        )}
                        {typeof order.utility?.quantity !== "undefined" && (
                          <Typography>
                            <b>الكمية:</b> {order.utility.quantity}
                          </Typography>
                        )}
                        {typeof order.utility?.unitPrice === "number" && (
                          <Typography>
                            <b>سعر الوحدة المجمد:</b> {order.utility.unitPrice} ﷼
                          </Typography>
                        )}
                        {typeof order.utility?.subtotal === "number" && (
                          <Typography>
                            <b>إجمالي السلع:</b> {order.utility.subtotal} ﷼
                          </Typography>
                        )}
                      </Stack>
                      <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                        <Button
                          size="small"
                          startIcon={<LocalShipping />}
                          onClick={async () => {
                            const driverId = prompt("معرّف السائق") || "";
                            if (!driverId) return;
                            await OrdersApi.assignDriver(order._id, driverId);
                            await load();
                          }}
                        >
                          تعيين سائق للطلب
                        </Button>
                      </Stack>
                    </Paper>
                  )}
                  <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => changeStatus("preparing")}
                    >
                      للتحضير
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => changeStatus("out_for_delivery")}
                    >
                      للخروج
                    </Button>
                    <Button
                      size="small"
                      variant="contained"
                      color="success"
                      onClick={() => changeStatus("delivered")}
                    >
                      تم التوصيل
                    </Button>
                    <Button
                      size="small"
                      color="warning"
                      onClick={() =>
                        changeStatus("returned", {
                          reason: prompt("سبب الإرجاع") || "بدون",
                          returnBy: "admin",
                        })
                      }
                    >
                      إرجاع
                    </Button>
                    <Button
                      size="small"
                      color="error"
                      onClick={() =>
                        changeStatus("cancelled", {
                          reason: prompt("سبب الإلغاء") || "بدون",
                          returnBy: "admin",
                        })
                      }
                    >
                      إلغاء
                    </Button>
                  </Stack>

                  {/* SHEIN Procurement Panel */}
                  {order.orderType === "errand" && order.source === "shein" && (
                    <Paper variant="outlined" sx={{ mt: 2, p: 2 }}>
                      <Typography fontWeight={700} gutterBottom>
                        شراء بالإنابة — SHEIN
                      </Typography>
                      <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                        <TextField
                          size="small"
                          label="رقم الطلب لدى SHEIN"
                          defaultValue={order.shein?.externalOrderNo || ""}
                          onBlur={async (e) => {
                            const v = e.target.value.trim();
                            if (!v) return;
                            await OrdersApi.markProcured(order._id, {
                              externalOrderNo: v,
                              invoiceUrl: order.shein?.invoiceUrl,
                            });
                            await load();
                          }}
                        />
                        <TextField
                          size="small"
                          label="رابط الفاتورة (اختياري)"
                          defaultValue={order.shein?.invoiceUrl || ""}
                          onBlur={async (e) => {
                            const v = e.target.value.trim();
                            if (!v) return;
                            await OrdersApi.markProcured(order._id, {
                              externalOrderNo: order.shein?.externalOrderNo || "",
                              invoiceUrl: v,
                            });
                            await load();
                          }}
                        />
                      </Stack>
                      <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                        <Button
                          variant="contained"
                          onClick={async () => {
                            const ext = prompt("رقم الطلب لدى SHEIN") || "";
                            if (!ext) return;
                            await OrdersApi.markProcured(order._id, {
                              externalOrderNo: ext,
                              invoiceUrl: order.shein?.invoiceUrl,
                            });
                            await load();
                          }}
                        >
                          تم الشراء
                        </Button>
                        <Button
                          variant="outlined"
                          color="error"
                          onClick={async () => {
                            const reason = prompt("سبب فشل الشراء؟") || "";
                            if (!reason) return;
                            await OrdersApi.failProcurement(order._id, reason);
                            await load();
                          }}
                        >
                          فشل الشراء
                        </Button>
                      </Stack>
                    </Paper>
                  )}
                </Stack>
              )}

              {tab === 1 && (
                <Stack spacing={2}>
                  {order.subOrders?.map((so) => (
                    <Paper key={so._id} variant="outlined" sx={{ p: 2 }}>
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                      >
                        <Typography fontWeight={600}>
                        {so.store?.name || "بدون متجر (Utility)"}
                      </Typography>{" "}
                      <Chip size="small" label={statusLabels[so.status]} />
                    </Stack>
                    {/* ✅ عرض origin إن وجِد */}
                    {so?.origin?.location && (
                      <Typography sx={{ mt: 0.5 }} color="text.secondary">
                        <RoomIcon
                          sx={{
                            fontSize: 16,
                            mr: 0.5,
                            verticalAlign: "middle",
                          }}
                        />
                        نقطة الانطلاق: {so.origin?.label || "—"} •{" "}
                        {so.origin?.city || "—"}
                      </Typography>
                    )}
                    <List dense>
                      {so.items?.map((it, i) => (
                        <ListItem key={i} divider>
                          <ListItemText
                            primary={`${it.name ?? "منتج"} ×${it.quantity}`}
                            secondary={`سعر الوحدة: ${it.unitPrice} ﷼`}
                          />
                        </ListItem>
                      ))}
                    </List>
                    <Stack direction="row" spacing={1}>
                      <Button
                        size="small"
                        startIcon={<LocalShipping />}
                        onClick={async () => {
                          const driverId = prompt("معرّف السائق") || "";
                          if (!driverId) return;
                          await OrdersApi.assignDriverToSub(
                            order._id,
                            so._id,
                            driverId
                          );
                          await OrdersApi.changeSubStatus(
                            order._id,
                            so._id,
                            "preparing"
                          );
                          await load();
                        }}
                      >
                        تعيين سائق
                      </Button>
                      {/* ✅ ضبط Origin للـ Utility SubOrder */}
                      <Button
                        size="small"
                        startIcon={<RoomIcon />}
                        onClick={async () => {
                          const label = prompt("اسم النقطة (اختياري)") || "";
                          const city =
                            prompt("المدينة (اختياري)") ||
                            order.address?.city ||
                            "";
                          const lat = parseFloat(prompt("Latitude") || "");
                          const lng = parseFloat(prompt("Longitude") || "");
                          if (!Number.isFinite(lat) || !Number.isFinite(lng))
                            return;
                          await OrdersApi.setUtilitySubOrigin(
                            order._id,
                            so._id,
                            {
                              label: label || undefined,
                              city: city || undefined,
                              lat,
                              lng,
                            }
                          );
                          await load();
                        }}
                      >
                        ضبط نقطة الانطلاق
                      </Button>
                      <Button
                        size="small"
                        onClick={async () => {
                          await OrdersApi.changeSubStatus(
                            order._id,
                            so._id,
                            "out_for_delivery"
                          );
                          await load();
                        }}
                      >
                        للخروج
                      </Button>
                      <Button
                        size="small"
                        variant="contained"
                        onClick={async () => {
                          await OrdersApi.changeSubStatus(
                            order._id,
                            so._id,
                            "delivered"
                          );
                          await load();
                        }}
                      >
                        تم التوصيل
                      </Button>
                      <Button
                        size="small"
                        onClick={async () => {
                          const n = prompt("رقم POD");
                          if (!n) return;
                          await OrdersApi.setSubPOD(order._id, so._id, n);
                          await load();
                        }}
                      >
                        POD
                      </Button>
                    </Stack>
                  </Paper>
                ))}
              </Stack>
            )}

              {tab === 2 && (
                <Box>
                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={1}
                    mb={2}
                  >
                  <TextField
                    fullWidth
                    size="small"
                    label="أضف ملاحظة"
                    value={noteBody}
                    onChange={(e) => setNoteBody(e.target.value)}
                  />
                  <Select
                    size="small"
                    value={noteVis}
                    onChange={(e) => setNoteVis(e.target.value as "public" | "internal")}
                  >
                    <MenuItem value="internal">داخلية</MenuItem>
                    <MenuItem value="public">للعميل</MenuItem>
                  </Select>
                  <Button
                    startIcon={<NoteAdd />}
                    variant="contained"
                    onClick={addNote}
                  >
                    إضافة
                  </Button>
                </Stack>
                <List dense>
                  {notes.map((n) => (
                    <ListItem key={n._id} divider>
                      <ListItemText
                        primary={n.body}
                        secondary={`${
                          n.visibility === "internal" ? "داخلية" : "عامة"
                        } • ${n.byRole} • ${
                          n.createdAt
                            ? dayjs(n.createdAt).format("YYYY/MM/DD HH:mm")
                            : ""
                        }`}
                      />
                    </ListItem>
                  ))}
                </List>
                </Box>
              )}

              {tab === 3 && (
                <List dense>
                  {timelineItems.map((t, i) => (
                    <ListItem key={i} divider>
                      <ListItemText
                        primary={t.label}
                        secondary={`${dayjs(t.ts).format("YYYY/MM/DD HH:mm")} • ${
                          t.meta || ""
                        }`}
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </>
          ) : null}
        </Box>
      </Box>
    </Drawer>
  );
}