// src/routes/marketing/Dashboard.tsx
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  MenuItem,
  ThemeProvider,
  createTheme,
} from "@mui/material";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import axios from "../../utils/axios";
type RoasPoint = {
  day: string;
  revenue: number;
  cost: number;
  conversions: number;
  roas: number;
  cpa: number;
  series: Record<string, number>;
};

const KPI = ({
  label,
  value,
}: {
  label: string;
  value: string | number | null;
}) => (
  <Card>
    <CardContent>
      <Typography variant="overline">{label}</Typography>
      <Typography variant="h5">{value ?? "—"}</Typography>
    </CardContent>
  </Card>
);

// إنشاء موضوع RTL
const rtlTheme = createTheme({
  direction: "rtl",
  typography: {
    fontFamily: "Segoe UI, Tahoma, Arial, sans-serif",
  },
});

export default function Dashboard() {
  const [from, setFrom] = useState<string>(() =>
    new Date(Date.now() - 30 * 864e5).toISOString().slice(0, 10)
  );
  const [to, setTo] = useState<string>(() =>
    new Date().toISOString().slice(0, 10)
  );
  const [groupBy, setGroupBy] = useState<"source" | "campaign" | "none">(
    "source"
  );

  const { data } = useQuery({
    queryKey: ["roas", from, to, groupBy],
    queryFn: async () =>
      (
        await axios.get<{ points: RoasPoint[] }>("/marketing/roas", {
          params: { from, to, groupBy },
        })
      ).data,
  });

  const points = data?.points ?? [];
  const totals = points.reduce(
    (a, p) => ({
      rev: a.rev + p.revenue,
      cost: a.cost + p.cost,
      conv: a.conv + p.conversions,
    }),
    { rev: 0, cost: 0, conv: 0 }
  );
  const roas =
    totals.cost > 0 ? totals.rev / totals.cost : totals.rev > 0 ? Infinity : 0;
  const chartData = points.map((p) => ({
    day: p.day,
    revenue: p.revenue,
    cost: p.cost,
  }));

  return (
    <ThemeProvider theme={rtlTheme}>
      <Box
        sx={{
          direction: "rtl",
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          <Box sx={{ flex: "1 1 220px" }}>
            <KPI label="الإيرادات" value={totals.rev.toFixed(2)} />
          </Box>
          <Box sx={{ flex: "1 1 220px" }}>
            <KPI label="إنفاق الإعلانات" value={totals.cost.toFixed(2)} />
          </Box>
          <Box sx={{ flex: "1 1 220px" }}>
            <KPI label="التحويلات" value={totals.conv} />
          </Box>
          <Box sx={{ flex: "1 1 220px" }}>
            <KPI
              label="عائد الإنفاق الإعلاني"
              value={Number.isFinite(roas) ? roas.toFixed(2) : "∞"}
            />
          </Box>
        </Box>

        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          <TextField
            type="date"
            label="من"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          />
          <TextField
            type="date"
            label="إلى"
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
          <TextField
            select
            label="تجميع حسب"
            value={groupBy}
            onChange={(e) =>
              setGroupBy(e.target.value as "source" | "campaign" | "none")
            }
            sx={{ minWidth: 180 }}
          >
            <MenuItem value="source">المصدر</MenuItem>
            <MenuItem value="campaign">الحملة</MenuItem>
            <MenuItem value="none">بدون</MenuItem>
          </TextField>
        </Box>

        <Card>
          <CardContent>
            <Typography variant="subtitle1" gutterBottom>
              الإيرادات مقابل الإنفاق
            </Typography>
            <Box sx={{ width: "100%", height: 340 }}>
              <ResponsiveContainer>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="revenue" name="الإيرادات" />
                  <Line type="monotone" dataKey="cost" name="التكلفة" />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </ThemeProvider>
  );
}
