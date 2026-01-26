import { useCallback, useEffect, useState } from "react";
import axios from "../../../utils/axios";
import { Box, Paper, Typography, TextField, Button, Table, TableHead, TableRow, TableCell, TableBody, Chip, Alert, CircularProgress } from "@mui/material";

type AssetAssignment = {
  _id: string;
  asset: { _id: string; code: string; type?: string; brand?: string; model?: string; status: string };
  driver: string;
  assignedAt: string;
  expectedReturnAt?: string;
  returnedAt?: string;
  status: "active" | "returned" | "overdue";
  depositAmount?: number;
  notes?: string;
};

export default function AssetsTab({ id }: { id: string }) {
  const [rows, setRows] = useState<AssetAssignment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState("");

  // نموذج إسناد أصل
  const [assetId, setAssetId] = useState("");
  const [deposit, setDeposit] = useState<string>("");
  const [expectedReturnAt, setExpectedReturnAt] = useState<string>("");

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const r = await axios.get("/admin/driver-assets", { params: { driver: id } });
      setRows(r.data?.items || []);
    } catch (e:unknown) { setError((e as { response?: { data?: { message?: string } } })?.response?.data?.message || (e as Error).message); }
    finally { setLoading(false); }
  }, [id]);

  useEffect(()=>{ load()}, [id, load]);

  const assign = async () => {
    if (!assetId) return;
    try {
      await axios.post(`/admin/driver-assets/${assetId}/assign`, {
        driverId: id,
        deposit: deposit ? Number(deposit) : undefined,
        expectedReturnAt: expectedReturnAt || undefined,
      });
      setAssetId(""); setDeposit(""); setExpectedReturnAt("");
      await load();
      } catch (e:unknown) { setError((e as { response?: { data?: { message?: string } } })?.response?.data?.message || (e as Error).message); }
  };

  const returnAsset = async (aid: string) => {
    try {
      await axios.post(`/admin/driver-assets/${aid}/return`, { notes: "Returned via panel" });
      await load();
    } catch (e:unknown) { setError((e as { response?: { data?: { message?: string } } })?.response?.data?.message || (e as Error).message); }
  };

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <Paper style={{ padding: 12 }}>
        <Typography variant="subtitle1">إسناد أصل جديد</Typography>
        <Box display="flex" gap={2} alignItems="center" flexWrap="wrap" mt={1}>
          <TextField size="small" label="AssetId (ObjectId)" value={assetId} onChange={e=>setAssetId(e.target.value)} />
          <TextField size="small" type="number" label="إيداع (اختياري)" value={deposit} onChange={e=>setDeposit(e.target.value)} />
          <TextField size="small" type="datetime-local" label="تاريخ متوقع للرجوع" value={expectedReturnAt} onChange={e=>setExpectedReturnAt(e.target.value)} />
          <Button variant="contained" onClick={assign}>إسناد</Button>
        </Box>
      </Paper>

      <Paper style={{ padding: 12 }}>
        {loading && <Box mt={1}><CircularProgress/></Box>}
        {error && <Box mt={1}><Alert severity="error">{error}</Alert></Box>}

        {!loading && !error && (
          <>
            <Typography variant="subtitle1">عُهَد السائق</Typography>
            <Table size="small" style={{ marginTop: 8 }}>
              <TableHead>
                <TableRow>
                  <TableCell>الكود</TableCell>
                  <TableCell>النوع</TableCell>
                  <TableCell>الحالة</TableCell>
                  <TableCell>تاريخ التسليم</TableCell>
                  <TableCell>متوقع الرجوع</TableCell>
                  <TableCell>رجع في</TableCell>
                  <TableCell>إيداع</TableCell>
                  <TableCell>إجراء</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.length===0 && <TableRow><TableCell colSpan={8} align="center">لا توجد بيانات</TableCell></TableRow>}
                {rows.map(r=>(
                  <TableRow key={r._id}>
                    <TableCell>{r.asset?.code || "-"}</TableCell>
                    <TableCell>{[r.asset?.type, r.asset?.brand, r.asset?.model].filter(Boolean).join(" / ") || "-"}</TableCell>
                    <TableCell>
                      <Chip label={r.status} color={
                        r.status==="active" ? "warning" :
                        r.status==="returned" ? "success" :
                        r.status==="overdue" ? "error" : "default"
                      }/>
                    </TableCell>
                    <TableCell>{r.assignedAt ? new Date(r.assignedAt).toLocaleString() : "-"}</TableCell>
                    <TableCell>{r.expectedReturnAt ? new Date(r.expectedReturnAt).toLocaleString() : "-"}</TableCell>
                    <TableCell>{r.returnedAt ? new Date(r.returnedAt).toLocaleString() : "-"}</TableCell>
                    <TableCell>{r.depositAmount ?? "-"}</TableCell>
                    <TableCell>
                      {r.status==="active" && r.asset?._id && (
                        <Button size="small" onClick={()=>returnAsset(r.asset._id)}>استلام/إرجاع</Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </>
        )}
      </Paper>
    </Box>
  );
}
