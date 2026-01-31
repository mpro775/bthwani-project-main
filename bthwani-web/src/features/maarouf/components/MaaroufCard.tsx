// مطابق لـ app-user MaaroufCard
import React from "react";
import { Card, CardContent, Typography, Box } from "@mui/material";
import { ChevronRight } from "@mui/icons-material";
import type { MaaroufItem } from "../types";
import {
  MaaroufKindLabels,
  MaaroufStatusLabels,
  MaaroufStatusColors,
} from "../types";

interface MaaroufCardProps {
  item: MaaroufItem;
  onView?: (item: MaaroufItem) => void;
}

const getKindText = (kind?: string) => {
  switch (kind) {
    case "lost":
      return "مفقود";
    case "found":
      return "موجود";
    default:
      return "غير محدد";
  }
};

const MaaroufCard: React.FC<MaaroufCardProps> = ({ item, onView }) => {
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
              backgroundColor: "grey.300",
              px: 1,
              py: 0.5,
              borderRadius: 1,
            }}
          >
            <Typography variant="caption" fontWeight={600}>
              {getKindText(item.kind)}
            </Typography>
          </Box>
          <Box
            sx={{
              px: 1,
              py: 0.5,
              borderRadius: 1,
              backgroundColor: MaaroufStatusColors[item.status],
            }}
          >
            <Typography
              variant="caption"
              sx={{ color: "white", fontWeight: 600 }}
            >
              {MaaroufStatusLabels[item.status]}
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

        {item.tags && item.tags.length > 0 && (
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 0.5,
              mb: 1.5,
            }}
          >
            {item.tags.slice(0, 3).map((tag, i) => (
              <Typography
                key={i}
                variant="caption"
                sx={{
                  color: "primary.main",
                  backgroundColor: "primary.light",
                  px: 1,
                  py: 0.25,
                  borderRadius: 2,
                  mr: 0.5,
                }}
              >
                #{tag}
              </Typography>
            ))}
            {item.tags.length > 3 && (
              <Typography variant="caption" color="text.secondary">
                +{item.tags.length - 3}
              </Typography>
            )}
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

export default MaaroufCard;
