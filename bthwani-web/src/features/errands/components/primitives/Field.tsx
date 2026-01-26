// src/features/errands/components/primitives/Field.tsx
import { Box, Typography } from "@mui/material";
import React from "react";

export const Field: React.FC<{
  label: string;
  required?: boolean;
  children: React.ReactNode;
  labelColor?: string;
}> = ({ label, required, children, labelColor = "primary.main" }) => (
  <Box sx={{ mb: 1.5 }}>
    <Typography
      variant="caption"
      sx={{
        fontWeight: "bold",
        color: labelColor,
        mb: 0.5,
        display: "block",
        fontSize: "0.75rem",
      }}
    >
      {label}{" "}
      {required && (
        <Typography component="span" sx={{ color: "error.main" }}>
          *
        </Typography>
      )}
    </Typography>
    {children}
  </Box>
);
