// src/pages/support/Reports.tsx
import { useEffect, useState } from "react";
import axios from "../../utils/axios";
import { Box, Paper, Typography, TextField, Button } from "@mui/material";
import dayjs from "dayjs";

interface SupportReportData {
  total?: number;
  backlog?: number;
  frtMinutes?: number;
  artMinutes?: number;
  csatAvg?: number;
}

export default function Reports() {
  const [from, setFrom] = useState(
    dayjs().subtract(7, "day").format("YYYY-MM-DD")
  );
  const [to, setTo] = useState(dayjs().format("YYYY-MM-DD"));
  const [data, setData] = useState<SupportReportData>({});
  const load = async () => {
    const r = await axios.get("/support/reports/summary", {
      params: { from, to },
    });
    setData(r.data || {});
  };
  useEffect(() => {
    load(); 
  },);

  return (
    <Box p={2} display="flex" flexDirection="column" gap={2}>
      <Typography variant="h5">تقارير الدعم (MVP)</Typography>
      <Paper style={{ padding: 12 }}>
        <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
          <TextField
            size="small"
            type="date"
            label="من"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          />
          <TextField
            size="small"
            type="date"
            label="إلى"
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
          <Button variant="contained" onClick={load}>
            تحديث
          </Button>
        </Box>
        <Box display="flex" gap={2} mt={2} flexWrap="wrap">
          <Paper style={{ padding: 12 }}>
            <Typography>المجموع: {data.total || 0}</Typography>
          </Paper>
          <Paper style={{ padding: 12 }}>
            <Typography>Backlog: {data.backlog || 0}</Typography>
          </Paper>
          <Paper style={{ padding: 12 }}>
            <Typography>
              FRT (د): {Math.round((data.frtMinutes || 0) / 60)}
            </Typography>
          </Paper>
          <Paper style={{ padding: 12 }}>
            <Typography>
              ART (د): {Math.round((data.artMinutes || 0) / 60)}
            </Typography>
          </Paper>
          <Paper style={{ padding: 12 }}>
            <Typography>
              CSAT: {Number(data.csatAvg || 0).toFixed(2)}
            </Typography>
          </Paper>
        </Box>
      </Paper>
    </Box>
  );
}
