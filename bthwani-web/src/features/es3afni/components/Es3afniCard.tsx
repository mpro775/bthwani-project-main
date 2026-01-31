// مطابق لـ app-user Es3afniCard
import React from "react";
import { Card, CardContent, Typography, Box } from "@mui/material";
import {
  WaterDrop,
  LocationOn,
  Science,
  Phone,
  ChevronRight,
} from "@mui/icons-material";
import type { Es3afniItem } from "../types";
import { Es3afniStatusLabels, Es3afniStatusColors } from "../types";

interface Es3afniCardProps {
  item: Es3afniItem;
  onView?: (item: Es3afniItem) => void;
}

const Es3afniCard: React.FC<Es3afniCardProps> = ({ item, onView }) => {
  const formatDate = (dateString?: string | Date) => {
    if (!dateString) return "غير محدد";
    try {
      const d =
        dateString instanceof Date ? dateString : new Date(dateString);
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

  return (
    <Card
      sx={{
        mb: 2,
        cursor: onView ? "pointer" : "default",
        borderRadius: 2,
        boxShadow: 1,
        "&:hover": onView ? { boxShadow: 3 } : {},
      }}
      onClick={onView ? () => onView(item) : undefined}
    >
      <CardContent sx={{ p: 2 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 1.5,
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              backgroundColor: "error.main",
              px: 1.5,
              py: 0.75,
              borderRadius: 1,
            }}
          >
            <WaterDrop sx={{ fontSize: 20, color: "white" }} />
            <Typography
              variant="body2"
              fontWeight={700}
              sx={{ color: "white", ml: 0.75 }}
            >
              {item.bloodType || "غير محدد"}
            </Typography>
          </Box>
          <Box
            sx={{
              px: 1,
              py: 0.5,
              borderRadius: 1,
              backgroundColor: Es3afniStatusColors[item.status],
            }}
          >
            <Typography variant="caption" sx={{ color: "white", fontWeight: 600 }}>
              {Es3afniStatusLabels[item.status]}
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
              lineHeight: 1.4,
            }}
          >
            {item.description}
          </Typography>
        )}

        {item.location?.address && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 1 }}>
            <LocationOn sx={{ fontSize: 16, color: "grey.500" }} />
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {item.location.address}
            </Typography>
          </Box>
        )}

        {item.metadata?.unitsNeeded && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 1 }}>
            <Science sx={{ fontSize: 14, color: "text.secondary" }} />
            <Typography variant="caption" color="text.secondary">
              مطلوب: {item.metadata.unitsNeeded} وحدة
            </Typography>
          </Box>
        )}

        {item.metadata?.contact && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 1 }}>
            <Phone sx={{ fontSize: 14, color: "text.secondary" }} />
            <Typography variant="caption" color="text.secondary">
              {item.metadata.contact}
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
            إنشاء: {formatDate(item.createdAt)}
          </Typography>
          {onView && (
            <ChevronRight sx={{ fontSize: 16, color: "grey.500" }} />
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default Es3afniCard;
