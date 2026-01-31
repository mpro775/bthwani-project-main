// مطابق لـ app-user Es3afniDetailsScreen
import React from "react";
import {
  Box,
  Typography,
  Paper,
  Chip,
  IconButton,
  Button,
  CircularProgress,
} from "@mui/material";
import {
  ArrowBack,
  Share,
  Edit,
  Delete,
  LocationOn,
  WaterDrop,
  Science,
  Phone,
  Warning,
} from "@mui/icons-material";
import type { Es3afniItem } from "../types";
import { Es3afniStatusLabels, Es3afniStatusColors } from "../types";

interface Es3afniDetailsProps {
  item: Es3afniItem;
  loading?: boolean;
  onBack?: () => void;
  onEdit?: (item: Es3afniItem) => void;
  onDelete?: (item: Es3afniItem) => void;
  isOwner?: boolean;
}

const Es3afniDetails: React.FC<Es3afniDetailsProps> = ({
  item,
  loading = false,
  onBack,
  onEdit,
  onDelete,
  isOwner = false,
}) => {
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

  const handleShare = async () => {
    if (!item) return;
    const text = `طلب تبرع بالدم: ${item.title}\n\n${item.description || ""}\n\nفصيلة الدم: ${item.bloodType || "غير محدد"}\n${item.location ? `الموقع: ${item.location.address}\n` : ""}${item.metadata?.unitsNeeded ? `الوحدات المطلوبة: ${item.metadata.unitsNeeded}\n` : ""}${item.metadata?.contact ? `التواصل: ${item.metadata.contact}\n` : ""}\nالحالة: ${Es3afniStatusLabels[item.status]}\n\nتاريخ النشر: ${formatDate(item.createdAt)}`;
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

  const handleCall = () => {
    if (!item?.metadata?.contact) return;
    const phone = item.metadata.contact.replace(/\D/g, "");
    window.location.href = `tel:+966${phone}`;
  };

  const handleLocation = () => {
    if (!item?.location) return;
    const { lat, lng } = item.location;
    window.open(
      `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`,
      "_blank"
    );
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress color="error" />
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
          تفاصيل طلب التبرع
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
              display: "flex",
              alignItems: "center",
              backgroundColor: "error.light",
              px: 2,
              py: 1,
              borderRadius: 2,
            }}
          >
            <WaterDrop sx={{ fontSize: 24, color: "error.main" }} />
            <Typography
              variant="h6"
              fontWeight={700}
              color="error.main"
              sx={{ ml: 1 }}
            >
              {item.bloodType || "غير محدد"}
            </Typography>
          </Box>
          <Chip
            label={Es3afniStatusLabels[item.status]}
            sx={{
              backgroundColor: Es3afniStatusColors[item.status],
              color: "white",
            }}
          />
        </Box>

        <Typography variant="h5" fontWeight={700} sx={{ mb: 2 }}>
          {item.title}
        </Typography>

        {item.description && (
          <Typography variant="body1" sx={{ mb: 3, whiteSpace: "pre-line" }}>
            {item.description}
          </Typography>
        )}

        {item.bloodType && (
          <Paper sx={{ p: 2, mb: 3, backgroundColor: "grey.100" }}>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
              فصيلة الدم المطلوبة
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <WaterDrop sx={{ color: "error.main" }} />
              <Typography variant="h6" fontWeight={600} color="error.main">
                {item.bloodType}
              </Typography>
              {["O-", "AB-", "B-"].includes(item.bloodType) && (
                <Chip label="نادرة" size="small" color="error" />
              )}
            </Box>
          </Paper>
        )}

        {item.location && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
              الموقع
            </Typography>
            <Paper
              component="button"
              onClick={handleLocation}
              sx={{
                p: 2,
                width: "100%",
                textAlign: "right",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 1,
                backgroundColor: "primary.light",
                border: "none",
                "&:hover": { backgroundColor: "action.hover" },
              }}
            >
              <LocationOn sx={{ color: "primary.main" }} />
              <Typography sx={{ flex: 1, color: "primary.main" }}>
                {item.location.address}
              </Typography>
              <Typography variant="caption" color="primary.main">
                فتح الخريطة
              </Typography>
            </Paper>
          </Box>
        )}

        {item.metadata &&
          (item.metadata.unitsNeeded ||
            item.metadata.contact ||
            item.metadata.urgency) && (
            <Box sx={{ mb: 3 }}>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                sx={{ mb: 1 }}
              >
                بيانات إضافية
              </Typography>
              {item.metadata.unitsNeeded && (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    mb: 1,
                    p: 1,
                    backgroundColor: "background.paper",
                    borderRadius: 1,
                  }}
                >
                  <Science fontSize="small" color="action" />
                  <Typography variant="body2">الوحدات المطلوبة:</Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {item.metadata.unitsNeeded} وحدة
                  </Typography>
                </Box>
              )}
              {item.metadata.contact && (
                <Paper
                  component="button"
                  onClick={handleCall}
                  sx={{
                    p: 1.5,
                    width: "100%",
                    textAlign: "right",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    mb: 1,
                    border: "none",
                    "&:hover": { backgroundColor: "action.hover" },
                  }}
                >
                  <Phone sx={{ color: "primary.main" }} />
                  <Typography variant="body2">رقم التواصل:</Typography>
                  <Typography
                    variant="body2"
                    fontWeight={600}
                    color="primary.main"
                  >
                    {item.metadata.contact}
                  </Typography>
                </Paper>
              )}
              {item.metadata.urgency && (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    p: 1,
                    backgroundColor: "background.paper",
                    borderRadius: 1,
                  }}
                >
                  <Warning fontSize="small" color="error" />
                  <Typography variant="body2">درجة الاستعجال:</Typography>
                  <Typography variant="body2" fontWeight={600} color="error.main">
                    {item.metadata.urgency}
                  </Typography>
                </Box>
              )}
            </Box>
          )}

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
            تواريخ مهمة
          </Typography>
          <Typography variant="body2">
            تاريخ الإنشاء: {formatDate(item.createdAt)}
          </Typography>
          <Typography variant="body2">
            آخر تحديث: {formatDate(item.updatedAt)}
          </Typography>
        </Box>

        {isOwner && (
          <Paper sx={{ p: 2, border: 1, borderColor: "primary.main" }}>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
              إدارة طلبك
            </Typography>
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
              {onEdit && (
                <Button
                  variant="contained"
                  startIcon={<Edit />}
                  onClick={() => onEdit(item)}
                >
                  تعديل البيانات
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="contained"
                  color="error"
                  startIcon={<Delete />}
                  onClick={() => onDelete(item)}
                >
                  حذف الطلب
                </Button>
              )}
            </Box>
          </Paper>
        )}
      </Box>
    </Box>
  );
};

export default Es3afniDetails;
