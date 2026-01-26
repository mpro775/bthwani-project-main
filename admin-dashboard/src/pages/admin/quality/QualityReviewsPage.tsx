import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Drawer,
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
} from "@mui/material";
import {
  Refresh,
  Search,
  Visibility,
  Star,
  Close,
} from "@mui/icons-material";
import axios from "../../../utils/axios";
import { AxiosError } from "axios";

// ===== Types =====
export type ReviewStatus = "approved" | "hidden" | "pending";
export type EntityType = "driver" | "order"; // إزالة "store" حسب الباك إيند الجديد

interface Rating {
  company: number;
  order: number;
  driver: number;
  comments?: string;
}

interface Review {
  _id: string;
  orderId: string;
  user: {
    _id: string;
    name?: string;
    phone?: string;
  };
  driver: {
    _id: string;
    name?: string;
    phone?: string;
  };
  rating: Rating;
  status?: 'published' | 'hidden';
  createdAt: string;
}

interface ReviewsResponse {
  ratings: Review[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  stats: {
    averageCompanyRating: number;
    averageOrderRating: number;
    averageDriverRating: number;
    totalRatings: number;
    fiveStarPercentage: number;
  };
}

// ===== Helpers / Constants =====
const SORT_OPTIONS = [
  { value: "createdAt", label: "تاريخ الإنشاء" },
  { value: "rating.company", label: "تقييم الشركة" },
  { value: "rating.order", label: "تقييم الطلب" },
  { value: "rating.driver", label: "تقييم السائق" },
];

const SORT_ORDER_OPTIONS = [
  { value: "desc", label: "تنازلي" },
  { value: "asc", label: "تصاعدي" },
];

// ===== API Layer (يمكن لاحقاً نقلها إلى services/qualityReviews.ts) =====
async function fetchReviews(params: {
  entityType?: EntityType | "";
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
}): Promise<ReviewsResponse> {
  const queryParams = new URLSearchParams();

  if (params.entityType) {
    queryParams.append('entityType', params.entityType);
  }

  queryParams.append('page', params.page.toString());
  queryParams.append('limit', params.limit.toString());

  if (params.sortBy) {
    queryParams.append('sortBy', params.sortBy);
  }

  if (params.sortOrder) {
    queryParams.append('sortOrder', params.sortOrder);
  }

  if (params.search) {
    queryParams.append('q', params.search);
  }

  const { data } = await axios.get(`/admin/quality/reviews?${queryParams}`);
  return data;
}

// ===== Main Page =====
export default function QualityReviewsPage() {
  // فلاتر
  const [entityType, setEntityType] = useState<"" | EntityType>("");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // جدول
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [rows, setRows] = useState<Review[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<ReviewsResponse['stats'] | null>(null);

  // Drawer
  const [openDrawer, setOpenDrawer] = useState(false);
  const [selected, setSelected] = useState<Review | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetchReviews({
        entityType: entityType || undefined,
        page,
        limit: pageSize,
        sortBy,
        sortOrder,
        search: search || undefined,
      });
      setRows(res.ratings);
      setTotal(res.pagination.total);
      setStats(res.stats);
    } catch (e: unknown) {
      console.error(e);
      const error = e as AxiosError<{ message: string }>;
      setError(error?.response?.data?.message || (error as Error)?.message || "تعذر جلب التقييمات");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entityType, search, sortBy, sortOrder, page, pageSize]);

  const onRefresh = () => load();

  const handleOpen = (r: Review) => {
    setSelected(r);
    setOpenDrawer(true);
  };

  const handleClose = () => setOpenDrawer(false);

  const handleHideReview = async (review: Review) => {
    if (!window.confirm('هل أنت متأكد من إخفاء هذا التقييم؟')) return;

    try {
      await axios.patch(`/admin/quality/reviews/${review._id}/hide`, {
        reason: 'إخفاء من قبل الإدارة'
      });
      load(); // إعادة تحميل البيانات
      setOpenDrawer(false);
    } catch (error) {
      console.error('Error hiding review:', error);
      alert('حدث خطأ أثناء إخفاء التقييم');
    }
  };

