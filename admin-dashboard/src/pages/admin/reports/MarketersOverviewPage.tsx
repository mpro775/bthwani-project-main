import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TextField,
  Button,
  CircularProgress,
  Chip,
} from "@mui/material";
import { Refresh } from "@mui/icons-material";
import { useOverview } from "./useMarketerReports";

type MarketersOverviewItem = {
  uid: string;
  submittedW: number;
  approvedW: number;
  needsFixW: number;
  rejectedW: number;
  approvalRate: number;
};
export default function MarketersOverviewPage() {
  const { rows, loading, list } = useOverview();
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const nav = useNavigate();
  const refetch = () => list({ from: from || "", to: to || "" });

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h5" fontWeight="bold">
          تقارير المسوّقين — إجمالي
        </Typography>
        <Button startIcon={<Refresh />} onClick={refetch} disabled={loading}>
          تحديث
        </Button>
      </Box>
      <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
        <TextField
          type="date"
          size="small"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
        />
        <TextField
          type="date"
          size="small"
          value={to}
          onChange={(e) => setTo(e.target.value)}
        />
      </Box>
      <Paper>
        {loading ? (
          <Box sx={{ p: 4, display: "flex", justifyContent: "center" }}>
            <CircularProgress />
          </Box>
        ) : (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>UID</TableCell>
                <TableCell>Submitted (W)</TableCell>
                <TableCell>Approved (W)</TableCell>
                <TableCell>NeedsFix (W)</TableCell>
                <TableCell>Rejected (W)</TableCell>
                <TableCell>Approval Rate</TableCell>
                <TableCell>فتح</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((r: MarketersOverviewItem) => (
                <TableRow key={r.uid} hover>
                  <TableCell>{r.uid}</TableCell>
                  <TableCell>{r.submittedW?.toFixed(2)}</TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      color="success"
                      label={r.approvedW?.toFixed(2)}
                    />
                  </TableCell>
                  <TableCell>{r.needsFixW?.toFixed(2)}</TableCell>
                  <TableCell>{r.rejectedW?.toFixed(2)}</TableCell>
                  <TableCell>
                    {Math.round((r.approvalRate || 0) * 100)}%
                  </TableCell>
                  <TableCell>
                    <Button
                      size="small"
                      onClick={() => nav(`/admin/reports/marketers/${r.uid}`)}
                    >
                      عرض
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
