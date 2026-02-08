// مطابق لـ app-user KenzDetailsScreen
import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Chip,
  IconButton,
  Button,
  CircularProgress,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import {
  ArrowBack,
  Share,
  Edit,
  Delete,
  LocationOn,
  Visibility,
  Storefront,
  ChatBubbleOutline,
  Phone,
  CheckCircle as SoldIcon,
  Flag as ReportIcon,
  Favorite,
  FavoriteBorder,
  TrendingUp,
  AccountBalanceWallet as EscrowIcon,
  Gavel as AuctionIcon,
} from "@mui/icons-material";
import type { KenzItem } from "../types";
import { KenzStatusLabels, KenzStatusColors } from "../types";
import { getKenzBids, type KenzBidItem } from "../api";

interface KenzDetailsProps {
  item: KenzItem;
  loading?: boolean;
  onBack?: () => void;
  onEdit?: (item: KenzItem) => void;
  onDelete?: (item: KenzItem) => void;
  isOwner?: boolean;
  onChat?: (item: KenzItem) => void;
  onMarkSold?: (item: KenzItem) => void | Promise<void>;
  /** (item, { reason, notes }) => submit report */
  onReport?: (
    item: KenzItem,
    payload: { reason: string; notes?: string }
  ) => void | Promise<void>;
  isFavorited?: boolean;
  onFavoriteToggle?: (item: KenzItem) => void;
  /** شراء بالإيكرو — يُستدعى عند الضغط على الزر */
  onBuyWithEscrow?: (item: KenzItem, amount: number) => void | Promise<void>;
  /** مزايدة — يُستدعى عند الضغط على زر المزايدة */
  onPlaceBid?: (item: KenzItem, amount: number) => void | Promise<void>;
  /** مفتاح لتحديث قائمة المزايدات (يُزيد بعد مزايدة ناجحة) */
  bidsRefreshKey?: number;
}

const normalizePhoneNumber = (phone: string): string | null => {
  if (!phone || typeof phone !== "string") return null;
  const digits = phone.replace(/\D/g, "").replace(/^0+/, "");
  if (digits.length < 8) return null;
  if (/^966\d{9}$/.test(digits)) return `+${digits}`;
  if (/^5\d{8}$/.test(digits)) return `+966${digits}`;
  if (/^05\d{8}$/.test(digits)) return `+966${digits.slice(1)}`;
  if (/^967\d{8,}$/.test(digits)) return `+${digits}`;
  if (/^7\d{8}$/.test(digits)) return `+967${digits}`;
  if (/^0\d{8,}$/.test(digits)) return `+967${digits.slice(1)}`;
  if (digits.length >= 9) return `+${digits}`;
  return null;
};

