// src/features/utilityGas/components/SchedulingCard.tsx
import React from "react";
import {
  alpha,
  Box,
  Card,
  CardContent,
  FormControl,
  InputAdornment,
  RadioGroup,
  TextField,
  Typography,
} from "@mui/material";
import { AccessTime, Schedule } from "@mui/icons-material";
import { CustomRadio } from "./primitives/CustomRadio";

export const SchedulingCard: React.FC<{
  mode: "now" | "later";
  setMode: (m: "now" | "later") => void;
  scheduledFor: string;
  setScheduledFor: (v: string) => void;
}> = ({ mode, setMode, scheduledFor, setScheduledFor }) => (
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
        <AccessTime sx={{ fontSize: 20 }} /> وقت التسليم
      </Typography>
      <FormControl component="fieldset">
        <RadioGroup
          value={mode}
          onChange={(e) => setMode(e.target.value as "now" | "later")}
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
            gap: 2,
          }}
        >
          <CustomRadio
            value="now"
            label="تسليم فوري"
            checked={mode === "now"}
            onChange={() => setMode("now")}
          />
          <CustomRadio
            value="later"
            label="جدولة التسليم"
            checked={mode === "later"}
            onChange={() => setMode("later")}
          />
        </RadioGroup>
      </FormControl>
      {mode === "later" && (
        <Box
          sx={{
            mt: 3,
            p: 2,
            background: (t) => alpha(t.palette.primary.main, 0.05),
            borderRadius: 2,
            border: (t) => `1px solid ${alpha(t.palette.primary.main, 0.2)}`,
          }}
        >
          <TextField
            fullWidth
            value={scheduledFor}
            onChange={(e) => setScheduledFor(e.target.value)}
            placeholder="اختر التاريخ والوقت (YYYY-MM-DD HH:mm)"
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Schedule />
                </InputAdornment>
              ),
            }}
          />
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ mt: 1, display: "block" }}
          >
            يمكنك جدولة التسليم لوقت لاحق حسب راحتك
          </Typography>
        </Box>
      )}
    </CardContent>
  </Card>
);
