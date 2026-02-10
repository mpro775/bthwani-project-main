import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  CircularProgress,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon, Bloodtype as BloodIcon, Person as PersonIcon } from '@mui/icons-material';
import { getEs3afniDonorsList } from '../../../api/es3afni';
import type { Es3afniDonorItem } from '../../../types/es3afni';
import RequireAdminPermission from '../../../components/RequireAdminPermission';

const Es3afniDonorsPage: React.FC = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<Es3afniDonorItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [bloodTypeFilter, setBloodTypeFilter] = useState<string>('all');
  const [availableFilter, setAvailableFilter] = useState<string>('all');
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);

  const fetchDonors = useCallback(async (cursor?: string, append = false) => {
    try {
      setLoading(true);
      const params: Record<string, string | number | boolean> = { limit: 25 };
      if (cursor) params.cursor = cursor;
      if (bloodTypeFilter !== 'all') params.bloodType = bloodTypeFilter;
      if (availableFilter === 'true') params.available = true;
      if (availableFilter === 'false') params.available = false;

      const response = await getEs3afniDonorsList(params);
      const list = response.items || [];

      setItems((prev) => (append ? [...prev, ...list] : list));
      setNextCursor(response.nextCursor ?? null);
      setHasMore(!!response.nextCursor && list.length === 25);
    } catch (error) {
      console.error('خطأ في جلب قائمة المتبرعين:', error);
    } finally {
      setLoading(false);
    }
  }, [bloodTypeFilter, availableFilter]);

  useEffect(() => {
    fetchDonors();
  }, [fetchDonors]);

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  return (
    <RequireAdminPermission permission="read">
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/admin/es3afni')} variant="outlined">
            العودة لبلاغات إسعفني
          </Button>
          <Typography variant="h4">قائمة المتبرعين</Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          عرض قراءة فقط (بدون موقع دقيق حفاظاً على الخصوصية)
        </Typography>

        <Paper sx={{ p: 2, mb: 3 }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel>فصيلة الدم</InputLabel>
              <Select
                value={bloodTypeFilter}
                onChange={(e) => setBloodTypeFilter(e.target.value)}
                label="فصيلة الدم"
              >
                <MenuItem value="all">الكل</MenuItem>
                {bloodTypes.map((t) => (
                  <MenuItem key={t} value={t}>{t}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel>التوفر</InputLabel>
              <Select
                value={availableFilter}
                onChange={(e) => setAvailableFilter(e.target.value)}
                label="التوفر"
              >
                <MenuItem value="all">الكل</MenuItem>
                <MenuItem value="true">متاح</MenuItem>
                <MenuItem value="false">غير متاح</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </Paper>

        <Paper>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>معرف المستخدم</TableCell>
                <TableCell>فصيلة الدم</TableCell>
                <TableCell>متاح</TableCell>
                <TableCell>آخر تبرع</TableCell>
                <TableCell>المدينة</TableCell>
                <TableCell>المحافظة</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading && items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <CircularProgress size={24} />
                  </TableCell>
                </TableRow>
              ) : items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography color="text.secondary">لا يوجد متبرعون</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                items.map((row) => (
                  <TableRow key={row._id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PersonIcon fontSize="small" color="action" />
                        <Typography variant="body2">{String(row.userId)}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <BloodIcon color="error" fontSize="small" />
                        <Typography variant="body2">{row.bloodType}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color={row.available ? 'success.main' : 'text.secondary'}>
                        {row.available ? 'نعم' : 'لا'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {row.lastDonation
                          ? new Date(row.lastDonation).toLocaleDateString('ar-SA')
                          : '—'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{row.city || '—'}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{row.governorate || '—'}</Typography>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          {hasMore && (
            <Box sx={{ p: 2, textAlign: 'center' }}>
              <Button
                variant="outlined"
                onClick={() => fetchDonors(nextCursor ?? undefined, true)}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={16} /> : null}
              >
                {loading ? 'جاري التحميل...' : 'تحميل المزيد'}
              </Button>
            </Box>
          )}
        </Paper>
      </Box>
    </RequireAdminPermission>
  );
};

export default Es3afniDonorsPage;
