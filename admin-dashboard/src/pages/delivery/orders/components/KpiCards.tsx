// src/orders/KpiCards.tsx
import { Box, Paper, Stack, Typography, LinearProgress, Tooltip } from "@mui/material";
import { alpha } from "@mui/material/styles";
import {
  Assignment,          // إجمالي الطلبات
  LocalShipping,       // تم التوصيل
  Cancel,              // ملغاة
          // متوسط الفاتورة
} from "@mui/icons-material";
import type { OrderRow } from "../types";

const nf = new Intl.NumberFormat("ar-EG", { maximumFractionDigits: 0 });

export default function KpiCards({ rows }: { rows: OrderRow[] }) {
  const total = rows.length;
  const delivered = rows.filter((r) => r.status === "delivered").length;
  const cancelled = rows.filter((r) => r.status === "cancelled").length;

  const deliveredRate = total ? Math.round((delivered / total) * 100) : 0;
  const cancelledRate = total ? Math.round((cancelled / total) * 100) : 0;

  const cards: Array<{
    key: string;
    label: string;
    value: string;
    hint?: string;
    icon: React.ElementType;
    color: "primary" | "success" | "error" | "warning" | "info";
    progress?: number; // لو موجود يظهر شريط تقدم
  }> = [
    {
      key: "total",
      label: "الطلبات",
      value: nf.format(total),
      icon: Assignment,
      color: "primary",
    },
    {
      key: "delivered",
      label: "تم التوصيل",
      value: nf.format(delivered),
      hint: `${deliveredRate}% من الإجمالي`,
      icon: LocalShipping,
      color: "success",
      progress: deliveredRate,
    },
    {
      key: "cancelled",
      label: "ملغاة",
      value: nf.format(cancelled),
      hint: `${cancelledRate}% من الإجمالي`,
      icon: Cancel,
      color: "error",
      progress: cancelledRate,
    },
   
  ];

  return (
    <Box
      className="mb-2"
      sx={{
        display: "grid",
        gap: 2,
        gridTemplateColumns: {
          xs: "1fr",
          sm: "1fr 1fr",
          md: "repeat(3, 1fr)",
          lg: "repeat(5, 1fr)", // خمس بطاقات في الصف على الشاشات الكبيرة
        },
      }}
    >
      {cards.map((c) => {
        const Icon = c.icon;
        return (
          <Paper
            key={c.key}
            sx={(theme) => ({
              p: 2,
              borderRadius: 3,
              border: "1px solid",
              borderColor: "divider",
              boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
              background: `linear-gradient(135deg, ${alpha(
                theme.palette[c.color].main,
                0.06
              )} 0%, rgba(255,255,255,0.9) 100%)`,
              display: "flex",
              flexDirection: "column",
              gap: 1,
              minHeight: 112,
            })}
          >
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Typography variant="body2" color="text.secondary">
                {c.label}
              </Typography>

              <Box
                sx={(theme) => ({
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  display: "grid",
                  placeItems: "center",
                  backgroundColor: alpha(theme.palette[c.color].main, 0.12),
                  color: theme.palette[c.color].main,
                  boxShadow: `inset 0 0 0 1px ${alpha(theme.palette[c.color].main, 0.18)}`,
                })}
              >
                <Icon fontSize="small" />
              </Box>
            </Stack>

            <Stack spacing={0.5}>
              <Typography variant="h5" fontWeight={800} sx={{ lineHeight: 1.1 }}>
                {c.value}
              </Typography>

              {c.hint && (
                <Tooltip title={c.hint}>
                  <Typography variant="caption" color="text.secondary">
                    {c.hint}
                  </Typography>
                </Tooltip>
              )}

              {typeof c.progress === "number" && (
                <LinearProgress
                  variant="determinate"
                  value={c.progress}
                  sx={(theme) => ({
                    mt: 0.5,
                    height: 6,
                    borderRadius: 999,
                    backgroundColor: alpha(theme.palette[c.color].main, 0.12),
                    "& .MuiLinearProgress-bar": {
                      borderRadius: 999,
                      backgroundColor: theme.palette[c.color].main,
                    },
                  })}
                />
              )}
            </Stack>
          </Paper>
        );
      })}
    </Box>
  );
}
