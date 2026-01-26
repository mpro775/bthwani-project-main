// src/features/errands/components/primitives/SchedulePicker.tsx
import React, { useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";
import EventIcon from "@mui/icons-material/Event";
import { buildSlots, dayTitle } from "../../helpers";
import theme from "../../../../theme";

export const SchedulePicker: React.FC<{
  value: string | null | undefined;
  onChange: (v: string | null) => void;
}> = ({ value, onChange }) => {
  const [mode, setMode] = useState<"now" | "later">(value ? "later" : "now");
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<0 | 1 | 2>(0);
  const [selected, setSelected] = useState<string | null>(value || null);
  const today = new Date();
  const d0 = new Date(today);
  const d1 = new Date(today);
  d1.setDate(d1.getDate() + 1);
  const d2 = new Date(today);
  d2.setDate(d2.getDate() + 2);
  const tabs = [
    { title: dayTitle(0, d0), slots: buildSlots(0) },
    { title: dayTitle(1, d1), slots: buildSlots(1) },
    { title: dayTitle(2, d2), slots: buildSlots(2) },
  ];

  return (
    <Box sx={{ mb: 1.5 }}>
      <Typography
        variant="caption"
        sx={{
          fontWeight: "bold",
          color: "primary.dark",
          mb: 0.5,
          display: "block",
          fontSize: "0.75rem",
        }}
      >
        وقت التنفيذ
      </Typography>
      <Box sx={{ display: "flex", gap: 1, mb: 1 }}>
        {(["now", "later"] as const).map((t) => (
          <Button
            key={t}
            type="button"
            variant={mode === t ? "contained" : "outlined"}
            onClick={() => {
              setMode(t);
              if (t === "now") onChange(null);
              else setOpen(true);
            }}
            sx={{
              flex: 1,
              borderRadius: 1.5,
              py: 1,
              textTransform: "none",
              color: "white",
              background:theme.palette.primary.dark,
              fontSize: "0.875rem",
              fontWeight: "bold",
            }}
          >
            {t === "now" ? "الآن" : "جدولة"}
          </Button>
        ))}
      </Box>
      {mode === "later" && (
        <Button
          type="button"
          variant="outlined"
          fullWidth
          onClick={() => setOpen(true)}
          sx={{
            justifyContent: "space-between",
            py: 1.5,
            color: "white",
            px: 1.5,
            borderRadius: 1.5,
            textTransform: "none",
          }}
        >
          <Typography
            variant="body2"
            sx={{
              color: selected ? "text.primary" : "primary.dark",
              fontSize: "0.75rem",
            }}
          >
            {selected ? selected.replace("T", " ") : "اختر موعد التنفيذ"}
          </Typography>
          <EventIcon sx={{ fontSize: 20 }} />
        </Button>
      )}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 2, mx: 2, mb: 2 } }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: "bold" }}>
            جدولة المشوار
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ p: 2 }}>
          <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
            {[0, 1, 2].map((i) => (
              <Button
                key={i}
                type="button"
                variant={tab === i ? "contained" : "outlined"}
                onClick={() => setTab(i as 0 | 1 | 2)}
                sx={{
                  flex: 1,
                  borderRadius: 1.5,
                  py: 1,
                  textTransform: "none",
                  fontSize: "0.75rem",
                  fontWeight: "bold",
                }}
              >
                {tabs[i].title}
              </Button>
            ))}
          </Box>
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 1,
              maxHeight: "50vh",
              overflow: "auto",
            }}
          >
            {tabs[tab].slots.map((s) => (
              <Button
                key={s.isoLocal}
                type="button"
                variant={selected === s.isoLocal ? "contained" : "outlined"}
                onClick={() => setSelected(s.isoLocal)}
                sx={{
                  borderRadius: 1,
                  px: 1.5,
                  py: 1,
                  minWidth: "auto",
                  textTransform: "none",
                  fontSize: "0.75rem",
                  fontWeight: "bold",
                }}
              >
                {s.label}
              </Button>
            ))}
          </Box>
        </DialogContent>
        <DialogActions
          sx={{ p: 2, pt: 1, gap: 1, flexDirection: "row-reverse" }}
        >
          <Button
            type="button"
            variant="contained"
            onClick={() => {
              if (!selected) return;
              onChange(selected);
              setOpen(false);
            }}
            disabled={!selected}
            sx={{
              flex: 1,
              borderRadius: 1.5,
              py: 1,
              textTransform: "none",
              fontSize: "0.875rem",
            }}
          >
            تأكيد الموعد
          </Button>
          <Button
            type="button"
            variant="outlined"
            onClick={() => {
              setSelected(null);
              onChange(null);
              setMode("now");
              setOpen(false);
            }}
            sx={{
              flex: 1,
              borderRadius: 1.5,
              py: 1,
              textTransform: "none",
              fontSize: "0.875rem",
            }}
          >
            إلغاء الجدولة
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
