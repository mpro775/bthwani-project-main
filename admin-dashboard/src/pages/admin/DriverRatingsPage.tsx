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

  Rating,
} from '@mui/material';
import {
  Search as SearchIcon,
  Star as StarIcon,
  Person as PersonIcon,
  RateReview as ReviewIcon,
  TrendingUp as TrendingIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';

import {
  getDriverRatings,
  getDriverRatingsByDriver,
  getDriverRatingStats,
  type DriverRating,
} from '../../api/driverRatings';
import { getDrivers, type Driver } from '../../api/drivers';
type DriverWithStats = Driver & { averageRating?: number; totalRatings?: number };

const RatingDistribution: React.FC<{
  distribution: { 1: number; 2: number; 3: number; 4: number; 5: number };
  total: number;
}> = ({ distribution, total }) => {
  const getPercentage = (count: number) => {
    return total > 0 ? (count / total) * 100 : 0;
  };

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>
        توزيع التقييمات
      </Typography>

      {[5, 4, 3, 2, 1].map((rating) => (
        <Box key={rating} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Typography variant="body2" sx={{ width: 20 }}>
            {rating}
          </Typography>
          <StarIcon sx={{ color: 'warning.main', mx: 0.5 }} />
          <Box sx={{ flex: 1, mx: 1 }}>
            <Box
              sx={{
                width: '100%',
                height: 8,
                bgcolor: 'grey.200',
                borderRadius: 4,
                overflow: 'hidden',
              }}
            >
              <Box
                sx={{
                  width: `${getPercentage(distribution[rating as keyof typeof distribution])}%`,
                  height: '100%',
                  bgcolor: 'warning.main',
                  borderRadius: 4,
                }}
              />
            </Box>
          </Box>
          <Typography variant="body2" color="text.secondary">
            {distribution[rating as keyof typeof distribution]}
          </Typography>
        </Box>
      ))}
    </Box>
  );
};

const DriverRatingCard: React.FC<{
  rating: DriverRating;
  driverName?: string;
  userName?: string;
  orderNumber?: string;
}> = ({ rating, driverName, userName, orderNumber }) => {
  const formatDate = (dateString: string) => {
    return dayjs(dateString).format('YYYY-MM-DD HH:mm');
  };

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
            <PersonIcon />
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6">
              {driverName || `سائق ${rating.driver}`}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              طلب #{orderNumber || rating.order}
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            <Rating value={rating.rating} readOnly precision={0.5} />
            <Typography variant="body2" color="text.secondary">
              {formatDate(rating.createdAt || '')}
            </Typography>
          </Box>
        </Box>

        {rating.comment && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
              "{rating.comment}"
            </Typography>
          </Box>
        )}

        <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="caption" color="text.secondary">
            من: {userName || `عميل ${rating.user}`}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

const TopDriversCard: React.FC<{
  drivers: Driver[];
  onDriverSelect: (driver: Driver) => void;
}> = ({ drivers, onDriverSelect }) => {
  const topDrivers = drivers.slice(0, 5);

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <TrendingIcon />
          أفضل السائقين تقييماً
        </Typography>

        {topDrivers.map((driver, index) => (
          <Box
            key={driver._id}
            sx={{
              display: 'flex',
              alignItems: 'center',
              py: 1,
              px: 1,
              mb: 1,
              borderRadius: 1,
              cursor: 'pointer',
              '&:hover': { bgcolor: 'action.hover' },
            }}
            onClick={() => onDriverSelect(driver)}
          >
            <Typography variant="body2" sx={{ width: 24, fontWeight: 'bold' }}>
              #{index + 1}
            </Typography>
            <Avatar sx={{ width: 32, height: 32, mx: 1 }}>
              {driver.fullName?.charAt(0)}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2">
                {driver.fullName}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {driver.vehicleType}
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'right' }}>
              <Rating value={(driver as DriverWithStats)?.averageRating || 0} readOnly size="small" />
              <Typography variant="caption" color="text.secondary">
                ({(driver as DriverWithStats)?.totalRatings || 0})
              </Typography>
            </Box>
          </Box>
        ))}
      </CardContent>
    </Card>
  );
};

