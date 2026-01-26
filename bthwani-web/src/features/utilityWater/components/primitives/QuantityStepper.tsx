// src/features/utilityWater/components/primitives/QuantityStepper.tsx
import React from "react";
import { Box, IconButton, Typography, alpha } from "@mui/material";
import { Add, Remove } from "@mui/icons-material";

export const QuantityStepper: React.FC<{
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
}> = ({ value, onChange, min = 1, max = 20 }) => (
  <Box
    sx={{
      display: "flex",
      alignItems: "center",
      gap: 2,
      p: 1,
      background: alpha("#2196F3", 0.05),
      borderRadius: 3,
      border: `1px solid ${alpha("#2196F3", 0.2)}`,
    }}
  >
    <IconButton
      onClick={() => onChange(Math.max(min, value - 1))}
      disabled={value <= min}
      sx={{ width: 40, height: 40 }}
    >
      <Remove sx={{ color: value <= min ? "#999" : "#2196F3" }} />
    </IconButton>
    <Typography
      variant="h6"
      sx={{
        minWidth: 40,
        textAlign: "center",
        fontWeight: "bold",
        color: "primary.main",
      }}
    >
      {value}
    </Typography>
    <IconButton
      onClick={() => onChange(Math.min(max, value + 1))}
      disabled={value >= max}
      sx={{ width: 40, height: 40 }}
    >
      <Add sx={{ color: value >= max ? "#999" : "#2196F3" }} />
    </IconButton>
  </Box>
);
