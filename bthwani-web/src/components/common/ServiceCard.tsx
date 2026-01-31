import React from "react";
import { Card, CardContent, Typography, Box } from "@mui/material";
import {
  DirectionsBike,
  Work,
  DirectionsCar,
  Search,
  AccountBalanceWallet,
  People,
  Storefront,
  Favorite,
} from "@mui/icons-material";

const ICON_MAP: Record<string, React.ElementType> = {
  bicycle: DirectionsBike,
  "briefcase-outline": Work,
  "car-outline": DirectionsCar,
  "search-outline": Search,
  "wallet-outline": AccountBalanceWallet,
  "people-outline": People,
  "storefront-outline": Storefront,
  "heart-outline": Favorite,
};

export interface ServiceCardProps {
  name: string;
  description: string;
  icon: string;
  color: string;
  onClick: () => void;
  disabled?: boolean;
}

const ServiceCard: React.FC<ServiceCardProps> = ({
  name,
  description,
  icon,
  color,
  onClick,
  disabled = false,
}) => {
  const IconComponent = ICON_MAP[icon] || Storefront;

  return (
    <Card
      onClick={disabled ? undefined : onClick}
      sx={{
        height: "100%",
        minHeight: 140,
        borderRadius: 3,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        border: "1px solid",
        borderColor: "divider",
        transition: "all 0.3s ease",
        "&:hover": disabled
          ? {}
          : {
              transform: "translateY(-4px)",
              boxShadow: 6,
              borderColor: color,
            },
      }}
      elevation={2}
    >
      <CardContent
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          py: 3,
          px: 2,
        }}
      >
        <Box
          sx={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            backgroundColor: `${color}20`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mb: 1.5,
          }}
        >
          <IconComponent
            sx={{ fontSize: 32, color: disabled ? "grey.500" : color }}
          />
        </Box>
        <Typography
          variant="subtitle1"
          fontWeight={700}
          sx={{
            mb: 0.5,
            color: disabled ? "text.disabled" : "text.primary",
          }}
        >
          {name}
        </Typography>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            lineHeight: 1.4,
          }}
        >
          {description}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default ServiceCard;