export default function DriverRatingsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [ratingFilter, setRatingFilter] = useState<number | ''>('');
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [showStats, setShowStats] = useState(false);

  // Fetch drivers
  const { data: driversData } = useQuery({
    queryKey: ['drivers'],
    queryFn: () => getDrivers({ pageSize: 1000 }),
  });

  // Fetch ratings
  const { data: ratingsData, isLoading } = useQuery({
    queryKey: ['driverRatings', selectedDriver?._id],
    queryFn: () => selectedDriver ?
      getDriverRatingsByDriver(selectedDriver._id!) :
      getDriverRatings(),
    enabled: !!driversData,
  });

  // Fetch rating statistics for selected driver
  const { data: ratingStats } = useQuery({
    queryKey: ['driverRatingStats', selectedDriver?._id],
    queryFn: () => selectedDriver ?
      getDriverRatingStats(selectedDriver._id!) :
      Promise.resolve(null),
    enabled: !!selectedDriver,
  });

  const drivers = driversData?.drivers || [];
  const ratings = ratingsData?.ratings || [];

  const filteredRatings = ratings.filter(rating => {
    const driver = drivers.find(d => d._id === rating.driver);
    const matchesSearch =
      (driver?.fullName?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (driver?.phone?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (rating.comment?.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesRating = !ratingFilter || rating.rating === ratingFilter;

    return matchesSearch && matchesRating;
  });

  const handleDriverSelect = (driver: Driver) => {
    setSelectedDriver(driver);
    setShowStats(true);
  };

  const handleBackToList = () => {
    setSelectedDriver(null);
    setShowStats(false);
  };

  if (isLoading) {
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
          تقييمات السائقين
        </Typography>

        {!selectedDriver && (
          <Button
            variant="outlined"
            startIcon={<ReviewIcon />}
            onClick={() => setShowStats(!showStats)}
          >
            {showStats ? 'إخفاء الإحصائيات' : 'عرض الإحصائيات'}
          </Button>
        )}

        {selectedDriver && (
          <Button
            variant="outlined"
            onClick={handleBackToList}
          >
            العودة للقائمة
          </Button>
        )}
      </Box>

      {!selectedDriver && showStats && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, md: 4 }}>
            <TopDriversCard
              drivers={drivers}
              onDriverSelect={handleDriverSelect}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 8 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  إحصائيات عامة
                </Typography>

                <Grid container spacing={2}>
                  <Grid size={{ xs: 6, sm: 3 }}>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                      {ratings.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      إجمالي التقييمات
                    </Typography>
                  </Grid>

                  <Grid size={{ xs: 6, sm: 3 }}>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'warning.main' }}>
                      {ratings.length > 0 ? (ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length).toFixed(1) : '0.0'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      متوسط التقييم
                    </Typography>
                  </Grid>

                  <Grid size={{ xs: 6, sm: 3 }}>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                      {ratings.filter(r => r.rating >= 4).length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      تقييمات عالية (4+)
                    </Typography>
                  </Grid>

                  <Grid size={{ xs: 6, sm: 3 }}>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'error.main' }}>
                      {ratings.filter(r => r.rating <= 2).length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      تقييمات منخفضة (2-)
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            <TextField
              placeholder="البحث في التقييمات..."
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
              <InputLabel>التقييم</InputLabel>
              <Select
                value={ratingFilter.toString()}
                onChange={(e) => setRatingFilter(e.target.value === '' ? '' : parseInt(e.target.value))}
                label="التقييم"
              >
                <MenuItem value="">الكل</MenuItem>
                <MenuItem value="5">5 نجوم</MenuItem>
                <MenuItem value="4">4 نجوم</MenuItem>
                <MenuItem value="3">3 نجوم</MenuItem>
                <MenuItem value="2">2 نجوم</MenuItem>
                <MenuItem value="1">1 نجم</MenuItem>
              </Select>
            </FormControl>

            <Chip
              label={`${filteredRatings.length} تقييم`}
              variant="outlined"
            />
          </Box>
        </CardContent>
      </Card>

      {selectedDriver && ratingStats && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  إحصائيات السائق
                </Typography>

                <Box sx={{ textAlign: 'center', mb: 2 }}>
                  <Typography variant="h3" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                    {ratingStats.averageRating.toFixed(1)}
                  </Typography>
                  <Rating value={ratingStats.averageRating} readOnly precision={0.1} size="large" />
                  <Typography variant="body2" color="text.secondary">
                    متوسط التقييم
                  </Typography>
                </Box>

                <Typography variant="body2" color="text.secondary">
                  إجمالي التقييمات: {ratingStats.totalRatings}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 8 }}>
            <Card>
              <CardContent>
                <RatingDistribution
                  distribution={ratingStats.ratingDistribution}
                  total={ratingStats.totalRatings}
                />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {filteredRatings.map((rating) => {
            const driver = drivers.find(d => d._id === rating.driver);
            return (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={rating._id}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <DriverRatingCard
                    rating={rating}
                    driverName={driver?.fullName}
                    orderNumber={rating.order}
                  />
                </motion.div>
              </Grid>
            );
          })}
        </Grid>
      )}

      {filteredRatings.length === 0 && !isLoading && (
        <Box sx={{ textAlign: 'center', py: 8, color: 'text.secondary' }}>
          <ReviewIcon sx={{ fontSize: 64, mb: 2, opacity: 0.5 }} />
          <Typography variant="h6">لا توجد تقييمات</Typography>
          <Typography variant="body2">
            {searchTerm || ratingFilter
              ? 'جرب مصطلح بحث مختلف أو تغيير فلتر التقييم'
              : 'لا توجد تقييمات للسائقين بعد'
            }
          </Typography>
        </Box>
      )}
    </Box>
  );
}