const KenzDetails: React.FC<KenzDetailsProps> = ({
  item,
  loading = false,
  onBack,
  onEdit,
  onDelete,
  isOwner = false,
  onChat,
  onMarkSold,
  onReport,
  isFavorited,
  onFavoriteToggle,
  onBuyWithEscrow,
  onPlaceBid,
  bidsRefreshKey,
}) => {
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [bidDialogOpen, setBidDialogOpen] = useState(false);
  const [bidAmount, setBidAmount] = useState<number | "">("");
  const [bidSubmitting, setBidSubmitting] = useState(false);
  const [bids, setBids] = useState<KenzBidItem[]>([]);
  const [bidsLoading, setBidsLoading] = useState(false);
  const [countdown, setCountdown] = useState<string | null>(null);
  const [escrowDialogOpen, setEscrowDialogOpen] = useState(false);
  const [escrowAmount, setEscrowAmount] = useState<number | "">("");
  const [escrowSubmitting, setEscrowSubmitting] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportNotes, setReportNotes] = useState("");
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const formatCurrency = (price?: number, currency?: string) => {
    if (!price) return "غير محدد";
    const cur = currency ?? "ريال يمني";
    return `${price.toLocaleString("ar-SA")} ${cur}`;
  };

  const formatDate = (dateInput?: string | Date) => {
    if (!dateInput) return "غير محدد";
    try {
      const d = dateInput instanceof Date ? dateInput : new Date(dateInput);
      return d.toLocaleDateString("ar-SA", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return String(dateInput);
    }
  };

  const hasContact = !!item?.metadata?.contact;

  const minBidAmount = item?.isAuction
    ? (bids.length > 0 && bids[0]
        ? bids[0].amount
        : item?.winningBidAmount ?? item?.startingPrice ?? item?.price ?? 0) + 1
    : 0;

  useEffect(() => {
    if (item?.isAuction && item?._id) {
      setBidsLoading(true);
      getKenzBids(item._id)
        .then((res) => setBids(res.items ?? []))
        .catch(() => setBids([]))
        .finally(() => setBidsLoading(false));
    } else {
      setBids([]);
    }
  }, [item?._id, item?.isAuction, bidsRefreshKey]);

  useEffect(() => {
    if (!item?.isAuction || !item?.auctionEndAt) return;
    const end = new Date(item.auctionEndAt).getTime();
    const tick = () => {
      const now = Date.now();
      if (now >= end) {
        setCountdown("انتهى المزاد");
        return;
      }
      const diff = end - now;
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setCountdown(`${d}يوم ${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [item?.isAuction, item?.auctionEndAt]);

  const handleShare = async () => {
    if (!item) return;
    const text = `إعلان في كنز: ${item.title}\n\n${
      item.description || ""
    }\n\nالسعر: ${formatCurrency(item.price, item.currency)}\nالفئة: ${
      item.category || "غير محدد"
    }\n${item.city ? `المدينة: ${item.city}\n` : ""}\nالحالة: ${
      KenzStatusLabels[item.status]
    }`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: item.title,
          text,
        });
      } else {
        await navigator.clipboard.writeText(text);
      }
    } catch (e) {
      console.error("Share failed:", e);
    }
  };

  const handleCall = () => {
    if (!hasContact) return;
    const raw = item.metadata!.contact;
    const normalized = normalizePhoneNumber(raw);
    if (normalized) window.location.href = `tel:${normalized}`;
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 800, mx: "auto", pb: 4 }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          px: 2,
          py: 1.5,
          backgroundColor: "background.paper",
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        {onBack && (
          <IconButton onClick={onBack} sx={{ mr: 1 }}>
            <ArrowBack />
          </IconButton>
        )}
        <Typography variant="h6" sx={{ flex: 1, textAlign: "center" }}>
          تفاصيل الإعلان
        </Typography>
        <IconButton onClick={handleShare}>
          <Share />
        </IconButton>
        {!isOwner && onFavoriteToggle && (
          <IconButton
            onClick={() => onFavoriteToggle(item)}
            aria-label={isFavorited ? "إزالة من المفضلة" : "إضافة للمفضلة"}
          >
            {isFavorited ? (
              <Favorite sx={{ color: "error.main" }} />
            ) : (
              <FavoriteBorder />
            )}
          </IconButton>
        )}
        {isOwner && (
          <>
            {onEdit && (
              <IconButton onClick={() => onEdit(item)}>
                <Edit />
              </IconButton>
            )}
            {onDelete && (
              <IconButton onClick={() => onDelete(item)} color="error">
                <Delete />
              </IconButton>
            )}
          </>
        )}
        {!isOwner && onReport && (
          <IconButton
            onClick={() => setReportDialogOpen(true)}
            color="warning"
            title="الإبلاغ عن إعلان"
          >
            <ReportIcon />
          </IconButton>
        )}
      </Box>

      <Box sx={{ px: 2, py: 2 }}>
        {/* Image Gallery */}
        {(item.images ?? []).length > 0 ? (
          <Box
            sx={{
              display: "flex",
              gap: 1,
              overflowX: "auto",
              mb: 2,
              pb: 1,
            }}
          >
            {item.images!.map((img, i) => (
              <Box
                key={i}
                component="img"
                src={img}
                alt={`${item.title} ${i + 1}`}
                sx={{
                  width: 280,
                  height: 220,
                  objectFit: "cover",
                  borderRadius: 2,
                  flexShrink: 0,
                }}
              />
            ))}
          </Box>
        ) : (
          <Box
            sx={{
              height: 220,
              backgroundColor: "grey.200",
              borderRadius: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mb: 2,
            }}
          >
            <Typography color="text.secondary">لا توجد صور</Typography>
          </Box>
        )}

        {/* Category & Status */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 1,
            mb: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Chip
              icon={<Storefront sx={{ fontSize: 20 }} />}
              label={item.category || "غير مصنف"}
              sx={{ backgroundColor: "primary.light", color: "primary.main" }}
            />
            {item.isAuction && (
              <Chip
                icon={<AuctionIcon sx={{ fontSize: 18 }} />}
                label="مزاد"
                size="small"
                sx={{
                  backgroundColor: "info.light",
                  color: "info.dark",
                }}
              />
            )}
            {item.acceptsEscrow && (
              <Chip
                icon={<EscrowIcon sx={{ fontSize: 18 }} />}
                label="إيكرو"
                size="small"
                sx={{
                  backgroundColor: "success.light",
                  color: "success.dark",
                }}
              />
            )}
            {item.isBoosted && (
              <Chip
                icon={<TrendingUp sx={{ fontSize: 18 }} />}
                label="إعلان مميز"
                size="small"
                sx={{
                  backgroundColor: "warning.main",
                  color: "warning.contrastText",
                  fontWeight: 600,
                }}
              />
            )}
          </Box>
          <Chip
            label={KenzStatusLabels[item.status]}
            sx={{
              backgroundColor: KenzStatusColors[item.status],
              color: "white",
            }}
          />
        </Box>

        <Typography variant="h5" fontWeight={700} sx={{ mb: 2 }}>
          {item.title}
        </Typography>

        {/* City, views, quantity */}
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
          {item.city && (
            <Chip
              icon={<LocationOn sx={{ fontSize: 14 }} />}
              label={item.city}
              size="small"
              sx={{ backgroundColor: "grey.100" }}
            />
          )}
          {(item.viewCount ?? 0) > 0 && (
            <Chip
              icon={<Visibility sx={{ fontSize: 14 }} />}
              label={`${item.viewCount} مشاهدة`}
              size="small"
              sx={{ backgroundColor: "grey.100" }}
            />
          )}
          {(item.quantity ?? 1) > 1 && (
            <Chip
              label={`الكمية: ${item.quantity}`}
              size="small"
              sx={{ backgroundColor: "grey.100" }}
            />
          )}
        </Box>

        {/* طريقة التسليم */}
        {item.deliveryOption && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            طريقة التسليم:{" "}
            {item.deliveryOption === "meetup"
              ? "لقاء"
              : item.deliveryOption === "delivery"
              ? item.deliveryFee
                ? `توصيل (${item.deliveryFee} ر.ي)`
                : "توصيل"
              : item.deliveryFee
              ? `لقاء أو توصيل (${item.deliveryFee} ر.ي)`
              : "لقاء وتوصيل"}
          </Typography>
        )}

        {/* نشر بالنيابة عن */}
        {(item.postedOnBehalfOfPhone ||
          (typeof item.postedOnBehalfOfUserId === "object" &&
            item.postedOnBehalfOfUserId)) && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            نُشر بالنيابة عن:{" "}
            {typeof item.postedOnBehalfOfUserId === "object" &&
            item.postedOnBehalfOfUserId?.name
              ? item.postedOnBehalfOfUserId.name
              : item.postedOnBehalfOfPhone
              ? `${String(item.postedOnBehalfOfPhone).replace(
                  /(\d{3})\d+(\d{3})/,
                  "$1***$2"
                )}`
              : ""}
          </Typography>
        )}

        {/* Price */}
        {(item.price != null || item.startingPrice != null || item.winningBidAmount != null) && (
          <Paper sx={{ p: 2, mb: 3, backgroundColor: "success.light" }}>
            <Typography variant="overline" color="text.secondary">
              {item.isAuction ? "المزاد" : "السعر"}
            </Typography>
            <Typography variant="h4" fontWeight={700} color="success.dark">
              {item.isAuction && item.winningBidAmount != null
                ? formatCurrency(item.winningBidAmount, item.currency)
                : item.isAuction
                ? formatCurrency(item.startingPrice ?? item.price, item.currency)
                : formatCurrency(item.price, item.currency)}
            </Typography>
            {item.isAuction && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {item.winningBidAmount != null
                  ? "السعر الحالي (آخر مزايدة)"
                  : "السعر الابتدائي"}
              </Typography>
            )}
            {item.isAuction && countdown && (
              <Chip
                label={countdown}
                size="small"
                sx={{ mt: 1, backgroundColor: "info.main", color: "white" }}
              />
            )}
            {item.isAuction && item.winnerId && (
              <Typography variant="body2" color="success.dark" sx={{ mt: 1 }}>
                الفائز:{" "}
                {typeof item.winnerId === "object" && item.winnerId
                  ? item.winnerId.fullName || item.winnerId.phone || "—"
                  : "—"}
              </Typography>
            )}
          </Paper>
        )}

        {/* قائمة المزايدات (للمزادات) */}
        {item.isAuction && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
              المزايدات
            </Typography>
            {bidsLoading ? (
              <Typography variant="body2" color="text.secondary">
                جاري التحميل...
              </Typography>
            ) : bids.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                لا توجد مزايدات حتى الآن
              </Typography>
            ) : (
              <Box
                sx={{
                  maxHeight: 200,
                  overflowY: "auto",
                  border: 1,
                  borderColor: "divider",
                  borderRadius: 1,
                  p: 1,
                }}
              >
                {bids.map((bid, i) => (
                  <Box
                    key={bid._id}
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      py: 0.5,
                      borderBottom:
                        i < bids.length - 1 ? 1 : 0,
                      borderColor: "divider",
                    }}
                  >
                    <Typography variant="body2">
                      {typeof bid.bidderId === "object" && bid.bidderId
                        ? bid.bidderId.fullName || bid.bidderId.phone || "—"
                        : "—"}
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {formatCurrency(bid.amount, item.currency)}
                    </Typography>
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        )}

        {/* Keywords */}
        {(item.keywords ?? []).length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography
              variant="subtitle2"
              color="text.secondary"
              sx={{ mb: 1 }}
            >
              كلمات مفتاحية
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              {item.keywords!.map((kw, i) => (
                <Chip key={i} label={kw} size="small" variant="outlined" />
              ))}
            </Box>
          </Box>
        )}

        {/* Description */}
        {item.description && (
          <Typography variant="body1" sx={{ mb: 3, whiteSpace: "pre-line" }}>
            {item.description}
          </Typography>
        )}

        {/* Owner Section */}
        {isOwner && (
          <Paper
            sx={{
              p: 2,
              mb: 3,
              border: 1,
              borderColor: "primary.main",
              backgroundColor: "primary.light",
            }}
          >
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
              إدارة إعلانك
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              يمكنك تعديل بيانات الإعلان أو حذفه أو متابعة المحادثات مع
              المهتمين.
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              {item.status !== "completed" && onMarkSold && (
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<SoldIcon />}
                  onClick={() => onMarkSold(item)}
                >
                  تم البيع
                </Button>
              )}
              {onEdit && (
                <Button
                  variant="contained"
                  startIcon={<Edit />}
                  onClick={() => onEdit(item)}
                >
                  تعديل البيانات
                </Button>
              )}
              {onChat && (
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<ChatBubbleOutline />}
                  onClick={() => onChat(item)}
                >
                  محادثاتي
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="contained"
                  color="error"
                  startIcon={<Delete />}
                  onClick={() => onDelete(item)}
                >
                  حذف الإعلان
                </Button>
              )}
            </Box>
          </Paper>
        )}

        {/* Contact Section - for visitors */}
        {!isOwner && (
          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
              التواصل
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
              {item.isAuction &&
                item.status !== "completed" &&
                item.status !== "cancelled" &&
                !item.winnerId &&
                countdown !== "انتهى المزاد" &&
                onPlaceBid && (
                  <Button
                    variant="contained"
                    color="info"
                    startIcon={<AuctionIcon />}
                    onClick={() => {
                      setBidAmount(minBidAmount || "");
                      setBidDialogOpen(true);
                    }}
                  >
                    مزايدة
                  </Button>
                )}
              {item.acceptsEscrow &&
                item.status !== "completed" &&
                item.status !== "cancelled" &&
                onBuyWithEscrow && (
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<EscrowIcon />}
                    onClick={() => {
                      setEscrowAmount(item.price ?? "");
                      setEscrowDialogOpen(true);
                    }}
                  >
                    شراء بالإيكرو
                  </Button>
                )}
              {onChat && (
                <Button
                  variant="contained"
                  startIcon={<ChatBubbleOutline />}
                  onClick={() => onChat(item)}
                >
                  تواصل مع المعلن
                </Button>
              )}
              {hasContact && (
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<Phone />}
                  onClick={handleCall}
                >
                  اتصال مباشر
                </Button>
              )}
            </Box>
            {hasContact && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                رقم التواصل:{" "}
                {normalizePhoneNumber(item.metadata!.contact) ??
                  item.metadata!.contact}
              </Typography>
            )}
            {!hasContact && onChat && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                لم يُذكر رقم تواصل في هذا الإعلان. يمكنك المحادثة مع المعلن
                أعلاه.
              </Typography>
            )}
          </Paper>
        )}

        {/* Metadata */}
        {item.metadata &&
          Object.keys(item.metadata).filter((k) => k !== "contact").length >
            0 && (
            <Box sx={{ mb: 3 }}>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                sx={{ mb: 1 }}
              >
                تفاصيل إضافية
              </Typography>
              <Grid container spacing={1}>
                {Object.entries(item.metadata)
                  .filter(([k]) => k !== "contact")
                  .map(([key, value]) => (
                    <Grid size={{ xs: 12 }} key={key}>
                      <Typography variant="body2">
                        <strong>{key}:</strong> {String(value)}
                      </Typography>
                    </Grid>
                  ))}
              </Grid>
            </Box>
          )}

        {/* Dates */}
        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
            تواريخ مهمة
          </Typography>
          <Typography variant="body2">
            تاريخ النشر: {formatDate(item.createdAt)}
          </Typography>
          <Typography variant="body2">
            آخر تحديث: {formatDate(item.updatedAt)}
          </Typography>
        </Box>
      </Box>

      {/* Escrow buy dialog */}
      <Dialog
        open={escrowDialogOpen}
        onClose={() => !escrowSubmitting && setEscrowDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>شراء بالإيكرو</DialogTitle>
        <DialogContent>
          {item?.price != null && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              سعر الإعلان: {item.price.toLocaleString("ar-SA")}{" "}
              {item.currency ?? "ريال يمني"}
            </Typography>
          )}
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            سيتم حجز المبلغ من محفظتك حتى تؤكد استلام السلعة. عند التأكيد يُحوّل
            المبلغ للبائع.
          </Typography>
          <TextField
            autoFocus
            fullWidth
            type="number"
            label="المبلغ (ريال يمني)"
            value={escrowAmount}
            onChange={(e) =>
              setEscrowAmount(
                e.target.value === "" ? "" : Number(e.target.value)
              )
            }
            inputProps={{ min: 1 }}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setEscrowDialogOpen(false)}
            disabled={escrowSubmitting}
          >
            إلغاء
          </Button>
          <Button
            variant="contained"
            color="success"
            disabled={
              escrowSubmitting ||
              (typeof escrowAmount === "number" ? escrowAmount < 1 : true)
            }
            onClick={async () => {
              if (
                !onBuyWithEscrow ||
                typeof escrowAmount !== "number" ||
                escrowAmount < 1
              )
                return;
              setEscrowSubmitting(true);
              try {
                await onBuyWithEscrow(item, escrowAmount);
                setEscrowDialogOpen(false);
                setEscrowAmount("");
              } finally {
                setEscrowSubmitting(false);
              }
            }}
          >
            {escrowSubmitting ? "جاري التنفيذ..." : "تأكيد الشراء"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Report dialog */}
      <Dialog
        open={reportDialogOpen}
        onClose={() => setReportDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>الإبلاغ عن إعلان</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label="سبب الإبلاغ"
            value={reportReason}
            onChange={(e) => setReportReason(e.target.value)}
            placeholder="مثال: محتوى غير لائق، إعلان مضلل..."
            required
            sx={{ mt: 1 }}
          />
          <TextField
            fullWidth
            label="ملاحظات (اختياري)"
            value={reportNotes}
            onChange={(e) => setReportNotes(e.target.value)}
            multiline
            rows={2}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReportDialogOpen(false)}>إلغاء</Button>
          <Button
            variant="contained"
            color="warning"
            disabled={!reportReason.trim() || reportSubmitting}
            onClick={async () => {
              if (!onReport || !reportReason.trim()) return;
              setReportSubmitting(true);
              try {
                await onReport(item, {
                  reason: reportReason.trim(),
                  notes: reportNotes.trim() || undefined,
                });
                setReportDialogOpen(false);
                setReportReason("");
                setReportNotes("");
              } finally {
                setReportSubmitting(false);
              }
            }}
          >
            إرسال البلاغ
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bid dialog */}
      <Dialog
        open={bidDialogOpen}
        onClose={() => !bidSubmitting && setBidDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>مزايدة</DialogTitle>
        <DialogContent>
          {(item?.startingPrice != null || item?.price != null) && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              السعر الابتدائي: {formatCurrency(item?.startingPrice ?? item?.price, item?.currency)}
            </Typography>
          )}
          {bids.length > 0 && bids[0] && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              أعلى مزايدة حالياً: {formatCurrency(bids[0].amount, item?.currency)}
            </Typography>
          )}
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            أدخل المبلغ الذي تريد المزايدة به (يجب أن يكون أكبر من أعلى مزايدة حالياً).
          </Typography>
          <TextField
            autoFocus
            fullWidth
            type="number"
            label="المبلغ"
            value={bidAmount}
            onChange={(e) =>
              setBidAmount(
                e.target.value === "" ? "" : Number(e.target.value)
              )
            }
            inputProps={{ min: minBidAmount }}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setBidDialogOpen(false)}
            disabled={bidSubmitting}
          >
            إلغاء
          </Button>
          <Button
            variant="contained"
            color="info"
            disabled={
              bidSubmitting ||
              (typeof bidAmount === "number" ? bidAmount < minBidAmount : true)
            }
            onClick={async () => {
              if (
                !onPlaceBid ||
                typeof bidAmount !== "number" ||
                bidAmount < minBidAmount
              )
                return;
              setBidSubmitting(true);
              try {
                await onPlaceBid(item, bidAmount);
                setBidDialogOpen(false);
                setBidAmount("");
              } finally {
                setBidSubmitting(false);
              }
            }}
          >
            {bidSubmitting ? "جاري التنفيذ..." : "تأكيد المزايدة"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default KenzDetails;
