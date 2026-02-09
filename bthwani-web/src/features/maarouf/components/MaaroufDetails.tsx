// مطابق لـ app-user MaaroufDetailsScreen
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
  ChatBubbleOutline,
  Phone,
  AttachMoney,
  LocationOn,
} from "@mui/icons-material";
import {
  APIProvider,
  Map as GoogleMap,
  AdvancedMarker,
  Pin,
} from "@vis.gl/react-google-maps";
import type { MaaroufItem } from "../types";
import {
  MaaroufStatusLabels,
  MaaroufStatusColors,
  MAAROUF_CATEGORIES,
} from "../types";

const getKindText = (kind?: string) => {
  switch (kind) {
    case "lost":
      return "شيء مفقود";
    case "found":
      return "شيء موجود";
    default:
      return "غير محدد";
  }
};

const getCategoryLabel = (category?: string) =>
  MAAROUF_CATEGORIES.find((c) => c.value === category)?.label || "أخرى";

interface MaaroufDetailsProps {
  item: MaaroufItem;
  loading?: boolean;
  onBack?: () => void;
  onEdit?: (item: MaaroufItem) => void;
  onDelete?: (item: MaaroufItem) => void;
  isOwner?: boolean;
  onChat?: (item: MaaroufItem) => void;
}

const MaaroufDetails: React.FC<MaaroufDetailsProps> = ({
  item,
  loading = false,
  onBack,
  onEdit,
  onDelete,
  isOwner = false,
  onChat,
}) => {
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

  const handleShare = async () => {
    if (!item) return;
    const text = `${getKindText(item.kind)}: ${item.title}\n\n${
      item.description || ""
    }\n\nالعلامات: ${
      item.tags?.join(", ") || "لا توجد علامات"
    }\n\nتاريخ النشر: ${formatDate(item.createdAt)}`;
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
    const phone = item?.metadata?.contact;
    if (!phone) return;
    const normalized = phone.replace(/[^0-9+]/g, "");
    if (normalized) {
      window.location.href = `tel:${normalized}`;
    }
  };

  const hasContact = !!item?.metadata?.contact && !item?.isAnonymous;

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
          تفاصيل الإعلان
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
              backgroundColor: "grey.200",
              px: 2,
              py: 1,
              borderRadius: 1,
            }}
          >
            <Typography variant="body2" fontWeight={600}>
              {getKindText(item.kind)}
            </Typography>
          </Box>
          <Box
            sx={{
              px: 2,
              py: 1,
              borderRadius: 1,
              backgroundColor: MaaroufStatusColors[item.status],
            }}
          >
            <Typography
              variant="body2"
              sx={{ color: "white", fontWeight: 600 }}
            >
              {MaaroufStatusLabels[item.status]}
            </Typography>
          </Box>
        </Box>

        {item.mediaUrls && item.mediaUrls.length > 0 && (
          <Box
            sx={{ display: "flex", gap: 1, overflowX: "auto", pb: 2, mb: 2 }}
          >
            {item.mediaUrls.map((url, idx) => (
              <Box
                key={idx}
                component="img"
                src={url}
                sx={{
                  minWidth: 200,
                  height: 160,
                  borderRadius: 2,
                  objectFit: "cover",
                }}
              />
            ))}
          </Box>
        )}

        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
          {item.category && (
            <Box
              sx={{
                backgroundColor: "primary.light",
                color: "primary.main",
                px: 1.5,
                py: 0.5,
                borderRadius: 1,
              }}
            >
              <Typography variant="body2">
                {getCategoryLabel(item.category)}
              </Typography>
            </Box>
          )}
          {item.reward && item.reward > 0 && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                backgroundColor: "success.light",
                color: "success.main",
                px: 1.5,
                py: 0.5,
                borderRadius: 1,
              }}
            >
              <AttachMoney sx={{ fontSize: 18 }} />
              <Typography variant="body2">
                مكافأة: {item.reward} ريال
              </Typography>
            </Box>
          )}
        </Box>

        <Typography variant="h5" fontWeight={700} sx={{ mb: 2 }}>
          {item.title}
        </Typography>

        {item.description && (
          <Typography variant="body1" sx={{ mb: 3, whiteSpace: "pre-line" }}>
            {item.description}
          </Typography>
        )}

        {item.tags && item.tags.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
              العلامات
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
              {item.tags.map((tag, i) => (
                <Typography
                  key={i}
                  variant="body2"
                  sx={{
                    color: "primary.main",
                    backgroundColor: "primary.light",
                    px: 1.5,
                    py: 0.5,
                    borderRadius: 2,
                    mr: 0.5,
                    mb: 0.5,
                  }}
                >
                  #{tag}
                </Typography>
              ))}
            </Box>
          </Box>
        )}

        {item.metadata && Object.keys(item.metadata).length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
              بيانات إضافية
            </Typography>
            {item.metadata.color && (
              <Box sx={{ mb: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  اللون:{" "}
                </Typography>
                <Typography variant="body2" component="span">
                  {item.metadata.color}
                </Typography>
              </Box>
            )}
            {item.metadata.location && (
              <Box sx={{ mb: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  الموقع:{" "}
                </Typography>
                <Typography variant="body2" component="span">
                  {item.metadata.location}
                </Typography>
              </Box>
            )}
            {item.metadata.date && (
              <Box sx={{ mb: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  التاريخ:{" "}
                </Typography>
                <Typography variant="body2" component="span">
                  {item.metadata.date}
                </Typography>
              </Box>
            )}
          </Box>
        )}

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
            التواصل
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            {!isOwner && onChat && (
              <Button
                variant="contained"
                color="primary"
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
          {item.isAnonymous && !isOwner && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              هذا الإعلان منشور بشكل مجهول. يمكنك التواصل مع المعلن عبر المحادثة
              فقط.
            </Typography>
          )}
          {hasContact && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              رقم التواصل: {item.metadata!.contact}
            </Typography>
          )}
          {!hasContact && !item.isAnonymous && !isOwner && onChat && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              لم يُذكر رقم تواصل في هذا الإعلان. يمكنك المحادثة مع المعلن أعلاه.
            </Typography>
          )}
        </Box>

        {/* Location Map */}
        {item.location && item.location.coordinates && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
              الموقع الجغرافي
            </Typography>
            <Box
              sx={{
                height: 300,
                borderRadius: 2,
                overflow: "hidden",
                border: 1,
                borderColor: "divider",
                position: "relative",
              }}
            >
              <APIProvider
                apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ""}
              >
                <GoogleMap
                  defaultZoom={15}
                  defaultCenter={{
                    lat: item.location.coordinates[1],
                    lng: item.location.coordinates[0],
                  }}
                  gestureHandling="greedy"
                  style={{ width: "100%", height: "100%" }}
                >
                  <AdvancedMarker
                    position={{
                      lat: item.location.coordinates[1],
                      lng: item.location.coordinates[0],
                    }}
                  >
                    <Pin
                      background="#D84315"
                      borderColor="#fff"
                      glyphColor="#fff"
                    />
                  </AdvancedMarker>
                </GoogleMap>
              </APIProvider>
              <Button
                variant="contained"
                size="small"
                startIcon={<LocationOn />}
                onClick={() => {
                  const [lng, lat] = item.location!.coordinates!;
                  window.open(
                    `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`,
                    "_blank"
                  );
                }}
                sx={{
                  position: "absolute",
                  bottom: 16,
                  right: 16,
                }}
              >
                فتح في خرائط جوجل
              </Button>
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

export default MaaroufDetails;
