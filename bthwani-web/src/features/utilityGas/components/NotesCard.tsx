// src/features/utilityGas/components/NotesCard.tsx
import React from "react";
import {
  alpha,
  Box,
  Card,
  CardContent,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";
import { Notes } from "@mui/icons-material";

export const NotesCard: React.FC<{
  notes: string;
  setNotes: (v: string) => void;
}> = ({ notes, setNotes }) => (
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
        <Notes sx={{ fontSize: 20 }} /> ملاحظات خاصة
      </Typography>
      <Box
        sx={{
          p: 2,
          background: (t) => alpha(t.palette.primary.main, 0.05),
          borderRadius: 2,
          border: (t) => `1px solid ${alpha(t.palette.primary.main, 0.2)}`,
        }}
      >
        <TextField
          fullWidth
          multiline
          rows={4}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="أضف أي ملاحظات خاصة للسائق..."
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment
                position="start"
                sx={{ alignSelf: "flex-start", mt: 1 }}
              >
                <Notes />
              </InputAdornment>
            ),
          }}
        />
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ mt: 1, display: "block" }}
        >
          هذه الملاحظات ستساعد السائق في تقديم خدمة أفضل لك
        </Typography>
      </Box>
    </CardContent>
  </Card>
);
