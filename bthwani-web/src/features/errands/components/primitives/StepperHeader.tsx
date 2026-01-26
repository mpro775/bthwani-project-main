// src/features/errands/components/StepperHeader.tsx
import React from "react";
import { Box, Typography } from "@mui/material";
import { STEPS } from "../../constants";
import theme from "../../../../theme";

export const StepperHeader: React.FC<{
  step: number;
  onStepClick?: (stepIndex: number) => void;
}> = ({ step, onStepClick }) => {
  const total = STEPS.length;
  const progress = ((step + 1) / total) * 100;
  return (
    <Box sx={{ px: 2, py: 2, position: "relative" }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {STEPS.map((s, i) => {
          const done = i < step;
          const active = i === step;
          const clickable = done || active || (onStepClick && i <= step);
          return (
            <React.Fragment key={s.key}>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  width: 80,
                }}
              >
                <Box
                  onClick={clickable && onStepClick ? () => onStepClick(i) : undefined}
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    border: 3,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderColor: done
                      ? "success.main"
                      : active
                      ? "primary.main"
                      : "grey.300",
                    backgroundColor: done
                      ? "success.main"
                      : active
                      ? "primary.main"
                      : "background.paper",
                    color: done || active ? "white" : "text.secondary",
                    cursor: clickable ? "pointer" : "default",
                    transition: "all 0.2s ease",
                    "&:hover": clickable ? {
                      transform: "scale(1.1)",
                      boxShadow: 2,
                    } : {},
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{ fontSize: "0.8rem", fontWeight: "bold" }}
                  >
                    {done ? "✓" : i + 1}
                  </Typography>
                </Box>
                <Typography
                  onClick={clickable && onStepClick ? () => onStepClick(i) : undefined}
                  variant="caption"
                  sx={{
                    mt: 1,
                    textAlign: "center",
                    fontSize: "0.7rem",
                    color: done
                      ? "success.main"
                      : active
                      ? "primary.main"
                      : "text.secondary",
                    fontWeight: done || active ? "bold" : "normal",
                    maxWidth: 70,
                    lineHeight: 1.2,
                    cursor: clickable ? "pointer" : "default",
                    transition: "all 0.2s ease",
                    "&:hover": clickable ? {
                      color: done ? "success.dark" : active ? "primary.dark" : "primary.main",
                    } : {},
                  }}
                >
                  {s.title}
                </Typography>
              </Box>
              {i !== total - 1 && (
                <Box
                  sx={{
                    flex: 1,
                    height: 3,
                    mx: 1,
                    backgroundColor: i < step ? "success.main" : "grey.300",
                    borderRadius: 1.5,
                  }}
                />
              )}
            </React.Fragment>
          );
        })}
      </Box>
      <Box
        sx={{
          height: 4,
          borderRadius: 2,
          mt: 2,
          overflow: "hidden",
          position: "relative",
          background: theme.palette.primary.main,
        }}
      >
        <Box
          sx={{
            height: "100%",
            borderRadius: 2,
            width: `${progress}%`,
            transition: "width 0.5s",
            background: theme.palette.primary.main,
          }}
        />
      </Box>
    </Box>
  );
};
