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
        backgroundColor: theme.palette.background.paper,
      }}
    >
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <Box sx={{ display: "flex" }}>
          <Typography
            variant="subtitle1"
            sx={{ minWidth: "120px", fontWeight: "bold" }}
          >
            الاسم:
          </Typography>
          <Typography>{store.name}</Typography>
        </Box>

        <Box sx={{ display: "flex" }}>
          <Typography
            variant="subtitle1"
            sx={{ minWidth: "120px", fontWeight: "bold" }}
          >
            القسم:
          </Typography>
          <Typography>{store.category.name}</Typography>
        </Box>

        <Box sx={{ display: "flex" }}>
          <Typography
            variant="subtitle1"
            sx={{ minWidth: "120px", fontWeight: "bold" }}
          >
            العنوان:
          </Typography>
          <Typography>{store.address}</Typography>
        </Box>

        <Box sx={{ display: "flex" }}>
          <Typography
            variant="subtitle1"
            sx={{ minWidth: "120px", fontWeight: "bold" }}
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
