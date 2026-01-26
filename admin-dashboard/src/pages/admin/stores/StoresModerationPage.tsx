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
import { useStoresModeration } from "./useStoresModeration";

export default function StoresModerationPage() {
  const {
    rows,
    loading,
    list,
    activate,
    deactivate,
    forceClose,
    forceOpen,
    patch,
    remove,
  } = useStoresModeration();
  const [q, setQ] = useState("");
  const [active, setActive] = useState("");
  const [usageType, setUsageType] = useState("");

  const refetch = () =>
    list({
      q: q || "",
      active: active || "",
      usageType: usageType || "",
    });

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h5" fontWeight="bold">
          Moderation — المتاجر
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
        <TextField
          label="نوع الاستخدام"
          size="small"
          value={usageType}
          onChange={(e) => setUsageType(e.target.value)}
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
                <TableCell>العنوان</TableCell>
                <TableCell>النوع</TableCell>
                <TableCell>الحالة</TableCell>
                <TableCell>Force</TableCell>
                <TableCell width={340}>إجراءات</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r._id} hover>
                  <TableCell>{r.name}</TableCell>
                  <TableCell>{r.address}</TableCell>
                  <TableCell>{r.usageType || "—"}</TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={r.isActive ? "نشط" : "غير نشط"}
                      color={r.isActive ? "success" : "default"}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={r.forceClosed ? "مغلق قسري" : "—"}
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
                    {!r.forceClosed ? (
                      <Button size="small" onClick={() => forceClose(r._id)}>
                        Force Close
                      </Button>
                    ) : (
                      <Button size="small" onClick={() => forceOpen(r._id)}>
                        Force Open
                      </Button>
                    )}
                    <Button
                      size="small"
                      onClick={async () => {
                        const name = prompt("اسم جديد:", r.name) || r.name;
                        if (name && name !== r.name)
                          await patch(r._id, { name });
                      }}
                    >
                      تعديل الاسم
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
