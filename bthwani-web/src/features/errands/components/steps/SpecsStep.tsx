// src/features/errands/components/steps/SpecsStep.tsx
import React from "react";
import {
  Box,
  Card,
  CardContent,
  Fade,
  TextField,
  Typography,
} from "@mui/material";
import LocalShipping from "@mui/icons-material/LocalShipping";
import StraightenIcon from "@mui/icons-material/Straighten";
import { CATS, SIZES } from "../../constants";
import type { ErrandCategory, ErrandForm, ErrandSize } from "../../types";
import { Field } from "../primitives/Field";
import { Row } from "../primitives/Row";
import { SelectField } from "../primitives/SelectField";
import ErrorBoundary from "../../../../components/common/ErrorBoundary";
import theme from "../../../../theme";

export const SpecsStep: React.FC<{
  form: ErrandForm;
  onSet: <K extends keyof ErrandForm>(k: K, v: ErrandForm[K]) => void;
}> = ({ form, onSet }) => {
  return (
    <ErrorBoundary>
      <Box>
        <Card
          sx={{ borderRadius: 4, border: 2, borderColor: "primary.light", mb: 3 }}
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
                <LocalShipping sx={{ color: "white", fontSize: 24 }} />
              </Box>
              <Typography
                variant="h6"
                  sx={{ fontWeight: 700, color: "primary.dark" }}
              >
                مواصفات المشوار
              </Typography>
            </Box>

            <Fade in={true} timeout={800} mountOnEnter unmountOnExit>
              <Box>
                <SelectField<ErrandCategory>
                  label="نوع الغرض"
                  value={form.category}
                  onChange={(v) => onSet("category", v)}
                  options={CATS.map((c) => ({
                    value: c.key as ErrandCategory,
                    label: c.label,
                  }))}
                  labelColor="primary.dark"
                />
              </Box>
            </Fade>

            <Fade in={true} timeout={1000} mountOnEnter unmountOnExit>
              <Box>
                <SelectField<ErrandSize>
                  label="الحجم التقريبي"
                  value={form.size}
                  onChange={(v) => onSet("size", v)}
                  options={SIZES.map((s) => ({
                    value: s.key as ErrandSize,
                    label: s.label,
                  }))}
                  labelColor="primary.dark"
                />
              </Box>
            </Fade>

            <Fade in={true} timeout={1200} mountOnEnter unmountOnExit>
              <Box>
                <Row>
                  <Box sx={{ flex: 1 }}>
                    <Field label="الوزن التقريبي (كجم)" labelColor="primary.dark">
                      <TextField
                        value={form.weightKg}
                        onChange={(e) => onSet("weightKg", e.target.value)}
                        placeholder="اختياري"
                        fullWidth
                        size="small"
                        type="number"
                        InputProps={{
                          startAdornment: (
                            <Box sx={{ color: "text.secondary", mr: 0.5 }}>
                              <StraightenIcon sx={{ fontSize: 16 }} />
                            </Box>
                          ),
                        }}
                      />
                    </Field>
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Field label="وصف مختصر للغرض" labelColor="primary.dark">
                      <TextField
                        value={form.description}
                        onChange={(e) => onSet("description", e.target.value)}
                        placeholder="مثال: ظرف مستندات رسمية"
                        fullWidth
                        size="small"
                      />
                    </Field>
                  </Box>
                </Row>
              </Box>
            </Fade>
          </CardContent>
        </Card>
      </Box>
    </ErrorBoundary>
  );
};
