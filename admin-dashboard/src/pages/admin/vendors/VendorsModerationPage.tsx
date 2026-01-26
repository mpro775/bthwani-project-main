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
  Chip,
} from "@mui/material";
import { Refresh } from "@mui/icons-material";
import { useVendorsModeration } from "./useVendorsModeration";

export default function VendorsModerationPage() {
  const {
    rows,
    loading,
    list,
    activate,
    deactivate,
    resetPassword,
    patch,
    remove,
  } = useVendorsModeration();
  const [q, setQ] = useState("");
  const [active, setActive] = useState("");

  const refetch = () =>
    list({ q: q || "", active: active || "" });

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h5" fontWeight="bold">
          Moderation — التجّار
        </Typography>
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={refetch}
          disabled={loading}
        >
          تحديث
        </Button>
      </Box>

      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        <TextField
          label="بحث"
          size="small"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && refetch()}
        />
        <TextField
          label="نشط؟ (true/false)"
          size="small"
          value={active}
          onChange={(e) => setActive(e.target.value)}
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
                <TableCell>الاسم</TableCell>
                <TableCell>الهاتف</TableCell>
                <TableCell>البريد</TableCell>
                <TableCell>المتجر</TableCell>
                <TableCell>الحالة</TableCell>
                <TableCell width={300}>إجراءات</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r._id} hover>
                  <TableCell>{r.fullName}</TableCell>
                  <TableCell>{r.phone}</TableCell>
                  <TableCell>{r.email || "—"}</TableCell>
                  <TableCell>{r.store?.name || "—"}</TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={r.isActive ? "نشط" : "موقوف"}
                      color={r.isActive ? "success" : "default"}
                    />
                  </TableCell>
                  <TableCell>
                    {r.isActive ? (
                      <Button size="small" onClick={() => deactivate(r._id)}>
                        تعطيل
                      </Button>
                    ) : (
                      <Button size="small" onClick={() => activate(r._id)}>
                        تفعيل
                      </Button>
                    )}
                    <Button
                      size="small"
                      onClick={async () => {
                        const email = prompt(
                          "بريد جديد (اختياري):",
                          r.email || ""
                        )?.trim();
                        if (email && email !== r.email)
                          await patch(r._id, { email });
                      }}
                    >
                      تعديل بريد
                    </Button>
                    <Button
                      size="small"
                      onClick={async () => {
                        const pw = prompt("كلمة مرور جديدة (>=8):") || "";
                        if (pw.length >= 8) await resetPassword(r._id, pw);
                      }}
                    >
                      Reset PW
                    </Button>
                    <Button
                      size="small"
                      color="error"
                      onClick={() => remove(r._id)}
                    >
                      حذف
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
