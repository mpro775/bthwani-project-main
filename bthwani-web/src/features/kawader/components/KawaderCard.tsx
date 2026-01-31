// مطابق لـ app-user KawaderCard
import React from "react";
import { Card, CardContent, Typography, Box } from "@mui/material";
import { WorkOutline, LocationOn, ChevronRight } from "@mui/icons-material";
import type { KawaderItem } from "../types";
import { KawaderStatusLabels, KawaderStatusColors } from "../types";

interface KawaderCardProps {
  item: KawaderItem;
  onView?: (item: KawaderItem) => void;
}

const KawaderCard: React.FC<KawaderCardProps> = ({ item, onView }) => {
  const formatCurrency = (amount?: number) => {
    if (!amount) return "غير محدد";
    return `${amount.toLocaleString("ar-SA")} ريال`;
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
              backgroundColor: "success.main",
              px: 1.5,
              py: 0.75,
              borderRadius: 1,
            }}
          >
            <Typography variant="body2" fontWeight={700} sx={{ color: "success.dark" }}>
              {formatCurrency(item.budget)}
            </Typography>
          </Box>
          <Box
            sx={{
              px: 1,
              py: 0.5,
              borderRadius: 1,
              backgroundColor: KawaderStatusColors[item.status],
            }}
          >
            <Typography
              variant="caption"
              sx={{ color: "white", fontWeight: 600 }}
            >
              {KawaderStatusLabels[item.status]}
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

        {item.scope && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 1 }}>
            <WorkOutline sx={{ fontSize: 14, color: "primary.main" }} />
            <Typography variant="caption" color="primary.main" fontWeight={500}>
              {item.scope}
            </Typography>
          </Box>
        )}

        {item.metadata?.skills && item.metadata.skills.length > 0 && (
          <Box sx={{ mb: 1 }}>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: "block" }}>
              المهارات:
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
              {item.metadata.skills.slice(0, 2).map((skill, i) => (
                <Typography
                  key={i}
                  variant="caption"
                  sx={{
                    color: "primary.main",
                    backgroundColor: "primary.light",
                    px: 1,
                    py: 0.25,
                    borderRadius: 2,
                  }}
                >
                  {skill}
                </Typography>
              ))}
              {item.metadata.skills.length > 2 && (
                <Typography variant="caption" color="text.secondary">
                  +{item.metadata.skills.length - 2}
                </Typography>
              )}
            </Box>
          </Box>
        )}

        {item.metadata?.location && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <LocationOn sx={{ fontSize: 14, color: "text.secondary" }} />
            <Typography variant="caption" color="text.secondary">
              {item.metadata.location}
              {item.metadata.remote && " (عن بعد)"}
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
            نشر: {new Date(item.createdAt).toLocaleDateString("ar-SA")}
          </Typography>
          {onView && (
            <ChevronRight sx={{ fontSize: 16, color: "grey.500" }} />
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default KawaderCard;
