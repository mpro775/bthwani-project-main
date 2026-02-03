// src/pages/admin/delivery/components/StoreInfo.tsx
import { Box, Typography, Paper, useTheme } from "@mui/material";
import type { DeliveryStore } from "../../../type/delivery";

type Props = { store: DeliveryStore };

export default function StoreInfo({ store }: Props) {
  const theme = useTheme();

  return (
    <Paper
      sx={{
        p: 3,
        mb: 4,
        borderRadius: "12px",
        border: `1px solid ${theme.palette.divider}`,
        bgcolor: "background.paper",
        color: "text.primary",
      }}
    >
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <Box sx={{ display: "flex" }}>
          <Typography
            variant="subtitle1"
            sx={{ minWidth: "120px", fontWeight: "bold", color: "inherit" }}
          >
            الاسم:
          </Typography>
          <Typography color="inherit">{store.name}</Typography>
        </Box>

        <Box sx={{ display: "flex" }}>
          <Typography
            variant="subtitle1"
            sx={{ minWidth: "120px", fontWeight: "bold", color: "inherit" }}
          >
            القسم:
          </Typography>
          <Typography color="inherit">{store.category?.name ?? "—"}</Typography>
        </Box>

        <Box sx={{ display: "flex" }}>
          <Typography
            variant="subtitle1"
            sx={{ minWidth: "120px", fontWeight: "bold", color: "inherit" }}
          >
            العنوان:
          </Typography>
          <Typography color="inherit">{store.address}</Typography>
        </Box>

        <Box sx={{ display: "flex" }}>
          <Typography
            variant="subtitle1"
            sx={{ minWidth: "120px", fontWeight: "bold", color: "inherit" }}
          >
            الحالة:
          </Typography>
          <Typography color={store.isActive ? "success.main" : "error.main"}>
            {store.isActive ? "نشط" : "معطل"}
            {store.isOpen !== undefined &&
              ` | ${store.isOpen ? "مفتوح" : "مغلق"}`}
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
}
