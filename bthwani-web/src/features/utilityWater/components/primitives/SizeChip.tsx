// src/features/utilityWater/components/primitives/SizeChip.tsx
import React from "react";
import { Chip } from "@mui/material";

export const SizeChip: React.FC<{
  active: boolean;
  label: string;
  onClick: () => void;
  icon?: React.ReactElement;
}> = ({ active, label, onClick, icon }) => (
  <Chip
    label={label}
    onClick={onClick}
    color={active ? "primary" : "default"}
    variant={active ? "filled" : "outlined"}
    icon={icon as React.ReactElement}
    sx={{ m: "4px 8px 4px 0", borderRadius: 2, fontWeight: 500 }}
  />
);
