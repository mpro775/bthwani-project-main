import { useEffect, useState, useCallback } from "react";
import axios from "../../utils/axios";
import { Box, Typography, TextField, MenuItem, Select, FormControl, InputLabel, Button, Table, TableHead, TableRow, TableCell, TableBody, Pagination, Paper, CircularProgress, Alert } from "@mui/material";
import ContractsWidget from "./ContractsWidget";

type Item = {
  _id: string;
  store: string;
  lifecycle: string;
  tier: string;
  commissionPct: number;
  healthScore: number;
  contract?: { end?: string; status?: string };
};

export default function PartnersList() {
  const [q,setQ] = useState("");
  const [lifecycle,setLifecycle] = useState<string>("");
  const [tier,setTier] = useState<string>("");
  const [contractStatus,setContractStatus] = useState<string>("");
  const [page,setPage] = useState(1);
  const [limit] = useState(20);
  const [loading,setLoading] = useState(false);
  const [error,setError] = useState<string>("");
  const [data,setData] = useState<{items:Item[], total:number}>({items:[], total:0});

  const fetchList = useCallback(async () => {
    setLoading(true); setError("");
    try{
      const params: Record<string, unknown> = { page, limit };
      if (q) params.q = q;
      if (lifecycle) params.lifecycle = lifecycle;
      if (tier) params.tier = tier;
      if (contractStatus) params.contractStatus = contractStatus;
      const r = await axios.get("/partners", { params });
      setData(r.data);
    }catch(e: unknown){ setError((e as { response?: { data?: { message?: string } } })?.response?.data?.message || (e as Error).message); }
    finally{ setLoading(false); }
  }, [page, limit, q, lifecycle, tier, contractStatus]);

  useEffect(()=>{ fetchList();},[fetchList]);

  return (
    <Box p={2} display="flex" flexDirection="column" gap={2}>
      <Typography variant="h5">الشراكات</Typography>

      <ContractsWidget days={30} />

      <Paper style={{ padding: 12 }}>
        <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
          <TextField size="small" label="بحث" value={q} onChange={e=>setQ(e.target.value)} />
          <FormControl size="small">
            <InputLabel>الحالة</InputLabel>
            <Select label="الحالة" value={lifecycle} onChange={(e)=>setLifecycle(e.target.value)}>
              <MenuItem value=""><em>الكل</em></MenuItem>
              {["prospect","onboarding","active","paused","terminated"].map(v=><MenuItem key={v} value={v}>{v}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl size="small">
            <InputLabel>الفئة</InputLabel>
            <Select label="الفئة" value={tier} onChange={(e)=>setTier(e.target.value)}>
              <MenuItem value=""><em>الكل</em></MenuItem>
              {["A","B","C"].map(v=><MenuItem key={v} value={v}>{v}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl size="small">
            <InputLabel>حالة العقد</InputLabel>
            <Select label="حالة العقد" value={contractStatus} onChange={(e)=>setContractStatus(e.target.value)}>
              <MenuItem value=""><em>الكل</em></MenuItem>
              {["draft","signed","active","expired","terminated"].map(v=><MenuItem key={v} value={v}>{v}</MenuItem>)}
            </Select>
          </FormControl>
          <Button variant="contained" onClick={()=>{ setPage(1); fetchList(); }}>بحث</Button>
        </Box>

        {loading && <Box mt={2}><CircularProgress /></Box>}
        {error && <Box mt={2}><Alert severity="error">{error}</Alert></Box>}

        {!loading && !error && (
          <>
          <Table size="small" style={{ marginTop: 12 }}>
            <TableHead>
              <TableRow>
                <TableCell>Store</TableCell>
                <TableCell>Lifecycle</TableCell>
                <TableCell>Tier</TableCell>
                <TableCell>Commission %</TableCell>
                <TableCell>Health</TableCell>
                <TableCell>Contract End</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.items.length === 0 && (
                <TableRow><TableCell colSpan={6}><Typography align="center">لا توجد بيانات</Typography></TableCell></TableRow>
              )}
              {data.items.map((it)=>(
                <TableRow key={it._id} hover onClick={()=>{ window.location.href = `/partners/${it.store}`; }} style={{ cursor:"pointer" }}>
                  <TableCell>{it.store}</TableCell>
                  <TableCell>{it.lifecycle}</TableCell>
                  <TableCell>{it.tier}</TableCell>
                  <TableCell>{it.commissionPct?.toFixed(2)}</TableCell>
                  <TableCell>{it.healthScore}</TableCell>
                  <TableCell>{it.contract?.end ? new Date(it.contract.end).toLocaleDateString() : "-"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Box display="flex" justifyContent="center" mt={1}>
            <Pagination count={Math.ceil(data.total/limit)||1} page={page} onChange={(_e,v)=>setPage(v)} />
          </Box>
          </>
        )}
      </Paper>
    </Box>
  );
}
