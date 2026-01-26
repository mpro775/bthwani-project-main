import { useEffect, useState } from "react";
import axios from "../../utils/axios";
import { Box, Paper, Typography, TextField, MenuItem, Select, FormControl, InputLabel, Button, Table, TableHead, TableRow, TableCell, TableBody, Alert } from "@mui/material";
import dayjs from "dayjs";
import { useParams } from "react-router-dom";

interface PartnerProfile {
  store: string;
  lifecycle?: string;
  tier?: string;
  commissionPct?: number;
}

interface PerformanceData {
  _id?: string;
  day: string;
  orders: number;
  gmv: number;
  cancels: number;
  avgPrepMin?: number;
}

export default function PartnerDetails() {
  const { store } = useParams();
  const [profile, setProfile] = useState<PartnerProfile | null>(null);
  const [perf, setPerf] = useState<PerformanceData[]>([]);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      const [p, pr] = await Promise.all([
        axios.get("/partners", { params:{ page:1, limit:1, q: store }}), // أو جلب مباشر إن جهزت endpoint منفصل
        axios.get(`/partners/${store}/performance`, { params: { from: dayjs().subtract(30,"day").format("YYYY-MM-DD") }})
      ]);
      setProfile(p.data.items?.[0]);
      setPerf(pr.data.items);
    } catch(e) {
      setError((e as Error)?.message || "حدث خطأ غير متوقع");
    }
  };
  useEffect(()=>{ load(); /* eslint-disable-next-line */ },[store]);

  const [patch,setPatch] = useState<{lifecycle?:string,tier?:string,commissionPct?:number}>({});

  const save = async () => {
    await axios.post("/partners/upsert", { store, ...patch });
    await load();
    setPatch({});
  };

  return (
    <Box p={2} display="flex" flexDirection="column" gap={2}>
      <Typography variant="h6">تفاصيل الشريك</Typography>
      {error && <Alert severity="error">{error}</Alert>}

      {profile && (
        <Paper style={{ padding: 12 }}>
          <Typography variant="subtitle1">نظرة عامة</Typography>
          <Box display="flex" gap={2} flexWrap="wrap" mt={1}>
            <Typography>Store: {profile.store}</Typography>
            <Typography>Lifecycle: {profile.lifecycle}</Typography>
            <Typography>Tier: {profile.tier}</Typography>
            <Typography>Commission: {profile.commissionPct}%</Typography>
          </Box>

          <Box display="flex" gap={2} alignItems="center" mt={2} flexWrap="wrap">
            <FormControl size="small">
              <InputLabel>الحالة</InputLabel>
              <Select label="الحالة" value={patch.lifecycle || ""} onChange={e=>setPatch(p=>({...p, lifecycle: e.target.value || undefined}))}>
                <MenuItem value="">—</MenuItem>
                {["prospect","onboarding","active","paused","terminated"].map(v=><MenuItem key={v} value={v}>{v}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl size="small">
              <InputLabel>الفئة</InputLabel>
              <Select label="الفئة" value={patch.tier || ""} onChange={e=>setPatch(p=>({...p, tier: e.target.value || undefined}))}>
                <MenuItem value="">—</MenuItem>
                {["A","B","C"].map(v=><MenuItem key={v} value={v}>{v}</MenuItem>)}
              </Select>
            </FormControl>
            <TextField size="small" type="number" label="Commission %" value={patch.commissionPct ?? ""} onChange={e=>setPatch(p=>({...p, commissionPct: e.target.value? Number(e.target.value): undefined}))} />
            <Button variant="contained" onClick={save}>حفظ</Button>
          </Box>
        </Paper>
      )}

      <Paper style={{ padding: 12 }}>
        <Typography variant="subtitle1">أداء آخر 30 يومًا</Typography>
        <Table size="small" style={{ marginTop: 8 }}>
          <TableHead><TableRow>
            <TableCell>اليوم</TableCell>
            <TableCell>الطلبات</TableCell>
            <TableCell>GMV</TableCell>
            <TableCell>إلغاءات</TableCell>
            <TableCell>متوسط التحضير (د)</TableCell>
          </TableRow></TableHead>
          <TableBody>
            {perf.map((d: PerformanceData) => (
              <TableRow key={d._id || d.day}>
                <TableCell>{d.day}</TableCell>
                <TableCell>{d.orders}</TableCell>
                <TableCell>{d.gmv.toFixed(2)}</TableCell>
                <TableCell>{d.cancels}</TableCell>
                <TableCell>{Number(d.avgPrepMin||0).toFixed(1)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
}
