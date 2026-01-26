
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  InputAdornment,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  MenuItem,
  Paper,
  Stack,
  Switch,
  TextField,
  Tooltip,
  Typography,
  Snackbar,
} from "@mui/material";
import {
  MapContainer,
  TileLayer,
  Marker,
  CircleMarker,
  Popup,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import {
  Lock,
  Send,
  Refresh,
  Search,
  WifiOff,
  Wifi,
  Notifications as Bell,
  TrendingUp as Activity,
} from "@mui/icons-material";
import axios from "../../../utils/axios";

// ===== Types =====
export type DriverStatus = "online" | "busy" | "idle" | "offline";

interface DriverRT {
  id: string;
  name: string;
  phone?: string;
  status: DriverStatus;
  lat: number;
  lng: number;
  speed?: number; // كم/س
  lastSeen: string; // ISO
  orderId?: string | null;
  city?: string;
  slaBreached?: boolean; // خرق SLA الجاري
}

interface HeatPoint {
  lat: number;
  lng: number;
  count: number;
}

// ===== Helpers =====
const STATUS_LABEL: Record<DriverStatus, string> = {
  online: "متصل",
  busy: "مشغول",
  idle: "خامل",
  offline: "غير متصل",
};

const STATUS_COLOR: Record<DriverStatus, string> = {
  online: "#22c55e",
  busy: "#ef4444",
  idle: "#f59e0b",
  offline: "#9ca3af",
};

function throttle<T extends (...args: never[]) => void>(fn: T, wait = 1000) {
  let last = 0;
  let pending: Parameters<T> | null = null;
  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - last >= wait) {
      last = now;
      fn(...args);
    } else {
      pending = args;
      setTimeout(() => {
        if (pending) {
          fn(...pending);
          pending = null;
          last = Date.now();
        }
      }, wait - (now - last));
    }
  };
}

// ===== API =====
async function fetchRealtime(params?: { city?: string }) {
  const { data } = await axios.get("/admin/ops/drivers/realtime", { params });
  return data as { drivers: DriverRT[] };
}

async function fetchHeatmap(params: { from: string; to: string }) {
  const { data } = await axios.get("/admin/ops/heatmap", { params });
  return data as { points: HeatPoint[] };
}

async function postAction(
  id: string,
  payload: { action: "lock" | "ping" | "notify"; reason?: string }
) {
  const { data } = await axios.post(
    `/admin/ops/drivers/${id}/actions`,
    payload
  );
  return data;
}

