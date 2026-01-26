import { useEffect, useState } from "react";
import axios from "../../../utils/axios";
import {
  Box,
  Paper,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import dayjs from "dayjs";

type DocRow = {
  _id: string;
  driver: string;
  type: string;
  number?: string;
  issuedAt?: string;
  expiresAt?: string;
  fileUrl?: string;
  status: "pending" | "approved" | "rejected";
  createdAt?: string;
};

export default function DocumentsTab({ id }: { id: string }) {
  const [rows, setRows] = useState<DocRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState<string>("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const r = await axios.get("/admin/drivers/docs", {
        params: { driver: id, status: status || undefined },
      });
      setRows(r.data?.items || []);
    } catch (e: unknown) {
      setError(
        (e as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || (e as Error).message
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(); /* eslint-disable-next-line */
  }, [id, status]);

  const approve = async (docId: string, newStatus: "approved" | "rejected") => {
    try {
      await axios.patch(`/admin/drivers/docs/${docId}`, { status: newStatus });
      await load();
    } catch (e: unknown) {
      setError(
        (e as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || (e as Error).message
      );
    }
  };

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <Paper style={{ padding: 12 }}>
        <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
          <FormControl size="small">
            <InputLabel>الحالة</InputLabel>
            <Select
              label="الحالة"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <MenuItem value="">
                <em>الكل</em>
              </MenuItem>
              {["pending", "approved", "rejected"].map((s) => (
                <MenuItem key={s} value={s}>
                  {s}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button variant="contained" onClick={load}>
            تحديث
          </Button>
        </Box>

        {loading && (
          <Box mt={2}>
            <CircularProgress />
          </Box>
        )}
        {error && (
          <Box mt={2}>
            <Alert severity="error">{error}</Alert>
          </Box>
        )}

        {!loading && !error && (
          <Table size="small" style={{ marginTop: 12 }}>
            <TableHead>
              <TableRow>
                <TableCell>النوع</TableCell>
                <TableCell>الرقم</TableCell>
                <TableCell>الإصدار</TableCell>
                <TableCell>الانتهاء</TableCell>
                <TableCell>الملف</TableCell>
                <TableCell>الحالة</TableCell>
                <TableCell>إجراءات</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    لا توجد بيانات
                  </TableCell>
                </TableRow>
              )}
              {rows.map((d) => (
                <TableRow key={d._id}>
                  <TableCell>{d.type}</TableCell>
                  <TableCell>{d.number || "-"}</TableCell>
                  <TableCell>
                    {d.issuedAt
                      ? new Date(d.issuedAt).toLocaleDateString()
                      : "-"}
                  </TableCell>
                  <TableCell>
                    {d.expiresAt ? (
                      <>
                        {new Date(d.expiresAt).toLocaleDateString()}{" "}
                        {dayjs(d.expiresAt).isBefore(dayjs()) && (
                          <Chip size="small" label="منتهي" color="error" />
                        )}
                        {dayjs(d.expiresAt).isAfter(dayjs()) &&
                          dayjs(d.expiresAt).diff(dayjs(), "day") <= 30 && (
                            <Chip
                              size="small"
                              label="قريب الانتهاء"
                              color="warning"
                            />
                          )}
                      </>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell>
                    {d.fileUrl ? (
                      <a href={d.fileUrl} target="_blank" rel="noreferrer">
                        عرض
                      </a>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={d.status}
                      color={
                        d.status === "approved"
                          ? "success"
                          : d.status === "pending"
                          ? "warning"
                          : "error"
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Box display="flex" gap={1}>
                      <Button
                        size="small"
                        onClick={() => approve(d._id, "approved")}
                      >
                        قبول
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        onClick={() => approve(d._id, "rejected")}
                      >
                        رفض
                      </Button>
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
