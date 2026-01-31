// مطابق لـ app-user KenzCard
import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
} from "@mui/material";
import {
  Storefront,
  LocationOn,
  Visibility,
  AttachMoney,
  ChevronRight,
  Image as ImageIcon,
} from "@mui/icons-material";
import type { KenzItem } from "../types";
import { KenzStatusLabels, KenzStatusColors } from "../types";

interface KenzCardProps {
  item: KenzItem;
  onView?: (item: KenzItem) => void;
}

const KenzCard: React.FC<KenzCardProps> = ({ item, onView }) => {
  const formatCurrency = (price?: number, currency?: string) => {
    if (!price) return "غير محدد";
    const cur = currency ?? "ريال يمني";
    return `${price.toLocaleString("ar-SA")} ${cur}`;
  };

  const formatDate = (dateString?: string | Date) => {
    if (!dateString) return "غير محدد";
    try {
      const d =
        dateString instanceof Date ? dateString : new Date(dateString);
      return d.toLocaleDateString("ar-SA", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return String(dateString);
    }
  };

  const coverImage = (item.images ?? [])[0];

  return (
    <Card
      sx={{
        cursor: onView ? "pointer" : "default",
        overflow: "hidden",
        borderRadius: 2,
        boxShadow: 1,
        "&:hover": onView ? { boxShadow: 3 } : {},
      }}
      onClick={onView ? () => onView(item) : undefined}
    >
      {/* Cover Image */}
      {coverImage ? (
        <Box
          component="img"
          src={coverImage}
          alt={item.title}
          sx={{
            width: "100%",
            height: 140,
            objectFit: "cover",
            backgroundColor: "grey.200",
          }}
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
          <ImageIcon sx={{ fontSize: 40, color: "grey.500" }} />
        </Box>
      )}

      <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
        {/* Category & Status */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 1.5,
          }}
        >
          <Chip
            icon={<Storefront sx={{ fontSize: 16 }} />}
            label={item.category || "غير مصنف"}
            size="small"
            sx={{
              backgroundColor: "primary.light",
              color: "primary.main",
              "& .MuiChip-icon": { color: "primary.main" },
            }}
          />
          <Chip
            label={KenzStatusLabels[item.status]}
            size="small"
            sx={{
              backgroundColor: KenzStatusColors[item.status],
              color: "white",
            }}
          />
        </Box>

        <Typography
          variant="subtitle1"
          fontWeight={600}
          sx={{ mb: 1, lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}
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
              lineHeight: 1.4,
            }}
          >
            {item.description}
          </Typography>
        )}

        {/* City & ViewCount */}
        {(item.city || (item.viewCount ?? 0) > 0) && (
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 1 }}>
            {item.city && (
              <Chip
                icon={<LocationOn sx={{ fontSize: 12 }} />}
                label={item.city}
                size="small"
                sx={{
                  backgroundColor: "grey.100",
                  "& .MuiChip-icon": { color: "primary.main" },
                }}
              />
            )}
            {(item.viewCount ?? 0) > 0 && (
              <Chip
                icon={<Visibility sx={{ fontSize: 12 }} />}
                label={item.viewCount}
                size="small"
                sx={{ backgroundColor: "grey.100" }}
              />
            )}
          </Box>
        )}

        {/* Price */}
        {item.price != null && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 1 }}>
            <AttachMoney sx={{ fontSize: 16, color: "success.main" }} />
            <Typography variant="body2" fontWeight={700} color="success.main">
              {formatCurrency(item.price, item.currency)}
            </Typography>
          </Box>
        )}

        {/* Metadata snippet */}
        {item.metadata && Object.keys(item.metadata).length > 0 && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              display: "block",
              mb: 1,
              backgroundColor: "grey.100",
              px: 1,
              py: 0.5,
              borderRadius: 1,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {Object.entries(item.metadata)
              .slice(0, 2)
              .map(([k, v]) => `${k}: ${v}`)
              .join(" • ")}
          </Typography>
        )}

        {/* Footer */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            pt: 0.5,
          }}
        >
          <Typography variant="caption" color="text.secondary">
            {formatDate(item.createdAt)}
          </Typography>
          {onView && (
            <ChevronRight sx={{ fontSize: 16, color: "grey.500" }} />
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default KenzCard;
