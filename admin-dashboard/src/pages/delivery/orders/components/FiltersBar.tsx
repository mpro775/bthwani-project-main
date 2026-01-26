// src/orders/FiltersBar.tsx
import { useMemo, useState } from "react";
import {
  Box,
  Paper,
  Stack,
  TextField,
  Select,
  MenuItem,
  Button,
  InputAdornment,
  IconButton,
  Tooltip,
  Chip,
  Collapse,
  Divider,
  Typography,
  Badge,
} from "@mui/material";
import {
  FilterAlt,
  Refresh,
  Search,
  ExpandMore,
  ExpandLess,
  ClearAll,
} from "@mui/icons-material";

import AsyncSearchSelect from "../components/AsyncSearchSelect";
import { StoresApi, type StoreLite } from "../services/storesApi";
import { UsersApi, type UserLite } from "../services/usersApi";
import { DriversApi, type DriverLite } from "../services/driversApi";
import {
  paymentLabels,
  statusLabels,
  type OrderStatus,
  type PaymentMethod,
} from "../types";
import { FormControl, InputLabel } from "@mui/material";

interface OrderFilters {
  q?: string;
  orderType?: string;
  source?: string;
  status?: string;
  paymentMethod?: string;
  city?: string;
  storeId?: string;
  driverId?: string;
  userId?: string;
  from?: string;
  to?: string;
}

type Props = {
  filters: OrderFilters;
  setFilters: (
    upd: OrderFilters | ((prev: OrderFilters) => OrderFilters)
  ) => void;
  onApply: () => void; // سيبقى موجود للي يحب يضغط يدويًا، لكن غير مطلوب مع Auto-apply
  loading?: boolean;
};

