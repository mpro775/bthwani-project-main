import { useEffect, useState, useCallback } from "react";
import { Box, Button, Card, CardContent, Grid, IconButton, Stack, TextField, Typography } from "@mui/material";
import { Delete, Save } from "@mui/icons-material";
import { listStrings, upsertString, deleteString, type CmsString,  } from "../../api/cmsApi";

export default function CmsStringsPage() {
  const [q, setQ] = useState("");
  const [rows, setRows] = useState<CmsString[]>([]);
  const [draft, setDraft] = useState<CmsString>({ key: "" });

  const load = useCallback(async () => { setRows(await listStrings(q)); }, [q]);
  useEffect(() => { load(); }, [load]);

  async function saveRow(item: CmsString) { await upsertString(item); await load(); }
  async function remove(id?: string) { if (!id || !confirm("تأكيد الحذف؟")) return; await deleteString(id); await load(); }
  async function create() { if (!draft.key) return; await upsertString(draft); setDraft({ key: "" }); await load(); }

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5">Strings (i18n)</Typography>
        <Stack direction="row" gap={1}>
          <TextField size="small" placeholder="بحث بالمفتاح" value={q} onChange={(e) => setQ(e.target.value)}/>
          <Button variant="outlined" onClick={load}>بحث</Button>
        </Stack>
      </Stack>

      <Grid container spacing={2}>
        {rows.map((s) => (
          <Grid  size={{xs: 12, md: 6}} key={s._id || s.key}>
            <Card>
              <CardContent>
                <Typography variant="caption" color="text.secondary">{s.key}</Typography>
                <Grid container spacing={1} mt={0.5}>
                  <Grid  size={{xs: 12, md: 6}}><TextField label="ar" fullWidth value={s.ar || ""} onChange={(e) => setRows(prev => prev.map(x => x === s ? { ...x, ar: e.target.value } : x))}/></Grid>
                  <Grid  size={{xs: 12, md: 6}}><TextField label="en" fullWidth value={s.en || ""} onChange={(e) => setRows(prev => prev.map(x => x === s ? { ...x, en: e.target.value } : x))}/></Grid>
                </Grid>
                <Stack direction="row" justifyContent="end" gap={1} mt={1}>
                  {s._id && <IconButton color="error" onClick={() => remove(s._id)}><Delete/></IconButton>}
                  <IconButton color="primary" onClick={() => saveRow(s)}><Save/></IconButton>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Card sx={{ mt: 2 }}>
        <CardContent>
          <Typography fontWeight={700} mb={1}>إضافة مفتاح جديد</Typography>
          <Grid container spacing={1}>
            <Grid  size={{xs: 12, md: 4}}><TextField label="key (ex: onboarding.skip)" fullWidth value={draft.key} onChange={(e) => setDraft({ ...draft, key: e.target.value })}/></Grid>
            <Grid  size={{xs: 12, md: 4}}><TextField label="ar" fullWidth value={draft.ar || ""} onChange={(e) => setDraft({ ...draft, ar: e.target.value })}/></Grid>
            <Grid  size={{xs: 12, md: 4}}><TextField label="en" fullWidth value={draft.en || ""} onChange={(e) => setDraft({ ...draft, en: e.target.value })}/></Grid>
          </Grid>
          <Stack direction="row" justifyContent="end" mt={1}><Button variant="contained" onClick={create} disabled={!draft.key}>إضافة</Button></Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
