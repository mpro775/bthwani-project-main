// ================================
// File: src/pages/admin/delivery/components/StoresHeader.tsx (new)
// A small, reusable header bar with gradient title and right-side actions
// ================================

import { Box, Typography, useTheme } from "@mui/material";
import type { ReactNode } from "react";

interface StoresHeaderProps {
  title: string;
  icon?: ReactNode;
  actions?: ReactNode;
}

export default function StoresHeader({ title, icon, actions }: StoresHeaderProps) {
  const theme = useTheme();
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        mb: 2.5,
        flexWrap: "wrap",
        gap: 1.5,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
        {icon}
        <Typography
          variant="h5"
          fontWeight={700}
          sx={{
            background: `linear-gradient(to right, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          {title}
        </Typography>
      </Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>{actions}</Box>
    </Box>
  );
}