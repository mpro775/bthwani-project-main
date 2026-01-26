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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Avatar,
  Divider,
  Pagination,
} from '@mui/material';
import {
  Search as SearchIcon,
  Person as PersonIcon,
  AccountBalanceWallet as WalletIcon,
  TrendingUp as TrendingUpIcon,
  AttachMoney as MoneyIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import {
  getWalletUsers,
  getWalletStats,
  updateWalletBalance,
  type WalletUser,
} from '../../api/wallet';

const WalletBalanceDialog: React.FC<{
  open: boolean;
  onClose: () => void;
  user: WalletUser | null;
  onSubmit: (userId: string, amount: number, type: "credit" | "debit", description: string) => void;
  loading: boolean;
}> = ({ open, onClose, user, onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    amount: '',
    type: 'credit' as "credit" | "debit",
    description: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  React.useEffect(() => {
    if (user) {
      setFormData({
        amount: '',
        type: 'credit',
        description: '',
      });
    }
    setErrors({});
  }, [user, open]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'يجب إدخال مبلغ صحيح';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'الوصف مطلوب';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm() && user) {
      onSubmit(
        user._id,
        parseFloat(formData.amount),
        formData.type,
        formData.description
      );
    }
  };

  const handleChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        تعديل رصيد المحفظة: {user?.fullName}
      </DialogTitle>

      <DialogContent>
        <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary">
              الرصيد الحالي: <strong>{user?.wallet.available.toFixed(2)} ر.ي</strong>
            </Typography>
          </Box>

          <FormControl fullWidth>
            <InputLabel>نوع العملية</InputLabel>
            <Select
              value={formData.type}
              onChange={(e) => handleChange('type')(e as React.ChangeEvent<HTMLInputElement>)}
              label="نوع العملية"
            >
              <MenuItem value="credit">إضافة رصيد</MenuItem>
              <MenuItem value="debit">خصم رصيد</MenuItem>
            </Select>
          </FormControl>

          <TextField
            label="المبلغ"
            type="number"
            value={formData.amount}
            onChange={handleChange('amount')}
            error={!!errors.amount}
            helperText={errors.amount}
            fullWidth
            required
            InputProps={{
              startAdornment: <Typography variant="caption">ر.ي</Typography>,
            }}
          />

          <TextField
            label="الوصف"
            value={formData.description}
            onChange={handleChange('description')}
            error={!!errors.description}
            helperText={errors.description}
            fullWidth
            multiline
            rows={2}
            placeholder="اكتب سبب التعديل..."
          />
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          إلغاء
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={16} /> : null}
        >
          تحديث الرصيد
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const WalletUserCard: React.FC<{
  user: WalletUser;
  onEditBalance: (user: WalletUser) => void;
  onViewTransactions: (user: WalletUser) => void;
}> = ({ user, onEditBalance, onViewTransactions }) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
            {getInitials(user.fullName)}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" noWrap>
              {user.fullName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {user.email}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ mb: 2 }} />

        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid  sx={{xs: 6}}>
            <Typography variant="caption" color="text.secondary">
              الرصيد المتاح
            </Typography>
            <Typography variant="h6" color="success.main" sx={{ fontFamily: 'monospace' }}>
              {user.wallet.available.toFixed(2)}
            </Typography>
          </Grid>

          <Grid  sx={{xs: 6}}>
            <Typography variant="caption" color="text.secondary">
              الرصيد المحجوز
            </Typography>
            <Typography variant="h6" color="warning.main" sx={{ fontFamily: 'monospace' }}>
              {user.wallet.onHold.toFixed(2)}
            </Typography>
          </Grid>

          <Grid  sx={{xs: 6}}>
            <Typography variant="caption" color="text.secondary">
              إجمالي الرصيد
            </Typography>
            <Typography variant="h6" color="primary.main" sx={{ fontFamily: 'monospace' }}>
              {user.wallet.balance.toFixed(2)}
            </Typography>
          </Grid>

            <Grid  sx={{xs: 6}}>
            <Typography variant="caption" color="text.secondary">
              نقاط الولاء
            </Typography>
            <Typography variant="h6" color="secondary.main" sx={{ fontFamily: 'monospace' }}>
              {user.wallet.loyaltyPoints}
            </Typography>
          </Grid>
        </Grid>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<WalletIcon />}
            onClick={() => onEditBalance(user)}
            fullWidth
          >
            تعديل الرصيد
          </Button>

          <Button
            variant="outlined"
            startIcon={<MoneyIcon />}
            onClick={() => onViewTransactions(user)}
            fullWidth
          >
            المعاملات
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default function WalletManagementPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<WalletUser | null>(null);

  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    search: '',
    sortBy: 'createdAt' as const,
    sortOrder: 'desc' as 'asc' | 'desc',
  });

  // Fetch wallet users
  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ['walletUsers', page, filters],
    queryFn: () =>
      getWalletUsers({
        ...filters,
        page,
        limit: 20,
      }),
  });

  // Fetch wallet statistics
  const { data: stats } = useQuery({
    queryKey: ['walletStats'],
    queryFn: () => getWalletStats('all'),
  });

  // Mutations
  const updateBalanceMutation = useMutation({
    mutationFn: ({ userId, amount, type, description }: {
      userId: string;
      amount: number;
      type: "credit" | "debit";
      description: string;
    }) => updateWalletBalance(userId, amount, type, description),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['walletUsers'] });
      queryClient.invalidateQueries({ queryKey: ['walletStats'] });
      setDialogOpen(false);
      setSelectedUser(null);
    },
  });

  const users = usersData?.data || [];
  const pagination = usersData?.pagination;

  // Update search filter when searchTerm changes
  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      setFilters((prev) => ({ ...prev, search: searchTerm }));
      setPage(1);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const handleEditBalance = (user: WalletUser) => {
    setSelectedUser(user);
    setDialogOpen(true);
  };

  const handleViewTransactions = (user: WalletUser) => {
    // TODO: Navigate to transactions page for this user
    console.log('View transactions for user:', user._id);
  };

  const handleBalanceSubmit = (userId: string, amount: number, type: "credit" | "debit", description: string) => {
    updateBalanceMutation.mutate({ userId, amount, type, description });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  if (usersLoading) {
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
          إدارة محافظ العملاء
        </Typography>
      </Box>

      {/* Statistics Cards */}
      {stats && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid sx={{xs: 12, sm: 6, md: 3}}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PersonIcon color="primary" />
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                      {stats.totalUsers}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      إجمالي العملاء
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid sx={{xs: 12, sm: 6, md: 3}}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <WalletIcon color="success" />
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                      {formatCurrency(stats.totalBalance)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      إجمالي الأرصدة
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid sx={{xs: 12, sm: 6, md: 3}}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TrendingUpIcon color="warning" />
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                      {formatCurrency(stats.totalOnHold)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      أرصدة محجوزة
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid sx={{xs: 12, sm: 6, md: 3}}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <MoneyIcon color="info" />
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                      {stats.transactionsToday}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      معاملات اليوم
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            <TextField
              placeholder="البحث في العملاء..."
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

            <Chip
              label={`${pagination?.total || 0} عميل`}
              variant="outlined"
            />
          </Box>
        </CardContent>
      </Card>

      {usersLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Grid container spacing={3}>
            {users.map((user) => (
            <Grid sx={{xs: 12, sm: 6, md: 4}} key={user._id}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <WalletUserCard
                  user={user}
                  onEditBalance={handleEditBalance}
                  onViewTransactions={handleViewTransactions}
                />
              </motion.div>
            </Grid>
          ))}
          </Grid>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Pagination
                count={pagination.totalPages}
                page={page}
                onChange={(_, value) => setPage(value)}
                color="primary"
              />
            </Box>
          )}
        </>
      )}

      {users.length === 0 && !usersLoading && (
        <Box sx={{ textAlign: 'center', py: 8, color: 'text.secondary' }}>
          <WalletIcon sx={{ fontSize: 64, mb: 2, opacity: 0.5 }} />
          <Typography variant="h6">لا يوجد عملاء</Typography>
          <Typography variant="body2">
            {searchTerm
              ? 'جرب مصطلح بحث مختلف'
              : 'لا يوجد عملاء مع محافظ بعد'
            }
          </Typography>
        </Box>
      )}

      {/* Wallet Balance Dialog */}
      <WalletBalanceDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setSelectedUser(null);
        }}
        user={selectedUser}
        onSubmit={handleBalanceSubmit}
        loading={updateBalanceMutation.isPending}
      />
    </Box>
  );
}