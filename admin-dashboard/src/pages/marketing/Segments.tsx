// src/routes/marketing/Segments.tsx
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Box, Card, CardContent, Typography, Button, TextField, ThemeProvider, createTheme } from "@mui/material";
import axios from "../../utils/axios";

// إنشاء موضوع RTL
const rtlTheme = createTheme({
  direction: 'rtl',
  typography: {
    fontFamily: 'Segoe UI, Tahoma, Arial, sans-serif',
  },
});

export default function Segments() {
  const [name, setName] = useState("");
  const [rules, setRules] = useState(`[{"field":"last_order_days","op":">","value":30}]`);
  const [dynamic, setDynamic] = useState(true);
  const [preview, setPreview] = useState<{ count: number } | null>(null);

  const previewMut = useMutation({
    mutationFn: async () =>
      (await axios.post("/segments/preview", { rules: JSON.parse(rules) })).data,
    onSuccess: setPreview,
  });

  const syncMut = useMutation({
    mutationFn: async () =>
      (await axios.post("/segments/sync", { name, rules: JSON.parse(rules), dynamic })).data,
  });

  return (
    <ThemeProvider theme={rtlTheme}>
      <Box sx={{ direction: 'rtl', display: "flex", flexDirection: "column", gap: 2 }}>
        <Typography variant="h6">الشرائح</Typography>

        <Card><CardContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField label="الاسم" value={name} onChange={(e) => setName(e.target.value)} />
            <TextField label="القواعد (JSON)" value={rules} onChange={(e) => setRules(e.target.value)} multiline minRows={6} />
            <TextField select label="النوع" value={dynamic ? "dynamic" : "static"} onChange={(e) => setDynamic(e.target.value === "dynamic")} SelectProps={{ native: true }}>
              <option value="dynamic">ديناميكي</option>
              <option value="static">ثابت (لقطة)</option>
            </TextField>
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button variant="contained" onClick={() => previewMut.mutate()}>معاينة</Button>
              <Button variant="outlined" onClick={() => syncMut.mutate()}>مزامنة</Button>
            </Box>
          </Box>
        </CardContent></Card>

        <Card><CardContent>
          <Typography variant="overline">معاينة</Typography>
          <Typography variant="body2">العدد: {preview?.count ?? "—"}</Typography>
        </CardContent></Card>
      </Box>
    </ThemeProvider>
  );
}
