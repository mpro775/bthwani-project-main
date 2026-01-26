import { useParams } from "react-router-dom";
import { Box, Typography, Paper, CircularProgress, Table, TableHead, TableRow, TableCell, TableBody } from "@mui/material";
import { usePerMarketer } from "./useMarketerReports";

export default function MarketerReportPage(){
  const { uid="" } = useParams();
  const { data, loading } = usePerMarketer(uid);
  const summary = Array.isArray(data) ? data[0] : null;

  return (
    <Box>
      <Typography variant="h5" fontWeight="bold" sx={{ mb:2 }}>تفاصيل المسوّق — {uid}</Typography>
      <Paper sx={{ p:2, mb:2 }}>
        {loading || !summary ? <CircularProgress/> : (
          <Box>
            <div>Submitted: {summary.submittedW}</div>
            <div>Approved: {summary.approvedW}</div>
            <div>Needs Fix: {summary.needsFixW}</div>
            <div>Rejected: {summary.rejectedW}</div>
            <div>Approval Rate: {Math.round((summary.approvalRate||0)*100)}%</div>
          </Box>
        )}
      </Paper>
      <Paper>
        {loading || !data ? <Box sx={{ p:4, display:"flex", justifyContent:"center" }}><CircularProgress/></Box> : (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Marketer UID</TableCell>
                <TableCell>Submitted</TableCell>
                <TableCell>Approved</TableCell>
                <TableCell>Needs Fix</TableCell>
                <TableCell>Rejected</TableCell>
                <TableCell>Approval Rate</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((it) => (
                <TableRow key={it.uid} hover>
                  <TableCell>{it.uid}</TableCell>
                  <TableCell>{it.submittedW}</TableCell>
                  <TableCell>{it.approvedW}</TableCell>
                  <TableCell>{it.needsFixW}</TableCell>
                  <TableCell>{it.rejectedW}</TableCell>
                  <TableCell>{Math.round((it.approvalRate||0)*100)}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Paper>
    </Box>
  );
}
