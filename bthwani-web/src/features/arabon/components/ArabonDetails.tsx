// مطابق لـ app-user ArabonDetailsScreen
import React, { useCallback, useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Chip,
  IconButton,
  CircularProgress,
  Button,
} from "@mui/material";
import {
  ArrowBack,
  Share,
  Edit,
  Delete,
  Phone,
  Event,
  People,
  CheckCircle,
  Cancel,
  DoneAll,
} from "@mui/icons-material";
import { getArabonActivity } from "../api";
import type { ArabonItem } from "../types";
import { ArabonStatusLabels, ArabonStatusColors } from "../types";

interface ArabonDetailsProps {
  item: ArabonItem;
  loading?: boolean;
  onBack?: () => void;
  onEdit?: (item: ArabonItem) => void;
  onDelete?: (item: ArabonItem) => void;
  isOwner?: boolean;
  onStatusChange?: (newStatus: string) => Promise<void>;
}

const ArabonDetails: React.FC<ArabonDetailsProps> = ({
  item,
  loading = false,
  onBack,
  onEdit,
  onDelete,
  isOwner = false,
  onStatusChange,
}) => {
  const [activity, setActivity] = useState<{ _id: string; oldStatus?: string; newStatus: string; createdAt: string }[]>([]);
  const [statusUpdating, setStatusUpdating] = useState(false);

  useEffect(() => {
    if (!item?._id) return;
    getArabonActivity(item._id)
      .then((res) => setActivity(res.data ?? []))
      .catch(() => setActivity([]));
  }, [item?._id]);

  const formatCurrency = (amount?: number) => {
    if (!amount) return "غير محدد";
    return `${amount.toFixed(2)} ريال`;
  };

  const formatDate = (dateInput?: string | Date) => {
    if (!dateInput) return "غير محدد";
    try {
      const d =
        dateInput instanceof Date ? dateInput : new Date(dateInput);
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

  const priceInfo = item.pricePerPeriod
    ? `${formatCurrency(item.pricePerPeriod)}/${item.bookingPeriod === "hour" ? "ساعة" : item.bookingPeriod === "day" ? "يوم" : "أسبوع"}`
    : formatCurrency(item.bookingPrice || item.depositAmount);

  const handleShare = async () => {
    if (!item) return;
    const text = `عربون: ${item.title}\n\n${item.description || ""}\n\n${item.category ? `النوع: ${item.category}\n` : ""}السعر: ${priceInfo}\nعربون: ${formatCurrency(item.depositAmount)}\n${item.contactPhone ? `للحجز: ${item.contactPhone}\n` : ""}${item.scheduleAt ? `الموعد: ${formatDate(item.scheduleAt)}\n` : ""}${item.metadata?.guests ? `عدد الأشخاص: ${item.metadata.guests}\n` : ""}\nالحالة: ${ArabonStatusLabels[item.status]}\n\nتاريخ النشر: ${formatDate(item.createdAt)}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: item.title, text });
      } else {
        await navigator.clipboard.writeText(text);
      }
    } catch (e) {
      console.error("Share failed:", e);
    }
  };

  const handleStatusChange = useCallback(
    async (newStatus: string) => {
      if (!onStatusChange) return;
      setStatusUpdating(true);
      try {
        await onStatusChange(newStatus);
      } finally {
        setStatusUpdating(false);
      }
    },
    [onStatusChange]
  );

  const canChangeStatus =
    isOwner &&
    item &&
    item.status !== "completed" &&
    item.status !== "cancelled";
  const isUpcoming = item?.scheduleAt
    ? new Date(item.scheduleAt) > new Date()
    : false;

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 800, mx: "auto", pb: 4 }}>
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
          تفاصيل العربون
        </Typography>
        <IconButton onClick={handleShare}>
          <Share />
        </IconButton>
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
      </Box>

      <Box sx={{ px: 2, py: 2 }}>
        {item.images && item.images.length > 0 && (
          <Box
            sx={{
              display: "flex",
              gap: 1,
              overflowX: "auto",
              pb: 2,
              mb: 2,
              "& > img": {
                minWidth: 280,
                height: 220,
                objectFit: "cover",
                borderRadius: 1,
              },
            }}
          >
            {item.images.map((url, i) => (
              <Box
                key={i}
                component="img"
                src={url}
                alt=""
              />
            ))}
          </Box>
        )}

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Box
            sx={{
              backgroundColor: "success.main",
              px: 2,
              py: 1,
              borderRadius: 2,
            }}
          >
            <Typography variant="h6" fontWeight={700} sx={{ color: "white" }}>
              {priceInfo}
            </Typography>
          </Box>
          <Chip
            label={ArabonStatusLabels[item.status]}
            sx={{
              backgroundColor: ArabonStatusColors[item.status],
              color: "white",
            }}
          />
        </Box>

        {item.category && (
          <Box
            sx={{
              alignSelf: "flex-start",
              backgroundColor: "primary.light",
              px: 1.5,
              py: 0.75,
              borderRadius: 1,
              mb: 2,
            }}
          >
            <Typography variant="body2" fontWeight={600} color="primary.main">
              {item.category}
            </Typography>
          </Box>
        )}

        <Typography variant="h5" fontWeight={700} sx={{ mb: 2 }}>
          {item.title}
        </Typography>

        {item.description && (
          <Typography variant="body1" sx={{ mb: 3, whiteSpace: "pre-line" }}>
            {item.description}
          </Typography>
        )}

        {(item.contactPhone || item.socialLinks) && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
              التواصل والحجز
            </Typography>
            {item.contactPhone && (
              <Paper
                component="a"
                href={`tel:${item.contactPhone}`}
                sx={{
                  p: 2,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  mb: 1,
                  textDecoration: "none",
                  cursor: "pointer",
                  "&:hover": { backgroundColor: "action.hover" },
                }}
              >
                <Phone color="primary" />
                <Typography fontWeight={600} color="primary.main">
                  {item.contactPhone}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  اضغط للاتصال
                </Typography>
              </Paper>
            )}
            {item.socialLinks && (
              <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
                {item.socialLinks.whatsapp && (
                  <Chip
                    label="واتساب"
                    component="a"
                    href={item.socialLinks.whatsapp}
                    target="_blank"
                    rel="noopener"
                    clickable
                  />
                )}
                {item.socialLinks.facebook && (
                  <Chip
                    label="فيسبوك"
                    component="a"
                    href={item.socialLinks.facebook}
                    target="_blank"
                    rel="noopener"
                    clickable
                  />
                )}
                {item.socialLinks.instagram && (
                  <Chip
                    label="إنستغرام"
                    component="a"
                    href={item.socialLinks.instagram}
                    target="_blank"
                    rel="noopener"
                    clickable
                  />
                )}
              </Box>
            )}
          </Box>
        )}

        {(item.bookingPrice || item.pricePerPeriod || item.depositAmount) && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
              التسعير
            </Typography>
            {item.pricePerPeriod && (
              <Typography variant="body2" sx={{ mb: 0.5 }}>
                السعر لكل فترة: {formatCurrency(item.pricePerPeriod)}{" "}
                {item.bookingPeriod === "hour"
                  ? "ريال/ساعة"
                  : item.bookingPeriod === "day"
                    ? "ريال/يوم"
                    : "ريال/أسبوع"}
              </Typography>
            )}
            {item.bookingPrice && (
              <Typography variant="body2" sx={{ mb: 0.5 }}>
                قيمة الحجز: {formatCurrency(item.bookingPrice)}
              </Typography>
            )}
            {item.depositAmount && (
              <Typography variant="body2" fontWeight={700} color="success.main">
                قيمة العربون المطلوب تحويلها: {formatCurrency(item.depositAmount)}
              </Typography>
            )}
          </Box>
        )}

        {item.scheduleAt && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
              موعد التنفيذ
            </Typography>
            <Paper sx={{ p: 2, display: "flex", alignItems: "center", gap: 1 }}>
              {isUpcoming ? (
                <Event color="primary" />
              ) : (
                <CheckCircle color="success" />
              )}
              <Typography
                variant="body2"
                fontWeight={600}
                color={isUpcoming ? "primary.main" : "success.main"}
              >
                {formatDate(item.scheduleAt)}
              </Typography>
              {isUpcoming && (
                <Chip label="قادم" size="small" color="primary" />
              )}
            </Paper>
          </Box>
        )}

        {item.metadata &&
          (item.metadata.guests || item.metadata.notes) && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
                بيانات إضافية
              </Typography>
              {item.metadata.guests && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                  <People fontSize="small" color="action" />
                  <Typography variant="body2">
                    عدد الأشخاص: {item.metadata.guests}
                  </Typography>
                </Box>
              )}
              {item.metadata.notes && (
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
                    ملاحظات:
                  </Typography>
                  <Typography variant="body2">{item.metadata.notes}</Typography>
                </Paper>
              )}
            </Box>
          )}

        {canChangeStatus && onStatusChange && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
              تغيير الحالة
            </Typography>
            {statusUpdating ? (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <CircularProgress size={20} />
                <Typography variant="body2" color="text.secondary">
                  جاري التحديث...
                </Typography>
              </Box>
            ) : (
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {(item.status === "draft" || item.status === "pending") && (
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<CheckCircle />}
                    size="small"
                    onClick={() => handleStatusChange("confirmed")}
                  >
                    تأكيد
                  </Button>
                )}
                {item.status !== "completed" && item.status !== "cancelled" && (
                  <>
                    <Button
                      variant="contained"
                      color="success"
                      startIcon={<DoneAll />}
                      size="small"
                      onClick={() => handleStatusChange("completed")}
                    >
                      مكتمل
                    </Button>
                    <Button
                      variant="contained"
                      color="error"
                      startIcon={<Cancel />}
                      size="small"
                      onClick={() => handleStatusChange("cancelled")}
                    >
                      إلغاء
                    </Button>
                  </>
                )}
              </Box>
            )}
          </Box>
        )}

        {activity.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
              سجل تغيير الحالة
            </Typography>
            {activity.map((a) => (
              <Paper key={a._id} sx={{ p: 1.5, mb: 1 }}>
                <Typography variant="body2">
                  {a.oldStatus ? `${(ArabonStatusLabels as Record<string, string>)[a.oldStatus] || a.oldStatus} → ` : ""}
                  {(ArabonStatusLabels as Record<string, string>)[a.newStatus] || a.newStatus}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {formatDate(a.createdAt)}
                </Typography>
              </Paper>
            ))}
          </Box>
        )}

        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
            تواريخ مهمة
          </Typography>
          <Typography variant="body2">
            تاريخ الإنشاء: {formatDate(item.createdAt)}
          </Typography>
          <Typography variant="body2">
            آخر تحديث: {formatDate(item.updatedAt)}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default ArabonDetails;
