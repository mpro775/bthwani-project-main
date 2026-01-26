// src/features/utilityGas/components/PricingCard.tsx
import React from "react";
import {
  alpha,
  Box,
  Card,
  CardContent,
  Divider,
  Typography,
} from "@mui/material";
import { GasMeter, LocalGasStation } from "@mui/icons-material";
import { QuantityStepper } from "./primitives/QuantityStepper";

export const PricingCard: React.FC<{
  loading: boolean;
  optionsAvailable: boolean;
  cylinderSize: number;
  unitPrice: number;
  qty: number;
  setQty: (n: number) => void;
  minQty: number;
  itemsTotal: number;
}> = ({
  loading,
  optionsAvailable,
  cylinderSize,
  unitPrice,
  qty,
  setQty,
  minQty,
  itemsTotal,
}) => {
  if (loading) {
    return (
      <Card sx={{ mb: 3, borderRadius: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: "bold",
              color: "primary.main",
              mb: 3,
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <GasMeter sx={{ fontSize: 20 }} /> معلومات التسعير
          </Typography>
          <Box
            sx={{
              py: 3,
              textAlign: "center",
              background: (t) => alpha(t.palette.primary.main, 0.05),
              borderRadius: 2,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              جارٍ تحميل معلومات التسعير...
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (!optionsAvailable) {
    return (
      <Card sx={{ mb: 3, borderRadius: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: "bold",
              color: "primary.main",
              mb: 3,
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <GasMeter sx={{ fontSize: 20 }} /> معلومات التسعير
          </Typography>
          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              border: "1px solid",
              borderColor: "warning.main",
              background: (t) => alpha(t.palette.warning.main, 0.1),
            }}
          >
            <Typography variant="body2">
              عذراً، خدمة طلب دبة الغاز غير متوفرة حالياً في هذه المدينة.
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ mb: 3, borderRadius: 3 }}>
      <CardContent sx={{ p: 3 }}>
        <Typography
          variant="h6"
          sx={{
            fontWeight: "bold",
            color: "primary.main",
            mb: 3,
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <GasMeter sx={{ fontSize: 20 }} /> معلومات التسعير
        </Typography>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 2,
            mb: 3,
            p: 2,
            background: (t) => alpha(t.palette.primary.main, 0.05),
            borderRadius: 2,
          }}
        >
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
              حجم الأسطوانة
            </Typography>
            <Typography
              variant="h6"
              sx={{ fontWeight: "bold", color: "primary.main" }}
            >
              {cylinderSize} لتر
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
              سعر الأسطوانة
            </Typography>
            <Typography
              variant="h6"
              sx={{ fontWeight: "bold", color: "success.main" }}
            >
              {unitPrice.toLocaleString()} ر.ي
            </Typography>
          </Box>
        </Box>

        <Typography
          variant="body2"
          sx={{
            fontWeight: "bold",
            color: "primary.main",
            mb: 2,
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <LocalGasStation sx={{ fontSize: 16 }} /> اختر الكمية
        </Typography>

        <Box sx={{ mb: 3 }}>
          <QuantityStepper
            value={qty}
            onChange={(v) => setQty(Math.max(minQty, v))}
            min={minQty}
          />
        </Box>

        <Divider sx={{ my: 3 }} />

        <Box
          sx={{
            p: 2,
            background: (t) =>
              `linear-gradient(45deg, ${t.palette.primary.main}, ${t.palette.secondary.main})`,
            borderRadius: 2,
            color: "white",
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>
            إجمالي السلع
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: "bold" }}>
            {itemsTotal.toLocaleString()} ر.ي
          </Typography>
        </Box>
        <Typography
          variant="caption"
          sx={{
            color: "text.secondary",
            mt: 1,
            display: "block",
            fontStyle: "italic",
          }}
        >
          * رسوم التوصيل تُحسب حسب السياسة (ثابت/مسافة) وتظهر بعد إنشاء الطلب.
        </Typography>
      </CardContent>
    </Card>
  );
};
