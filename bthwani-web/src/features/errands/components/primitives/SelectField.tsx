// src/features/errands/components/primitives/SelectField.tsx
import  { useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import RadioButtonCheckedIcon from "@mui/icons-material/RadioButtonChecked";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";

export function SelectField<T extends string>({
  label,
  value,
  onChange,
  options,
  placeholder = "اختر…",
  labelColor = "primary.main",
}: {
  label: string;
  value?: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
  placeholder?: string;
  labelColor?: string;
}) {
  const [open, setOpen] = useState(false);
  const current = options.find((o) => o.value === value);
  return (
    <Box sx={{ mb: 1.5 }}>
      <Typography
        variant="caption"
        sx={{
          fontWeight: "bold",
          color: labelColor,
          mb: 0.5,
          display: "block",
          fontSize: "0.75rem",
        }}
      >
        {label}
      </Typography>
      <Button
        type="button"
        variant="outlined"
        fullWidth
        onClick={() => setOpen(true)}
        sx={{
          justifyContent: "space-between",
          py: 1.5,
          px: 1.5,
          borderRadius: 1.5,
          borderColor: labelColor,
          textTransform: "none",
          "&:hover": { borderColor: "primary.main" },
        }}
      >
        <Typography
          variant="body2"
          sx={{
            color: current ? "text.primary" : "text.secondary",
            fontSize: "0.75rem",
          }}
        >
          {current?.label || placeholder}
        </Typography>
        <ExpandMoreIcon sx={{ color: "primary.main", fontSize: 20 }} />
      </Button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 2, mx: 2, mb: 2 } }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Typography
            variant="body1"
            sx={{ fontWeight: "bold", color: "primary.main" }}
          >
            {label}
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          {options.map((o) => (
            <Button
              key={o.value}
              onClick={() => {
                onChange(o.value);
                setOpen(false);
              }}
              fullWidth
              sx={{
                justifyContent: "space-between",
                py: 1.5,
                px: 2,
                borderRadius: 0,
                textTransform: "none",
                color: value === o.value ? "primary.main" : "text.primary",
                backgroundColor:
                  value === o.value ? "primary.light" : "transparent",
                "&:hover": {
                  backgroundColor:
                    value === o.value ? "primary.light" : "grey.50",
                },
              }}
            >
              <Typography variant="body2">{o.label}</Typography>
              {value === o.value ? (
                <RadioButtonCheckedIcon sx={{ color: "primary.main" }} />
              ) : (
                <RadioButtonUncheckedIcon sx={{ color: "text.disabled" }} />
              )}
            </Button>
          ))}
        </DialogContent>
      </Dialog>
    </Box>
  );
}
