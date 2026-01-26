import { useCallback, useEffect, useState } from "react";
import axios from "../../../utils/axios";
import { Box, Paper, Typography, TextField, Button, Table, TableHead, TableRow, TableCell, TableBody, Chip, Alert, CircularProgress, MenuItem, Select, FormControl, InputLabel, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import dayjs from "dayjs";

type Adjustment = {
  _id: string;
  type: "bonus"|"penalty";
  amount: number;
  reason?: string;
  createdAt: string;
};

type Payout = {
  _id: string;
  driver: string;
  period: "weekly"|"biweekly"|"monthly";
  start: string; // YYYY-MM-DD
  end: string;   // YYYY-MM-DD
  earnings: number;
  adjustments: number;
  fees: number;
  withdrawals: number;
  net: number;
  status: "pending"|"approved"|"paid";
  reference?: string;
  createdAt: string;
};

export default function FinanceTab({ id }: { id: string }) {
  const [adjustments, setAdjustments] = useState<Adjustment[]>([]);
  const [payouts, setPayouts]         = useState<Payout[]>([]);
  const [loadingAdj, setLoadingAdj] = useState(false);
  const [loadingPay, setLoadingPay] = useState(false);
  const [error, setError] = useState("");

  // إنشاء تعديل
  const [adjType, setAdjType] = useState<"bonus"|"penalty">("bonus");
  const [adjAmount, setAdjAmount] = useState<string>("");
  const [adjReason, setAdjReason] = useState<string>("");

  // تصفية التسويات
  const [status, setStatus] = useState<string>("");
  const [from, setFrom] = useState(dayjs().subtract(60,"day").format("YYYY-MM-DD"));
  const [to, setTo]     = useState(dayjs().format("YYYY-MM-DD"));

  // نافذة دفع
  const [payId, setPayId] = useState<string>("");
  const [reference, setReference] = useState<string>("");

  const loadAdjustments = useCallback(async () => {
    setLoadingAdj(true); setError("");
    try {
      const r = await axios.get(`/admin/drivers/${id}/adjustments`);
      setAdjustments(r.data?.items || []);
    } catch (e:unknown) { setError((e as { response?: { data?: { message?: string } } })?.response?.data?.message || (e as Error).message); }
    finally { setLoadingAdj(false); }
  }, [id]);

  const loadPayouts = useCallback(async () => {
    setLoadingPay(true); setError("");
    try {
      const r = await axios.get("/admin/driver-payouts", {
        params: { driver: id, from, to, status: status || undefined }
      });
      setPayouts(r.data?.items || []);
    } catch (e:unknown) { setError((e as { response?: { data?: { message?: string } } })?.response?.data?.message || (e as Error).message); }
    finally { setLoadingPay(false); }
  }, [id, from, to, status]);

  useEffect(()=>{ loadAdjustments();  }, [id, loadAdjustments]);
  useEffect(()=>{ loadPayouts();}, [id, from, to, status, loadPayouts ]);

  const createAdjustment = async () => {
    if (!adjAmount) return;
    try {
      await axios.post(`/admin/drivers/${id}/adjustments`, {
        type: adjType, amount: Number(adjAmount), reason: adjReason || undefined
      });
      setAdjAmount(""); setAdjReason("");
      await loadAdjustments();
    } catch (e:unknown) { setError((e as { response?: { data?: { message?: string } } })?.response?.data?.message || (e as Error).message); }
  };

  const approve = async (payoutId: string) => {
    try {
      await axios.patch(`/admin/driver-payouts/${payoutId}/approve`);
      await loadPayouts();
    } catch (e:unknown) { setError((e as { response?: { data?: { message?: string } } })?.response?.data?.message || (e as Error).message); }
  };

  const pay = async () => {
    if (!payId || !reference) return;
    try {
      await axios.patch(`/admin/driver-payouts/${payId}/pay`, { reference });
      setPayId(""); setReference("");
      await loadPayouts();
    } catch (e:unknown) { setError((e as { response?: { data?: { message?: string } } })?.response?.data?.message || (e as Error).message); }
  };

  const totals = payouts.reduce((a,p)=>({
    earnings: a.earnings + (p.earnings||0),
    adjustments: a.adjustments + (p.adjustments||0),
    fees: a.fees + (p.fees||0),
    withdrawals: a.withdrawals + (p.withdrawals||0),
    net: a.net + (p.net||0),
  }), { earnings:0, adjustments:0, fees:0, withdrawals:0, net:0 });

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <Paper style={{ padding: 12 }}>
        <Typography variant="subtitle1">إضافة مكافأة/خصم</Typography>
        <Box display="flex" gap={2} alignItems="center" flexWrap="wrap" mt={1}>
          <FormControl size="small">
            <InputLabel>النوع</InputLabel>
            <Select label="النوع" value={adjType} onChange={e=>setAdjType(e.target.value as "bonus"|"penalty")}>
              <MenuItem value="bonus">Bonus</MenuItem>
              <MenuItem value="penalty">Penalty</MenuItem>
            </Select>
          </FormControl>
          <TextField size="small" type="number" label="المبلغ" value={adjAmount} onChange={e=>setAdjAmount(e.target.value)} />
          <TextField size="small" label="السبب (اختياري)" value={adjReason} onChange={e=>setAdjReason(e.target.value)} />
          <Button variant="contained" onClick={createAdjustment}>حفظ</Button>
        </Box>

        {loadingAdj && <Box mt={2}><CircularProgress/></Box>}
        {error && <Box mt={2}><Alert severity="error">{error}</Alert></Box>}

        {!loadingAdj && !error && (
          <>
            <Typography variant="subtitle1" mt={2}>سجل التعديلات</Typography>
            <Table size="small" style={{ marginTop: 8 }}>
              <TableHead>
                <TableRow>
                  <TableCell>التاريخ</TableCell>
                  <TableCell>النوع</TableCell>
                  <TableCell>المبلغ</TableCell>
                  <TableCell>السبب</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {adjustments.length===0 && <TableRow><TableCell colSpan={4} align="center">لا توجد بيانات</TableCell></TableRow>}
                {adjustments.map(a=>(
                  <TableRow key={a._id}>
                    <TableCell>{a.createdAt ? new Date(a.createdAt).toLocaleString() : "-"}</TableCell>
                    <TableCell>
                      <Chip label={a.type} color={a.type==="bonus" ? "success" : "error"} />
                    </TableCell>
                    <TableCell>{a.amount.toFixed(2)}</TableCell>
                    <TableCell>{a.reason || "-"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </>
        )}
      </Paper>

      <Paper style={{ padding: 12 }}>
        <Typography variant="subtitle1">دورات التسوية</Typography>
        <Box display="flex" gap={2} alignItems="center" flexWrap="wrap" mt={1}>
          <TextField size="small" type="date" label="من" value={from} onChange={e=>setFrom(e.target.value)} />
          <TextField size="small" type="date" label="إلى" value={to} onChange={e=>setTo(e.target.value)} />
          <FormControl size="small">
            <InputLabel>الحالة</InputLabel>
            <Select label="الحالة" value={status} onChange={e=>setStatus(e.target.value)}>
              <MenuItem value=""><em>الكل</em></MenuItem>
              {["pending","approved","paid"].map(s=><MenuItem key={s} value={s}>{s}</MenuItem>)}
            </Select>
          </FormControl>
          <Box ml="auto" display="flex" gap={2} flexWrap="wrap">
            <Typography fontWeight={600}>الإجماليات:</Typography>
            <Typography>Earn: {totals.earnings.toFixed(2)}</Typography>
            <Typography>Adj: {totals.adjustments.toFixed(2)}</Typography>
            <Typography>Fees: {totals.fees.toFixed(2)}</Typography>
            <Typography>Net: {totals.net.toFixed(2)}</Typography>
          </Box>
        </Box>

        {loadingPay && <Box mt={2}><CircularProgress/></Box>}
        {error && <Box mt={2}><Alert severity="error">{error}</Alert></Box>}

        {!loadingPay && !error && (
          <Table size="small" style={{ marginTop: 8 }}>
            <TableHead>
              <TableRow>
                <TableCell>الفترة</TableCell>
                <TableCell>الحالة</TableCell>
                <TableCell>Earn</TableCell>
                <TableCell>Adj</TableCell>
                <TableCell>Fees</TableCell>
                <TableCell>Withd</TableCell>
                <TableCell>Net</TableCell>
                <TableCell>مرجع الدفع</TableCell>
                <TableCell>إجراءات</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {payouts.length===0 && <TableRow><TableCell colSpan={9} align="center">لا توجد بيانات</TableCell></TableRow>}
              {payouts.map(p=>(
                <TableRow key={p._id}>
                  <TableCell>{p.start} → {p.end}</TableCell>
                  <TableCell>
                    <Chip label={p.status} color={
                      p.status==="paid" ? "success" :
                      p.status==="approved" ? "warning" : "default"
                    }/>
                  </TableCell>
                  <TableCell>{p.earnings?.toFixed(2) ?? "0.00"}</TableCell>
                  <TableCell>{p.adjustments?.toFixed(2) ?? "0.00"}</TableCell>
                  <TableCell>{p.fees?.toFixed(2) ?? "0.00"}</TableCell>
                  <TableCell>{p.withdrawals?.toFixed(2) ?? "0.00"}</TableCell>
                  <TableCell>{p.net?.toFixed(2) ?? "0.00"}</TableCell>
                  <TableCell>{p.reference || "-"}</TableCell>
                  <TableCell>
                    <Box display="flex" gap={1}>
                      {p.status==="pending" && <Button size="small" onClick={()=>approve(p._id)}>اعتماد</Button>}
                      {p.status!=="paid" && <Button size="small" onClick={()=>{ setPayId(p._id); setReference(""); }}>دفع</Button>}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Paper>

      <Dialog open={!!payId} onClose={()=>setPayId("")}>
        <DialogTitle>توثيق الدفع</DialogTitle>
        <DialogContent>
          <TextField fullWidth size="small" label="Reference" value={reference} onChange={e=>setReference(e.target.value)} />
        </DialogContent>
        <DialogActions>
          <Button onClick={()=>setPayId("")}>إلغاء</Button>
          <Button variant="contained" onClick={pay}>حفظ</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
