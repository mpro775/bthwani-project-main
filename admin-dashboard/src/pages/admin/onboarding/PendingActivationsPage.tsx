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
import { Refresh, Check } from "@mui/icons-material";
import { usePendingActivations } from "./usePendingActivations";
import type { Store } from "antd/es/form/interface";
import type { VendorRow } from "../vendors/useVendorsModeration";

export default function PendingActivationsPage() {
  const { stores, vendors, loading, list, activateStore, activateVendor } =
    usePendingActivations();
  const [q, setQ] = useState("");

  const refetch = () => list({ q: q || "" });

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h5" fontWeight="bold">
          بانتظار التفعيل
        </Typography>
        <Button startIcon={<Refresh />} onClick={refetch} disabled={loading}>
          تحديث
        </Button>
      </Box>

      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        <TextField
          size="small"
          label="بحث بالاسم/الهاتف/البريد"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && refetch()}
        />
      </Stack>

      <Paper sx={{ mb: 3 }}>
        <Typography sx={{ px: 2, pt: 2 }} variant="subtitle1" fontWeight="bold">
          متاجر  مفعّلة
        </Typography>
        {loading ? (
          <Box sx={{ p: 4, display: "flex", justifyContent: "center" }}>
            <CircularProgress />
          </Box>
        ) : (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>المتجر</TableCell>
                <TableCell>العنوان</TableCell>
                <TableCell>الحالة</TableCell>
                <TableCell width={180}>إجراء</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {stores.map((s: Store) => (
                <TableRow key={s._id} hover>
                  <TableCell>{s.name}</TableCell>
                  <TableCell>{s.address}</TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={s.isActive ? "مفعل" : "بانتظار التفعيل"}
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      size="small"
                      startIcon={<Check />}
                      onClick={() => activateStore(s._id)}
                      disabled={s.isActive}
                    >
                      تفعيل المتجر
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {!stores.length && (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    لا يوجد عناصر
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </Paper>

      <Paper>
        <Typography sx={{ px: 2, pt: 2 }} variant="subtitle1" fontWeight="bold">
          تجّار غير مفعّلين
        </Typography>
        {loading ? (
          <Box sx={{ p: 4, display: "flex", justifyContent: "center" }}>
            <CircularProgress />
          </Box>
        ) : (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>الاسم</TableCell>
                <TableCell>الهاتف / البريد</TableCell>
                <TableCell>المتجر</TableCell>
                <TableCell>الحالة</TableCell>
                <TableCell width={180}>إجراء</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {vendors.map((v: VendorRow) => (
                <TableRow key={v._id} hover>
                  <TableCell>{v.fullName}</TableCell>
                  <TableCell>
                    {v.phone}
                    {v.email ? ` / ${v.email}` : ""}
                  </TableCell>
                  <TableCell>{v.store?.name || "—"}</TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={v.isActive ? "مفعل" : "بانتظار التفعيل"}
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      size="small"
                      startIcon={<Check />}
                      onClick={() => activateVendor(v._id)}
                      disabled={v.isActive}
                    >
                      تفعيل التاجر
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {!vendors.length && (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    لا يوجد عناصر
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </Paper>
    </Box>
  );
}
