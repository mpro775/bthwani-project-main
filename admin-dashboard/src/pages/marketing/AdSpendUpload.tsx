// src/routes/marketing/AdSpendUpload.tsx
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Box, Card, CardContent, Typography, Button, TextField, MenuItem, ThemeProvider, createTheme } from "@mui/material";
import axios from "../../utils/axios";

// إنشاء موضوع RTL
const rtlTheme = createTheme({
  direction: 'rtl',
  typography: {
    fontFamily: 'Segoe UI, Tahoma, Arial, sans-serif',
  },
});

export default function AdSpendUpload() {
  const [source, setSource] = useState<"google" | "meta" | "tiktok">("google");
  const [file, setFile] = useState<File | undefined>();

  const upload = useMutation({
    mutationFn: async () => {
      if (!file) throw new Error("اختر ملف CSV");
      const form = new FormData();
      form.append("file", file);
      const res = await axios.post("/marketing/adspend/upload", form, {
        params: { source },
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    },
  });

  return (
    <ThemeProvider theme={rtlTheme}>
      <Box sx={{ direction: 'rtl', display: "flex", flexDirection: "column", gap: 2 }}>
        <Typography variant="h6">رفع ملف إنفاق الإعلانات CSV</Typography>
        <Card><CardContent>
          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center" }}>
            <TextField select label="المصدر" value={source} onChange={(e) => setSource(e.target.value as "google" | "meta" | "tiktok")} sx={{ minWidth: 160 }}>
              <MenuItem value="google">جوجل</MenuItem>
              <MenuItem value="meta">ميتا</MenuItem>
              <MenuItem value="tiktok">تيك توك</MenuItem>
            </TextField>
            <input type="file" accept=".csv" onChange={(e) => setFile(e.target.files?.[0])} />
            <Button variant="contained" onClick={() => upload.mutate()} disabled={upload.isPending}>رفع</Button>
          </Box>
        </CardContent></Card>
      </Box>
    </ThemeProvider>
  );
}
