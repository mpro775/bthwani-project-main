// src/features/errands/components/steps/PickupStep.tsx
import React from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
} from "@mui/material";
import MyLocation from "@mui/icons-material/MyLocation";
import { Field } from "../primitives/Field";
import { Row } from "../primitives/Row";
import type { ErrandForm } from "../../types";
import { useNavigate } from "react-router-dom";
import ErrorBoundary from "../../../../components/common/ErrorBoundary";
import theme from "../../../../theme";

export const PickupStep: React.FC<{
  form: ErrandForm;
  onPoint: (
    which: "pickup" | "dropoff",
    key: keyof ErrandForm["pickup"],
    value: unknown
  ) => void;
  currentStep: number;
}> = ({ form, onPoint, currentStep }) => {
  const navigate = useNavigate();
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
                <MyLocation sx={{ color: "white", fontSize: 24 }} />
              </Box>
              <Typography
                variant="h6"
                sx={{ fontWeight: 700, color: "primary.dark" }}
              >
                موقع الاستلام
              </Typography>
            </Box>
            <Row>
              <Button
                variant="contained"
                sx={{ background: theme.palette.primary.dark }}
                onClick={() =>
                  navigate(`/select-location?storageKey=akhdimni_pickup&step=${currentStep}`)
                }
              >
                اختيار من الخريطة
              </Button>
              <Box sx={{ flex: 1 }}>
                <Field label="وصف/ملصق" labelColor="primary.dark">
                  <TextField
                    value={form.pickup.label || ""}
                    onChange={(e) => onPoint("pickup", "label", e.target.value)}
                    placeholder="مثال: مكتب الطباعة - حدة"
                    fullWidth
                    size="small"
                  />
                </Field>
              </Box>
       
            </Row>
            <Row>
              <Box sx={{ flex: 1 }}>
                <Field label="المدينة" labelColor="primary.dark">
                  <TextField
                    value={form.pickup.city || ""}
                    onChange={(e) => onPoint("pickup", "city", e.target.value)}
                    placeholder="صنعاء"
                    fullWidth
                    size="small"
                  />
                </Field>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Field label="الشارع" labelColor="primary.dark">
                  <TextField
                    value={form.pickup.street || ""}
                    onChange={(e) => onPoint("pickup", "street", e.target.value)}
                    placeholder="مثال: الزبيري"
                    fullWidth
                    size="small"
                  />
                </Field>
              </Box>
            </Row>
           
          </CardContent>
        </Card>
      </Box>
    </ErrorBoundary>
  );
};
