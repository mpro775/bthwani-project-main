// src/components/support/CustomerPanel.tsx
import { useEffect, useState } from "react";
import axios from "../../utils/axios";
import { Box, Paper, Typography, Chip } from "@mui/material";

interface LastOrder {
  _id: string;
  status?: string;
  createdAt: string;
}

interface LastTicket {
  _id: string;
  status: string;
  number: number;
  subject: string;
}

interface CustomerPrefs {
  channels?: {
    inApp?: boolean;
    push?: boolean;
  };
}

interface CustomerData {
  lastOrders?: LastOrder[];
  lastTickets?: LastTicket[];
  prefs?: CustomerPrefs;
}

export default function CustomerPanel({ userId }: { userId?: string }) {
  const [data, setData] = useState<CustomerData | null>(null);
  useEffect(()=>{ if (userId) axios.get(`/customers/${userId}/overview`).then(r=>setData(r.data)).catch(()=>{}); },[userId]);
  if (!userId) return null;

  return (
    <Paper style={{ padding:12, minWidth: 320 }}>
      <Typography variant="subtitle1">العميل</Typography>
      <Typography>userId: {userId}</Typography>

      <Box mt={1}>
        <Typography variant="subtitle2">آخر الطلبات</Typography>
        {(data?.lastOrders||[]).map((o: LastOrder)=>(
          <Box key={o._id} display="flex" gap={1}><Chip label={o.status||"-"} /> <Typography>{new Date(o.createdAt).toLocaleString()}</Typography></Box>
        ))}
      </Box>

      <Box mt={1}>
        <Typography variant="subtitle2">آخر التذاكر</Typography>
        {(data?.lastTickets||[]).map((t: LastTicket)=>(
          <Box key={t._id} display="flex" gap={1}><Chip label={t.status} /> <Typography>#{t.number} — {t.subject}</Typography></Box>
        ))}
      </Box>

      <Box mt={1}>
        <Typography variant="subtitle2">تفضيلات الرسائل</Typography>
        <Typography>inApp: {data?.prefs?.channels?.inApp ? "✓":"✗"} / push: {data?.prefs?.channels?.push ? "✓":"✗"}</Typography>
      </Box>
    </Paper>
  );
}
