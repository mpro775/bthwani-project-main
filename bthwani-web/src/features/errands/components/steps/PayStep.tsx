// src/features/errands/components/steps/PayStep.tsx
import React from "react";
import { Box, Card, CardContent, TextField, Typography } from "@mui/material";
import Payment from "@mui/icons-material/Payment";
import { PAY_METHODS } from "../../constants";
import type { ErrandForm, PayMethod } from "../../types";
import { Field } from "../primitives/Field";
import { Row } from "../primitives/Row";
import { SelectField } from "../primitives/SelectField";
import { SchedulePicker } from "../primitives/SchedulePicker";
import ErrorBoundary from "../../../../components/common/ErrorBoundary";
import theme from "../../../../theme";

export const PayStep: React.FC<{
  form: ErrandForm;
  onSet: <K extends keyof ErrandForm>(k: K, v: ErrandForm[K]) => void;
}> = ({ form, onSet }) => {
  return (
    <ErrorBoundary>
      <Box>
      <Card
        sx={{
          borderRadius: 4,
          border: 2,
          borderColor: "secondary.light",
          mb: 3,
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
            <Box
              sx={{
                background:theme.palette.primary.dark,
                borderRadius: "50%",
                p: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Payment sx={{ color: "white", fontSize: 24 }} />
            </Box>
            <Typography
              variant="h6"
              sx={{ fontWeight: 700, color: "primary.dark" }}
            >
              الدفع والجدولة
            </Typography>
          </Box>

          <SelectField<PayMethod>
            label="طريقة الدفع"
            labelColor="primary.dark"
            value={form.paymentMethod}
            onChange={(v) => onSet("paymentMethod", v)}
            options={PAY_METHODS.map((p) => ({ value: p.key, label: p.label }))}
          />

          <SchedulePicker
            value={form.scheduledFor}
            onChange={(d) => onSet("scheduledFor", d)}
          />

          <Row>
          
            <Box sx={{ flex: 1 }}>
              <Field labelColor="primary.dark" label="ملاحظات (اختياري)">
                <TextField
                  value={form.notes}
                  onChange={(e) => onSet("notes", e.target.value)}
                  placeholder="أي تفاصيل إضافية"
                  fullWidth
                  size="small"
                  multiline
                  rows={2}
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
