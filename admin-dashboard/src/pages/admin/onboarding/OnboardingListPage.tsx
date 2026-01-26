/**
 * صفحة قائمة طلبات الانضمام
 */

import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Alert,
  TextField,
  MenuItem,
  Stack,
  Button,
  IconButton,
} from '@mui/material';
import { Check as ApproveIcon, Close as RejectIcon, Visibility as ViewIcon } from '@mui/icons-material';
import {
  useOnboardingApplications,
  useApproveApplication,
  useRejectApplication,
} from '@/api/onboarding';

export default function OnboardingListPage() {
  const [page, setPage] = useState('1');
  const [status, setStatus] = useState('');
  const [applicantType, setApplicantType] = useState('');

  const { data, loading, error, refetch } = useOnboardingApplications({
    page,
    limit: '20',
    status,
    applicantType,
  });

  const { mutate: approve, loading: approving } = useApproveApplication({
    onSuccess: () => {
      alert('تم الموافقة على الطلب');
      refetch();
    },
  });

  const { mutate: reject, loading: rejecting } = useRejectApplication({
    onSuccess: () => {
      alert('تم رفض الطلب');
      refetch();
    },
  });

  const handleApprove = (applicationId: string) => {
    if (confirm('هل أنت متأكد من الموافقة على هذا الطلب؟')) {
      approve({ notes: 'تمت الموافقة' }, { params: { id: applicationId } });
    }
  };

  const handleReject = (applicationId: string) => {
    const reason = prompt('سبب الرفض:');
    if (reason) {
      reject({ reason }, { params: { id: applicationId } });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'success';
      case 'rejected': return 'error';
      case 'pending': return 'warning';
      case 'under_review': return 'info';
      default: return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'approved': return 'موافق';
      case 'rejected': return 'مرفوض';
      case 'pending': return 'قيد الانتظار';
      case 'under_review': return 'قيد المراجعة';
      default: return status;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'driver': return 'سائق';
      case 'store': return 'متجر';
      case 'merchant': return 'شريك تجاري';
      default: return type;
    }
  };

  if (loading && !data) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">خطأ في تحميل البيانات: {error.message}</Alert>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        طلبات الانضمام
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack direction="row" spacing={2}>
            <TextField
              select
              label="الحالة"
              variant="outlined"
              size="small"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              sx={{ minWidth: 150 }}
            >
              <MenuItem value="">الكل</MenuItem>
              <MenuItem value="pending">قيد الانتظار</MenuItem>
              <MenuItem value="under_review">قيد المراجعة</MenuItem>
              <MenuItem value="approved">موافق</MenuItem>
              <MenuItem value="rejected">مرفوض</MenuItem>
            </TextField>
            <TextField
              select
              label="النوع"
              variant="outlined"
              size="small"
              value={applicantType}
              onChange={(e) => setApplicantType(e.target.value)}
              sx={{ minWidth: 150 }}
            >
              <MenuItem value="">الكل</MenuItem>
              <MenuItem value="driver">سائق</MenuItem>
              <MenuItem value="store">متجر</MenuItem>
              <MenuItem value="merchant">شريك</MenuItem>
            </TextField>
            <Button variant="outlined" onClick={refetch}>
              تحديث
            </Button>
          </Stack>
        </CardContent>
      </Card>

      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>الاسم</TableCell>
                <TableCell>الهاتف</TableCell>
                <TableCell>النوع</TableCell>
                <TableCell>الحالة</TableCell>
                <TableCell>تاريخ التقديم</TableCell>
                <TableCell>الإجراءات</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data?.data?.map((application) => (
                <TableRow key={application._id}>
                  <TableCell>{application.fullName}</TableCell>
                  <TableCell>{application.phone}</TableCell>
                  <TableCell>{getTypeLabel(application.applicantType)}</TableCell>
                  <TableCell>
                    <Chip
                      label={getStatusLabel(application.status)}
                      color={getStatusColor(application.status) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(application.createdAt).toLocaleDateString('ar-SA')}
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <IconButton size="small" color="primary">
                        <ViewIcon />
                      </IconButton>
                      {application.status === 'pending' && (
                        <>
                          <IconButton
                            size="small"
                            color="success"
                            onClick={() => handleApprove(application._id)}
                            disabled={approving}
                          >
                            <ApproveIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleReject(application._id)}
                            disabled={rejecting}
                          >
                            <RejectIcon />
                          </IconButton>
                        </>
                      )}
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {data && (
          <Box p={2} display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="body2" color="text.secondary">
              إجمالي: {data.total} طلب
            </Typography>
            <Stack direction="row" spacing={1}>
              <Button
                size="small"
                disabled={page === '1'}
                onClick={() => setPage(String(Number(page) - 1))}
              >
                السابق
              </Button>
              <Typography variant="body2" sx={{ px: 2, py: 1 }}>
                صفحة {page}
              </Typography>
              <Button
                size="small"
                onClick={() => setPage(String(Number(page) + 1))}
              >
                التالي
              </Button>
            </Stack>
          </Box>
        )}
      </Card>
    </Box>
  );
}

