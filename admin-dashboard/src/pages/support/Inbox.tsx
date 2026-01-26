// src/pages/support/Inbox.tsx
import { useEffect, useState } from "react";
import axios from "../../utils/axios";
import {
  Box,
  Paper,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  CircularProgress,
  Alert,
  Pagination,
} from "@mui/material";
import TicketList from "./TicketList";

interface TicketItem {
  _id: string;
  number: number;
  subject: string;
  description?: string;
  status: string;
  priority: string;
  assignee: string;
  requester: {
    userId: string;
    userInfo: {
      name?: string;
      email?: string;
    };
  };
  links?: {
    orderId?: string;
    store?: string;
    driver?: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface TicketsData {
  tickets: TicketItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  stats: {
    totalTickets: number;
    newTickets: number;
    openTickets: number;
    pendingTickets: number;
    resolvedTickets: number;
    closedTickets: number;
    urgentTickets: number;
    avgResolutionTimeDays: number;
    resolutionRate: number;
  };
}

interface ApiParams {
  page: number;
  limit: number;
  status?: string;
  priority?: string;
  assignee?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export default function Inbox() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [assignee, setAssignee] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [data, setData] = useState<TicketsData>({
    tickets: [],
    pagination: { page: 1, limit: 20, total: 0, pages: 0 },
    stats: {
      totalTickets: 0,
      newTickets: 0,
      openTickets: 0,
      pendingTickets: 0,
      resolvedTickets: 0,
      closedTickets: 0,
      urgentTickets: 0,
      avgResolutionTimeDays: 0,
      resolutionRate: 0,
    },
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const params: ApiParams = { page, limit, sortBy, sortOrder };
      if (search) params.search = search;
      if (status) params.status = status;
      if (priority) params.priority = priority;
      if (assignee) params.assignee = assignee;
      const r = await axios.get("/admin/dashboard/support-tickets", { params });
      setData(r.data);
    } catch (e) {
      setError((e as Error)?.message || "حدث خطأ غير متوقع");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(); /* eslint-disable-next-line */
  }, [page, status, priority, search, sortBy, sortOrder]);

  return (
    <Box p={2} display="flex" flexDirection="column" gap={2}>
      <Typography variant="h5">صندوق الوارد — الدعم</Typography>
      <Paper style={{ padding: 12 }}>
        <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
          <TextField
            size="small"
            label="بحث في العنوان، الوصف، أو معرف المستخدم"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && load()}
          />
          <FormControl size="small">
            <InputLabel>الحالة</InputLabel>
            <Select
              label="الحالة"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <MenuItem value="">
                <em>الكل</em>
              </MenuItem>
              {["new", "open", "pending", "resolved", "closed"].map(
                (s) => (
                  <MenuItem key={s} value={s}>
                    {s}
                  </MenuItem>
                )
              )}
            </Select>
          </FormControl>
          <FormControl size="small">
            <InputLabel>الأولوية</InputLabel>
            <Select
              label="الأولوية"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            >
              <MenuItem value="">
                <em>الكل</em>
              </MenuItem>
              {["low", "normal", "high", "urgent"].map((s) => (
                <MenuItem key={s} value={s}>
                  {s}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            size="small"
            label="المُعيّن (البريد الإلكتروني)"
            value={assignee}
            onChange={(e) => setAssignee(e.target.value)}
          />
          <FormControl size="small">
            <InputLabel>ترتيب حسب</InputLabel>
            <Select
              label="ترتيب حسب"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <MenuItem value="createdAt">تاريخ الإنشاء</MenuItem>
              <MenuItem value="updatedAt">آخر تحديث</MenuItem>
              <MenuItem value="status">الحالة</MenuItem>
              <MenuItem value="priority">الأولوية</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small">
            <InputLabel>اتجاه الترتيب</InputLabel>
            <Select
              label="اتجاه الترتيب"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")}
            >
              <MenuItem value="desc">تنازلي</MenuItem>
              <MenuItem value="asc">تصاعدي</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="contained"
            onClick={() => {
              setPage(1);
              load();
            }}
          >
            بحث
          </Button>
          <Button
            variant="outlined"
            onClick={() => {
              setSearch("");
              setStatus("");
              setPriority("");
              setAssignee("");
              setSortBy("createdAt");
              setSortOrder("desc");
              setPage(1);
              load();
            }}
          >
            مسح الفلاتر
          </Button>
        </Box>

        {/* إحصائيات التذاكر */}
        {data.stats && (
          <Box mt={2}>
            <Paper style={{ padding: 12 }}>
              <Typography variant="h6" gutterBottom>إحصائيات نقاط الدعم</Typography>
              <Box display="flex" gap={2} flexWrap="wrap">
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">إجمالي التذاكر</Typography>
                  <Typography variant="h6">{data.stats.totalTickets}</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">تذاكر جديدة</Typography>
                  <Typography variant="h6">{data.stats.newTickets}</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">تذاكر مفتوحة</Typography>
                  <Typography variant="h6">{data.stats.openTickets}</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">تذاكر معلقة</Typography>
                  <Typography variant="h6">{data.stats.pendingTickets}</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">تذاكر محلولة</Typography>
                  <Typography variant="h6">{data.stats.resolvedTickets}</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">تذاكر مغلقة</Typography>
                  <Typography variant="h6">{data.stats.closedTickets}</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">تذاكر عاجلة</Typography>
                  <Typography variant="h6">{data.stats.urgentTickets}</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">متوسط وقت الحل (أيام)</Typography>
                  <Typography variant="h6">{data.stats.avgResolutionTimeDays.toFixed(1)}</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">معدل حل المشاكل</Typography>
                  <Typography variant="h6">{data.stats.resolutionRate.toFixed(1)}%</Typography>
                </Box>
              </Box>
            </Paper>
          </Box>
        )}

        {loading && (
          <Box mt={2}>
            <CircularProgress />
          </Box>
        )}
        {error && (
          <Box mt={2}>
            <Alert severity="error">{error}</Alert>
          </Box>
        )}
        {!loading && !error && (
          <Box mt={1}>
            <TicketList items={data.tickets} />
          </Box>
        )}
        <Box display="flex" justifyContent="center" mt={1}>
          <Pagination
            count={data.pagination.pages || 1}
            page={data.pagination.page}
            onChange={(_e, v) => setPage(v)}
          />
        </Box>
      </Paper>
    </Box>
  );
}