const ALL: OrderStatus[] = [
  "pending_confirmation",
  "under_review",
  "preparing",
  "out_for_delivery",
  "delivered",
  "returned",
  "cancelled",
  // ⬇️ جديدة
  "awaiting_procurement",
  "procured",
  "procurement_failed",
];
export default function FiltersBar({
  filters,
  setFilters,
  onApply,
  loading,
}: Props) {
  const up = (k: keyof OrderFilters, v: string | undefined) =>
    setFilters((f: OrderFilters) => ({ ...f, [k]: v ?? undefined }));

  const [storeOpt, setStoreOpt] = useState<StoreLite | null>(null);
  const [driverOpt, setDriverOpt] = useState<DriverLite | null>(null);
  const [userOpt, setUserOpt] = useState<UserLite | null>(null);
  const [moreOpen, setMoreOpen] = useState(false);

  // احسب عدد الفلاتر الفعالة لعرض Badge وشيبّات أسفل الشريط
  const activeChips = useMemo(() => {
    const chips: { key: string; label: string }[] = [];
    if (filters.q) chips.push({ key: "q", label: `بحث: ${filters.q}` });
    if (filters.orderType)
      chips.push({
        key: "orderType",
        label: `النوع: ${filters.orderType === "errand" ? "اخدمني" : "متاجر"}`,
      });
    if (filters.source)
      chips.push({
        key: "source",
        label: `المصدر: ${filters.source === "shein" ? "SHEIN" : "أخرى"}`,
      });
    if (filters.status)
      chips.push({
        key: "status",
        label: `الحالة: ${statusLabels[filters.status as OrderStatus]}`,
      });
    if (filters.paymentMethod)
      chips.push({
        key: "paymentMethod",
        label: `الدفع: ${
          paymentLabels[filters.paymentMethod as PaymentMethod]
        }`,
      });
    if (filters.city)
      chips.push({ key: "city", label: `المدينة: ${filters.city}` });
    if (filters.storeId && storeOpt)
      chips.push({ key: "storeId", label: `المتجر: ${storeOpt.name}` });
    if (filters.driverId && driverOpt)
      chips.push({
        key: "driverId",
        label: `السائق: ${driverOpt.fullName}${
          driverOpt.phone ? " • " + driverOpt.phone : ""
        }`,
      });
    if (filters.userId && userOpt)
      chips.push({
        key: "userId",
        label: `العميل: ${(userOpt.fullName || userOpt.name) ?? ""}${
          userOpt.phone ? " • " + userOpt.phone : ""
        }`,
      });
    if (filters.from) chips.push({ key: "from", label: `من: ${filters.from}` });
    if (filters.to) chips.push({ key: "to", label: `إلى: ${filters.to}` });
    return chips;
  }, [filters, storeOpt, driverOpt, userOpt]);

  const clearKey = (k: string) => {
    // نظّف الفلتر المعني + حالة الـ option المرتبطة به
    if (k === "storeId") setStoreOpt(null);
    if (k === "driverId") setDriverOpt(null);
    if (k === "userId") setUserOpt(null);
    if (k === "orderType") up("orderType", undefined);
    if (k === "source") up("source", undefined);
    if (k === "status") up("status", undefined);
    if (k === "paymentMethod") up("paymentMethod", undefined);
    if (k === "city") up("city", undefined);
    if (k === "q") up("q", undefined);
    if (k === "from") up("from", undefined);
    if (k === "to") up("to", undefined);
  };

  const clearAll = () => {
    setStoreOpt(null);
    setDriverOpt(null);
    setUserOpt(null);
    setFilters({});
  };

  return (
    <Paper
      className="mb-2 rounded-2xl"
      sx={{
        p: 2,
        border: "1px solid",
        borderColor: "divider",
        boxShadow: "0px 6px 24px rgba(0,0,0,0.06)",
        background:
          "linear-gradient(180deg, rgba(250,250,252,0.9) 0%, rgba(255,255,255,0.9) 100%)",
        backdropFilter: "saturate(180%) blur(6px)",
      }}
    >
      {/* شريط علوي: عنوان الفلاتر + أدوات */}
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ mb: 1 }}
      >
        <Stack direction="row" alignItems="center" gap={1}>
          <Badge
            color="primary"
            invisible={!activeChips.length}
            badgeContent={activeChips.length}
            anchorOrigin={{ vertical: "top", horizontal: "left" }}
          >
            <Typography
              variant="subtitle1"
              fontWeight={700}
              sx={{ display: "flex", alignItems: "center", gap: 1 }}
            >
              <FilterAlt fontSize="small" /> فلاتر
            </Typography>
          </Badge>
        </Stack>

        <Stack direction="row" alignItems="center" gap={0.5}>
          {/* زر تطبيق يدوي اختياري */}
          <Tooltip title="تطبيق الفلاتر الآن">
            <span>
              <Button
                size="small"
                variant="outlined"
                onClick={onApply}
                disabled={loading}
                sx={{ borderRadius: 2 }}
              >
                تطبيق
              </Button>
            </span>
          </Tooltip>
          <Tooltip title="تفريغ كل الفلاتر">
            <span>
              <IconButton onClick={clearAll} disabled={loading}>
                <ClearAll />
              </IconButton>
            </span>
          </Tooltip>
          <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
          <Tooltip
            title={
              moreOpen ? "إخفاء الفلاتر المتقدمة" : "إظهار الفلاتر المتقدمة"
            }
          >
            <IconButton onClick={() => setMoreOpen((v) => !v)} size="small">
              {moreOpen ? <ExpandLess /> : <ExpandMore />}
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>

      {/* صف الفلاتر الأساسية */}
      <Stack
        direction={{ xs: "column", md: "row" }}
        gap={1.5}
        alignItems={{ xs: "stretch", md: "center" }}
        sx={{
          "& .MuiFormControl-root, & .MuiTextField-root, & .MuiAutocomplete-root, & .MuiSelect-root":
            {
              minWidth: { xs: "100%", md: 180 },
            },
        }}
      >
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel id="order-type">نوع الطلب</InputLabel>
          <Select
            labelId="order-type"
            label="نوع الطلب"
            value={filters.orderType || ""}
            onChange={(e) =>
              setFilters((prev: OrderFilters) => ({
                ...prev,
                orderType: e.target.value || undefined, // "" => undefined
              }))
            }
          >
            <MenuItem value="">الكل</MenuItem>
            <MenuItem value="marketplace">متاجر (سلة)</MenuItem>
            <MenuItem value="errand">اخدمني</MenuItem>
            <MenuItem value="errand">اخدمني</MenuItem>
            <MenuItem value="utility">خدمات (غاز/وايت)</MenuItem>
          </Select>
        </FormControl>

        {/* نوع الطلب */}
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel id="order-type">نوع الطلب</InputLabel>
          <Select
            labelId="order-type"
            label="نوع الطلب"
            value={filters.orderType || ""}
            onChange={(e) =>
              setFilters((prev: OrderFilters) => ({
                ...prev,
                orderType: e.target.value || undefined,
                // تصفير المصدر إذا خرجنا من errand
                source: e.target.value === "errand" ? prev.source : undefined,
              }))
            }
          >
            <MenuItem value="">الكل</MenuItem>
            <MenuItem value="marketplace">متاجر (سلة)</MenuItem>
            <MenuItem value="errand">اخدمني</MenuItem>
          </Select>
        </FormControl>

        {/* ✅ مصدر الطلب (SHEIN) — يظهر فقط مع اخدمني */}
        {filters.orderType === "errand" && (
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel id="source">المصدر</InputLabel>
            <Select
              labelId="source"
              label="المصدر"
              value={filters.source || ""}
              onChange={(e) => up("source", e.target.value || undefined)}
            >
              <MenuItem value="">
                <em>الكل</em>
              </MenuItem>
              <MenuItem value="shein">SHEIN</MenuItem>
              <MenuItem value="other">أخرى</MenuItem>
            </Select>
          </FormControl>
        )}

        <TextField
          size="small"
          fullWidth
          label="بحث"
          value={filters.q || ""}
          onChange={(e) => up("q", e.target.value)}
          placeholder="رقم الطلب، هاتف، بريد…"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search fontSize="small" />
              </InputAdornment>
            ),
          }}
        />

        <Select
          size="small"
          displayEmpty
          value={filters.status || ""}
          onChange={(e) => up("status", e.target.value)}
          sx={{ minWidth: 180, borderRadius: 2 }}
          renderValue={(v) =>
            v ? (
              statusLabels[v as OrderStatus]
            ) : (
              <em style={{ color: "#888" }}>كل الحالات</em>
            )
          }
        >
          <MenuItem value="">
            <em>كل الحالات</em>
          </MenuItem>
          {ALL.map((s) => (
            <MenuItem key={s} value={s}>
              {statusLabels[s]}
            </MenuItem>
          ))}
        </Select>

        <Select
          size="small"
          displayEmpty
          value={filters.paymentMethod || ""}
          onChange={(e) => up("paymentMethod", e.target.value)}
          sx={{ minWidth: 160, borderRadius: 2 }}
          renderValue={(v) =>
            v ? (
              paymentLabels[v as PaymentMethod]
            ) : (
              <em style={{ color: "#888" }}>كل طرق الدفع</em>
            )
          }
        >
          <MenuItem value="">
            <em>كل طرق الدفع</em>
          </MenuItem>
          {(["wallet", "card", "cash", "mixed"] as PaymentMethod[]).map(
            (pm) => (
              <MenuItem key={pm} value={pm}>
                {paymentLabels[pm]}
              </MenuItem>
            )
          )}
        </Select>
      </Stack>

      {/* الفلاتر المتقدمة */}
      <Collapse in={moreOpen} unmountOnExit>
        <Divider sx={{ my: 1.5 }} />
        <Stack
          direction={{ xs: "column", lg: "row" }}
          gap={1.5}
          alignItems={{ xs: "stretch", lg: "center" }}
          sx={{
            "& .MuiFormControl-root, & .MuiTextField-root, & .MuiAutocomplete-root":
              {
                minWidth: { xs: "100%", lg: 220 },
              },
          }}
        >
          <TextField
            size="small"
            label="مدينة"
            value={filters.city || ""}
            onChange={(e) => up("city", e.target.value)}
          />

          {/* المتجر */}
          <Box sx={{ minWidth: 240, flex: 1 }}>
            <AsyncSearchSelect<StoreLite>
              label="المتجر"
              value={storeOpt}
              onChange={(opt) => {
                setStoreOpt(opt);
                up("storeId", opt?._id || undefined);
              }}
              fetchOptions={StoresApi.search}
              getOptionLabel={(o) => o?.name || ""}
              placeholder="ابحث باسم المتجر"
            />
          </Box>

          {/* السائق */}
          <Box sx={{ minWidth: 260, flex: 1 }}>
            <AsyncSearchSelect<DriverLite>
              label="السائق"
              value={driverOpt}
              onChange={(opt) => {
                setDriverOpt(opt);
                up("driverId", opt?._id || undefined);
              }}
              fetchOptions={DriversApi.search}
              getOptionLabel={(o) =>
                o?.fullName
                  ? `${o.fullName}${o.phone ? " • " + o.phone : ""}`
                  : ""
              }
              placeholder="ابحث باسم السائق أو هاتفه"
            />
          </Box>

          {/* العميل */}
          <Box sx={{ minWidth: 260, flex: 1 }}>
            <AsyncSearchSelect<UserLite>
              label="العميل"
              value={userOpt}
              onChange={(opt) => {
                setUserOpt(opt);
                up("userId", opt?._id || undefined);
              }}
              fetchOptions={UsersApi.search}
              getOptionLabel={(o) =>
                (o?.fullName || o?.name || "") +
                (o?.phone ? ` • ${o.phone}` : "")
              }
              placeholder="ابحث باسم العميل أو هاتفه"
            />
          </Box>

          {/* نطاق التاريخ */}
          <Stack
            direction={{ xs: "column", sm: "row" }}
            gap={1}
            sx={{ minWidth: 280 }}
          >
            <TextField
              size="small"
              type="date"
              label="من"
              InputLabelProps={{ shrink: true }}
              value={filters.from || ""}
              onChange={(e) => up("from", e.target.value)}
              sx={{ flex: 1 }}
            />
            <TextField
              size="small"
              type="date"
              label="إلى"
              InputLabelProps={{ shrink: true }}
              value={filters.to || ""}
              onChange={(e) => up("to", e.target.value)}
              sx={{ flex: 1 }}
            />
          </Stack>
        </Stack>
      </Collapse>

      {/* شريط الشيبّات للفلاتر الفعالة */}
      {!!activeChips.length && (
        <>
          <Divider sx={{ my: 1.5 }} />
          <Stack direction="row" flexWrap="wrap" gap={1}>
            {activeChips.map((c) => (
              <Chip
                key={c.key}
                label={c.label}
                onDelete={() => clearKey(c.key)}
                variant="outlined"
                size="small"
                sx={{
                  borderRadius: 2,
                }}
              />
            ))}
            <Box sx={{ flex: 1 }} />
            <Tooltip title="تفريغ الكل">
              <span>
                <Button
                  startIcon={<Refresh />}
                  size="small"
                  onClick={clearAll}
                  disabled={loading}
                  sx={{ borderRadius: 2 }}
                >
                  تفريغ
                </Button>
              </span>
            </Tooltip>
          </Stack>
        </>
      )}
    </Paper>
  );
}