  const handlePublishReview = async (review: Review) => {
    try {
      await axios.patch(`/admin/quality/reviews/${review._id}/publish`);
      load(); // إعادة تحميل البيانات
      setOpenDrawer(false);
    } catch (error) {
      console.error('Error publishing review:', error);
      alert('حدث خطأ أثناء نشر التقييم');
    }
  };

  // إعادة تعيين الصفحة إلى 1 عند تغيير الفلاتر
  useEffect(() => {
    setPage(1);
  }, [entityType, search, sortBy, sortOrder]);

  const filtersApplied = useMemo(
    () => Boolean(entityType || search || sortBy !== "createdAt" || sortOrder !== "desc"),
    [entityType, search, sortBy, sortOrder]
  );

  return (
    <Box p={2}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
        <Typography variant="h5">تبويب الجودة — مراجعات المستخدمين</Typography>
        <Stack direction="row" spacing={1}>
          <Tooltip title="تحديث">
            <IconButton onClick={onRefresh} disabled={loading}>
              <Refresh />
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>

      {/* إحصائيات التقييمات */}
      {stats && (
        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6" gutterBottom>إحصائيات التقييمات</Typography>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} flexWrap="wrap">
            <Box>
              <Typography variant="subtitle2" color="text.secondary">متوسط تقييم الشركة</Typography>
              <Typography variant="h6">{stats.averageCompanyRating.toFixed(1)} ⭐</Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">متوسط تقييم الطلب</Typography>
              <Typography variant="h6">{stats.averageOrderRating.toFixed(1)} ⭐</Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">متوسط تقييم السائق</Typography>
              <Typography variant="h6">{stats.averageDriverRating.toFixed(1)} ⭐</Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">إجمالي التقييمات</Typography>
              <Typography variant="h6">{stats.totalRatings}</Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">نسبة 5 نجوم</Typography>
              <Typography variant="h6">{stats.fiveStarPercentage}%</Typography>
            </Box>
          </Stack>
        </Paper>
      )}

      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ md: "center" }}>
          <TextField
            size="small"
            placeholder="بحث في التعليقات، اسم المستخدم، أو رقم الهاتف…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") load();
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
            sx={{ width: { xs: "100%", md: 340 } }}
          />

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} flexWrap="wrap">
            <TextField
              select
              size="small"
              label="نوع التقييم"
              value={entityType}
              onChange={(e) => setEntityType(e.target.value as EntityType)}
              sx={{ minWidth: 160 }}
            >
              <MenuItem value="">الكل</MenuItem>
              <MenuItem value="driver">تقييمات السائقين</MenuItem>
              <MenuItem value="order">تقييمات الطلبات</MenuItem>
            </TextField>

            <TextField
              select
              size="small"
              label="ترتيب حسب"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              sx={{ minWidth: 180 }}
            >
              {SORT_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              size="small"
              label="اتجاه الترتيب"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")}
              sx={{ minWidth: 140 }}
            >
              {SORT_ORDER_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>

            {filtersApplied && (
              <Button
                variant="text"
                onClick={() => {
                  setEntityType("");
                  setSearch("");
                  setSortBy("createdAt");
                  setSortOrder("desc");
                  setPage(1);
                }}
              >
                مسح الفلاتر
              </Button>
            )}
          </Stack>
        </Stack>
      </Paper>

      <Paper>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>رقم الطلب</TableCell>
                <TableCell>المستخدم</TableCell>
                <TableCell>السائق</TableCell>
                <TableCell align="center">تقييم الشركة</TableCell>
                <TableCell align="center">تقييم الطلب</TableCell>
                <TableCell align="center">تقييم السائق</TableCell>
                <TableCell>التعليقات</TableCell>
                <TableCell align="right">إجراءات</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <Stack direction="row" spacing={1} alignItems="center" justifyContent="center">
                      <CircularProgress size={20} />
                      <Typography variant="body2">جاري التحميل…</Typography>
                    </Stack>
                  </TableCell>
                </TableRow>
              ) : rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8}>
                    <Stack alignItems="center" py={6} spacing={1}>
                      <Typography variant="body1">لا توجد تقييمات مطابقة للفلترة الحالية.</Typography>
                      <Button size="small" onClick={onRefresh}>تحديث</Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((r) => (
                  <TableRow key={r._id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        #{r.orderId}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight={500}>
                          {r.user.name || "مستخدم غير معروف"}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {r.user.phone || "—"}
                        </Typography>
                      </Box>
                    </TableCell>

                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight={500}>
                          {r.driver.name || "سائق غير معروف"}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {r.driver.phone || "—"}
                        </Typography>
                      </Box>
                    </TableCell>

                    <TableCell align="center">
                      <Stack direction="row" spacing={0.5} justifyContent="center">
                        {Array.from({ length: r.rating.company }).map((_, i) => (
                          <Star key={i} fontSize="small" color="primary" />
                        ))}
                        <Typography variant="caption" sx={{ ml: 0.5 }}>
                          ({r.rating.company})
                        </Typography>
                      </Stack>
                    </TableCell>

                    <TableCell align="center">
                      <Stack direction="row" spacing={0.5} justifyContent="center">
                        {Array.from({ length: r.rating.order }).map((_, i) => (
                          <Star key={i} fontSize="small" color="secondary" />
                        ))}
                        <Typography variant="caption" sx={{ ml: 0.5 }}>
                          ({r.rating.order})
                        </Typography>
                      </Stack>
                    </TableCell>

                    <TableCell align="center">
                      <Stack direction="row" spacing={0.5} justifyContent="center">
                        {Array.from({ length: r.rating.driver }).map((_, i) => (
                          <Star key={i} fontSize="small" color="success" />
                        ))}
                        <Typography variant="caption" sx={{ ml: 0.5 }}>
                          ({r.rating.driver})
                        </Typography>
                      </Stack>
                    </TableCell>

                    <TableCell sx={{ maxWidth: 300 }}>
                      <Tooltip title={r.rating.comments || "لا توجد تعليقات"}>
                        <Typography noWrap variant="body2">
                          {r.rating.comments || "—"}
                        </Typography>
                      </Tooltip>
                    </TableCell>

                    <TableCell align="right">
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        <Tooltip title="عرض التفاصيل">
                          <IconButton size="small" onClick={() => handleOpen(r)}>
                            <Visibility />
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
          page={page - 1} // تحويل من 1-based إلى 0-based للـ MUI
          onPageChange={(_, p) => setPage(p + 1)}
          rowsPerPage={pageSize}
          onRowsPerPageChange={(e) => {
            setPageSize(parseInt(e.target.value, 10));
            setPage(1);
          }}
          rowsPerPageOptions={[10, 20, 50, 100]}
          labelRowsPerPage="عدد الصفوف في الصفحة"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} من ${count}`}
        />
      </Paper>

      <ReviewDetailsDrawer
        open={openDrawer}
        onClose={handleClose}
        review={selected}
        onHideReview={handleHideReview}
        onPublishReview={handlePublishReview}
      />

      {error && (
        <Alert sx={{ mt: 2 }} severity="error">{error}</Alert>
      )}
    </Box>
  );
}

// ===== Drawer =====
function ReviewDetailsDrawer({
  open,
  onClose,
  review,
  onHideReview,
  onPublishReview,
}: {
  open: boolean;
  onClose: () => void;
  review: Review | null;
  onHideReview: (review: Review) => void;
  onPublishReview: (review: Review) => void;
}) {
  return (
    <Drawer anchor="right" open={open} onClose={onClose} PaperProps={{ sx: { width: { xs: "100%", sm: 520 } } }}>
      <Box p={2}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">تفاصيل التقييم</Typography>
          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </Stack>

        {!review ? (
          <Stack py={4} alignItems="center">
            <Typography variant="body2" color="text.secondary">
              لا يوجد تقييم محدد.
            </Typography>
          </Stack>
        ) : (
          <>
            <Box mt={2}>
              <Typography variant="subtitle2" color="text.secondary">
                رقم الطلب
              </Typography>
              <Typography variant="body1" fontWeight={600}>
                #{review.orderId}
              </Typography>
            </Box>

            <Box mt={2}>
              <Typography variant="subtitle2" color="text.secondary">
                معلومات المستخدم
              </Typography>
              <Paper variant="outlined" sx={{ p: 1.5, mt: 0.5 }}>
                <Typography variant="body2" fontWeight={500}>
                  الاسم: {review.user.name || "غير محدد"}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  الهاتف: {review.user.phone || "غير محدد"}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  المعرف: {review.user._id}
                </Typography>
              </Paper>
            </Box>

            <Box mt={2}>
              <Typography variant="subtitle2" color="text.secondary">
                معلومات السائق
              </Typography>
              <Paper variant="outlined" sx={{ p: 1.5, mt: 0.5 }}>
                <Typography variant="body2" fontWeight={500}>
                  الاسم: {review.driver.name || "غير محدد"}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  الهاتف: {review.driver.phone || "غير محدد"}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  المعرف: {review.driver._id}
                </Typography>
              </Paper>
            </Box>

            <Box mt={2}>
              <Typography variant="subtitle2" color="text.secondary">
                تقييم الشركة
              </Typography>
              <Stack direction="row" spacing={0.5} mt={0.5} alignItems="center">
                {Array.from({ length: review.rating.company }).map((_, i) => (
                  <Star key={i} fontSize="small" color="primary" />
                ))}
                <Typography variant="body2" sx={{ ml: 1 }}>
                  ({review.rating.company}/5)
                </Typography>
              </Stack>
            </Box>

            <Box mt={2}>
              <Typography variant="subtitle2" color="text.secondary">
                تقييم الطلب
              </Typography>
              <Stack direction="row" spacing={0.5} mt={0.5} alignItems="center">
                {Array.from({ length: review.rating.order }).map((_, i) => (
                  <Star key={i} fontSize="small" color="secondary" />
                ))}
                <Typography variant="body2" sx={{ ml: 1 }}>
                  ({review.rating.order}/5)
                </Typography>
              </Stack>
            </Box>

            <Box mt={2}>
              <Typography variant="subtitle2" color="text.secondary">
                تقييم السائق
              </Typography>
              <Stack direction="row" spacing={0.5} mt={0.5} alignItems="center">
                {Array.from({ length: review.rating.driver }).map((_, i) => (
                  <Star key={i} fontSize="small" color="success" />
                ))}
                <Typography variant="body2" sx={{ ml: 1 }}>
                  ({review.rating.driver}/5)
                </Typography>
              </Stack>
            </Box>

            <Box mt={2}>
              <Typography variant="subtitle2" color="text.secondary">
                التعليقات
              </Typography>
              <Paper variant="outlined" sx={{ p: 1.5, mt: 0.5 }}>
                <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                  {review.rating.comments || "لا توجد تعليقات"}
                </Typography>
              </Paper>
            </Box>

            <Box mt={2}>
              <Typography variant="subtitle2" color="text.secondary">
                تاريخ التقييم
              </Typography>
              <Typography variant="body2">
                {new Date(review.createdAt).toLocaleString("ar-SA")}
              </Typography>
            </Box>

            <Box mt={3}>
              {review.status === 'published' && (
                <Button
                  variant="outlined"
                  color="warning"
                  size="small"
                  onClick={() => onHideReview(review)}
                  sx={{ mb: 2 }}
                >
                  إخفاء التقييم
                </Button>
              )}

              {review.status === 'hidden' && (
                <Button
                  variant="outlined"
                  color="success"
                  size="small"
                  onClick={() => onPublishReview(review)}
                  sx={{ mb: 2 }}
                >
                  نشر التقييم
                </Button>
              )}

              <Typography variant="caption" color="text.secondary" display="block">
                ملاحظة: هذه التقييمات تُستخدم لتحسين جودة الخدمة ولا يمكن تعديلها من هنا.
              </Typography>
            </Box>
          </>
        )}
      </Box>
    </Drawer>
  );
}
