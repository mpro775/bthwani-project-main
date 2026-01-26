// src/features/errands/components/primitives/Row.tsx
import { Box } from "@mui/material";
import React from "react";

export const Row: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Box
    sx={{
      display: "flex",
      flexDirection: "row-reverse",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 1.5,
      mb: 1,
    }}
  >
    {children}
  </Box>
);
