import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  IconButton,
  Chip,

  CircularProgress,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Avatar,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Search as SearchIcon,
  Person as PersonIcon,
  Schedule as ScheduleIcon,
  CheckCircle as OnlineIcon,
  Cancel as OfflineIcon,
  Timer as TimerIcon,
  Clear as ClearIcon,
  Refresh as RefreshIcon,

} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';

import {
  getDrivers,
  getDriverAttendanceDaily,
  getDriverAttendanceSessions,
  type Driver,
  type DriverAttendanceDaily,
  type DriverAttendanceSession
} from '../../api/drivers';

const DriverStatusCard: React.FC<{
  driver: Driver;
  attendance: DriverAttendanceDaily[];
  sessions: DriverAttendanceSession[];
  onViewDetails: (driver: Driver) => void;
}> = ({ driver, attendance, sessions, onViewDetails }) => {
  const today = dayjs().format('YYYY-MM-DD');
  const todayAttendance = attendance.find(att => att.day === today);
  const activeSession = sessions.find(session => session.driver === driver._id && session.status === 'open');

  const getStatusIcon = () => {
    if (activeSession) return <OnlineIcon color="success" />;
    if (todayAttendance) return <TimerIcon color="warning" />;
    return <OfflineIcon color="error" />;
  };

  const getStatusColor = () => {
    if (activeSession) return 'success';
    if (todayAttendance) return 'warning';
    return 'error';
  };

  const getStatusText = () => {
    if (activeSession) return 'متصل الآن';
    if (todayAttendance) return `حاضر (${dayjs(todayAttendance.firstCheckInAt).format('HH:mm')})`;
    return 'غير متصل';
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}:${mins.toString().padStart(2, '0')}`;
  };

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar
            sx={{
              width: 48,
              height: 48,
              bgcolor: driver.isAvailable ? 'success.main' : 'grey.400',
              mr: 2
            }}
          >
            {getInitials(driver.fullName)}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" noWrap>
              {driver.fullName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {driver.vehicleType} - {driver.role}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {getStatusIcon()}
            <Chip
              label={getStatusText()}
              color={getStatusColor()}
              size="small"
            />
          </Box>
        </Box>

        <Divider sx={{ mb: 2 }} />

        {todayAttendance && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              إحصائيات اليوم:
            </Typography>
            <Grid container spacing={1}>
              <Grid size={{ xs: 6 }}>
                <Typography variant="caption" color="text.secondary">
                  الوقت الإجمالي
                </Typography>
                <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                  {formatDuration(todayAttendance.totalOnlineMins)}
                </Typography>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Typography variant="caption" color="text.secondary">
                  الطلبات
                </Typography>
                <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                  {todayAttendance.ordersDelivered}
                </Typography>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Typography variant="caption" color="text.secondary">
                  المسافة
                </Typography>
                <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                  {todayAttendance.distanceKm.toFixed(1)} كم
                </Typography>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Typography variant="caption" color="text.secondary">
                  الفواصل
                </Typography>
                <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                  {todayAttendance.breaksCount}
                </Typography>
              </Grid>
            </Grid>
          </Box>
        )}

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<ScheduleIcon />}
            onClick={() => onViewDetails(driver)}
            fullWidth
          >
            تفاصيل
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

const AttendanceSummary: React.FC<{
  drivers: Driver[];
  attendance: DriverAttendanceDaily[];
  sessions: DriverAttendanceSession[];
}> = ({ drivers, attendance, sessions }) => {
  const today = dayjs().format('YYYY-MM-DD');
  const todayAttendance = attendance.filter(att => att.day === today);
  const activeSessions = sessions.filter(session => session.status === 'open');

  const onlineNow = activeSessions.length;
  const attendedToday = todayAttendance.length;
  const totalDrivers = drivers.length;
  const absentToday = totalDrivers - attendedToday;

  return (
    <Grid container spacing={2} sx={{ mb: 3 }}>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <OnlineIcon color="success" />
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  {onlineNow}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  متصل الآن
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TimerIcon color="warning" />
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  {attendedToday}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  حضر اليوم
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <OfflineIcon color="error" />
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  {absentToday}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  غائب اليوم
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PersonIcon color="primary" />
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  {totalDrivers}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  إجمالي السائقين
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default function DriverAttendancePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'available' | 'unavailable'>('all');
  const [vehicleFilter, setVehicleFilter] = useState('');
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);

  const queryClient = useQueryClient();

  // Fetch drivers
  const { data: driversData, isLoading: driversLoading } = useQuery({
    queryKey: ['drivers'],
    queryFn: () => getDrivers({ pageSize: 1000 }),
  });

  // Fetch attendance data
  const { data: attendanceData, isLoading: attendanceLoading } = useQuery({
    queryKey: ['driverAttendance'],
    queryFn: () => getDriverAttendanceDaily(),
  });

  // Fetch attendance sessions
  const { data: sessionsData, isLoading: sessionsLoading } = useQuery({
    queryKey: ['driverAttendanceSessions'],
    queryFn: () => getDriverAttendanceSessions(),
  });

  const drivers = driversData?.drivers || [];
  const attendance = attendanceData?.attendance || [];
  const sessions = sessionsData?.sessions || [];

  const filteredDrivers = drivers.filter(driver => {
    const matchesSearch =
      driver.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'available' && driver.isAvailable) ||
      (statusFilter === 'unavailable' && !driver.isAvailable);

    const matchesVehicle = !vehicleFilter || driver.vehicleType === vehicleFilter;

    return matchesSearch && matchesStatus && matchesVehicle;
  });

  const handleViewDetails = (driver: Driver) => {
    setSelectedDriver(driver);
  };

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['drivers'] });
    queryClient.invalidateQueries({ queryKey: ['driverAttendance'] });
    queryClient.invalidateQueries({ queryKey: ['driverAttendanceSessions'] });
  };

  if (driversLoading || attendanceLoading || sessionsLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          إدارة حضور السائقين
        </Typography>

        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={handleRefresh}
        >
          تحديث
        </Button>
      </Box>

      {/* Summary Cards */}
      <AttendanceSummary
        drivers={drivers}
        attendance={attendance}
        sessions={sessions}
      />

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            <TextField
              placeholder="البحث في السائقين..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                endAdornment: searchTerm && (
                  <IconButton size="small" onClick={() => setSearchTerm('')}>
                    <ClearIcon />
                  </IconButton>
                ),
              }}
              sx={{ flex: 1, minWidth: 200 }}
            />

            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>الحالة</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'all' | 'available' | 'unavailable')}
                label="الحالة"
              >
                <MenuItem value="all">الكل</MenuItem>
                <MenuItem value="available">متاح</MenuItem>
                <MenuItem value="unavailable">غير متاح</MenuItem>
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>نوع المركبة</InputLabel>
              <Select
                value={vehicleFilter}
                onChange={(e) => setVehicleFilter(e.target.value)}
                label="نوع المركبة"
              >
                <MenuItem value="">الكل</MenuItem>
                <MenuItem value="motor">دراجة نارية</MenuItem>
                <MenuItem value="bike">دراجة</MenuItem>
                <MenuItem value="car">سيارة</MenuItem>
              </Select>
            </FormControl>

            <Chip
              label={`${filteredDrivers.length} سائق`}
              variant="outlined"
            />
          </Box>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        {filteredDrivers.map((driver) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={driver._id}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <DriverStatusCard
                driver={driver}
                attendance={attendance}
                sessions={sessions}
                onViewDetails={handleViewDetails}
              />
            </motion.div>
          </Grid>
        ))}
      </Grid>

      {filteredDrivers.length === 0 && !driversLoading && (
        <Box sx={{ textAlign: 'center', py: 8, color: 'text.secondary' }}>
          <PersonIcon sx={{ fontSize: 64, mb: 2, opacity: 0.5 }} />
          <Typography variant="h6">لا يوجد سائقون</Typography>
          <Typography variant="body2">
            {searchTerm || statusFilter !== 'all' || vehicleFilter
              ? 'جرب مصطلح بحث مختلف أو تغيير الفلاتر'
              : 'ابدأ بإضافة سائقين جدد'
            }
          </Typography>
        </Box>
      )}

      {/* Driver Details Dialog */}
      {selectedDriver && (
        <Dialog
          open={!!selectedDriver}
          onClose={() => setSelectedDriver(null)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            تفاصيل السائق: {selectedDriver.fullName}
          </DialogTitle>

          <DialogContent>
            <Box sx={{ pt: 2 }}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    معلومات أساسية:
                  </Typography>
                  <Box sx={{ pl: 2 }}>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      <strong>الاسم:</strong> {selectedDriver.fullName}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      <strong>الهاتف:</strong> {selectedDriver.phone}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      <strong>البريد الإلكتروني:</strong> {selectedDriver.email}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      <strong>نوع المركبة:</strong> {selectedDriver.vehicleType}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      <strong>الدور:</strong> {selectedDriver.role}
                    </Typography>
                  </Box>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    حالة الحساب:
                  </Typography>
                  <Box sx={{ pl: 2 }}>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      <strong>الحالة:</strong>
                      <Chip
                        label={selectedDriver.isAvailable ? 'متاح' : 'غير متاح'}
                        color={selectedDriver.isAvailable ? 'success' : 'error'}
                        size="small"
                        sx={{ ml: 1 }}
                      />
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      <strong>مُتحقق:</strong>
                      <Chip
                        label={selectedDriver.isVerified ? 'نعم' : 'لا'}
                        color={selectedDriver.isVerified ? 'success' : 'warning'}
                        size="small"
                        sx={{ ml: 1 }}
                      />
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      <strong>محظور:</strong>
                      <Chip
                        label={selectedDriver.isBanned ? 'نعم' : 'لا'}
                        color={selectedDriver.isBanned ? 'error' : 'success'}
                        size="small"
                        sx={{ ml: 1 }}
                      />
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              {selectedDriver.residenceLocation && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    موقع السكن:
                  </Typography>
                  <Typography variant="body2">
                    {selectedDriver.residenceLocation.address}, {selectedDriver.residenceLocation.city}, {selectedDriver.residenceLocation.governorate}
                  </Typography>
                </Box>
              )}
            </Box>
          </DialogContent>

          <DialogActions>
            <Button onClick={() => setSelectedDriver(null)}>
              إغلاق
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
}
