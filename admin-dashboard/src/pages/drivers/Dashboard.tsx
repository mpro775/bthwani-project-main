// src/pages/ops/drivers/Dashboard.tsx
import { useEffect, useState } from "react";
import axios from "../../utils/axios";
import { Box, Paper, Typography } from "@mui/material";

export default function DriversDashboard() {
  const [expiring, setExpiring] = useState<{
    count: number;
    items: { _id: string; name: string; expireAt: string }[];
  }>({
    count: 0,
    items: [],
  });
  const [health, setHealth] = useState<{
    attendanceDaily?: { at?: string };
    markShift?: { at?: string };
  }>({});
  useEffect(() => {
    axios
      .get("/drivers/health")
      .then((r) => setHealth(r.data))
      .catch(() => {});
    axios
      .get("/admin/drivers/docs/expiring", { params: { days: 30 } })
      .then((r) => setExpiring(r.data))
      .catch(() => {});
  }, []);
  return (
    <Box p={2} display="flex" flexDirection="column" gap={2}>
      <Typography variant="h5">عمليات الكباتن</Typography>
      <Box display="flex" gap={2} flexWrap="wrap">
        <Paper style={{ padding: 12 }}>
          <Typography>وثائق تنتهي خلال 30 يوم: {expiring.count}</Typography>
        </Paper>
        <Paper style={{ padding: 12 }}>
          <Typography>
            آخر تجميع حضور: {health?.attendanceDaily?.at || "-"}
          </Typography>
        </Paper>
        <Paper style={{ padding: 12 }}>
          <Typography>آخر وسم شِفت: {health?.markShift?.at || "-"}</Typography>
        </Paper>
      </Box>
    </Box>
  );
}
