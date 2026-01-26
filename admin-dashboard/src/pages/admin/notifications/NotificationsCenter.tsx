import { useCallback, useEffect,  useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  Snackbar,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import {
  Add,
  Edit,
  Refresh,
  Search,
  Send,
  Assessment,
  ContentCopy,
  Science as TestIcon,
} from "@mui/icons-material";

// ===== استبدل هذه المسارات حسب مشروعك =====
import {
  getNotificationCampaigns,
  createNotificationCampaign,
  updateNotificationCampaign,
  sendNotificationCampaign,
  getNotificationTemplates,
  type NotificationCampaign,
  type CreateCampaignRequest,
} from "../../../api/adminNotifications";
import NotificationBadge from "../../../components/ui/NotificationBadge";
import NotificationLog from "../../../components/ui/NotificationLog";
import { type UpdateCampaignRequest } from "../../../api/adminNotifications"; // ← عدّل المسار

// ============= Types (UI-facing) =============
export type Channel = "push" | "sms" | "email" | "inapp";
export type NotificationStatus = "draft" | "scheduled" | "sent" | "failed";

export interface AudienceRule {
  key: "city" | "role" | "status" | "platform" | "segment";
  op: "in" | "not-in" | "eq" | "neq";
  values: string[];
}

export interface LocalizedContent {
  locale: string; // "ar" | "en" | ...
  title?: string;
  body: string;
}

export interface UTM {
  source?: string;
  medium?: string;
  campaign?: string;
  term?: string;
  content?: string;
}

export interface RateLimit {
  perMinute?: number;
  maxTotal?: number;
}

export interface NotificationItem {
  _id: string;
  title: string;
  channels: Channel[];
  audience: AudienceRule[];
  content: LocalizedContent[];
  scheduleAt?: string | null; // ISO
  status: NotificationStatus;
  createdBy: string;
  updatedAt: string; // ISO
}

export interface NotificationsListResponse {
  data: NotificationItem[];
  total: number;
}

export interface NotificationMetrics {
  deliveries: number;
  opens?: number;
  clicks?: number;
  failures: number;
  perChannel: {
    channel: Channel;
    deliveries: number;
    failures: number;
    opens?: number;
    clicks?: number;
  }[];
}

export interface TemplateItem {
  _id: string;
  name: string;
  channels: Channel[];
  content: LocalizedContent[];
}

// ============= Helpers / Mapping =============
const CHANNEL_LABEL: Record<Channel, string> = {
  push: "Push",
  sms: "SMS",
  email: "Email",
  inapp: "In-App",
};

const STATUS_LABEL: Record<NotificationStatus, string> = {
  draft: "مسودة",
  scheduled: "مجدول",
  sent: "مرسل",
  failed: "فاشل",
};

function hasValidAudience(rules: AudienceRule[]): boolean {
  return rules.length > 0 && rules.every((r) => r.values.length > 0);
}

function hasValidContent(content: LocalizedContent[]): boolean {
  return (
    content.length > 0 && content.every((c) => Boolean(c.body && c.locale))
  );
}

// حملة ← عنصر واجهة
function fromCampaign(c: NotificationCampaign): NotificationItem {
  const audienceRules: AudienceRule[] = [];
  if (c.audience?.apps?.length) {
    audienceRules.push({ key: "role", op: "in", values: c.audience.apps });
  }
  if (c.audience?.platforms?.length) {
    audienceRules.push({
      key: "platform",
      op: "in",
      values: c.audience.platforms,
    });
  }
  if (c.audience?.cities?.length) {
    audienceRules.push({ key: "city", op: "in", values: c.audience.cities });
  }

  const status: NotificationStatus =
    c.status === "completed"
      ? "sent"
      : c.status === "scheduled"
      ? "scheduled"
      : c.status === "failed"
      ? "failed"
      : "draft";

  const scheduleAt =
    c.schedule?.type === "datetime" && c.schedule.when
      ? new Date(c.schedule.when).toISOString()
      : null;

  return {
    _id: c._id,
    title: c.title || c.message?.title || "",
    channels: ["push"], // حالياً الباك يدعم Push
    audience: audienceRules,
    content: [
      {
        locale: "ar",
        title: c.message?.title ?? c.title ?? "",
        body: c.message?.body ?? "",
      },
    ],
    scheduleAt,
    status,
    createdBy: c.createdBy || "admin",
    updatedAt: c.updatedAt || c.createdAt,
  };
}

// واجهة ← CreateCampaignRequest (للإنشاء/التعديل)
function toCampaignCreatePayload(p: {
  title: string;
  audience: AudienceRule[];
  content: LocalizedContent[];
  scheduleAt?: string | null;
  utm?: UTM;
}): CreateCampaignRequest {
  const primary = p.content[0] ?? { title: p.title, body: "" };

  const apps = p.audience.find((a) => a.key === "role")?.values?.length
    ? p.audience.find((a) => a.key === "role")!.values
    : ["user"];

  const platforms = p.audience.find((a) => a.key === "platform")?.values || [];
  const cities = p.audience.find((a) => a.key === "city")?.values || [];

  return {
    title: p.title,
    message: {
      title: primary.title || p.title,
      body: primary.body || "",
      data: p.utm && Object.keys(p.utm).length ? { utm: p.utm } : undefined,
      channelId: "orders",
    },
    audience: {
      apps,
      platforms,
      cities: cities.length ? cities : undefined,
    },
    schedule: p.scheduleAt
      ? { type: "datetime", when: new Date(p.scheduleAt).toISOString() }
      : { type: "now" },
  };
}


export function NotificationsListPage() {
  const [channel, setChannel] = useState<Channel | "">("");
  const [status, setStatus] = useState<NotificationStatus | "">("");
  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");
  const [q, setQ] = useState<string>("");

  const [page, setPage] = useState<number>(0);
  const [pageSize, setPageSize] = useState<number>(10);

  const [rows, setRows] = useState<NotificationItem[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [openComposer, setOpenComposer] = useState<boolean>(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [metricsId, setMetricsId] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  // متغيرات سجل الإشعارات
  const [notificationLog, setNotificationLog] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  // دالة تحميل سجل الإشعارات الأخيرة
  const loadNotificationLog = useCallback(async () => {
    try {
      // هذه دالة وهمية - ستحتاج لربطها بـ API حقيقي
      // const response = await getNotificationLog();
      // setNotificationLog(response.data);

      // للآن، سنستخدم بيانات وهمية
      const mockLog = [
        {
          id: '1',
          title: 'تحديث حالة طلب',
          message: 'تم تعيين سائق للطلب رقم 12345',
          channel: 'push' as const,
          status: 'sent' as const,
          timestamp: new Date().toISOString(),
          recipientCount: 1,
          actor: 'النظام'
        },
        {
          id: '2',
          title: 'إشعار جديد',
          message: 'مرحباً بك في تطبيقنا',
          channel: 'push' as const,
          status: 'delivered' as const,
          timestamp: new Date(Date.now() - 60000).toISOString(),
          recipientCount: 5,
          actor: 'مدير النظام'
        }
      ];

      setNotificationLog(mockLog);
      setUnreadCount(1);
    } catch (error) {
      console.error('Failed to load notification log:', error);
    }
  }, []);

  const load = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const list = await getNotificationCampaigns(); // بدون ترقيم من الباك
      let items = list.map(fromCampaign);

      // فلترة على الواجهة مؤقتاً
      if (channel) items = items.filter((i) => i.channels.includes(channel));
      if (status) items = items.filter((i) => i.status === status);
      if (from)
        items = items.filter((i) => new Date(i.updatedAt) >= new Date(from));
      if (to)
        items = items.filter((i) => new Date(i.updatedAt) <= new Date(to));
      if (q) {
        const qq = q.toLowerCase();
        items = items.filter(
          (i) =>
            i.title.toLowerCase().includes(qq) ||
            (i.createdBy || "").toLowerCase().includes(qq)
        );
      }

      const start = page * pageSize;
      const dataPage = items.slice(start, start + pageSize);

      setRows(dataPage);
      setTotal(items.length);
    } catch (e) {
      setError(e instanceof Error ? e.message : "تعذر جلب الإشعارات");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, channel, status, from, to, q]);

  useEffect(() => {
    void load();
    void loadNotificationLog();
  }, [channel, status, from, to, page, pageSize, refreshTrigger, load, loadNotificationLog]);

  return (
    <Box p={2}>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        mb={2}
      >
        <Stack direction="row" alignItems="center" spacing={2}>
          <Typography variant="h5">مركز الإشعارات</Typography>
          <NotificationBadge count={unreadCount} />
        </Stack>
        <Stack direction="row" spacing={1}>
          <Button
            startIcon={<TestIcon />}
            variant="outlined"
            onClick={() => {
              // سيتم إضافة منطق اختبار OTP هنا
              window.open('/admin/test-otp', '_blank');
            }}
          >
            اختبار OTP
          </Button>
          <Button
            startIcon={<Add />}
            variant="contained"
            onClick={() => {
              setEditId(null);
              setOpenComposer(true);
            }}
          >
            إشعار جديد
          </Button>
        </Stack>
      </Stack>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          alignItems={{ md: "center" }}
        >
          <TextField
            size="small"
            placeholder="بحث بعنوان/مرسل/جمهور"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") void load();
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
            sx={{ width: { xs: "100%", md: 360 } }}
          />

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            flexWrap="wrap"
          >
            <TextField
              select
              size="small"
              label="القناة"
              value={channel}
              onChange={(e) => setChannel(e.target.value as Channel | "")}
              sx={{ minWidth: 160 }}
            >
              <MenuItem value="">الكل</MenuItem>
              <MenuItem value="push">Push</MenuItem>
              <MenuItem value="sms" disabled>
                SMS
              </MenuItem>
              <MenuItem value="email" disabled>
                Email
              </MenuItem>
              <MenuItem value="inapp" disabled>
                In-App
              </MenuItem>
            </TextField>

            <TextField
              select
              size="small"
              label="الحالة"
              value={status}
              onChange={(e) =>
                setStatus(e.target.value as NotificationStatus | "")
              }
              sx={{ minWidth: 160 }}
            >
              <MenuItem value="">الكل</MenuItem>
              <MenuItem value="draft">مسودة</MenuItem>
              <MenuItem value="scheduled">مجدول</MenuItem>
              <MenuItem value="sent">مرسل</MenuItem>
              <MenuItem value="failed">فاشل</MenuItem>
            </TextField>

            <TextField
              size="small"
              label="من"
              type="datetime-local"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
            />
            <TextField
              size="small"
              label="إلى"
              type="datetime-local"
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />

            <Tooltip title="تحديث">
              <IconButton onClick={() => void load()} disabled={loading}>
                <Refresh />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>
      </Paper>

      <Paper>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>العنوان</TableCell>
                <TableCell>القناة</TableCell>
                <TableCell>الجمهور</TableCell>
                <TableCell>الحالة</TableCell>
                <TableCell>المرسل</TableCell>
                <TableCell>آخر تحديث</TableCell>
                <TableCell align="right">إجراءات</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <CircularProgress size={20} />
                  </TableCell>
                </TableRow>
              ) : rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7}>
                    <Box py={6} textAlign="center">
                      لا توجد نتائج
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((n) => (
                  <TableRow key={n._id} hover>
                    <TableCell>{n.title}</TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={0.5} flexWrap="wrap">
                        {n.channels.map((c) => (
                          <Chip key={c} size="small" label={CHANNEL_LABEL[c]} />
                        ))}
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Tooltip title={JSON.stringify(n.audience)}>
                        <Typography variant="caption">
                          {n.audience.length} قاعدة
                        </Typography>
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={STATUS_LABEL[n.status]}
                        color={
                          n.status === "sent"
                            ? "success"
                            : n.status === "failed"
                            ? "error"
                            : n.status === "scheduled"
                            ? "warning"
                            : "default"
                        }
                      />
                    </TableCell>
                    <TableCell>{n.createdBy}</TableCell>
                    <TableCell>
                      {new Date(n.updatedAt).toLocaleString()}
                    </TableCell>
                    <TableCell align="right">
                      <Stack
                        direction="row"
                        spacing={1}
                        justifyContent="flex-end"
                      >
                        <Tooltip title="مقاييس">
                          <IconButton
                            size="small"
                            onClick={() => setMetricsId(n._id)}
                          >
                            <Assessment />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="تعديل">
                          <IconButton
                            size="small"
                            onClick={() => {
                              setEditId(n._id);
                              setOpenComposer(true);
                            }}
                          >
                            <Edit />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={total}
          page={page}
          onPageChange={(_, p) => setPage(p)}
          rowsPerPage={pageSize}
          onRowsPerPageChange={(e) => {
            const n = parseInt(e.target.value, 10);
            setPageSize(n);
            setPage(0);
          }}
          labelRowsPerPage="عدد الصفوف"
        />
      </Paper>

      {/* سجل الإشعارات الأخيرة */}
      <Box sx={{ mb: 2 }}>
        <NotificationLog
          entries={notificationLog}
          maxEntries={10}
          onRetry={(id) => {
            // منطق إعادة إرسال الإشعار
            console.log('Retry notification:', id);
          }}
        />
      </Box>

      <NotificationComposer
        open={openComposer}
        id={editId}
        onClose={() => {
          setOpenComposer(false);
          setEditId(null);
        }}
        onSave={() => {
          setRefreshTrigger((prev) => prev + 1);
        }}
      />
      <MetricsDialog id={metricsId} onClose={() => setMetricsId(null)} />

      {error && (
        <Snackbar
          open
          autoHideDuration={3000}
          onClose={() => setError(null)}
          message={error}
        />
      )}
    </Box>
  );
}

// ============= Composer =============
function NotificationComposer({
  open,
  id,
  onClose,
  onSave,
}: {
  open: boolean;
  id: string | null;
  onClose: () => void;
  onSave?: () => void;
}) {
  const editing = Boolean(id);
  const [loading, setLoading] = useState<boolean>(editing);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    open: boolean;
    msg: string;
    sev?: "success" | "error";
  }>({ open: false, msg: "" });

  const [title, setTitle] = useState<string>("");
  const [channels, setChannels] = useState<Channel[]>(["push"]);
  const [audience, setAudience] = useState<AudienceRule[]>([]);
  const [content, setContent] = useState<LocalizedContent[]>([
    { locale: "ar", title: "", body: "" },
  ]);
  const [scheduleAt, setScheduleAt] = useState<string>("");

  // غير مستخدمة حالياً في الباك، نحتفظ بها لواجهة مستقبلية
  const [rateLimit, setRateLimit] = useState<RateLimit>({
    perMinute: 0,
    maxTotal: 0,
  });
  const [utm, setUtm] = useState<UTM>({});

  const [openTemplates, setOpenTemplates] = useState<boolean>(false);

  const load = useCallback(async (): Promise<void> => {
    if (!id) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);

      // لا يوجد GET فردي في خدماتك؛ نجلب القائمة ونبحث
      const list = await getNotificationCampaigns();
      const found = list.find((x) => x._id === id);
      if (!found) throw new Error("لم يتم العثور على الحملة");

      const n = fromCampaign(found);
      setTitle(n.title);
      setChannels(n.channels);
      setAudience(n.audience);
      setContent(n.content);
      setScheduleAt(n.scheduleAt ?? "");
    } catch (e) {
      setError(e instanceof Error ? e.message : "تعذر تحميل الإشعار");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (open) void load();
  }, [id, open, load]);

  const validate = (): string | null => {
    if (!title.trim()) return "العنوان مطلوب";
    if (channels.length === 0) return "اختر قناة واحدة على الأقل";
    if (!hasValidAudience(audience))
      return "يجب تحديد جمهور صالح (قيم لكل قاعدة)";
    if (!hasValidContent(content)) return "المحتوى غير صالح (نص ولغة لكل عنصر)";
    return null;
  };

  const handleSave = async (sendNow?: boolean): Promise<void> => {
    const v = validate();
    if (v) {
      setToast({ open: true, msg: v, sev: "error" });
      return;
    }
    try {
      const base = {
        title,
        audience,
        content,
        scheduleAt: scheduleAt || null,
        utm,
      };
      if (editing && id) {
        const payload: UpdateCampaignRequest = toCampaignCreatePayload(base);
        await updateNotificationCampaign(id, payload);
        if (sendNow) await sendNotificationCampaign(id);
      } else {
        const payload: CreateCampaignRequest = toCampaignCreatePayload(base);
        const created = await createNotificationCampaign(payload);
        if (sendNow) await sendNotificationCampaign(created._id);
      }
      setToast({
        open: true,
        msg: sendNow ? "تم الإرسال" : scheduleAt ? "تم الجدولة" : "تم الحفظ",
        sev: "success",
      });
      onSave?.();
      onClose();
    } catch (e) {
      setToast({
        open: true,
        msg: e instanceof Error ? e.message : "فشل الحفظ/الإرسال",
        sev: "error",
      });
    }
  };

  const onApplyTemplate = (tpl: TemplateItem): void => {
    // نطبّق عنوان/نص من القالب
    setChannels(tpl.channels?.length ? tpl.channels : ["push"]);
    setContent(tpl.content?.length ? tpl.content : content);
    if (tpl.content?.[0]?.title) setTitle(tpl.content[0].title!);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>{editing ? "تعديل إشعار" : "إنشاء إشعار"}</DialogTitle>
      <DialogContent>
        {loading ? (
          <Box py={6} textAlign="center">
            <CircularProgress size={22} />
          </Box>
        ) : (
          <Stack spacing={2} mt={1}>
            {error && <Alert severity="error">{error}</Alert>}
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                label="العنوان"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                fullWidth
              />
              <Button
                startIcon={<ContentCopy />}
                variant="outlined"
                onClick={() => setOpenTemplates(true)}
              >
                قوالب
              </Button>
            </Stack>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <ChannelsSelector value={channels} onChange={setChannels} />
              <TextField
                type="datetime-local"
                label="وقت الإرسال (اختياري)"
                value={scheduleAt}
                onChange={(e) => setScheduleAt(e.target.value)}
                sx={{ minWidth: 240 }}
              />
            </Stack>

            <AudienceBuilder value={audience} onChange={setAudience} />
            <LocalizedEditor value={content} onChange={setContent} />

            {/* حقول إضافية (اختيارية مستقبلًا) */}
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                type="number"
                label="Rate / min"
                value={rateLimit.perMinute ?? 0}
                onChange={(e) =>
                  setRateLimit({
                    ...rateLimit,
                    perMinute: Number(e.target.value),
                  })
                }
              />
              <TextField
                type="number"
                label="Max total"
                value={rateLimit.maxTotal ?? 0}
                onChange={(e) =>
                  setRateLimit({
                    ...rateLimit,
                    maxTotal: Number(e.target.value),
                  })
                }
              />
              <TextField
                label="UTM Source"
                value={utm.source ?? ""}
                onChange={(e) => setUtm({ ...utm, source: e.target.value })}
              />
              <TextField
                label="UTM Campaign"
                value={utm.campaign ?? ""}
                onChange={(e) => setUtm({ ...utm, campaign: e.target.value })}
              />
            </Stack>
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>إلغاء</Button>
        <Button variant="outlined" onClick={() => handleSave(false)}>
          حفظ مسودة
        </Button>
        <Button
          startIcon={<Send />}
          variant="contained"
          onClick={() => handleSave(!scheduleAt)}
        >
          {scheduleAt ? "جدولة" : "إرسال الآن"}
        </Button>
      </DialogActions>

      <TemplatePicker
        open={openTemplates}
        onClose={() => setOpenTemplates(false)}
        onPick={onApplyTemplate}
      />

      <Snackbar
        open={toast.open}
        autoHideDuration={2500}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
        message={toast.msg}
      />
    </Dialog>
  );
}

// ============= Channels Selector =============
function ChannelsSelector({
  value,
  onChange,
}: {
  value: Channel[];
  onChange: (c: Channel[]) => void;
}) {
  const toggle = (c: Channel): void => {
    const set = new Set<Channel>(value);
    if (set.has(c)) set.delete(c);
    else set.add(c);
    onChange(Array.from(set));
  };
  return (
    <Paper sx={{ p: 1.5, minWidth: 280 }} variant="outlined">
      <Typography variant="subtitle2" gutterBottom>
        القنوات
      </Typography>
      <Stack direction="row" spacing={1} flexWrap="wrap">
        {(["push", "sms", "email", "inapp"] as Channel[]).map((c) => (
          <FormControlLabel
            key={c}
            control={
              <Checkbox
                checked={value.includes(c)}
                onChange={() => toggle(c)}
                disabled={c !== "push"} // حالياً الباك يدعم Push فقط
              />
            }
            label={CHANNEL_LABEL[c]}
          />
        ))}
      </Stack>
    </Paper>
  );
}

// ============= Audience Builder =============
function AudienceBuilder({
  value,
  onChange,
}: {
  value: AudienceRule[];
  onChange: (v: AudienceRule[]) => void;
}) {
  const [draft, setDraft] = useState<AudienceRule>({
    key: "role", // افتراضيًا role لأنه مدعوم أكيد
    op: "in",
    values: [],
  });

  const addRule = (): void => {
    if (draft.values.length === 0) return;
    onChange([...value, draft]);
    setDraft({ key: draft.key, op: draft.op, values: [] });
  };
  const removeRule = (idx: number): void => {
    const next = value.slice();
    next.splice(idx, 1);
    onChange(next);
  };

  // الحقول المدعومة حالياً من الباك: role (apps), platform (platforms), city (cities)
  const SUPPORTED_KEYS: AudienceRule["key"][] = ["role", "platform", "city"];

  return (
    <Paper sx={{ p: 1.5 }} variant="outlined">
      <Typography variant="subtitle2" gutterBottom>
        الجمهور
      </Typography>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        alignItems={{ sm: "center" }}
      >
        <TextField
          select
          label="الحقل"
          value={draft.key}
          onChange={(e) =>
            setDraft({ ...draft, key: e.target.value as AudienceRule["key"] })
          }
          sx={{ minWidth: 160 }}
        >
          {SUPPORTED_KEYS.map((k) => (
            <MenuItem key={k} value={k}>
              {k === "role"
                ? "Role"
                : k === "platform"
                ? "Platform"
                : k === "city"
                ? "City"
                : k}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          label="العملية"
          value={draft.op}
          onChange={(e) =>
            setDraft({ ...draft, op: e.target.value as AudienceRule["op"] })
          }
          sx={{ minWidth: 140 }}
        >
          <MenuItem value="in">ضمن</MenuItem>
          <MenuItem value="not-in">ليس ضمن</MenuItem>
          <MenuItem value="eq" disabled>
            يساوي
          </MenuItem>
          <MenuItem value="neq" disabled>
            لا يساوي
          </MenuItem>
        </TextField>
        <TextField
          label="القيم (مفصولة بفواصل)"
          value={draft.values.join(", ")}
          onChange={(e) =>
            setDraft({
              ...draft,
              values: e.target.value
                .split(",")
                .map((s) => s.trim())
                .filter((s) => s),
            })
          }
          sx={{ minWidth: 260 }}
        />
        <Button variant="outlined" onClick={addRule}>
          إضافة قاعدة
        </Button>
      </Stack>

      <Stack spacing={1} mt={1}>
        {value.length === 0 ? (
          <Typography variant="caption" color="text.secondary">
            لم يتم تحديد جمهور
          </Typography>
        ) : (
          value.map((r, i) => (
            <Stack
              key={`${r.key}-${i}`}
              direction="row"
              spacing={1}
              alignItems="center"
            >
              <Chip
                size="small"
                label={`${r.key} ${r.op} [${r.values.join("; ")}]`}
              />
              <Button size="small" onClick={() => removeRule(i)}>
                حذف
              </Button>
            </Stack>
          ))
        )}
      </Stack>
    </Paper>
  );
}

// ============= Localized Editor =============
function LocalizedEditor({
  value,
  onChange,
}: {
  value: LocalizedContent[];
  onChange: (c: LocalizedContent[]) => void;
}) {
  const addLocale = (): void => {
    onChange([...value, { locale: "en", title: "", body: "" }]);
  };
  const update = (idx: number, patch: Partial<LocalizedContent>): void => {
    const next = value.slice();
    next[idx] = { ...next[idx], ...patch };
    onChange(next);
  };
  const remove = (idx: number): void => {
    const next = value.slice();
    next.splice(idx, 1);
    onChange(next);
  };

  return (
    <Paper sx={{ p: 1.5 }} variant="outlined">
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Typography variant="subtitle2">المحتوى (متعدد اللغات)</Typography>
        <Button variant="text" onClick={addLocale}>
          إضافة لغة
        </Button>
      </Stack>
      <Divider sx={{ my: 1 }} />
      <Stack spacing={2}>
        {value.map((c, idx) => (
          <Paper key={`${c.locale}-${idx}`} variant="outlined" sx={{ p: 1.5 }}>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                label="اللغة"
                value={c.locale}
                onChange={(e) => update(idx, { locale: e.target.value })}
                sx={{ minWidth: 120 }}
              />
              <TextField
                label="العنوان"
                value={c.title ?? ""}
                onChange={(e) => update(idx, { title: e.target.value })}
                fullWidth
              />
            </Stack>
            <TextField
              sx={{ mt: 1 }}
              label="النص"
              value={c.body}
              onChange={(e) => update(idx, { body: e.target.value })}
              fullWidth
              multiline
              minRows={3}
            />
            <Stack direction="row" justifyContent="flex-end" spacing={1} mt={1}>
              <Button size="small" onClick={() => remove(idx)}>
                حذف
              </Button>
            </Stack>
          </Paper>
        ))}
      </Stack>
    </Paper>
  );
}

// ============= Templates =============
function TemplatePicker({
  open,
  onClose,
  onPick,
}: {
  open: boolean;
  onClose: () => void;
  onPick: (tpl: TemplateItem) => void;
}) {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<TemplateItem[]>([]);

  const load = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const res = await getNotificationTemplates();
      // تحويل NotificationTemplate → TemplateItem (للتوافق مع المحرّر)
      const mapped: TemplateItem[] = (res || []).map((t) => ({
        _id: t._id,
        name:
          t.name ||
          t.title ||
          t.message?.title ||
          "Template",
        channels: ["push"],
        content: [
          {
            locale: "ar",
            title: t.message?.title ?? t.title ?? "",
            body: t.message?.body ?? "",
          },
        ],
      }));
      setRows(mapped);
    } catch (e) {
      setError(e instanceof Error ? e.message : "تعذر جلب القوالب");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) void load();
  }, [open, load]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>القوالب</DialogTitle>
      <DialogContent>
        {loading ? (
          <Box py={6} textAlign="center">
            <CircularProgress size={22} />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : (
          <Stack spacing={1} mt={1}>
            {rows.length === 0 ? (
              <Typography variant="caption" color="text.secondary">
                لا توجد قوالب
              </Typography>
            ) : (
              rows.map((t) => (
                <Paper key={t._id} variant="outlined" sx={{ p: 1.5 }}>
                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    alignItems={{ sm: "center" }}
                    justifyContent="space-between"
                    spacing={1}
                  >
                    <Typography variant="body2" fontWeight={600}>
                      {t.name}
                    </Typography>
                    <Stack direction="row" spacing={1}>
                      {t.channels.map((c) => (
                        <Chip size="small" key={c} label={CHANNEL_LABEL[c]} />
                      ))}
                    </Stack>
                    <Button
                      onClick={() => {
                        onPick(t);
                        onClose();
                      }}
                    >
                      تطبيق
                    </Button>
                  </Stack>
                </Paper>
              ))
            )}
          </Stack>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ============= Metrics Dialog =============
function MetricsDialog({
  id,
  onClose,
}: {
  id: string | null;
  onClose: () => void;
}) {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [m, setM] = useState<NotificationMetrics | null>(null);

  const load = useCallback(async (): Promise<void> => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);

      const list = await getNotificationCampaigns();
      const c = list.find((x) => x._id === id);
      if (!c) throw new Error("الحملة غير موجودة");

      const stats = c.stats || {
        sent: 0,
        failed: 0,
        queued: 0,
        delivered: 0,
        uniqueUsers: 0,
      };

      const mm: NotificationMetrics = {
        deliveries: stats.sent || 0,
        failures: stats.failed || 0,
        opens: undefined,
        clicks: undefined,
        perChannel: [
          {
            channel: "push",
            deliveries: stats.sent || 0,
            failures: stats.failed || 0,
            opens: undefined,
            clicks: undefined,
          },
        ],
      };
      setM(mm);
    } catch (e) {
      setError(e instanceof Error ? e.message : "تعذر جلب المقاييس");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) void load();
  }, [id, load]);

  return (
    <Dialog open={Boolean(id)} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>المقاييس</DialogTitle>
      <DialogContent>
        {loading ? (
          <Box py={6} textAlign="center">
            <CircularProgress size={22} />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : !m ? (
          <Typography variant="caption" color="text.secondary">
            لا توجد بيانات
          </Typography>
        ) : (
          <Stack spacing={1} mt={1}>
            <Typography variant="body2">
              إجمالي الإرسال: {m.deliveries} • فشل: {m.failures} • فتحات:{" "}
              {m.opens ?? 0} • نقرات: {m.clicks ?? 0}
            </Typography>
            <Divider />
            {m.perChannel.map((pc) => (
              <Stack
                key={pc.channel}
                direction="row"
                spacing={1}
                alignItems="center"
              >
                <Chip size="small" label={CHANNEL_LABEL[pc.channel]} />
                <Typography variant="caption" color="text.secondary">
                  ارسال: {pc.deliveries} • فشل: {pc.failures} • فتحات:{" "}
                  {pc.opens ?? 0} • نقرات: {pc.clicks ?? 0}
                </Typography>
              </Stack>
            ))}
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>إغلاق</Button>
      </DialogActions>
    </Dialog>
  );
}
