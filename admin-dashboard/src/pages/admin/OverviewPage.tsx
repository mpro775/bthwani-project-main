// src/pages/admin/OverviewPage.tsx
import React, { useMemo, useState } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
  IconButton,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  TextField,
  Divider,
  CircularProgress,
  Alert,
  Stack,
  Tooltip,
  Chip,
} from "@mui/material";
import {
  Refresh,
  TrendingUp,
  MonetizationOn,
  ShoppingCart,
  AccessTime,
  Report,
} from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import {
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip as RTooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import axios from "../../utils/axios";

// =============== Types ===============
interface SummaryParams {
  from: string;
  to: string;
  tz: string;
}

interface SeriesParams extends SummaryParams {
  metric: "orders" | "gmv" | "revenue";
  interval: "day" | "hour";
}

interface TopParams extends SummaryParams {
  by: "stores" | "cities" | "categories";
  limit: number;
}

// =============== API layer (can swap to your existing wrappers) ===============
const api = {
  summary: (params: SummaryParams) =>
    axios.get("/admin/dashboard/summary", { params }).then((r) => r.data),
  series: (params: SeriesParams) =>
    axios.get("/admin/dashboard/timeseries", { params }).then((r) => r.data),
  top: (params: TopParams) =>
    axios.get("/admin/dashboard/top", { params }).then((r) => r.data),
  alerts: () => axios.get("/admin/dashboard/alerts").then((r) => r.data),
};

// =============== helpers ===============
const fmtCurrency = (v: number | null | undefined, currency = "﷼") =>
  v == null
    ? "—"
    : `${currency} ${v.toLocaleString(undefined, {
        maximumFractionDigits: 0,
      })}`;
const fmtNumber = (v: number | null | undefined) =>
  v == null ? "—" : v.toLocaleString();
const fmtPercent = (v: number | null | undefined) =>
  v == null ? "—" : `${(v * 100).toFixed(1)}%`;
const fmtMinutes = (v: number | null | undefined) =>
  v == null ? "—" : `${Math.round(v)}m`;
const iso = (d: Date) => d.toISOString().slice(0, 10);

// pick sensible defaults
const today = new Date();
const thirtyDaysAgo = new Date(today.getTime() - 29 * 24 * 60 * 60 * 1000);

// =============== main component ===============
const OverviewPage: React.FC = () => {
  const [from, setFrom] = useState<string>(iso(thirtyDaysAgo));
  const [to, setTo] = useState<string>(iso(today));
  const [tz, setTz] = useState<string>("Asia/Aden");

  const [metric, setMetric] = useState<"orders" | "gmv" | "revenue">("orders");
  const [interval, setInterval] = useState<"day" | "hour">("day");
  const [topBy, setTopBy] = useState<"stores" | "cities" | "categories">(
    "stores"
  );

  const rangeParams = useMemo(() => ({ from, to, tz }), [from, to, tz]);

  const qSummary = useQuery({
    queryKey: ["admin-summary", rangeParams],
    queryFn: () => api.summary(rangeParams),
  });

  const qSeries = useQuery({
    queryKey: ["admin-series", { ...rangeParams, metric, interval }],
    queryFn: () => api.series({ ...rangeParams, metric, interval }),
  });

  const qTop = useQuery({
    queryKey: ["admin-top", { ...rangeParams, by: topBy }],
    queryFn: () => api.top({ ...rangeParams, by: topBy, limit: 10 }),
  });

  const qAlerts = useQuery({
    queryKey: ["admin-alerts"],
    queryFn: () => api.alerts(),
  });

  const loading = qSummary.isLoading || qSeries.isLoading || qTop.isLoading;

  if (loading)
    return (
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        height="100%"
      >
        <CircularProgress />
      </Box>
    );
  return (
    <Box p={2}>
      {/* Header & Filters */}
      <Grid container spacing={2} alignItems="center">
        <Grid size={{ xs: 12, md: 12 }}>
          <Typography variant="h5" fontWeight={700}>
            لوحة الإدارة العامة
          </Typography>
          <Typography variant="body2" color="text.secondary">
            ملخّص الأداء والتنبيهات ونظرة عامة على المتاجر
          </Typography>
        </Grid>
        <Grid>
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>المنطقة الزمنية</InputLabel>
            <Select
              label="المنطقة الزمنية"
              value={tz}
              onChange={(e) => setTz(e.target.value)}
            >
              <MenuItem value="Asia/Aden">Asia/Aden</MenuItem>
              <MenuItem value="Asia/Riyadh">Asia/Riyadh</MenuItem>
              <MenuItem value="UTC">UTC</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid>
          <TextField
            size="small"
            type="date"
            label="من"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          />
        </Grid>
        <Grid>
          <TextField
            size="small"
            type="date"
            label="إلى"
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
        </Grid>
        <Grid>
          <Tooltip title="تحديث">
            <IconButton
              onClick={() => {
                qSummary.refetch();
                qSeries.refetch();
                qTop.refetch();
                qAlerts.refetch();
              }}
            >
              <Refresh />
            </IconButton>
          </Tooltip>
        </Grid>
      </Grid>

      <Box mt={2} />

      {/* KPI Cards */}
      <Grid container spacing={2}>
        <KpiCard
          loading={qSummary.isLoading}
          icon={<ShoppingCart />}
          title="عدد الطلبات"
          value={fmtNumber(qSummary.data?.orders)}
        />
        <KpiCard
          loading={qSummary.isLoading}
          icon={<MonetizationOn />}
          title="GMV"
          value={fmtCurrency(qSummary.data?.gmv)}
        />
        <KpiCard
          loading={qSummary.isLoading}
          icon={<TrendingUp />}
          title="إيراد المنصة"
          value={fmtCurrency(qSummary.data?.revenue)}
        />
        <KpiCard
          loading={qSummary.isLoading}
          icon={<Report />}
          title="معدّل الإلغاء"
          value={fmtPercent(qSummary.data?.cancelRate)}
        />
        <KpiCard
          loading={qSummary.isLoading}
          icon={<AccessTime />}
          title="زمن التوصيل (متوسط/90%)"
          value={`${fmtMinutes(
            qSummary.data?.deliveryTime?.avgMin
          )} / ${fmtMinutes(qSummary.data?.deliveryTime?.p90Min)}`}
        />
      </Grid>

      <Box mt={2} />

      {/* Chart + Controls */}
      <Card>
        <CardContent>
          <Grid container alignItems="center" spacing={2}>
            <Grid size={{ xs: 12, md: 3 }}>
              <Typography variant="subtitle1" fontWeight={700}>
                السلسلة الزمنية
              </Typography>
              <Typography variant="caption" color="text.secondary">
                الأداء حسب الفترة المختارة
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <ToggleButtonGroup
                size="small"
                value={metric}
                exclusive
                onChange={(_, v) => v && setMetric(v)}
              >
                <ToggleButton value="orders">الطلبات</ToggleButton>
                <ToggleButton value="gmv">GMV</ToggleButton>
                <ToggleButton value="revenue">الإيراد</ToggleButton>
              </ToggleButtonGroup>
              <Box component="span" sx={{ mx: 1 }} />
              <ToggleButtonGroup
                size="small"
                value={interval}
                exclusive
                onChange={(_, v) => v && setInterval(v)}
              >
                <ToggleButton value="day">يومي</ToggleButton>
                <ToggleButton value="hour">ساعي</ToggleButton>
              </ToggleButtonGroup>
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              {qSeries.isFetching && (
                <Chip size="small" label="جارِ التحديث…" />
              )}
            </Grid>
          </Grid>
          <Box mt={2} height={320}>
            {qSeries.isLoading ? (
              <Box
                display="flex"
                alignItems="center"
                justifyContent="center"
                height="100%"
              >
                <CircularProgress />
              </Box>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={(qSeries.data?.data || []).map(
                    (d: { date: string; value: number }) => ({
                      ...d,
                      date: new Date(d.date).toLocaleDateString(),
                    })
                  )}
                >
                  <defs>
                    <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopOpacity={0.25} />
                      <stop offset="100%" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <RTooltip
                    formatter={(v: number) =>
                      metric === "orders" ? fmtNumber(v) : fmtCurrency(v)
                    }
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    fill="url(#grad)"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    dot={false}
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </Box>
        </CardContent>
      </Card>

      <Box mt={2} />

      {/* Top table & Alerts */}
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 7 }}>
          <Card>
            <CardContent>
              <Grid container alignItems="center" spacing={2}>
                <Grid size={{ xs: 12 }}>
                  <Typography variant="subtitle1" fontWeight={700}>
                    الأعلى أداءً
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    حسب GMV خلال الفترة
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <FormControl size="small">
                    <InputLabel>حسب</InputLabel>
                    <Select
                      label="حسب"
                      value={topBy}
                      onChange={(e) =>
                        setTopBy(
                          e.target.value as "stores" | "cities" | "categories"
                        )
                      }
                    >
                      <MenuItem value="stores">متاجر</MenuItem>
                      <MenuItem value="cities">مدن</MenuItem>
                      <MenuItem value="categories">تصنيفات</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
              <Box mt={2}>
                {qTop.isLoading ? (
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    py={6}
                  >
                    <CircularProgress />
                  </Box>
                ) : (
                  <Box
                    component="table"
                    sx={{ width: "100%", borderCollapse: "collapse" }}
                  >
                    <Box component="thead">
                      <Box
                        component="tr"
                        sx={{
                          borderBottom: "1px solid",
                          borderColor: "divider",
                        }}
                      >
                        <Box component="th" sx={{ textAlign: "left", p: 1 }}>
                          العنصر
                        </Box>
                        <Box component="th" sx={{ textAlign: "right", p: 1 }}>
                          الطلبات
                        </Box>
                        <Box component="th" sx={{ textAlign: "right", p: 1 }}>
                          GMV
                        </Box>
                        <Box component="th" sx={{ textAlign: "right", p: 1 }}>
                          الإيراد
                        </Box>
                      </Box>
                    </Box>
                    <Box component="tbody">
                      {(qTop.data?.rows || []).map(
                        (
                          r: {
                            _id: string;
                            orders: number;
                            gmv: number;
                            revenue: number;
                          },
                          idx: number
                        ) => (
                          <Box
                            key={idx}
                            component="tr"
                            sx={{
                              borderBottom: "1px dashed",
                              borderColor: "divider",
                            }}
                          >
                            <Box component="td" sx={{ p: 1 }}>
                              {String(r._id ?? "—")}
                            </Box>
                            <Box
                              component="td"
                              sx={{ p: 1, textAlign: "right" }}
                            >
                              {fmtNumber(r.orders)}
                            </Box>
                            <Box
                              component="td"
                              sx={{ p: 1, textAlign: "right" }}
                            >
                              {fmtCurrency(r.gmv)}
                            </Box>
                            <Box
                              component="td"
                              sx={{ p: 1, textAlign: "right" }}
                            >
                              {fmtCurrency(r.revenue)}
                            </Box>
                          </Box>
                        )
                      )}
                    </Box>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 5 }}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={700}>
                التنبيهات السريعة
              </Typography>
              <Typography variant="caption" color="text.secondary">
                أرقام يجب مراقبتها اليوم
              </Typography>
              <Box mt={2}>
                {qAlerts.isLoading ? (
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    py={6}
                  >
                    <CircularProgress />
                  </Box>
                ) : (
                  <Stack spacing={1}>
                    <Alert severity="warning">
                      طلبات بانتظار الشراء:{" "}
                      <b>{fmtNumber(qAlerts.data?.awaitingProcurement)}</b>
                    </Alert>
                    <Alert severity="info">
                      طلبات بانتظار الإسناد لكابتن:{" "}
                      <b>{fmtNumber(qAlerts.data?.awaitingAssign)}</b>
                    </Alert>
                    <Alert severity="error">
                      طلبات متأخرة في التوصيل ({">"}90 دقيقة):{" "}
                      <b>{fmtNumber(qAlerts.data?.overdueDeliveries)}</b>
                    </Alert>
                  </Stack>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box mt={3} />

      {/* Status Distribution */}
      <Card>
        <CardContent>
          <Typography variant="subtitle1" fontWeight={700}>
            توزيع الحالات
          </Typography>
          <Typography variant="caption" color="text.secondary">
            لنفس الفترة المحددة
          </Typography>
          <Box mt={2}>
            {qSummary.isLoading ? (
              <Box
                display="flex"
                alignItems="center"
                justifyContent="center"
                py={6}
              >
                <CircularProgress />
              </Box>
            ) : (
              <Box
                component="table"
                sx={{ width: "100%", borderCollapse: "collapse" }}
              >
                <Box component="thead">
                  <Box
                    component="tr"
                    sx={{ borderBottom: "1px solid", borderColor: "divider" }}
                  >
                    <Box component="th" sx={{ textAlign: "left", p: 1 }}>
                      الحالة
                    </Box>
                    <Box component="th" sx={{ textAlign: "right", p: 1 }}>
                      العدد
                    </Box>
                  </Box>
                </Box>
                <Box component="tbody">
                  {(qSummary.data?.byStatus || []).map(
                    (s: { status: string; count: number }, idx: number) => (
                      <Box
                        key={idx}
                        component="tr"
                        sx={{
                          borderBottom: "1px dashed",
                          borderColor: "divider",
                        }}
                      >
                        <Box component="td" sx={{ p: 1 }}>
                          {s.status}
                        </Box>
                        <Box component="td" sx={{ p: 1, textAlign: "right" }}>
                          {fmtNumber(s.count)}
                        </Box>
                      </Box>
                    )
                  )}
                </Box>
              </Box>
            )}
          </Box>
        </CardContent>
      </Card>

      <Box mt={4} />
      <Divider />
      <Box mt={2} display="flex" alignItems="center" gap={1}>
        <Typography variant="caption" color="text.secondary">
          المسار:
        </Typography>
        <Chip size="small" label="/admin/overview" />
        <Typography variant="caption" color="text.secondary">
          يعتمد على /admin/dashboard/*
        </Typography>
      </Box>
    </Box>
  );
};

// =============== small KPI card ===============
const KpiCard: React.FC<{
  title: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
  loading?: boolean;
}> = ({ title, value, icon, loading }) => (
  <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2.4 as unknown as number }}>
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" gap={1}>
          {icon && <Box color="text.secondary">{icon}</Box>}
          <Typography variant="overline" color="text.secondary">
            {title}
          </Typography>
        </Box>
        <Box mt={1}>
          {loading ? (
            <CircularProgress size={20} />
          ) : (
            <Typography variant="h6" fontWeight={700}>
              {value}
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  </Grid>
);

export default OverviewPage;
