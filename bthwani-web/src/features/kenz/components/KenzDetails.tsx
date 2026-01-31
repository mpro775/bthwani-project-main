// مطابق لـ app-user KenzDetailsScreen
import React from "react";
import {
  Box,
  Typography,
  Paper,
  Chip,
  IconButton,
  Button,
  CircularProgress,
  Grid,
} from "@mui/material";
import {
  ArrowBack,
  Share,
  Edit,
  Delete,
  LocationOn,
  Visibility,
  AttachMoney,
  Storefront,
  ChatBubbleOutline,
  Phone,
} from "@mui/icons-material";
import type { KenzItem } from "../types";
import { KenzStatusLabels, KenzStatusColors } from "../types";

interface KenzDetailsProps {
  item: KenzItem;
  loading?: boolean;
  onBack?: () => void;
  onEdit?: (item: KenzItem) => void;
  onDelete?: (item: KenzItem) => void;
  isOwner?: boolean;
  onChat?: (item: KenzItem) => void;
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
}) => {
  const formatCurrency = (price?: number, currency?: string) => {
    if (!price) return "غير محدد";
    const cur = currency ?? "ريال يمني";
    return `${price.toLocaleString("ar-SA")} ${cur}`;
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

  const hasContact = !!(item?.metadata?.contact);

  const handleShare = async () => {
    if (!item) return;
    const text = `إعلان في كنز: ${item.title}\n\n${item.description || ""}\n\nالسعر: ${formatCurrency(item.price, item.currency)}\nالفئة: ${item.category || "غير محدد"}\n${item.city ? `المدينة: ${item.city}\n` : ""}\nالحالة: ${KenzStatusLabels[item.status]}`;
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
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Chip
            icon={<Storefront sx={{ fontSize: 20 }} />}
            label={item.category || "غير مصنف"}
            sx={{ backgroundColor: "primary.light", color: "primary.main" }}
          />
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
            <Chip label={`الكمية: ${item.quantity}`} size="small" sx={{ backgroundColor: "grey.100" }} />
          )}
        </Box>

        {/* Price */}
        {item.price != null && (
          <Paper sx={{ p: 2, mb: 3, backgroundColor: "success.light" }}>
            <Typography variant="overline" color="text.secondary">
              السعر
            </Typography>
            <Typography variant="h4" fontWeight={700} color="success.dark">
              {formatCurrency(item.price, item.currency)}
            </Typography>
          </Paper>
        )}

        {/* Keywords */}
        {(item.keywords ?? []).length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
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
          <Paper sx={{ p: 2, mb: 3, border: 1, borderColor: "primary.main", backgroundColor: "primary.light" }}>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
              إدارة إعلانك
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              يمكنك تعديل بيانات الإعلان أو حذفه أو متابعة المحادثات مع المهتمين.
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              {onEdit && (
                <Button variant="contained" startIcon={<Edit />} onClick={() => onEdit(item)}>
                  تعديل البيانات
                </Button>
              )}
              {onChat && (
                <Button variant="contained" color="success" startIcon={<ChatBubbleOutline />} onClick={() => onChat(item)}>
                  محادثاتي
                </Button>
              )}
              {onDelete && (
                <Button variant="contained" color="error" startIcon={<Delete />} onClick={() => onDelete(item)}>
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
                رقم التواصل: {normalizePhoneNumber(item.metadata!.contact) ?? item.metadata!.contact}
              </Typography>
            )}
            {!hasContact && onChat && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                لم يُذكر رقم تواصل في هذا الإعلان. يمكنك المحادثة مع المعلن أعلاه.
              </Typography>
            )}
          </Paper>
        )}

        {/* Metadata */}
        {item.metadata && Object.keys(item.metadata).filter((k) => k !== "contact").length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
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
          <Typography variant="body2">تاريخ النشر: {formatDate(item.createdAt)}</Typography>
          <Typography variant="body2">آخر تحديث: {formatDate(item.updatedAt)}</Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default KenzDetails;
