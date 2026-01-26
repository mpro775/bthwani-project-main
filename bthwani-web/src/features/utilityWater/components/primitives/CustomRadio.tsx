// src/features/utilityWater/components/primitives/CustomRadio.tsx
import React from "react";
import { Box, FormControlLabel, Radio, Typography } from "@mui/material";

export const CustomRadio: React.FC<{
  value: string;
  label: string;
  checked: boolean;
  onChange: () => void;
  icon?: React.ReactNode;
}> = ({ value, label, checked, onChange, icon }) => (
  <FormControlLabel
    value={value}
    control={
      <Radio
        checked={checked}
        onChange={onChange}
        sx={{
          color: "primary.main",
          "&.Mui-checked": { color: "primary.main" },
        }}
      />
    }
    label={
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        {icon}
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          {label}
        </Typography>
      </Box>
    }
  />
);
