// src/pages/ops/drivers/DriversList.tsx
import { useEffect, useState } from "react";
import axios from "../../utils/axios";
import {
  Box,
  Paper,
  Typography,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  CircularProgress,
  Alert,
} from "@mui/material";

export default function DriversList() {
  const [q, setQ] = useState("");
  const [onlineOnly, setOnlineOnly] = useState("");
  const [vehicleClass, setVehicleClass] = useState("");
  const [vehiclePower, setVehiclePower] = useState("");
  const [data, setData] = useState<
    { _id: string; driver: string; status?: string; startAt?: string }[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      // مثال: نستخدم /admin/drivers/attendance?status=online_now
      const params: any = {};
      if (onlineOnly) params.status = onlineOnly;
      if (vehicleClass) params.vehicleClass = vehicleClass;
      if (vehiclePower) params.vehiclePower = parseInt(vehiclePower);

      const r = await axios.get("/admin/drivers/attendance", {
        params: Object.keys(params).length > 0 ? params : undefined,
      });
      setData(r.data.items || []);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "حدث خطأ غير متوقع");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load(); /* eslint-disable-next-line */
  }, [onlineOnly, vehicleClass, vehiclePower]);

  return (
    <Box p={2} display="flex" flexDirection="column" gap={2}>
      <Typography variant="h6">قائمة السائقين</Typography>
      <Paper style={{ padding: 12 }}>
        <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
          <TextField
            size="small"
            label="بحث"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <FormControl size="small">
            <InputLabel>فلتر</InputLabel>
            <Select
              label="فلتر"
              value={onlineOnly}
              onChange={(e) => setOnlineOnly(e.target.value)}
            >
              <MenuItem value="">
                <em>الكل</em>
              </MenuItem>
              <MenuItem value="online_now">أونلاين الآن</MenuItem>
              <MenuItem value="attended">حضر اليوم</MenuItem>
              <MenuItem value="absent">غائب اليوم</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" style={{ minWidth: 120 }}>
            <InputLabel>تصنيف المركبة</InputLabel>
            <Select
              label="تصنيف المركبة"
              value={vehicleClass}
              onChange={(e) => setVehicleClass(e.target.value)}
            >
              <MenuItem value="">
                <em>الكل</em>
              </MenuItem>
              <MenuItem value="light">خفيف</MenuItem>
              <MenuItem value="medium">متوسط</MenuItem>
              <MenuItem value="heavy">ثقيل</MenuItem>
            </Select>
          </FormControl>

          <TextField
            size="small"
            label="قوة المركبة (cc أو kW)"
            type="number"
            value={vehiclePower}
            onChange={(e) => setVehiclePower(e.target.value)}
            style={{ minWidth: 150 }}
          />

          <Button variant="contained" onClick={() => load()}>
            تحديث
          </Button>
        </Box>

        {loading && (
          <Box mt={2}>
            <CircularProgress />
          </Box>
        )}
        {error && (
          <Box mt={2}>
            <Alert severity="error">{error}</Alert>
          </Box>
        )}

        {!loading && !error && (
          <Table size="small" style={{ marginTop: 12 }}>
            <TableHead>
              <TableRow>
                <TableCell>Driver</TableCell>
                <TableCell>الحالة</TableCell>
                <TableCell>آخر Check-in</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} align="center">
                    لا توجد بيانات
                  </TableCell>
                </TableRow>
              )}
              {data.map(
                (it: {
                  _id: string;
                  driver: string;
                  status?: string;
                  startAt?: string;
                }) => (
                  <TableRow
                    key={it._id}
                    hover
                    style={{ cursor: "pointer" }}
                    onClick={() => {
                      window.location.href = `/ops/drivers/${it.driver}`;
                    }}
                  >
                    <TableCell>{it.driver}</TableCell>
                    <TableCell>{it.status || "—"}</TableCell>
                    <TableCell>
                      {it.startAt ? new Date(it.startAt).toLocaleString() : "—"}
                    </TableCell>
                  </TableRow>
                )
              )}
            </TableBody>
          </Table>
        )}
      </Paper>
    </Box>
  );
}
