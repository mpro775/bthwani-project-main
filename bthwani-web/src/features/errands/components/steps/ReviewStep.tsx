// src/features/errands/components/steps/ReviewStep.tsx
import React from "react";
import { Box, Button, Card, CardContent, Typography } from "@mui/material";
import Calculate from "@mui/icons-material/Calculate";
import CheckCircle from "@mui/icons-material/CheckCircle";
import { CATS, PAY_METHODS, SIZES } from "../../constants";
import type { ErrandForm } from "../../types";
import ErrorBoundary from "../../../../components/common/ErrorBoundary";
import theme from "../../../../theme";

export const ReviewStep: React.FC<{
  form: ErrandForm;
  estimate: {
    distanceKm?: number | null;
    deliveryFee?: number | null;
    totalWithTip?: number | null;
  };
  feeLoading: boolean;
  canEstimate: boolean;
  localDistanceKm: number | null | undefined;
  onFetchEstimate: () => void;
}> = ({
  form,
  estimate,
  feeLoading,
  canEstimate,
  localDistanceKm,
  onFetchEstimate,
}) => {
  return (
    <ErrorBoundary>
      <Box>
      <Card
        sx={{ borderRadius: 4, border: 2, borderColor: "primary.dark", mb: 3 }}
      >
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
            <Box
              sx={{
                background: theme.palette.primary.dark,
                borderRadius: "50%",

                p: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CheckCircle sx={{ color: "white", fontSize: 24 }} />
            </Box>
            <Typography
              variant="h6"
              sx={{ fontWeight: 700, color: "primary.dark" }}
            >
              مراجعة الطلب والتأكيد
            </Typography>
          </Box>

          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 1,
              fontSize: "0.75rem",
            }}
          >
            <RowLabel
              label="النوع/الحجم"
              value={`${CATS.find((c) => c.key === form.category)?.label} — ${
                SIZES.find((s) => s.key === form.size)?.label
              }`}
            />
            <RowLabel
              label="الاستلام"
              value={`${form.pickup.label || "—"}${
                form.pickup.city ? ` • ${form.pickup.city}` : ""
              }`}
            />
            <RowLabel
              label="التسليم"
              value={`${form.dropoff.label || "—"}${
                form.dropoff.city ? ` • ${form.dropoff.city}` : ""
              }`}
            />
            <RowLabel
              label="الدفع"
              value={`${
                PAY_METHODS.find((p) => p.key === form.paymentMethod)?.label
              }`}
            />
            <RowLabel
              label="الجدولة"
              value={
                form.scheduledFor ? form.scheduledFor.replace("T", " ") : "الآن"
              }
            />
            {!!form.tip && (
              <RowLabel label="بقشيش" value={`${form.tip} ريال`} />
            )}
          </Box>
        </CardContent>
      </Card>

      <Card
        sx={{ borderRadius: 4, border: 2, borderColor: "primary.dark", mb: 3 }}
      >
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
            <Box
              sx={{
                background: theme.palette.primary.dark,
                borderRadius: "50%",
                p: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Calculate sx={{ color: "white", fontSize: 24 }} />
            </Box>
            <Typography
              variant="h6"
              sx={{ fontWeight: 700, color: "primary.dark" }}
            >
              تقدير التكلفة
            </Typography>
          </Box>

          <Button
            type="button"
            variant="contained"
            onClick={onFetchEstimate}
            disabled={feeLoading || !canEstimate}
            sx={{ mb: 2 }}
          >
            {feeLoading ? "جارٍ حساب السعر..." : "احسب السعر التقريبي"}
          </Button>

          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 1.5,
              fontSize: "0.8rem",
              p: 2,
              borderRadius: 2,
              border: "1px solid",
              borderColor: "primary.dark",
            }}
          >
            <RowLabel
              label="المسافة التقريبية"
              value={
                estimate.distanceKm != null
                  ? `${estimate.distanceKm.toFixed(2)} كم`
                  : localDistanceKm != null
                  ? `${localDistanceKm.toFixed(2)} كم (محلي)`
                  : "—"
              }
                strongColor="primary.dark"
            />
            <RowLabel
              label="رسوم التوصيل"
              value={
                estimate.deliveryFee != null
                  ? `${estimate.deliveryFee} ريال`
                  : "—"
              }
              strongColor="primary.dark"
            />
            <RowLabel
              label="الإجمالي مع البقشيش"
              value={
                estimate.totalWithTip != null
                  ? `${estimate.totalWithTip} ريال`
                  : "—"
              }
              strong
              isLarge
            />
          </Box>
        </CardContent>
      </Card>
      </Box>
    </ErrorBoundary>
  );
};

const RowLabel: React.FC<{
  label: string;
  value: string;
  strong?: boolean;
  strongColor?: string;
  isLarge?: boolean;
}> = ({ label, value, strong, strongColor, isLarge }) => (
  <Box
    sx={{
      display: "flex",
      flexDirection: "row-reverse",
      justifyContent: "space-between",
      alignItems: "center",
      p: 1,
    }}
  >
    <Typography variant="body2" color="primary.dark">
      {label}
    </Typography>
    <Typography
      variant={isLarge ? "h6" : "body2"}
      sx={{
        fontWeight: strong ? "bold" : 500,
        color: strongColor || "primary.main",
      }}
    >
      {value}
    </Typography>
  </Box>
);
