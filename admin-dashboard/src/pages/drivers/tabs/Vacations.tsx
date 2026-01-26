// src/pages/drivers/tabs/Vacations.tsx
import  { useCallback, useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Paper,
} from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { CheckCircle, Cancel, Visibility } from "@mui/icons-material";
import { api } from "../../../services/api";

interface VacationRequest {
  _id: string;
  driverId: {
    _id: string;
    fullName: string;
    phone: string;
    email: string;
  };
  fromDate: string;
  toDate: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

interface VacationStats {
  pending: number;
  approved: number;
  rejected: number;
  total: number;
}

export default function VacationsTab() {
  const [vacations, setVacations] = useState<VacationRequest[]>([]);
  const [stats, setStats] = useState<VacationStats>({
    pending: 0,
    approved: 0,
    rejected: 0,
    total: 0,
  });
  const [loading, setLoading] = useState(true);
  const [selectedVacation, setSelectedVacation] = useState<VacationRequest | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // فلاتر البحث
  const [filters, setFilters] = useState({
    status: "",
    driverId: "",
    fromDate: null as dayjs.Dayjs | null,
    toDate: null as dayjs.Dayjs | null,
  });

  const fetchVacations = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      if (filters.status) params.append("status", filters.status);
      if (filters.driverId) params.append("driverId", filters.driverId);
      if (filters.fromDate) params.append("from", filters.fromDate.format("YYYY-MM-DD"));
      if (filters.toDate) params.append("to", filters.toDate.format("YYYY-MM-DD"));

      const [vacationsRes, statsRes] = await Promise.all([
        api.get(`/admin/drivers/vacations?${params.toString()}`),
        api.get("/admin/drivers/vacations/stats"),
      ]);

      setVacations(vacationsRes.data);
      setStats(statsRes.data);
    } catch (error) {
      console.error("Error fetching vacations:", error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchVacations();
  }, [fetchVacations]);

  const handleApprove = async (id: string) => {
    try {
      await api.post(`/driver/vacations/${id}/approve`);
      fetchVacations();
    } catch (error) {
      console.error("Error approving vacation:", error);
    }
  };

  const handleReject = async (id: string) => {
    try {
      await api.post(`/driver/vacations/${id}/reject`);
      fetchVacations();
    } catch (error) {
      console.error("Error rejecting vacation:", error);
    }
  };

