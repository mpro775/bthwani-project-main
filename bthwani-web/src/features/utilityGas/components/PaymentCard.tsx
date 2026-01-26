// src/features/utilityGas/components/PaymentCard.tsx
import React from "react";
import {
  Card,
  CardContent,
  FormControl,
  RadioGroup,
  Typography,
} from "@mui/material";
import { Payment } from "@mui/icons-material";
import { CustomRadio } from "./primitives/CustomRadio";
import type { PayMethod } from "../types";

export const PaymentCard: React.FC<{
  pm: PayMethod;
  setPM: (p: PayMethod) => void;
  requireAuth: () => boolean;
}> = ({ pm, setPM, requireAuth }) => (
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
        <Payment sx={{ fontSize: 20 }} /> طريقة الدفع
      </Typography>
      <FormControl component="fieldset">
        <RadioGroup
          value={pm}
          onChange={(e) => {
            const value = e.target.value as PayMethod;
            if (value === "wallet" && !requireAuth()) return;
            setPM(value);
          }}
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
            gap: 2,
          }}
        >
          <CustomRadio
            value="cash"
            label="دفع نقدي عند التسليم"
            checked={pm === "cash"}
            onChange={() => setPM("cash")}
          />
          <CustomRadio
            value="wallet"
            label="محفظة إلكترونية"
            checked={pm === "wallet"}
            onChange={() => setPM("wallet")}
          />
          <CustomRadio
            value="mixed"
            label="دفع مختلط"
            checked={pm === "mixed"}
            onChange={() => setPM("mixed")}
          />
          <CustomRadio
            value="card"
            label="بطاقة ائتمانية"
            checked={pm === "card"}
            onChange={() => setPM("card")}
          />
        </RadioGroup>
      </FormControl>
    </CardContent>
  </Card>
);
