import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  Button,
  TextField,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,

  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Stack,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Lock as LockIcon,
  LockOpen as LockOpenIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  holdFunds,
  releaseFunds,
  refundFunds,
  getAllTransactions,
  type WalletTransaction,
} from '../../../api/wallet';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`escrow-tabpanel-${index}`}
      aria-labelledby={`escrow-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const HoldFundsDialog: React.FC<{
  open: boolean;
  onClose: () => void;
  onHold: (data: { userId: string; amount: number; orderId?: string }) => void;
  loading: boolean;
}> = ({ open, onClose, onHold, loading }) => {
  const [formData, setFormData] = useState({
    userId: '',
    amount: '',
    orderId: '',
  });

  const handleSubmit = () => {
    if (formData.userId && formData.amount) {
      onHold({
        userId: formData.userId,
        amount: parseFloat(formData.amount),
        orderId: formData.orderId || undefined,
      });
      setFormData({ userId: '', amount: '', orderId: '' });
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>حجز مبلغ</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="معرف المستخدم *"
            value={formData.userId}
            onChange={(e) =>
              setFormData({ ...formData, userId: e.target.value })
            }
            fullWidth
            required
          />
          <TextField
            label="المبلغ *"
            type="number"
            value={formData.amount}
            onChange={(e) =>
              setFormData({ ...formData, amount: e.target.value })
            }
            fullWidth
            required
            InputProps={{
              endAdornment: <Typography variant="caption">ر.ي</Typography>,
            }}
          />
          <TextField
            label="معرف الطلب (اختياري)"
            value={formData.orderId}
            onChange={(e) =>
              setFormData({ ...formData, orderId: e.target.value })
            }
            fullWidth
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
          disabled={loading || !formData.userId || !formData.amount}
          startIcon={loading ? <CircularProgress size={16} /> : null}
        >
          حجز
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const ReleaseRefundDialog: React.FC<{
  open: boolean;
  onClose: () => void;
  onAction: (data: {
    userId: string;
    amount: number;
    orderId?: string;
    reason?: string;
  }) => void;
  loading: boolean;
  action: 'release' | 'refund';
}> = ({ open, onClose, onAction, loading, action }) => {
  const [formData, setFormData] = useState({
    userId: '',
    amount: '',
    orderId: '',
    reason: '',
  });

  const handleSubmit = () => {
    if (formData.userId && formData.amount) {
      onAction({
        userId: formData.userId,
        amount: parseFloat(formData.amount),
        orderId: formData.orderId || undefined,
        reason: action === 'refund' ? formData.reason : undefined,
      });
      setFormData({ userId: '', amount: '', orderId: '', reason: '' });
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {action === 'release' ? 'إطلاق المبلغ المحجوز' : 'إرجاع المبلغ المحجوز'}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="معرف المستخدم *"
            value={formData.userId}
            onChange={(e) =>
              setFormData({ ...formData, userId: e.target.value })
            }
            fullWidth
            required
          />
          <TextField
            label="المبلغ *"
            type="number"
            value={formData.amount}
            onChange={(e) =>
              setFormData({ ...formData, amount: e.target.value })
            }
            fullWidth
            required
            InputProps={{
              endAdornment: <Typography variant="caption">ر.ي</Typography>,
            }}
          />
          <TextField
            label="معرف الطلب (اختياري)"
            value={formData.orderId}
            onChange={(e) =>
              setFormData({ ...formData, orderId: e.target.value })
            }
            fullWidth
          />
          {action === 'refund' && (
            <TextField
              label="السبب (اختياري)"
              value={formData.reason}
              onChange={(e) =>
                setFormData({ ...formData, reason: e.target.value })
              }
              fullWidth
              multiline
              rows={3}
            />
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          إلغاء
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color={action === 'release' ? 'success' : 'warning'}
          disabled={loading || !formData.userId || !formData.amount}
          startIcon={loading ? <CircularProgress size={16} /> : null}
        >
          {action === 'release' ? 'إطلاق' : 'إرجاع'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default function EscrowManagementPage() {
  const [tabValue, setTabValue] = useState(0);
  const [holdDialogOpen, setHoldDialogOpen] = useState(false);
  const [releaseDialogOpen, setReleaseDialogOpen] = useState(false);
  const [refundDialogOpen, setRefundDialogOpen] = useState(false);

  const queryClient = useQueryClient();

  // Fetch pending escrow transactions
  const { data: pendingEscrow, isLoading: pendingLoading } = useQuery({
    queryKey: ['pendingEscrow'],
    queryFn: () =>
      getAllTransactions({
        method: 'escrow',
        status: 'pending',
        limit: 100,
      }),
  });

  // Fetch all escrow transactions
  const { data: allEscrow, isLoading: allLoading } = useQuery({
    queryKey: ['allEscrow'],
    queryFn: () =>
      getAllTransactions({
        method: 'escrow',
        limit: 100,
      }),
  });

  // Hold funds mutation
  const holdMutation = useMutation({
    mutationFn: holdFunds,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingEscrow'] });
      queryClient.invalidateQueries({ queryKey: ['allEscrow'] });
      setHoldDialogOpen(false);
    },
  });

  // Release funds mutation
  const releaseMutation = useMutation({
    mutationFn: releaseFunds,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingEscrow'] });
      queryClient.invalidateQueries({ queryKey: ['allEscrow'] });
      setReleaseDialogOpen(false);
    },
  });

  // Refund funds mutation
  const refundMutation = useMutation({
    mutationFn: refundFunds,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingEscrow'] });
      queryClient.invalidateQueries({ queryKey: ['allEscrow'] });
      setRefundDialogOpen(false);
    },
  });

  const pendingTransactions = pendingEscrow?.data || [];
  const allTransactions = allEscrow?.data || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'completed':
        return 'success';
      case 'reversed':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'معلق';
      case 'completed':
        return 'مكتمل';
      case 'reversed':
        return 'معكوس';
      default:
        return status;
    }
  };

  const renderTransactionsTable = (transactions: WalletTransaction[]) => {
    if (transactions.length === 0) {
      return (
        <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 4 }}>
          لا توجد معاملات
        </Typography>
      );
    }

    return (
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>المعرف</TableCell>
              <TableCell>المستخدم</TableCell>
              <TableCell>المبلغ</TableCell>
              <TableCell>معرف الطلب</TableCell>
              <TableCell>الحالة</TableCell>
              <TableCell>تاريخ الإنشاء</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {transactions.map((transaction) => (
              <TableRow key={transaction._id}>
                <TableCell>{transaction._id?.substring(0, 8)}...</TableCell>
                <TableCell>
                  {typeof transaction.userId === 'object' && transaction.userId
                    ? (transaction.userId as any).fullName || transaction.userId
                    : transaction.userId}
                </TableCell>
                <TableCell>
                  <Typography variant="body1" fontWeight="bold">
                    {transaction.amount.toFixed(2)} ر.ي
                  </Typography>
                </TableCell>
                <TableCell>
                  {transaction.meta?.orderId || '-'}
                </TableCell>
                <TableCell>
                  <Chip
                    label={getStatusLabel(transaction.status || 'pending')}
                    color={getStatusColor(transaction.status || 'pending') as any}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {transaction.createdAt
                    ? new Date(transaction.createdAt).toLocaleDateString('ar-SA')
                    : '-'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Typography variant="h4" component="h1">
          إدارة الحجز (Escrow)
        </Typography>
        <Stack direction="row" spacing={2}>
          <Button
            variant="contained"
            startIcon={<LockIcon />}
            onClick={() => setHoldDialogOpen(true)}
          >
            حجز مبلغ
          </Button>
          <Button
            variant="outlined"
            color="success"
            startIcon={<LockOpenIcon />}
            onClick={() => setReleaseDialogOpen(true)}
          >
            إطلاق مبلغ
          </Button>
          <Button
            variant="outlined"
            color="warning"
            startIcon={<RefreshIcon />}
            onClick={() => setRefundDialogOpen(true)}
          >
            إرجاع مبلغ
          </Button>
        </Stack>
      </Box>

      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={tabValue}
            onChange={(_, newValue) => setTabValue(newValue)}
            aria-label="escrow tabs"
          >
            <Tab
              label={`المعلقة (${pendingTransactions.length})`}
              id="escrow-tab-0"
              aria-controls="escrow-tabpanel-0"
            />
            <Tab
              label={`الكل (${allTransactions.length})`}
              id="escrow-tab-1"
              aria-controls="escrow-tabpanel-1"
            />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          {pendingLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            renderTransactionsTable(pendingTransactions)
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          {allLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            renderTransactionsTable(allTransactions)
          )}
        </TabPanel>
      </Card>

      {/* Dialogs */}
      <HoldFundsDialog
        open={holdDialogOpen}
        onClose={() => setHoldDialogOpen(false)}
        onHold={(data) => holdMutation.mutate(data)}
        loading={holdMutation.isPending}
      />

      <ReleaseRefundDialog
        open={releaseDialogOpen}
        onClose={() => setReleaseDialogOpen(false)}
        onAction={(data) => releaseMutation.mutate(data)}
        loading={releaseMutation.isPending}
        action="release"
      />

      <ReleaseRefundDialog
        open={refundDialogOpen}
        onClose={() => setRefundDialogOpen(false)}
        onAction={(data) => refundMutation.mutate(data)}
        loading={refundMutation.isPending}
        action="refund"
      />
    </Box>
  );
}
