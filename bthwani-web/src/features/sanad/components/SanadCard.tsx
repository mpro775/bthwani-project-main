// مطابق لـ app-user SanadCard
import React from "react";
import { Card, CardContent, Typography, Box } from "@mui/material";
import {
  WorkOutline,
  Warning,
  Favorite,
  HelpOutline,
  LocationOn,
  ChevronRight,
} from "@mui/icons-material";
import type { SanadItem } from "../types";
import {
  SanadKindLabels,
  SanadStatusLabels,
  SanadStatusColors,
  SanadKindColors,
} from "../types";

interface SanadCardProps {
  item: SanadItem;
  onView?: (item: SanadItem) => void;
}

const getKindIcon = (kind?: string) => {
  switch (kind) {
    case "specialist":
      return <WorkOutline sx={{ fontSize: 16 }} />;
    case "emergency":
      return <Warning sx={{ fontSize: 16 }} />;
    case "charity":
      return <Favorite sx={{ fontSize: 16 }} />;
    default:
      return <HelpOutline sx={{ fontSize: 16 }} />;
  }
};

const SanadCard: React.FC<SanadCardProps> = ({ item, onView }) => {
  const kindColor =
    item.kind && item.kind in SanadKindColors
      ? SanadKindColors[item.kind]
      : "#9e9e9e";

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
              gap: 0.5,
              backgroundColor: "grey.200",
              px: 1,
              py: 0.5,
              borderRadius: 1,
            }}
          >
            <Box sx={{ color: kindColor }}>{getKindIcon(item.kind)}</Box>
            <Typography variant="caption" fontWeight={600} sx={{ color: kindColor }}>
              {item.kind ? SanadKindLabels[item.kind] : "غير محدد"}
            </Typography>
          </Box>
          <Box
            sx={{
              px: 1,
              py: 0.5,
              borderRadius: 1,
              backgroundColor: SanadStatusColors[item.status],
            }}
          >
            <Typography
              variant="caption"
              sx={{ color: "white", fontWeight: 600 }}
            >
              {SanadStatusLabels[item.status]}
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

        {item.metadata?.location && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 1 }}>
            <LocationOn sx={{ fontSize: 14, color: "text.secondary" }} />
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {item.metadata.location}
            </Typography>
          </Box>
        )}

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mt: 1.5,
            pt: 1,
          }}
        >
          <Typography variant="caption" color="text.secondary">
            {new Date(item.createdAt).toLocaleDateString("ar-SA")}
          </Typography>
          {onView && <ChevronRight sx={{ fontSize: 16, color: "grey.500" }} />}
        </Box>
      </CardContent>
    </Card>
  );
};

export default SanadCard;
