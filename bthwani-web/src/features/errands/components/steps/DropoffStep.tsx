// src/features/errands/components/steps/DropoffStep.tsx
import React from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
} from "@mui/material";
import LocationOn from "@mui/icons-material/LocationOn";
import { Field } from "../primitives/Field";
import { Row } from "../primitives/Row";
import type { ErrandForm } from "../../types";
import { useNavigate } from "react-router-dom";
import ErrorBoundary from "../../../../components/common/ErrorBoundary";

export const DropoffStep: React.FC<{
  form: ErrandForm;
  onPoint: (
    which: "pickup" | "dropoff",
    key: keyof ErrandForm["pickup"],
    value: unknown
  ) => void;
  localDistanceKm: number | null | undefined;
  currentStep: number;
}> = ({ form, onPoint, localDistanceKm, currentStep }) => {
  const navigate = useNavigate();
  return (
    <ErrorBoundary>
      <Box>
      <Card
        sx={{ borderRadius: 4, border: 2, borderColor: "warning.light", mb: 3 }}
      >
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
            <Box
              sx={{
                background: "primary.dark",
                borderRadius: "50%",
                p: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <LocationOn sx={{ color: "white", fontSize: 24 }} />
            </Box>
            <Typography
              variant="h6"
              sx={{ fontWeight: 700, color: "primary.dark" }}
            >
              موقع التسليم
            </Typography>
          </Box>
          <Row>
          <Button
              variant="contained"
              onClick={() =>
                navigate(`/select-location?storageKey=akhdimni_dropoff&step=${currentStep}`)
              }
            >
              اختيار من الخريطة
            </Button>
            <Box sx={{ flex: 1 }}>
              <Field label="وصف العنوان">
                <TextField
                  value={form.dropoff.label || ""}
                  onChange={(e) => onPoint("dropoff", "label", e.target.value)}
                  placeholder="مثال: بيت العميل - شارع تونس"
                  fullWidth
                  size="small"
                />
              </Field>
            </Box>
          
          </Row>
          <Row>
            <Box sx={{ flex: 1 }}>
              <Field label="المدينة">
                <TextField
                  value={form.dropoff.city || ""}
                  onChange={(e) => onPoint("dropoff", "city", e.target.value)}
                  placeholder="صنعاء"
                  fullWidth
                  size="small"
                />
              </Field>
            </Box>
            <Box sx={{ flex: 1 }}>
              <Field label="الشارع">
                <TextField
                  value={form.dropoff.street || ""}
                  onChange={(e) => onPoint("dropoff", "street", e.target.value)}
                  placeholder="مثال: الجزائر"
                  fullWidth
                  size="small"
                />
              </Field>
            </Box>
          </Row>
          <Row>
            <Box sx={{ flex: 1 }}>
              <Field label="Lat">
                <TextField
                  value={form.dropoff.location.lat ?? ""}
                  type="number"
                  onChange={(e) =>
                    onPoint("dropoff", "location", {
                      ...form.dropoff.location,
                      lat: e.target.value ? Number(e.target.value) : null,
                    })
                  }
                  placeholder="15.36"
                  fullWidth
                  size="small"
                />
              </Field>
            </Box>
            <Box sx={{ flex: 1 }}>
              <Field label="Lng">
                <TextField
                  value={form.dropoff.location.lng ?? ""}
                  type="number"
                  onChange={(e) =>
                    onPoint("dropoff", "location", {
                      ...form.dropoff.location,
                      lng: e.target.value ? Number(e.target.value) : null,
                    })
                  }
                  placeholder="44.20"
                  fullWidth
                  size="small"
                />
              </Field>
            </Box>
          </Row>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              py: 1,
              color: "primary.main",
              fontSize: "0.75rem",
            }}
          >
            <Typography variant="body2">
              المسافة التقريبية:{" "}
              {localDistanceKm != null
                ? `${localDistanceKm.toFixed(2)} كم`
                : "—"}
            </Typography>
          </Box>
        </CardContent>
      </Card>
      </Box>
    </ErrorBoundary>
  );
};
