import { useEffect, useState, useCallback } from "react";
import { listStrings, upsertString, deleteString, type CmsString } from "../../api/cmsApi";
import { Box, Button, Card, CardContent, CardHeader, IconButton, Stack, TextField, Typography } from "@mui/material";
import { Delete } from "@mui/icons-material";

export default function StringsAdmin() {
  const [q, setQ] = useState("");
  const [rows, setRows] = useState<CmsString[]>([]);
  const [draft, setDraft] = useState<CmsString>({ key: "" });

  const load = useCallback(async () => { setRows(await listStrings(q)); }, [q]);
  useEffect(() => { load(); }, [load]);

  async function saveRow(s: CmsString) { await upsertString(s); load(); }
  async function remove(id?: string) { if (!id) return; if (!confirm("تأكيد الحذف؟")) return; await deleteString(id); load(); }
  async function add() { if (!draft.key) return; await upsertString(draft); setDraft({ key: "" }); load(); }

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5">Strings (i18n)</Typography>
        <Stack direction="row" spacing={1}>
          <TextField size="small" placeholder="بحث بالمفتاح" value={q} onChange={(e) => setQ(e.target.value)} />
          <Button variant="outlined" onClick={load}>بحث</Button>
        </Stack>
      </Stack>

      <Card sx={{ mb: 2 }}>
        <CardHeader title="إضافة مفتاح" />
        <CardContent>
          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <TextField fullWidth label="key (ex: onboarding.skip)" value={draft.key} onChange={(e) => setDraft({ ...draft, key: e.target.value })} />
            <TextField fullWidth label="ar" value={draft.ar || ""} onChange={(e) => setDraft({ ...draft, ar: e.target.value })} />
            <TextField fullWidth label="en" value={draft.en || ""} onChange={(e) => setDraft({ ...draft, en: e.target.value })} />
            <Button variant="contained" onClick={add} disabled={!draft.key}>إضافة</Button>
          </Stack>
        </CardContent>
      </Card>

      <Stack spacing={2}>
        {rows.map((s) => (
          <Card key={s._id || s.key}>
            <CardContent>
              <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems="center">
                <Typography sx={{ minWidth: 260 }} variant="subtitle2">{s.key}</Typography>
                <TextField fullWidth label="ar" value={s.ar || ""} onChange={(e) => setRows((prev) => prev.map((x) => x === s ? { ...x, ar: e.target.value } : x))} />
                <TextField fullWidth label="en" value={s.en || ""} onChange={(e) => setRows((prev) => prev.map((x) => x === s ? { ...x, en: e.target.value } : x))} />
                <Stack direction="row" spacing={1}>
                  <Button onClick={() => saveRow(s)} variant="contained">حفظ</Button>
                  {s._id && <IconButton color="error" onClick={() => remove(s._id)}><Delete /></IconButton>}
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Stack>
    </Box>
  );
}
