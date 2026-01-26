import { useCallback, useEffect,  useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Switch,
  IconButton,
  Button,
  LinearProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Chip,
  Snackbar,
  styled,
  Card,
  CardContent,
  Divider,
  Stack,
  Tooltip,
} from "@mui/material";
import {
  Visibility,
  Delete,
  ShoppingCart,
  Download,
  Person,
  Store as StoreIcon,
  AccessTime,
  WhatsApp,
  Email,
  NotificationsActive,
  ContentCopy,
} from "@mui/icons-material";
import axios from "../../utils/axios";
import { format, parseISO } from "date-fns";
import { arSA } from "date-fns/locale";

// -------------------- Types (تعريفات صارمة بدون any) --------------------
interface Product {
  _id: string;
  name: string;
  image?: string;
  price: number;
}

interface Store {
  _id: string;
  name: string;
}

interface User {
  _id: string;
  email?: string;
  name?: string;
  fullName?: string;
  phone?: string;
}

interface CartItem {
  product: Product;
  quantity: number;
}

interface Cart {
  _id: string;
  user?: User;
  items: CartItem[];
  store?: Store;
  total: number;
  createdAt: string;
}

// شكل قديم محتمل من الـ API
type LegacyRawCartItem = {
  productId: string;
  name: string;
  fullName?: string;
  image?: string;
  price: number;
  quantity: number;
  store: string;
};

// الشكل الحالي الذي أرسلته
type CurrentRawCartItem = {
  product: {
    _id: string;
    name: string;
    image?: string;
    price: number;
  };
  quantity: number;
};

type RawCart = {
  _id: string;
  user?: User | string;
  items: Array<LegacyRawCartItem | CurrentRawCartItem>;
  store?: Store | string;
  total: number | string;
  createdAt: string;
};

// -------------------- Styled --------------------
const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:nth-of-type(odd)": {
    backgroundColor: theme.palette.action.hover,
  },
  "&:hover": {
    backgroundColor: theme.palette.action.selected,
  },
}));

const StatusChip = styled(Chip)({
  fontWeight: "bold",
  minWidth: 90,
});

const SmallAvatar = styled(Avatar)({
  width: 40,
  height: 40,
});

// -------------------- Helpers --------------------
function isCurrentItem(
  it: LegacyRawCartItem | CurrentRawCartItem
): it is CurrentRawCartItem {
  return (it as CurrentRawCartItem).product !== undefined;
}

function isUserObject(u: User | string | undefined): u is User {
  return !!u && typeof u === "object" && "_id" in u;
}

function isStoreObject(s: Store | string | undefined): s is Store {
  return !!s && typeof s === "object" && "_id" in s && "name" in s;
}

function formatDate(dateString: string) {
  // يتعامل مع ISO بشكل صحيح
  try {
    return format(parseISO(dateString), "dd/MM/yyyy HH:mm", { locale: arSA });
  } catch {
    // fallback
    return new Date(dateString).toLocaleString("ar-YE");
  }
}

function sanitizePhoneToWhatsApp(phone?: string): string | null {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, "");
  // اليمن: لو الرقم يبدأ بـ 7 وطوله 9 أرقام -> أضف 967
  if (/^7\d{8}$/.test(digits)) return `967${digits}`;
  // لو يبدأ بـ 0 ويظهر كرَقْم محلي -> أزل الصفر وأضف 967
  if (/^0\d{8,}$/.test(digits)) return `967${digits.slice(1)}`;
  // لو فيه كود دولي مسبقاً (+967 أو 967) نحاول نزله لصيغة wa.me (بدون +)
  if (/^967\d{8,}$/.test(digits)) return digits;
  return digits; // كحل أخير
}

function cartDeepLink(cartId: string) {
  // عدل الرابط حسب نظامك إن كان عندك صفحة عامة لاستئناف السلة
  return `${window.location.origin}/cart/${cartId}`;
}

