// src/components/CharacterCounter.tsx
import React from "react";
import { Box, Typography } from "@mui/material";

interface CharacterCounterProps {
  current: number;
  max: number;
  showWarning?: boolean;
  warningThreshold?: number; // نسبة مئوية لإظهار التحذير
}

export const CharacterCounter: React.FC<CharacterCounterProps> = ({
  current,
  max,
  showWarning = true,
  warningThreshold = 80,
}) => {
  const percentage = (current / max) * 100;
  const isWarning = showWarning && percentage >= warningThreshold;
  const isError = current > max;



  const getTextColor = () => {
    if (isError) return "error";
    if (isWarning) return "warning";
    return "inherit";
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "flex-end",
        alignItems: "center",
        mt: 0.5,
      }}
    >
      <Typography
        variant="caption"
        color={getTextColor()}
        sx={{
          fontSize: "0.75rem",
          fontWeight: isError || isWarning ? 500 : 400,
        }}
      >
        {current}/{max}
      </Typography>
    </Box>
  );
};
