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
  Alert,
} from "@mui/material";
import { Add, Refresh } from "@mui/icons-material";
import { useMarketersLegacy } from "@/api/marketers";
import MarketerDialog from "./MarketerDialog";
import type { Marketer as ApiMarketer } from "@/api/marketers";

// Type متوافق مع MarketerDialog
type Marketer = ApiMarketer & {
  fullName?: string;
  password?: string;
  team?: string;
  area?: string;
  city?: string;
};

export default function MarketersPage() {
  const {
    rows,
    loading,
    error,
    list,
    create,
    patch,
    setStatus,
    resetPassword,
    remove,
  } = useMarketersLegacy();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Marketer | null>(null);
  const [q, setQ] = useState("");
  const [status, setStatusFilter] = useState<string>("");

  const refetch = () =>
      list({ q: q || "", status: status || "" });

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          mb: 2,
          alignItems: "center",
        }}
      >
        <Typography variant="h5" fontWeight="bold">
          إدارة المسوّقين
        </Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={refetch}
            disabled={loading}
          >
            تحديث
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => {
              setEditing(null);
              setOpen(true);
            }}
          >
            إضافة مسوّق
          </Button>
        </Box>
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
          label="الحالة (active/suspended)"
          size="small"
          value={status}
          onChange={(e) => setStatusFilter(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && refetch()}
        />
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

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
                <TableCell>الفريق</TableCell>
                <TableCell>المنطقة</TableCell>
                <TableCell>الحالة</TableCell>
                <TableCell width={320}>إجراءات</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r._id} hover>
                  <TableCell>{r.fullName}</TableCell>
                  <TableCell>{r.phone}</TableCell>
                  <TableCell>{r.email || "—"}</TableCell>
                  <TableCell>{r.team || "—"}</TableCell>
                  <TableCell>{r.area || "—"}</TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={r.status}
                      color={r.status === "active" ? "success" : "default"}
                    />
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      <Button
                        size="small"
                        onClick={() => {
                          setEditing(r);
                          setOpen(true);
                        }}
                      >
                        تعديل
                      </Button>

                      <Button
                        size="small"
                        onClick={() =>
                          setStatus(
                            r._id,
                            r.status === "active" ? "suspended" : "active"
                          )
                        }
                      >
                        {r.status === "active" ? "تعليق" : "تفعيل"}
                      </Button>

                      <Button
                        size="small"
                        onClick={async () => {
                          const pw =
                            prompt("كلمة مرور جديدة (>=8 أحرف):")?.trim() || "";
                          if (pw.length >= 8) {
                            await resetPassword(r._id, pw);
                            alert("تم تحديث كلمة المرور");
                          } else if (pw) {
                            alert("الحد الأدنى 8 أحرف");
                          }
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
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
              {!rows.length && (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    لا يوجد مسوّقون
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </Paper>

      <MarketerDialog
        open={open}
        editing={editing}
        onClose={() => setOpen(false)}
        onSave={async (payload) => {
          if (editing) await patch(editing._id, payload);
          else await create(payload);
          setOpen(false);
        }}
      />
    </Box>
  );
}