// ===== Hook: Realtime with WS fallback =====
function useDriversRealtime({ city }: { city?: string }) {
  const [drivers, setDrivers] = useState<DriverRT[]>([]);
  const [connected, setConnected] = useState<boolean>(false);
  const [usingWS, setUsingWS] = useState<boolean>(false);
  const wsRef = useRef<WebSocket | null>(null);
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  const safeUpdate = useMemo(
    () => throttle((list: DriverRT[]) => setDrivers(list), 1000),
    []
  );

  useEffect(() => {
    // Cleanup previous
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }

    // Try WebSocket first
    let wsUrl = "/ws/admin/ops/drivers";
    try {
      const loc = window.location;
      const proto = loc.protocol === "https:" ? "wss" : "ws";
      wsUrl = `${proto}://${loc.host}/ws/admin/ops/drivers${
        city ? `?city=${encodeURIComponent(city)}` : ""
      }`;
    } catch (error) {
      console.warn("Failed to construct WebSocket URL:", error);
    }

    const startPolling = async () => {
      setUsingWS(false);
      setConnected(true); // polling considered connected
      const load = async () => {
        try {
          const res = await fetchRealtime({ city });
          safeUpdate(res.drivers || []);
        } catch {
          // show disconnect if polling fails too
          setConnected(false);
        }
      };
      load();
      pollRef.current = setInterval(load, 4000); // ≤5 ثوانٍ حسب القبول
    };

    const startWS = () => {
      try {
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;
        ws.onopen = () => {
          setConnected(true);
          setUsingWS(true);
        };
        ws.onmessage = (evt) => {
          try {
            const payload = JSON.parse(evt.data);
            if (Array.isArray(payload?.drivers)) {
              safeUpdate(payload.drivers);
            }
          } catch (error) {
            console.warn("Failed to parse WebSocket message:", error);
          }
        };
        ws.onerror = () => {
          setConnected(false);
        };
        ws.onclose = () => {
          setConnected(false);
          // fallback to polling
          startPolling();
        };
      } catch {
        startPolling();
      }
    };

    startWS();

    return () => {
      if (wsRef.current) wsRef.current.close();
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [city, safeUpdate]);

  return { drivers, connected, usingWS };
}

// ===== Main Page =====
export default function OpsDriversDashboard() {
  const [city, setCity] = useState<string>("");
  const { drivers, connected, usingWS } = useDriversRealtime({
    city: city || undefined,
  });

  // Filters
  const [statusFilter, setStatusFilter] = useState<DriverStatus | "">("");
  const [query, setQuery] = useState("");
  const [showHeat, setShowHeat] = useState(false);
  const [heatPoints, setHeatPoints] = useState<HeatPoint[]>([]);
  const [timeRange] = useState<{ from: string; to: string }>(
    () => {
      const to = new Date();
      const from = new Date(to.getTime() - 60 * 60 * 1000); // آخر ساعة
      return { from: from.toISOString(), to: to.toISOString() };
    }
  );

  const [toast, setToast] = useState<{
    open: boolean;
    msg: string;
    sev?: "success" | "error";
  }>({ open: false, msg: "" });

  useEffect(() => {
    let active = true;
    if (showHeat) {
      fetchHeatmap(timeRange)
        .then((res) => {
          if (!active) return;
          setHeatPoints(res.points || []);
        })
        .catch(() => {});
    }
    return () => {
      active = false;
    };
  }, [showHeat, timeRange]);

  const filtered = useMemo(() => {
    return drivers.filter((d) => {
      if (statusFilter && d.status !== statusFilter) return false;
      if (query) {
        const q = query.trim().toLowerCase();
        if (
          !(
            `${d.name}`.toLowerCase().includes(q) ||
            `${d.phone || ""}`.includes(q)
          )
        )
          return false;
      }
      return true;
    });
  }, [drivers, statusFilter, query]);

  // Map center (تلقائي وفق أول عنصر أو افتراضي)
  const center: [number, number] = useMemo(() => {
    const d = filtered[0] || drivers[0];
    return d ? [d.lat, d.lng] : [15.3694, 44.191]; // صنعاء افتراضًا
  }, [filtered, drivers]);

  const onAction = async (
    driverId: string,
    action: "lock" | "ping" | "notify"
  ) => {
    try {
      await postAction(driverId, { action });
      setToast({ open: true, msg: "تم تنفيذ الإجراء", sev: "success" });
    } catch (e: unknown) {
      const error = e as { response?: { data?: { message?: string } } };
      setToast({
        open: true,
        msg: error?.response?.data?.message || "فشل تنفيذ الإجراء",
        sev: "error",
      });
    }
  };

  // Alerts widget (SLA/Disconnect/Load)
  const alerts = useMemo(() => {
    const list: { type: "sla" | "offline" | "load"; text: string }[] = [];
    const offline = drivers.filter((d) => d.status === "offline");
    const sla = drivers.filter((d) => d.slaBreached);
    if (offline.length > 0)
      list.push({
        type: "offline",
        text: `كباتن غير متصلين: ${offline.length}`,
      });
    if (sla.length > 0)
      list.push({ type: "sla", text: `خرق SLA: ${sla.length}` });
    if (drivers.length > 0) {
      const busy = drivers.filter((d) => d.status === "busy").length;
      if (busy / drivers.length > 0.7)
        list.push({ type: "load", text: "كثافة طلبات عالية (>70% مشغول)" });
    }
    return list;
  }, [drivers]);

  return (
    <Box
      p={2}
      sx={{
        height: "calc(100vh - 64px)",
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "340px 1fr" },
        gap: 2,
      }}
    >
      {/* Sidebar */}
      <Paper sx={{ p: 2, overflow: "auto" }}>
        <Stack spacing={2}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Typography variant="h6">لوحة العمليات — الكباتن</Typography>
            <Chip
              size="small"
              label={usingWS ? "WS" : "Polling"}
              color={usingWS ? "success" : "default"}
            />
          </Stack>

          <Alert
            icon={connected ? <Wifi /> : <WifiOff />}
            severity={connected ? "success" : "warning"}
          >
            {connected
              ? "متصل بالمصدر اللحظي"
              : "انقطع الاتصال — تم التحويل إلى Polling"}
          </Alert>

          <TextField
            size="small"
            placeholder="ابحث باسم الكابتن أو الهاتف"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />

          <TextField
            select
            size="small"
            label="الحالة"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as DriverStatus | "")}
          >
            <MenuItem value="">الكل</MenuItem>
            <MenuItem value="online">متصل</MenuItem>
            <MenuItem value="busy">مشغول</MenuItem>
            <MenuItem value="idle">خامل</MenuItem>
            <MenuItem value="offline">غير متصل</MenuItem>
          </TextField>

          <TextField
            size="small"
            label="المدينة"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="مثال: صنعاء"
          />

          <Stack direction="row" alignItems="center" spacing={1}>
            <Switch
              checked={showHeat}
              onChange={(e) => setShowHeat(e.target.checked)}
            />
            <Typography variant="body2">إظهار Heatmap (ساعة أخيرة)</Typography>
          </Stack>

          <Divider />

          <Typography variant="subtitle2">تنبيهات تشغيلية</Typography>
          {alerts.length === 0 ? (
            <Typography variant="caption" color="text.secondary">
              لا توجد تنبيهات حالية
            </Typography>
          ) : (
            <List dense>
              {alerts.map((a, idx) => (
                <ListItem key={idx}>
                  <ListItemAvatar>
                    <Avatar
                      sx={{
                        bgcolor:
                          a.type === "sla"
                            ? "error.main"
                            : a.type === "load"
                            ? "warning.main"
                            : "grey.500",
                      }}
                    >
                      {a.type === "sla" ? (
                        <Activity />
                      ) : a.type === "load" ? (
                        <Bell />
                      ) : (
                        <WifiOff />
                      )}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primaryTypographyProps={{ variant: "body2" }}
                    primary={a.text}
                  />
                </ListItem>
              ))}
            </List>
          )}

          <Divider />

          <Typography variant="subtitle2">
            قائمة الكباتن ({filtered.length}/{drivers.length})
          </Typography>
          <List dense sx={{ maxHeight: 280, overflow: "auto" }}>
            {filtered.map((d) => (
              <ListItem
                key={d.id}
                secondaryAction={
                  <Stack direction="row" spacing={0.5}>
                    <Tooltip title="قفل مؤقت">
                      <IconButton
                        size="small"
                        onClick={() => onAction(d.id, "lock")}
                      >
                        {" "}
                        <Lock fontSize="small" />{" "}
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Ping">
                      <IconButton
                        size="small"
                        onClick={() => onAction(d.id, "ping")}
                      >
                        {" "}
                        <Send fontSize="small" />{" "}
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="إرسال تنبيه">
                      <IconButton
                        size="small"
                        onClick={() => onAction(d.id, "notify")}
                      >
                        {" "}
                        <Bell fontSize="small" />{" "}
                      </IconButton>
                    </Tooltip>
                  </Stack>
                }
              >
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: STATUS_COLOR[d.status] }} />
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography variant="body2" fontWeight={600}>
                        {d.name}
                      </Typography>
                      {d.slaBreached && (
                        <Chip size="small" color="error" label="SLA" />
                      )}
                    </Stack>
                  }
                  secondary={
                    <Typography variant="caption" color="text.secondary">
                      {d.phone || "—"} • {STATUS_LABEL[d.status]}
                    </Typography>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Stack>
      </Paper>

      {/* Map */}
      <Paper sx={{ position: "relative" }}>
        <Box sx={{ position: "absolute", zIndex: 2, top: 8, right: 8 }}>
          <Tooltip title="تحديث" placement="left">
            <IconButton onClick={() => window.location.reload()} size="small">
              <Refresh />
            </IconButton>
          </Tooltip>
        </Box>

        <MapContainer
          center={center}
          zoom={12}
          style={{ height: "100%", minHeight: 480 }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap"
          />

          {showHeat &&
            heatPoints.map((p, idx) => (
              <CircleMarker
                key={`h-${idx}`}
                center={[p.lat, p.lng]}
                radius={Math.min(20, 4 + p.count)}
                pathOptions={{
                  color: "#ef4444",
                  fillColor: "#ef4444",
                  fillOpacity: 0.25,
                  opacity: 0,
                }}
              />
            ))}

          {filtered.map((d) => (
            <Marker key={d.id} position={[d.lat, d.lng]}>
              <Popup>
                <Stack spacing={0.5}>
                  <Typography variant="subtitle2">{d.name}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {d.phone || "—"}
                  </Typography>
                  <Chip
                    size="small"
                    label={STATUS_LABEL[d.status]}
                    sx={{
                      bgcolor: STATUS_COLOR[d.status],
                      color: "#fff",
                      width: "fit-content",
                    }}
                  />
                  {d.orderId && (
                    <Typography variant="caption">
                      طلب جاري: #{d.orderId}
                    </Typography>
                  )}
                  <Typography variant="caption" color="text.secondary">
                    آخر تواجد: {new Date(d.lastSeen).toLocaleTimeString()}
                  </Typography>
                  <Divider />
                  <Stack direction="row" spacing={1}>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => onAction(d.id, "lock")}
                      startIcon={<Lock />}
                    >
                      قفل
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => onAction(d.id, "ping")}
                      startIcon={<Send />}
                    >
                      Ping
                    </Button>
                    <Button
                      size="small"
                      variant="contained"
                      onClick={() => onAction(d.id, "notify")}
                      startIcon={<Bell />}
                    >
                      تنبيه
                    </Button>
                  </Stack>
                </Stack>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </Paper>

      <Snackbar
        open={toast.open}
        autoHideDuration={2500}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
        message={toast.msg}
      />
    </Box>
  );
}
