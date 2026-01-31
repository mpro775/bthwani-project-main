// مطابق لـ app-user KawaderDetailsScreen
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
  WorkOutline,
  School,
  Build,
  LocationOn,
  Home,
  Phone,
  ChatBubbleOutline,
} from "@mui/icons-material";
import type { KawaderItem } from "../types";
import { KawaderStatusLabels, KawaderStatusColors } from "../types";

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

interface KawaderDetailsProps {
  item: KawaderItem;
  loading?: boolean;
  onBack?: () => void;
  onEdit?: (item: KawaderItem) => void;
  onDelete?: (item: KawaderItem) => void;
  isOwner?: boolean;
  onChat?: (item: KawaderItem) => void;
}

const KawaderDetails: React.FC<KawaderDetailsProps> = ({
  item,
  loading = false,
  onBack,
  onEdit,
  onDelete,
  isOwner = false,
  onChat,
}) => {
  const formatCurrency = (amount?: number) => {
    if (!amount) return "غير محدد";
    return `${amount.toLocaleString("ar-SA")} ريال`;
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

  const handleShare = async () => {
    if (!item) return;
    const text = `عرض وظيفي: ${item.title}\n\n${item.description || ""}\n\nالنطاق: ${item.scope || "غير محدد"}\nالميزانية: ${formatCurrency(item.budget)}\n${item.metadata?.location ? `الموقع: ${item.metadata.location}\n` : ""}${item.metadata?.remote ? "متاح العمل عن بعد\n" : ""}${item.metadata?.experience ? `الخبرة المطلوبة: ${item.metadata.experience}\n` : ""}${item.metadata?.skills?.length ? `المهارات: ${item.metadata.skills.join(", ")}\n` : ""}\nالحالة: ${KawaderStatusLabels[item.status]}\n\nتاريخ النشر: ${formatDate(item.createdAt)}`;
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
    const raw = item?.metadata?.contact;
    if (!raw) return;
    const normalized = normalizePhoneNumber(raw);
    if (normalized) {
      window.location.href = `tel:${normalized}`;
    }
  };

  const handleChat = () => {
    if (onChat) {
      onChat(item);
    }
  };

  const hasContact = !!(item?.metadata?.contact);

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
          تفاصيل العرض الوظيفي
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
              backgroundColor: "success.light",
              px: 2,
              py: 1,
              borderRadius: 2,
            }}
          >
            <Typography variant="h6" fontWeight={700} color="success.dark">
              {formatCurrency(item.budget)}
            </Typography>
          </Box>
          <Chip
            label={KawaderStatusLabels[item.status]}
            sx={{
              backgroundColor: KawaderStatusColors[item.status],
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

        {item.scope && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
              نطاق العمل
            </Typography>
            <Paper sx={{ p: 2, display: "flex", alignItems: "center", gap: 1 }}>
              <WorkOutline color="primary" />
              <Typography variant="body2" color="primary.main" fontWeight={500}>
                {item.scope}
              </Typography>
            </Paper>
          </Box>
        )}

        {item.metadata && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
              متطلبات العمل
            </Typography>
            {item.metadata.experience && (
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
                <School fontSize="small" color="action" />
                <Typography variant="body2">الخبرة المطلوبة:</Typography>
                <Typography variant="body2" fontWeight={500}>
                  {item.metadata.experience}
                </Typography>
              </Box>
            )}
            {item.metadata.skills && item.metadata.skills.length > 0 && (
              <Paper sx={{ p: 2, mb: 1 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                  <Build fontSize="small" color="action" />
                  <Typography variant="body2" fontWeight={600}>
                    المهارات المطلوبة:
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                  {item.metadata.skills.map((skill, i) => (
                    <Chip key={i} label={skill} size="small" sx={{ mb: 0.5 }} />
                  ))}
                </Box>
              </Paper>
            )}
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
                <Typography variant="body2">الموقع:</Typography>
                <Typography variant="body2" fontWeight={500}>
                  {item.metadata.location}
                  {item.metadata.remote && " (متاح العمل عن بعد)"}
                </Typography>
              </Box>
            )}
            {item.metadata.remote && !item.metadata.location && (
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
                <Home fontSize="small" color="action" />
                <Typography variant="body2">نوع العمل:</Typography>
                <Typography variant="body2" fontWeight={500}>
                  عن بعد
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
                onClick={handleChat}
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
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              رقم التواصل:{" "}
              {normalizePhoneNumber(item.metadata!.contact!) ??
                item.metadata!.contact}
            </Typography>
          )}
          {!hasContact && !isOwner && onChat && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              لم يُذكر رقم تواصل في هذا الإعلان. يمكنك المحادثة مع المعلن
              أعلاه.
            </Typography>
          )}
        </Box>

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

export default KawaderDetails;