  const handleViewDetails = (vacation: VacationRequest) => {
    setSelectedVacation(vacation);
    setDialogOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "success";
      case "rejected":
        return "error";
      case "pending":
        return "warning";
      default:
        return "default";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "approved":
        return "معتمد";
      case "rejected":
        return "مرفوض";
      case "pending":
        return "قيد المراجعة";
      default:
        return status;
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box p={3}>
        <Typography variant="h6" gutterBottom>
          إدارة طلبات الإجازات
        </Typography>

        {/* إحصائيات */}
        <Grid container spacing={3} mb={3}>
          <Grid  size={{xs: 12, sm: 6, md: 3}}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  إجمالي الطلبات
                </Typography>
                <Typography variant="h4">{stats.total}</Typography>
              </CardContent>
            </Card>
          </Grid>
            <Grid  size={{xs: 12, sm: 6, md: 3}}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  قيد المراجعة
                </Typography>
                <Typography variant="h4" color="warning.main">
                  {stats.pending}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid  size={{xs: 12, sm: 6, md: 3}}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  معتمدة
                </Typography>
                <Typography variant="h4" color="success.main">
                  {stats.approved}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid  size={{xs: 12, sm: 6, md: 3}}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  مرفوضة
                </Typography>
                <Typography variant="h4" color="error.main">
                  {stats.rejected}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* فلاتر البحث */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid  size={{xs: 12, sm: 6, md: 3}}>
              <FormControl fullWidth>
                <InputLabel>الحالة</InputLabel>
                <Select
                  value={filters.status}
                  onChange={(e) =>
                    setFilters({ ...filters, status: e.target.value })
                  }
                >
                  <MenuItem value="">الكل</MenuItem>
                  <MenuItem value="pending">قيد المراجعة</MenuItem>
                  <MenuItem value="approved">معتمد</MenuItem>
                  <MenuItem value="rejected">مرفوض</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid  size={{xs: 12, sm: 6, md: 3}}>
              <TextField
                fullWidth
                label="رقم السائق"
                value={filters.driverId}
                onChange={(e) =>
                  setFilters({ ...filters, driverId: e.target.value })
                }
              />
            </Grid>
            <Grid  size={{xs: 12, sm: 6, md: 3}}>
              <DatePicker
                label="من تاريخ"
                value={filters.fromDate}
                onChange={(date) =>
                  setFilters({ ...filters, fromDate: date })
                }
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Grid>
            <Grid  size={{xs: 12, sm: 6, md: 3}}>
              <DatePicker
                label="إلى تاريخ"
                value={filters.toDate}
                onChange={(date) =>
                  setFilters({ ...filters, toDate: date })
                }
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Grid>
          </Grid>
        </Paper>

        {/* جدول الطلبات */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>السائق</TableCell>
                <TableCell>الهاتف</TableCell>
                <TableCell>من تاريخ</TableCell>
                <TableCell>إلى تاريخ</TableCell>
                <TableCell>السبب</TableCell>
                <TableCell>الحالة</TableCell>
                <TableCell>تاريخ الطلب</TableCell>
                <TableCell>الإجراءات</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    جارٍ التحميل...
                  </TableCell>
                </TableRow>
              ) : vacations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    لا توجد طلبات إجازات
                  </TableCell>
                </TableRow>
              ) : (
                vacations.map((vacation) => (
                  <TableRow key={vacation._id}>
                    <TableCell>{vacation.driverId.fullName}</TableCell>
                    <TableCell>{vacation.driverId.phone}</TableCell>
                    <TableCell>
                      {dayjs(vacation.fromDate).format("YYYY-MM-DD")}
                    </TableCell>
                    <TableCell>
                      {dayjs(vacation.toDate).format("YYYY-MM-DD")}
                    </TableCell>
                    <TableCell>{vacation.reason || "—"}</TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusLabel(vacation.status)}
                        color={getStatusColor(vacation.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {dayjs(vacation.createdAt).format("YYYY-MM-DD")}
                    </TableCell>
                    <TableCell>
                      <Box display="flex" gap={1}>
                        <IconButton
                          size="small"
                          onClick={() => handleViewDetails(vacation)}
                          color="info"
                        >
                          <Visibility />
                        </IconButton>
                        {vacation.status === "pending" && (
                          <>
                            <IconButton
                              size="small"
                              onClick={() => handleApprove(vacation._id)}
                              color="success"
                            >
                              <CheckCircle />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => handleReject(vacation._id)}
                              color="error"
                            >
                              <Cancel />
                            </IconButton>
                          </>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* نافذة التفاصيل */}
        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>تفاصيل طلب الإجازة</DialogTitle>
          <DialogContent>
            {selectedVacation && (
              <Box>
                <Typography variant="subtitle1" gutterBottom>
                  <strong>السائق:</strong> {selectedVacation.driverId.fullName}
                </Typography>
                <Typography variant="subtitle1" gutterBottom>
                  <strong>الهاتف:</strong> {selectedVacation.driverId.phone}
                </Typography>
                <Typography variant="subtitle1" gutterBottom>
                  <strong>البريد الإلكتروني:</strong> {selectedVacation.driverId.email}
                </Typography>
                <Typography variant="subtitle1" gutterBottom>
                  <strong>من تاريخ:</strong>{" "}
                  {dayjs(selectedVacation.fromDate).format("YYYY-MM-DD")}
                </Typography>
                <Typography variant="subtitle1" gutterBottom>
                  <strong>إلى تاريخ:</strong>{" "}
                  {dayjs(selectedVacation.toDate).format("YYYY-MM-DD")}
                </Typography>
                <Typography variant="subtitle1" gutterBottom>
                  <strong>السبب:</strong> {selectedVacation.reason || "—"}
                </Typography>
                <Typography variant="subtitle1" gutterBottom>
                  <strong>الحالة:</strong>{" "}
                  <Chip
                    label={getStatusLabel(selectedVacation.status)}
                    color={getStatusColor(selectedVacation.status)}
                    size="small"
                  />
                </Typography>
                <Typography variant="subtitle1" gutterBottom>
                  <strong>تاريخ الطلب:</strong>{" "}
                  {dayjs(selectedVacation.createdAt).format("YYYY-MM-DD HH:mm")}
                </Typography>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>إغلاق</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
}
