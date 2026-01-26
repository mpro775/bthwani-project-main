import { useState } from "react";
import {
  Box,
  Button,
  Typography,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  CircularProgress,
  TextField,
  Stack,
} from "@mui/material";
import { Refresh, Check, Close, Feedback } from "@mui/icons-material";
import { useOnboardingLegacy as useOnboarding } from "@/api/onboarding";

export default function OnboardingQueuePage() {
  const { rows, loading, list, approve, reject, needsFix } = useOnboarding();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("submitted");

  const refetch = () => list({ q: q || "", status });

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h5" fontWeight="bold">
          طابور المراجعة
        </Typography>
        <Button startIcon={<Refresh />} onClick={refetch} disabled={loading}>
          تحديث
        </Button>
      </Box>
      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        <TextField
          size="small"
          label="بحث بالاسم"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && refetch()}
        />
        <TextField
          size="small"
          label="الحالة"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && refetch()}
        />
      </Stack>
      <Paper>
        {loading ? (
          <Box sx={{ p: 4, display: "flex", justifyContent: "center" }}>
            <CircularProgress />
          </Box>
        ) : (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>المتجر</TableCell>
                <TableCell>المالك</TableCell>
                <TableCell>الحالة</TableCell>
                <TableCell width={320}>إجراءات</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r._id} hover>
                  <TableCell>
                    {r.storeDraft.name}
                    <br />
                    <small>{r.storeDraft.address}</small>
                  </TableCell>
                  <TableCell>
                    {r.ownerDraft?.fullName || "—"}
                    <br />
                    <small>
                      {r.ownerDraft?.phone || r.ownerDraft?.email || ""}
                    </small>
                  </TableCell>
                  <TableCell>{r.status}</TableCell>
                  <TableCell>
                    <Button
                      size="small"
                      startIcon={<Check />}
                      onClick={async () => {
                        const pw =
                          prompt("كلمة مرور للتاجر (إن أردت تعيينها الآن):") ||
                          undefined;
                        await approve(r._id, pw);
                      }}
                    >
                      اعتماد
                    </Button>
                    <Button
                      size="small"
                      color="warning"
                      startIcon={<Feedback />}
                      onClick={async () => {
                        const notes = prompt("ملاحظات (needs_fix):") || "";
                        if (notes) await needsFix(r._id, notes);
                      }}
                    >
                      إرجاع للتعديل
                    </Button>
                    <Button
                      size="small"
                      color="error"
                      startIcon={<Close />}
                      onClick={async () => {
                        const reason = prompt("سبب الرفض:") || "";
                        if (reason) await reject(r._id, reason);
                      }}
                    >
                      رفض
                    </Button>
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