// -------------------- Component --------------------
export default function DeliveryCartsPage() {
  const [carts, setCarts] = useState<Cart[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showAbandonedOnly, setShowAbandonedOnly] = useState<boolean>(false);
  const [selectedCart, setSelectedCart] = useState<Cart | null>(null);

  // سلة متروكة إذا مر عليها أكثر من 30 دقيقة
  const isAbandoned = (createdAt: string) => {
    const thirtyMin = 30 * 60 * 1000;
    return Date.now() - new Date(createdAt).getTime() > thirtyMin;
  };

  // تطبيع مرن يدعم الشكل القديم والجديد
  const normalizeCart = (raw: RawCart): Cart => {
    const items: CartItem[] = raw.items.map((it) => {
      if (isCurrentItem(it)) {
        return {
          product: {
            _id: it.product._id,
            name: it.product.name,
            image: it.product.image,
            price: Number(it.product.price),
          },
          quantity: Number(it.quantity),
        };
      }
      // legacy
      return {
        product: {
          _id: String(it.productId),
          name: it.fullName ?? it.name,
          image: it.image,
          price: Number(it.price),
        },
        quantity: Number(it.quantity),
      };
    });

    return {
      _id: raw._id,
      user: isUserObject(raw.user) ? raw.user : undefined,
      store: isStoreObject(raw.store) ? raw.store : undefined,
      items,
      total: Number(raw.total),
      createdAt: raw.createdAt,
    };
  };

  const fetchCarts = useCallback(
    async (signal?: AbortSignal) => {
      setLoading(true);
      setError(null);
      try {
        const endpoint = showAbandonedOnly
          ? "/delivery/cart/abandoned"
          : "/delivery/cart";
        const res = await axios.get<RawCart[]>(endpoint, { signal });
        setCarts(res.data.map(normalizeCart));
      } catch (err) {
        // تجاهل الإلغاء
        if (
          err &&
          typeof err === "object" &&
          "name" in err &&
          (err as { name: string }).name === "CanceledError"
        ) {
          return;
        }
        setError("فشل في جلب بيانات السلات");
        console.error(err);
      } finally {
        setLoading(false);
      }
    },
    [showAbandonedOnly]
  );

  useEffect(() => {
    const controller = new AbortController();
    fetchCarts(controller.signal);
    return () => controller.abort();
  }, [fetchCarts]);

  const handleDeleteCart = async (cartId: string) => {
    if (!confirm("هل أنت متأكد من حذف هذه السلة بالكامل؟")) return;
    try {
      setLoading(true);
      await axios.delete(`/delivery/cart/${cartId}`);
      setSuccess("تم حذف السلة بنجاح");
      fetchCarts();
    } catch (err) {
      setError("فشل في حذف السلة");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = async (cartId: string, productId: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا المنتج من السلة؟")) return;
    try {
      setLoading(true);
      await axios.delete(`/delivery/cart/${cartId}/items/${productId}`);
      setSuccess("تم حذف المنتج من السلة بنجاح");
      fetchCarts();
    } catch (err) {
      setError("فشل في حذف العنصر");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `/delivery/cart/export?abandoned=${showAbandonedOnly}`,
        {
          responseType: "blob",
        }
      );
      const url = window.URL.createObjectURL(res.data);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `سلات_${showAbandonedOnly ? "المتروكة" : "الكل"}_${new Date()
          .toISOString()
          .slice(0, 10)}.csv`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      setSuccess("تم تصدير البيانات بنجاح");
    } catch (err) {
      setError("فشل في تصدير البيانات");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSnackbarClose = () => {
    setError(null);
    setSuccess(null);
  };

  // --------- إعادة الاستهداف ----------
  const openWhatsApp = (cart: Cart) => {
    const phoneIntl = sanitizePhoneToWhatsApp(cart.user?.phone);
    if (!phoneIntl) {
      setError("لا يوجد رقم هاتف صالح للواتساب.");
      return;
    }
    const msg =
      `مرحباً${cart.user?.fullName ? " " + cart.user.fullName : ""} 👋\n` +
      `وجدنا سلة غير مكتملة مجموعها ${cart.total.toFixed(2)} ﷼.\n` +
      `يمكنك استكمال الطلب من هنا: ${cartDeepLink(cart._id)}`;
    const url = `https://wa.me/${phoneIntl}?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank");
  };

  const openEmail = (cart: Cart) => {
    if (!cart.user?.email) {
      setError("لا يوجد بريد إلكتروني.");
      return;
    }
    const subject = "تذكير بإكمال سلة التسوق";
    const body =
      `مرحباً${cart.user?.fullName ? " " + cart.user.fullName : ""},\n\n` +
      `سلتك ما زالت جاهزة بمنتجات مجموعها ${cart.total.toFixed(2)} ﷼.\n` +
      `أكمل طلبك من هنا: ${cartDeepLink(cart._id)}\n\n` +
      `مع التحية.`;
    window.location.href = `mailto:${encodeURIComponent(
      cart.user.email
    )}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const sendPush = async (cart: Cart) => {
    try {
      setLoading(true);
      // عدّل المسار حسب الباكند عندك
      await axios.post(`/delivery/cart/${cart._id}/retarget/push`, {
        title: "سلتك بانتظارك",
        body: `مجموع السلة ${cart.total.toFixed(2)} ﷼ — أكمل طلبك الآن.`,
        deepLink: cartDeepLink(cart._id),
      });
      setSuccess("تم إرسال الإشعار بنجاح");
    } catch (err) {
      setError("فشل في إرسال الإشعار (تأكد من مسار الـ API).");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const copyCartLink = (cart: Cart) => {
    const link = cartDeepLink(cart._id);
    navigator.clipboard
      .writeText(link)
      .then(() => setSuccess("تم نسخ رابط استكمال السلة"))
      .catch(() => setError("تعذر نسخ الرابط"));
  };

  // ملخص المنتجات كـ Chips في الجدول
  const renderProductsSummary = (items: CartItem[]) => {
    if (items.length === 0)
      return <Typography color="text.secondary">لا توجد منتجات</Typography>;
    const chips = items
      .slice(0, 3)
      .map((it) => (
        <Chip
          key={it.product._id}
          label={`${it.product.name} × ${it.quantity}`}
          variant="outlined"
          sx={{ mr: 0.5, mb: 0.5 }}
        />
      ));
    const extra =
      items.length > 3 ? (
        <Chip label={`+${items.length - 3} أخرى`} sx={{ mb: 0.5 }} />
      ) : null;
    return (
      <Box display="flex" flexWrap="wrap" alignItems="center">
        {chips}
        {extra}
      </Box>
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Notifications */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity="error" onClose={handleSnackbarClose}>
          {error}
        </Alert>
      </Snackbar>
      <Snackbar
        open={!!success}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity="success" onClose={handleSnackbarClose}>
          {success}
        </Alert>
      </Snackbar>

      {/* Loading */}
      {loading && <LinearProgress />}

      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Typography variant="h4" fontWeight="bold" color="primary">
          <ShoppingCart sx={{ verticalAlign: "middle", mr: 1 }} />
          إدارة سلات التسوق
        </Typography>
        <Box display="flex" alignItems="center" gap={2}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography>السلات المتروكة فقط</Typography>
            <Switch
              checked={showAbandonedOnly}
              onChange={() => setShowAbandonedOnly(!showAbandonedOnly)}
              color="primary"
            />
          </Box>
          <Button
            variant="contained"
            startIcon={<Download />}
            onClick={handleExport}
            sx={{ minWidth: 120 }}
          >
            تصدير
          </Button>
        </Box>
      </Box>

      {/* Table */}
      <Paper elevation={3} sx={{ overflow: "hidden" }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: "primary.main" }}>
              <TableCell sx={{ color: "common.white" }}>المستخدم</TableCell>
              <TableCell sx={{ color: "common.white" }}>المنتجات</TableCell>
              <TableCell sx={{ color: "common.white" }}>المتجر</TableCell>
              <TableCell sx={{ color: "common.white" }}>الإجمالي</TableCell>
              <TableCell sx={{ color: "common.white" }}>التاريخ</TableCell>
              <TableCell sx={{ color: "common.white" }}>الحالة</TableCell>
              <TableCell align="right" sx={{ color: "common.white" }}>
                الإجراءات
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {carts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  <Typography variant="body1" color="text.secondary">
                    لا توجد سلات متاحة
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              carts.map((cart) => (
                <StyledTableRow key={cart._id}>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Person color="action" />
                      <Typography>
                        {cart.user
                          ? cart.user.fullName ||
                            cart.user.name ||
                            cart.user.email ||
                            cart.user.phone ||
                            "مستخدم"
                          : "زائر"}
                      </Typography>
                    </Box>
                  </TableCell>

                  <TableCell>{renderProductsSummary(cart.items)}</TableCell>

                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      <StoreIcon fontSize="small" color="action" />
                      <Typography>{cart.store?.name ?? "—"}</Typography>
                    </Box>
                  </TableCell>

                  <TableCell>
                    <Typography fontWeight="medium">
                      {cart.total.toFixed(2)} ﷼
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      <AccessTime fontSize="small" color="action" />
                      <Typography variant="body2">
                        {formatDate(cart.createdAt)}
                      </Typography>
                    </Box>
                  </TableCell>

                  <TableCell>
                    <StatusChip
                      label={isAbandoned(cart.createdAt) ? "متروكة" : "نشطة"}
                      color={isAbandoned(cart.createdAt) ? "error" : "success"}
                    />
                  </TableCell>

                  <TableCell align="right">
                    <Tooltip title="عرض التفاصيل">
                      <IconButton
                        color="primary"
                        onClick={() => setSelectedCart(cart)}
                      >
                        <Visibility />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="حذف السلة">
                      <IconButton
                        color="error"
                        onClick={() => handleDeleteCart(cart._id)}
                      >
                        <Delete />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </StyledTableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Paper>

      {/* Cart Details Dialog */}
      <Dialog
        open={!!selectedCart}
        onClose={() => setSelectedCart(null)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ bgcolor: "primary.main", color: "common.white" }}>
          تفاصيل السلة
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          {/* معلومات العميل */}
          {selectedCart?.user && (
            <Card variant="outlined" sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  معلومات العميل
                </Typography>
                <Stack spacing={0.5}>
                  {selectedCart.user.fullName && (
                    <Typography>
                      <strong>الاسم:</strong> {selectedCart.user.fullName}
                    </Typography>
                  )}
                  {selectedCart.user.email && (
                    <Typography>
                      <strong>البريد:</strong> {selectedCart.user.email}
                    </Typography>
                  )}
                  {selectedCart.user.phone && (
                    <Typography>
                      <strong>الهاتف:</strong> {selectedCart.user.phone}
                    </Typography>
                  )}
                </Stack>

                {/* أزرار إعادة الاستهداف */}
                <Stack direction="row" spacing={1.5} mt={2} flexWrap="wrap">
                  <Button
                    variant="outlined"
                    startIcon={<WhatsApp />}
                    onClick={() => selectedCart && openWhatsApp(selectedCart)}
                    disabled={
                      !sanitizePhoneToWhatsApp(selectedCart.user.phone || "")
                    }
                  >
                    واتساب
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Email />}
                    onClick={() => selectedCart && openEmail(selectedCart)}
                    disabled={!selectedCart.user.email}
                  >
                    بريد
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<NotificationsActive />}
                    onClick={() => selectedCart && sendPush(selectedCart)}
                  >
                    إشعار
                  </Button>
                  <Button
                    variant="text"
                    startIcon={<ContentCopy />}
                    onClick={() => selectedCart && copyCartLink(selectedCart)}
                  >
                    نسخ رابط الاستكمال
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          )}

          {/* معلومات المتجر */}
          {selectedCart?.store && (
            <Card variant="outlined" sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  معلومات المتجر
                </Typography>
                <Typography>
                  <StoreIcon sx={{ verticalAlign: "middle", mr: 1 }} />
                  {selectedCart.store.name}
                </Typography>
              </CardContent>
            </Card>
          )}

          {/* ملخص السلة */}
          <Card variant="outlined" sx={{ mb: 2 }}>
            <CardContent>
              <Box
                sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
              >
                <Typography>عدد المنتجات:</Typography>
                <Typography>{selectedCart?.items.length}</Typography>
              </Box>
              <Box
                sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
              >
                <Typography>الكمية الكلية:</Typography>
                <Typography>
                  {selectedCart?.items.reduce(
                    (sum, item) => sum + item.quantity,
                    0
                  )}
                </Typography>
              </Box>
              <Divider sx={{ my: 1 }} />
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="h6">المجموع:</Typography>
                <Typography variant="h6" color="primary">
                  {selectedCart?.total.toFixed(2)} ﷼
                </Typography>
              </Box>
            </CardContent>
          </Card>

          {/* المنتجات */}
          <Typography variant="h6" gutterBottom>
            المنتجات ({selectedCart?.items.length})
          </Typography>
          <List sx={{ maxHeight: 400, overflow: "auto" }}>
            {selectedCart?.items.map((item) => (
              <ListItem
                key={item.product._id}
                secondaryAction={
                  <IconButton
                    edge="end"
                    onClick={() =>
                      selectedCart &&
                      handleDeleteItem(selectedCart._id, item.product._id)
                    }
                    color="error"
                  >
                    <Delete />
                  </IconButton>
                }
                sx={{ borderBottom: 1, borderColor: "divider" }}
              >
                <ListItemAvatar>
                  <SmallAvatar src={item.product.image} variant="rounded">
                    {item.product.name.charAt(0)}
                  </SmallAvatar>
                </ListItemAvatar>
                <ListItemText
                  primary={`${item.product.name} × ${item.quantity}`}
                  secondary={
                    <>
                      <Typography component="span" display="block">
                        السعر: {item.product.price.toFixed(2)} ﷼
                      </Typography>
                      <Typography
                        component="span"
                        display="block"
                        fontWeight="bold"
                      >
                        المجموع:{" "}
                        {(item.product.price * item.quantity).toFixed(2)} ﷼
                      </Typography>
                    </>
                  }
                />
              </ListItem>
            ))}
          </List>
        </DialogContent>

        <DialogActions sx={{ p: 3 }}>
          <Button
            onClick={() => setSelectedCart(null)}
            variant="outlined"
            sx={{ minWidth: 100 }}
          >
            إغلاق
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
