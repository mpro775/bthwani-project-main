import { useCallback, useEffect, useState } from "react";
import axios from "../../../utils/axios";
import { Box, Paper,  TextField, Button, Table, TableHead, TableRow, TableCell, TableBody, Chip, Alert, CircularProgress, MenuItem, Select, FormControl, InputLabel } from "@mui/material";
import dayjs from "dayjs";

type ShiftRow = {
  _id: string;
  shiftId: {
    _id: string;
    name: string;
    dayOfWeek?: number;
    specificDate?: string;   // "YYYY-MM-DD"
    startLocal: string;      // "HH:mm"
    endLocal: string;        // "HH:mm"
    area?: string;
  };
  driver: string;
  status: "assigned" | "attended" | "absent" | "late";
  checkInAt?: string;
  checkOutAt?: string;
};

export default function ShiftsTab({ id }: { id: string }) {
  const [rows, setRows] = useState<ShiftRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState("");
  const [status, setStatus] = useState<string>("");
  const [from, setFrom]     = useState(dayjs().subtract(14,"day").format("YYYY-MM-DD"));
  const [to, setTo]         = useState(dayjs().add(14,"day").format("YYYY-MM-DD"));

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const r = await axios.get("/admin/driver-shifts", { params: { driver: id, from, to } });
      let items: ShiftRow[] = (r.data?.items || []).filter((x:ShiftRow)=>x.shiftId);
      if (status) items = items.filter(x => x.status === status);
      setRows(items);
    } catch (e:unknown) { setError((e as { response?: { data?: { message?: string } } })?.response?.data?.message || (e as Error).message); }
    finally { setLoading(false); }
  }, [id, from, to, status]);

  useEffect(()=>{ load(); }, [id, from, to, status, load]);

  const mark = async (assignId: string, newStatus: "attended"|"absent"|"late") => {
    try {
      const shiftId = rows.find(r=>r._id===assignId)?.shiftId?._id;
      if (!shiftId) return;
      await axios.patch(`/admin/driver-shifts/${shiftId}/mark`, { driver: id, status: newStatus });
      await load();
    } catch (e:unknown) { setError((e as { response?: { data?: { message?: string } } })?.response?.data?.message || (e as Error).message); }
  };

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <Paper style={{ padding: 12 }}>
        <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
          <TextField size="small" type="date" label="من" value={from} onChange={e=>setFrom(e.target.value)} />
          <TextField size="small" type="date" label="إلى" value={to} onChange={e=>setTo(e.target.value)} />
          <FormControl size="small">
            <InputLabel>الحالة</InputLabel>
            <Select label="الحالة" value={status} onChange={e=>setStatus(e.target.value)}>
              <MenuItem value=""><em>الكل</em></MenuItem>
              {["assigned","attended","absent","late"].map(s=><MenuItem key={s} value={s}>{s}</MenuItem>)}
            </Select>
          </FormControl>
          <Button variant="contained" onClick={load}>تحديث</Button>
        </Box>

        {loading && <Box mt={2}><CircularProgress/></Box>}
        {error && <Box mt={2}><Alert severity="error">{error}</Alert></Box>}

        {!loading && !error && (
          <Table size="small" style={{ marginTop: 12 }}>
            <TableHead>
              <TableRow>
                <TableCell>الشِفت</TableCell>
                <TableCell>التاريخ/اليوم</TableCell>
                <TableCell>الوقت</TableCell>
                <TableCell>المنطقة</TableCell>
                <TableCell>الحالة</TableCell>
                <TableCell>إجراءات</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.length===0 && <TableRow><TableCell colSpan={6} align="center">لا توجد بيانات</TableCell></TableRow>}
              {rows.map(r=>(
                <TableRow key={r._id}>
                  <TableCell>{r.shiftId?.name || "-"}</TableCell>
                  <TableCell>
                    {r.shiftId?.specificDate
                      ? r.shiftId.specificDate
                      : typeof r.shiftId?.dayOfWeek === "number"
                        ? ["الأحد","الاثنين","الثلاثاء","الأربعاء","الخميس","الجمعة","السبت"][r.shiftId.dayOfWeek!]
                        : "-"}
                  </TableCell>
                  <TableCell>{r.shiftId?.startLocal} - {r.shiftId?.endLocal}</TableCell>
                  <TableCell>{r.shiftId?.area || "-"}</TableCell>
                  <TableCell>
                    <Chip label={r.status} color={
                      r.status==="attended" ? "success" :
                      r.status==="late" ? "warning" :
                      r.status==="absent" ? "error" : "default"
                    } />
                  </TableCell>
                  <TableCell>
                    <Box display="flex" gap={1}>
                      <Button size="small" onClick={()=>mark(r._id,"attended")}>وسم حضر</Button>
                      <Button size="small" onClick={()=>mark(r._id,"late")}>وسم متأخر</Button>
                      <Button size="small" color="error" onClick={()=>mark(r._id,"absent")}>وسم غياب</Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Paper>
    </Box>
  );
}
