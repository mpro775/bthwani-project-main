// src/features/utilityWater/components/WaterOptionsCard.tsx
import React from "react";
import {
  alpha,
  Box,
  Card,
  CardContent,
  Divider,
  FormControl,
  RadioGroup,
  Typography,
} from "@mui/material";
import { Opacity, WaterDrop, Waves } from "@mui/icons-material";
import { SizeChip } from "./primitives/SizeChip";
import { QuantityStepper } from "./primitives/QuantityStepper";
import type { WaterSizeKey } from "../types";

export const WaterOptionsCard: React.FC<{
  loading: boolean;
  available: boolean;
  sizes: {
    key: WaterSizeKey;
    capacityLiters: number;
    pricePerTanker: number;
  }[];
  selected: WaterSizeKey | null;
  onSelect: (k: WaterSizeKey) => void;
  allowHalf: boolean;
  half: boolean;
  setHalf: (v: boolean) => void;
  qty: number;
  setQty: (n: number) => void;
  displayUnitPrice: number;
  itemsTotal: number;
}> = ({
  loading,
  available,
  sizes,
  selected,
  onSelect,
  allowHalf,
  half,
  setHalf,
  qty,
  setQty,
  displayUnitPrice,
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
            <Opacity sx={{ fontSize: 20 }} /> خيارات وايت الماء
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
              جارٍ تحميل خيارات الماء...
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (!available) {
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
            <Opacity sx={{ fontSize: 20 }} /> خيارات وايت الماء
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
              عذراً، خدمة طلب وايت الماء غير متوفرة حالياً في هذه المدينة.
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
          <Opacity sx={{ fontSize: 20 }} /> خيارات وايت الماء
        </Typography>

        {/* Size Selection */}
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
          <WaterDrop sx={{ fontSize: 16 }} /> اختر الحجم
        </Typography>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 3 }}>
          {sizes.map((s) => (
            <SizeChip
              key={s.key}
              active={selected === s.key}
              onClick={() => onSelect(s.key)}
              label={`${
                s.key === "small" ? "صغير" : s.key === "medium" ? "وسط" : "كبير"
              } • ${s.capacityLiters} لتر`}
              icon={<WaterDrop sx={{ fontSize: 16 }} />}
            />
          ))}
        </Box>

        {/* Half Option */}
        {allowHalf && (
          <>
            <Divider
              sx={{
                my: 3,
                background: (t) => alpha(t.palette.primary.main, 0.2),
              }}
            />
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
              <Waves sx={{ fontSize: 16 }} /> خيار النصف
            </Typography>
            <FormControl component="fieldset">
              <RadioGroup
                value={half ? "half" : "full"}
                onChange={(e) => setHalf(e.target.value === "half")}
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                  gap: 2,
                }}
              >
                {/* استخدم CustomRadio من primitives إذا رغبت؛ هنا تركناه مبدّلًا بسيطًا عبر RadioGroup */}
              </RadioGroup>
            </FormControl>
          </>
        )}

        {/* Quantity Selection */}
        {!half && (
          <>
            <Divider
              sx={{
                my: 3,
                background: (t) => alpha(t.palette.primary.main, 0.2),
              }}
            />
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
              <WaterDrop sx={{ fontSize: 16 }} /> العدد
            </Typography>
            <Box sx={{ mb: 3 }}>
              <QuantityStepper value={qty} onChange={setQty} min={1} />
            </Box>
          </>
        )}

        {/* Pricing Summary */}
        <Divider
          sx={{ my: 3, background: (t) => alpha(t.palette.primary.main, 0.2) }}
        />
        <Box
          sx={{
            p: 2,
            background: (t) => alpha(t.palette.primary.main, 0.05),
            borderRadius: 2,
            border: (t) => `1px solid ${alpha(t.palette.primary.main, 0.2)}`,
          }}
        >
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            سعر الوحدة التقريبي
          </Typography>
          <Typography
            variant="h6"
            sx={{ fontWeight: "bold", color: "success.main", mb: 2 }}
          >
            {displayUnitPrice ? displayUnitPrice.toLocaleString() : "—"} ر.ي
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            إجمالي السلع
          </Typography>
          <Typography
            variant="h5"
            sx={{ fontWeight: "bold", color: "primary.main", mb: 1 }}
          >
            {itemsTotal.toLocaleString()} ر.ي
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ fontStyle: "italic" }}
          >
            * التسعير النهائي ورسوم التوصيل تحدد بعد الإنشاء.
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};
