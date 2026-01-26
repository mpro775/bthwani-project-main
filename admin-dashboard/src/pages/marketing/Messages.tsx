// src/routes/marketing/Messages.tsx
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

export default function Messages() {
  const [channel, setChannel] = useState<"push" | "sms" | "inapp">("push");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [segmentId, setSegmentId] = useState("");
  const [userIds, setUserIds] = useState("");
  const [scheduleAt, setScheduleAt] = useState<string>("");

  const send = useMutation({
    mutationFn: async () => {
      const payload: { channel: string; title: string; body: string; segmentId?: string; userIds?: string[]; scheduleAt?: string } = { channel, title, body };
      if (segmentId) payload.segmentId = segmentId;
      if (userIds) payload.userIds = userIds.split(",").map((s) => s.trim()).filter(Boolean);
      if (scheduleAt) payload.scheduleAt = new Date(scheduleAt).toISOString();
      const url = scheduleAt ? "/messages/schedule" : "/messages/send";
      return (await axios.post(url, payload)).data;
    },
  });

  return (
    <ThemeProvider theme={rtlTheme}>
      <Box sx={{ direction: 'rtl', display: "flex", flexDirection: "column", gap: 2 }}>
        <Typography variant="h6">الرسائل</Typography>

        <Card><CardContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField select label="القناة" value={channel} onChange={(e) => setChannel(e.target.value as "push" | "sms" | "inapp")} sx={{ maxWidth: 240 }}>
              <MenuItem value="push">إشعارات فورية</MenuItem>
              <MenuItem value="sms">رسائل نصية</MenuItem>
              <MenuItem value="inapp">داخل التطبيق</MenuItem>
            </TextField>
            <TextField label="العنوان" value={title} onChange={(e) => setTitle(e.target.value)} />
            <TextField label="المحتوى" value={body} onChange={(e) => setBody(e.target.value)} multiline minRows={4} />
            <TextField label="معرف الشريحة (اختياري)" value={segmentId} onChange={(e) => setSegmentId(e.target.value)} />
            <TextField label="معرفات المستخدمين مفصولة بفاصلة (اختياري)" value={userIds} onChange={(e) => setUserIds(e.target.value)} />
            <TextField label="جدولة في (اختياري)" type="datetime-local" value={scheduleAt} onChange={(e) => setScheduleAt(e.target.value)} />
            <Button variant="contained" onClick={() => send.mutate()} disabled={send.isPending}>
              {scheduleAt ? "جدولة" : "إرسال الآن"}
            </Button>
          </Box>
        </CardContent></Card>
      </Box>
    </ThemeProvider>
  );
}
