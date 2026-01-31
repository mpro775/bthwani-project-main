// مطابق لـ app-user SanadDetailsScreen
import React from "react";
import {
  Box,
  Typography,
  IconButton,
  Button,
  CircularProgress,
} from "@mui/material";
import {
  ArrowBack,
  Share,
  Edit,
  Delete,
  WorkOutline,
  Warning,
  Favorite,
  HelpOutline,
  LocationOn,
  Phone,
} from "@mui/icons-material";
import type { SanadItem, SanadStatus } from "../types";
import {
  SanadKindLabels,
  SanadStatusLabels,
  SanadStatusColors,
  SanadKindColors,
} from "../types";

interface SanadDetailsProps {
  item: SanadItem;
  loading?: boolean;
  onBack?: () => void;
  onEdit?: (item: SanadItem) => void;
  onDelete?: (item: SanadItem) => void;
  isOwner?: boolean;
  onStatusChange?: (item: SanadItem, newStatus: SanadStatus) => Promise<void>;
}

const getKindIcon = (kind?: string) => {
  switch (kind) {
    case "specialist":
      return <WorkOutline />;
    case "emergency":
      return <Warning />;
    case "charity":
      return <Favorite />;
    default:
      return <HelpOutline />;
  }
};

const SanadDetails: React.FC<SanadDetailsProps> = ({
  item,
  loading = false,
  onBack,
  onEdit,
  onDelete,
  isOwner = false,
  onStatusChange,
}) => {
  const [updatingStatus, setUpdatingStatus] = React.useState(false);

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

  const kindColor =
    item.kind && item.kind in SanadKindColors
      ? SanadKindColors[item.kind]
      : "#9e9e9e";

  const handleShare = async () => {
    if (!item) return;
    const text = `${item.kind ? SanadKindLabels[item.kind] : "طلب"}: ${item.title}\n\n${item.description || ""}\n\nالموقع: ${item.metadata?.location || "غير محدد"}\n\nمعلومات التواصل: ${item.metadata?.contact || "غير محدد"}\n\nتاريخ النشر: ${formatDate(item.createdAt)}`;
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

  const handleStatusChange = async (newStatus: SanadStatus) => {
    if (!item || item.status === newStatus || !onStatusChange) return;
    setUpdatingStatus(true);
    try {
      await onStatusChange(item, newStatus);
    } finally {
      setUpdatingStatus(false);
    }
  };

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
          تفاصيل الطلب
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
              gap: 1,
              backgroundColor: "grey.200",
              px: 2,
              py: 1,
              borderRadius: 1,
            }}
          >
            <Box sx={{ color: kindColor }}>{getKindIcon(item.kind)}</Box>
            <Typography variant="body2" fontWeight={600} sx={{ color: kindColor }}>
              {item.kind ? SanadKindLabels[item.kind] : "غير محدد"}
            </Typography>
          </Box>
          <Box
            sx={{
              px: 2,
              py: 1,
              borderRadius: 1,
              backgroundColor: SanadStatusColors[item.status],
            }}
          >
            <Typography variant="body2" sx={{ color: "white", fontWeight: 600 }}>
              {SanadStatusLabels[item.status]}
            </Typography>
          </Box>
        </Box>

        <Typography variant="h5" fontWeight={700} sx={{ mb: 2 }}>
          {item.title}
        </Typography>

        {item.description && (
          <Typography variant="body1" sx={{ mb: 3, whiteSpace: "pre-line" }}>
            {item.description}
          </Typography>
        )}

        {(item.metadata?.location || item.metadata?.contact) && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
              بيانات إضافية
            </Typography>
            {item.metadata.location && (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  mb: 1,
                  p: 1,
                  backgroundColor: "grey.50",
                  borderRadius: 1,
                }}
              >
                <LocationOn fontSize="small" color="action" />
                <Typography variant="body2">{item.metadata.location}</Typography>
              </Box>
            )}
            {item.metadata.contact && (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  p: 1,
                  backgroundColor: "grey.50",
                  borderRadius: 1,
                }}
              >
                <Phone fontSize="small" color="action" />
                <Typography variant="body2">{item.metadata.contact}</Typography>
              </Box>
            )}
          </Box>
        )}

        {isOwner && (
          <Box
            sx={{
              mb: 3,
              p: 2,
              backgroundColor: "background.paper",
              borderRadius: 2,
              border: 1,
              borderColor: "divider",
            }}
          >
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
              إدارة الطلب
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              هذا الطلب خاص بك. يمكنك تغيير الحالة أو تعديل التفاصيل أو حذفه.
            </Typography>
            <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
              تغيير الحالة
            </Typography>
            {updatingStatus ? (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <CircularProgress size={20} color="primary" />
                <Typography variant="body2" color="text.secondary">
                  جاري التحديث...
                </Typography>
              </Box>
            ) : (
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
                {(
                  [
                    "draft",
                    "pending",
                    "confirmed",
                    "completed",
                    "cancelled",
                  ] as SanadStatus[]
                ).map((status) => (
                  <Button
                    key={status}
                    variant={item.status === status ? "contained" : "outlined"}
                    size="small"
                    onClick={() => handleStatusChange(status)}
                    sx={{
                      borderColor: SanadStatusColors[status],
                      ...(item.status === status && {
                        backgroundColor: SanadStatusColors[status],
                        color: "white",
                      }),
                    }}
                  >
                    {SanadStatusLabels[status]}
                  </Button>
                ))}
              </Box>
            )}
            <Box sx={{ display: "flex", gap: 1 }}>
              {onEdit && (
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<Edit />}
                  onClick={() => onEdit(item)}
                >
                  تعديل التفاصيل
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
          </Box>
        )}

        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
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
    </Box>
  );
};

export default SanadDetails;
