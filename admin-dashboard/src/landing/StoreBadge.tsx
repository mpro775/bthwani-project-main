// =============================
// /src/landing/components/StoreBadge.tsx
// =============================
import React from "react";
import { Button, alpha } from "@mui/material";
import { Download } from "@mui/icons-material";

type Props = {
  label: string;
  subtitle?: string;
  href: string;
  dark?: boolean;
};

export const StoreBadge: React.FC<Props> = ({
  label,
  subtitle,
  href,
  dark,
}) => (
  <Button
    variant={dark ? "contained" : "outlined"}
    size="large"
    startIcon={<Download />}
    href={href}
    target="_blank"
    rel="noopener"
    sx={{
      px: 3,
      py: 1.5,
      borderRadius: 2,
      bgcolor: dark ? "#000" : undefined,
      color: dark ? "#fff" : undefined,
      borderColor: dark
        ? undefined
        : (theme) => alpha(theme.palette.text.primary, 0.2),
      "&:hover": {
        transform: "translateY(-2px)",
      },
    }}
  >
    {subtitle ? (
      <span style={{ display: "grid", lineHeight: 1 }}>
        <strong style={{ fontWeight: 800 }}>{label}</strong>
        <small style={{ opacity: 0.8 }}>{subtitle}</small>
      </span>
    ) : (
      <strong style={{ fontWeight: 800 }}>{label}</strong>
    )}
  </Button>
);
