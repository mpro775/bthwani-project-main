// مطابق لـ app-user ArabonCard
import React from "react";
import { Card, CardContent, Typography, Box } from "@mui/material";
import {
  Phone,
  CalendarToday,
  CheckCircle,
  People,
  ChevronRight,
  Image as ImageIcon,
} from "@mui/icons-material";
import type { ArabonItem } from "../types";
import { ArabonStatusLabels, ArabonStatusColors } from "../types";

const BOOKING_PERIOD_LABELS: Record<string, string> = {
  hour: "ريال/ساعة",
  day: "ريال/يوم",
  week: "ريال/أسبوع",
};

interface ArabonCardProps {
  item: ArabonItem;
  onView?: (item: ArabonItem) => void;
}

const ArabonCard: React.FC<ArabonCardProps> = ({ item, onView }) => {
  const formatCurrency = (amount?: number) => {
    if (!amount) return "غير محدد";
    return `${amount.toFixed(0)} ريال`;
  };

  const formatDate = (dateString?: string | Date) => {
    if (!dateString) return "غير محدد";
    try {
      const d = dateString instanceof Date ? dateString : new Date(dateString);
      return d.toLocaleDateString("ar-SA", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return String(dateString);
    }
  };

  const primaryImage = item.images?.[0];
  const priceLabel = item.pricePerPeriod
    ? `${formatCurrency(item.pricePerPeriod)} ${BOOKING_PERIOD_LABELS[item.bookingPeriod || "day"] || ""}`
    : item.bookingPrice
      ? formatCurrency(item.bookingPrice)
      : formatCurrency(item.depositAmount);

  const isUpcoming = () => {
    if (!item.scheduleAt) return false;
    const scheduleDate = new Date(item.scheduleAt);
    const now = new Date();
    return (
      scheduleDate > now &&
      item.status !== "completed" &&
      item.status !== "cancelled"
    );
  };

  return (
    <Card
      sx={{
        mb: 2,
        cursor: onView ? "pointer" : "default",
        borderRadius: 2,
        overflow: "hidden",
        boxShadow: 1,
        "&:hover": onView ? { boxShadow: 3 } : {},
      }}
      onClick={onView ? () => onView(item) : undefined}
    >
      {primaryImage ? (
        <Box
          component="img"
          src={primaryImage}
          alt=""
          sx={{ width: "100%", height: 140, objectFit: "cover" }}
        />
      ) : (
        <Box
          sx={{
            width: "100%",
            height: 140,
            backgroundColor: "grey.200",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ImageIcon sx={{ fontSize: 40, color: "grey.400" }} />
        </Box>
      )}
      <CardContent sx={{ p: 2 }}>
        {item.category && (
          <Box
            sx={{
              alignSelf: "flex-start",
              backgroundColor: "primary.light",
              px: 1,
              py: 0.5,
              borderRadius: 1,
              mb: 1,
            }}
          >
            <Typography variant="caption" fontWeight={600} color="primary.main">
              {item.category}
            </Typography>
          </Box>
        )}

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 1,
          }}
        >
          <Box
            sx={{
              backgroundColor: "success.main",
              px: 1.5,
              py: 0.75,
              borderRadius: 1,
            }}
          >
            <Typography variant="body2" fontWeight={700} sx={{ color: "white" }}>
              {priceLabel}
            </Typography>
          </Box>
          <Box
            sx={{
              px: 1,
              py: 0.5,
              borderRadius: 1,
              backgroundColor: ArabonStatusColors[item.status],
            }}
          >
            <Typography variant="caption" sx={{ color: "white", fontWeight: 600 }}>
              {ArabonStatusLabels[item.status]}
            </Typography>
          </Box>
        </Box>

        <Typography
          variant="subtitle1"
          fontWeight={600}
          sx={{ mb: 1, lineHeight: 1.4 }}
        >
          {item.title}
        </Typography>

        {item.description && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mb: 1,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {item.description}
          </Typography>
        )}

        {item.contactPhone && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 1 }}>
            <Phone sx={{ fontSize: 14, color: "primary.main" }} />
            <Typography variant="caption" color="primary.main" fontWeight={600}>
              {item.contactPhone}
            </Typography>
          </Box>
        )}

        {item.scheduleAt && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 1 }}>
            {isUpcoming() ? (
              <CalendarToday sx={{ fontSize: 16, color: "primary.main" }} />
            ) : (
              <CheckCircle sx={{ fontSize: 16, color: "success.main" }} />
            )}
            <Typography
              variant="caption"
              sx={{ color: isUpcoming() ? "primary.main" : "success.main" }}
            >
              {formatDate(item.scheduleAt)}
            </Typography>
          </Box>
        )}

        {item.metadata?.guests && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 1 }}>
            <People sx={{ fontSize: 14, color: "text.secondary" }} />
            <Typography variant="caption" color="text.secondary">
              {item.metadata.guests} شخص
            </Typography>
          </Box>
        )}

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            pt: 0.5,
          }}
        >
          <Typography variant="caption" color="text.secondary">
            إنشاء:{" "}
            {new Date(item.createdAt).toLocaleDateString("ar-SA")}
          </Typography>
          {onView && <ChevronRight sx={{ fontSize: 16, color: "grey.500" }} />}
        </Box>
      </CardContent>
    </Card>
  );
};

export default ArabonCard;
