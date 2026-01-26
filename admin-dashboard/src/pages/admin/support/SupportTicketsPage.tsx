// src/pages/admin/support/SupportTicketsPage.tsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Grid,
  Stack,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Avatar,
  Badge,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
 
  Visibility as VisibilityIcon,
  Message as MessageIcon,
  Person as PersonIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  AccessTime as AccessTimeIcon,
} from '@mui/icons-material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from '../../../utils/axios';
import { formatDistanceToNow } from 'date-fns';
import { arSA } from 'date-fns/locale';

interface SupportTicket {
  _id: string;
  number: number;
  subject: string;
  description?: string;
  status: 'new' | 'open' | 'pending' | 'on_hold' | 'resolved' | 'closed';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  assignee?: {
    _id: string;
    name: string;
    email: string;
  };
  requester: {
    userId: string;
    phone?: string;
    email?: string;
  };
  links?: {
    orderId?: {
      _id: string;
      orderNumber: string;
    };
    store?: {
      _id: string;
      name: string;
    };
    driver?: {
      _id: string;
      name: string;
    };
  };
  createdAt: string;
  updatedAt: string;
  firstResponseAt?: string;
  responseTime?: number; // minutes
  messageCount?: number;
}

interface SupportTicketFormData {
  subject: string;
  description: string;
  priority: SupportTicket['priority'];
  assignee: string;
  group: string;
  tags: string[];
  links: {
    orderId: string;
    store: string;
    driver: string;
  };
}

interface SupportStats {
  totalTickets: number;
  newTickets: number;
  openTickets: number;
  pendingTickets: number;
  resolvedTickets: number;
  closedTickets: number;
  averageFirstResponseTime: number;
  averageResolutionTime: number;
  breachedFirstResponse: number;
  breachedResolution: number;
}

const statusColors = {
  new: 'error',
  open: 'primary',
  pending: 'warning',
  on_hold: 'info',
  resolved: 'success',
  closed: 'default',
} as const;

const priorityColors = {
  low: 'default',
  normal: 'primary',
  high: 'warning',
  urgent: 'error',
} as const;

const SupportTicketFormDialog: React.FC<{
  open: boolean;
  onClose: () => void;
  ticket?: SupportTicket | null;
  onSubmit: (data: SupportTicketFormData) => void;
  loading: boolean;
}> = ({ open, onClose, ticket, onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    priority: 'normal' as SupportTicket['priority'],
    assignee: '',
    group: '',
    tags: [] as string[],
    links: {
      orderId: '',
      store: '',
      driver: '',
    },
  });

  useEffect(() => {
    if (ticket) {
      setFormData({
        subject: ticket.subject,
        description: ticket.description || '',
        priority: ticket.priority,
        assignee: ticket.assignee?._id || '',
        group: '',
        tags: [],
        links: {
          orderId: ticket.links?.orderId?._id || '',
          store: ticket.links?.store?._id || '',
          driver: ticket.links?.driver?._id || '',
        },
      });
    } else {
      setFormData({
        subject: '',
        description: '',
        priority: 'normal',
        assignee: '',
        group: '',
        tags: [],
        links: {
          orderId: '',
          store: '',
          driver: '',
        },
      });
    }
  }, [ticket, open]);

  const handleSubmit = () => {
    onSubmit(formData);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {ticket ? 'تعديل تذكرة دعم' : 'إنشاء تذكرة دعم جديدة'}
      </DialogTitle>

      <DialogContent>
        <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="موضوع التذكرة"
            value={formData.subject}
            onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
            fullWidth
            required
          />

          <TextField
            label="وصف المشكلة"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            fullWidth
            multiline
            rows={3}
          />

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth>
                <InputLabel>الأولوية</InputLabel>
                <Select
                  value={formData.priority}
                  onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as SupportTicket['priority'] }))}
                  label="الأولوية"
                >
                  <MenuItem value="low">منخفضة</MenuItem>
                  <MenuItem value="normal">عادية</MenuItem>
                  <MenuItem value="high">عالية</MenuItem>
                  <MenuItem value="urgent">عاجلة</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="المعيّن للحل"
                value={formData.assignee}
                onChange={(e) => setFormData(prev => ({ ...prev, assignee: e.target.value }))}
                fullWidth
                placeholder="معرف الموظف أو البريد الإلكتروني"
              />
            </Grid>
          </Grid>

          <Typography variant="h6" sx={{ mt: 2 }}>
            روابط ذات صلة
          </Typography>

          <TextField
            label="رقم الطلب"
            value={formData.links.orderId}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              links: { ...prev.links, orderId: e.target.value }
            }))}
            fullWidth
          />

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="المتجر"
                value={formData.links.store}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  links: { ...prev.links, store: e.target.value }
                }))}
                fullWidth
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="السائق"
                value={formData.links.driver}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  links: { ...prev.links, driver: e.target.value }
                }))}
                fullWidth
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          إلغاء
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || !formData.subject.trim()}
          startIcon={loading ? <CircularProgress size={16} /> : null}
        >
          {ticket ? 'تحديث' : 'إنشاء'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default function SupportTicketsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [assigneeFilter] = useState<string>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTicket, setEditingTicket] = useState<SupportTicket | null>(null);

  const queryClient = useQueryClient();

  // Fetch support tickets
  const { data: ticketsData, isLoading, error } = useQuery({
    queryKey: ['supportTickets', searchTerm, statusFilter, priorityFilter, assigneeFilter],
    queryFn: async () => {
      const params = new URLSearchParams();

      if (searchTerm) params.append('q', searchTerm);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (priorityFilter !== 'all') params.append('priority', priorityFilter);
      if (assigneeFilter !== 'all') params.append('assignee', assigneeFilter);

      const { data } = await axios.get(`/admin/support/tickets?${params}`);
      return data;
    },
  });

  // Fetch support stats
  const { data: stats } = useQuery({
    queryKey: ['supportStats'],
    queryFn: async () => {
      const { data } = await axios.get('/admin/support/stats');
      return data as SupportStats;
    },
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: async (ticketData: SupportTicketFormData) => {
      const { data } = await axios.post('/admin/support/tickets', ticketData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supportTickets'] });
      queryClient.invalidateQueries({ queryKey: ['supportStats'] });
      setDialogOpen(false);
      setEditingTicket(null);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: SupportTicketFormData }) => {
      const { data } = await axios.patch(`/admin/support/tickets/${id}`, updates);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supportTickets'] });
      queryClient.invalidateQueries({ queryKey: ['supportStats'] });
      setDialogOpen(false);
      setEditingTicket(null);
    },
  });

  const handleFormSubmit = (formData: SupportTicketFormData) => {
    if (editingTicket) {
      updateMutation.mutate({ id: editingTicket._id, updates: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleViewTicket = (ticket: SupportTicket) => {
    window.open(`/support/ticket/${ticket._id}`, '_blank');
  };

  const tickets = ticketsData?.tickets || [];
  const total = ticketsData?.pagination?.total || 0;

  const getStatusText = (status: SupportTicket['status']) => {
    switch (status) {
      case 'new': return 'جديد';
      case 'open': return 'مفتوح';
      case 'pending': return 'معلق';
      case 'on_hold': return 'في الانتظار';
      case 'resolved': return 'محلول';
      case 'closed': return 'مغلق';
      default: return status;
    }
  };

  const getPriorityText = (priority: SupportTicket['priority']) => {
    switch (priority) {
      case 'low': return 'منخفضة';
      case 'normal': return 'عادية';
      case 'high': return 'عالية';
      case 'urgent': return 'عاجلة';
      default: return priority;
    }
  };

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          خطأ في تحميل تذاكر الدعم: {error.message}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          مركز دعم العملاء
        </Typography>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setEditingTicket(null);
            setDialogOpen(true);
          }}
        >
          إنشاء تذكرة جديدة
        </Button>
      </Box>

      {/* Statistics Cards */}
      {stats && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Badge badgeContent={stats.newTickets} color="error">
                    <ErrorIcon />
                  </Badge>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                      {stats.totalTickets}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      إجمالي التذاكر
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
                  <AccessTimeIcon color="warning" />
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                      {stats.openTickets}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      تذاكر مفتوحة
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
                  <CheckCircleIcon color="success" />
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                      {stats.resolvedTickets}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      تذاكر محلولة
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
                  <ScheduleIcon color="info" />
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                      {stats.averageFirstResponseTime ?
                        `${Math.round(stats.averageFirstResponseTime / (1000 * 60))}د` :
                        'غير محدد'
                      }
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      متوسط وقت الرد الأول
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
              placeholder="البحث في التذاكر..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
              sx={{ flex: 1, minWidth: 200 }}
            />

            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>الحالة</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label="الحالة"
              >
                <MenuItem value="all">الكل</MenuItem>
                <MenuItem value="new">جديد</MenuItem>
                <MenuItem value="open">مفتوح</MenuItem>
                <MenuItem value="pending">معلق</MenuItem>
                <MenuItem value="resolved">محلول</MenuItem>
                <MenuItem value="closed">مغلق</MenuItem>
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>الأولوية</InputLabel>
              <Select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                label="الأولوية"
              >
                <MenuItem value="all">الكل</MenuItem>
                <MenuItem value="low">منخفضة</MenuItem>
                <MenuItem value="normal">عادية</MenuItem>
                <MenuItem value="high">عالية</MenuItem>
                <MenuItem value="urgent">عاجلة</MenuItem>
              </Select>
            </FormControl>

            <Chip
              label={`${total} تذكرة`}
              variant="outlined"
            />
          </Box>
        </CardContent>
      </Card>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Card>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell># التذكرة</TableCell>
                  <TableCell>الموضوع</TableCell>
                  <TableCell>العميل</TableCell>
                  <TableCell>الحالة</TableCell>
                  <TableCell>الأولوية</TableCell>
                  <TableCell>المعيّن</TableCell>
                  <TableCell>الروابط</TableCell>
                  <TableCell>وقت الرد الأول</TableCell>
                  <TableCell>عدد الرسائل</TableCell>
                  <TableCell>آخر تحديث</TableCell>
                  <TableCell>إجراءات</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tickets.map((ticket: SupportTicket) => (
                  <TableRow key={ticket._id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        #{ticket.number}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight={500}>
                          {ticket.subject}
                        </Typography>
                        {ticket.description && (
                          <Typography variant="caption" color="text.secondary" noWrap>
                            {ticket.description.length > 50 ?
                              `${ticket.description.slice(0, 50)}...` :
                              ticket.description
                            }
                          </Typography>
                        )}
                      </Box>
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2">
                        {ticket.requester.phone || ticket.requester.email || ticket.requester.userId}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={getStatusText(ticket.status)}
                        color={statusColors[ticket.status]}
                        size="small"
                      />
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={getPriorityText(ticket.priority)}
                        color={priorityColors[ticket.priority]}
                        size="small"
                      />
                    </TableCell>

                    <TableCell>
                      {ticket.assignee ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar sx={{ width: 24, height: 24 }}>
                            <PersonIcon fontSize="small" />
                          </Avatar>
                          <Typography variant="body2">
                            {ticket.assignee.name}
                          </Typography>
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          غير محدد
                        </Typography>
                      )}
                    </TableCell>

                    <TableCell>
                      <Stack direction="row" spacing={0.5}>
                        {ticket.links?.orderId && (
                          <Chip label={`طلب ${ticket.links.orderId.orderNumber}`} size="small" />
                        )}
                        {ticket.links?.store && (
                          <Chip label={`متجر ${ticket.links.store.name}`} size="small" />
                        )}
                        {ticket.links?.driver && (
                          <Chip label={`سائق ${ticket.links.driver.name}`} size="small" />
                        )}
                      </Stack>
                    </TableCell>

                    <TableCell>
                      {ticket.firstResponseAt ? (
                        <Typography variant="body2">
                          {formatDistanceToNow(new Date(ticket.firstResponseAt), {
                            addSuffix: true,
                            locale: arSA
                          })}
                        </Typography>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          لم يتم الرد بعد
                        </Typography>
                      )}
                    </TableCell>

                    <TableCell>
                      <Badge badgeContent={ticket.messageCount || 0} color="primary">
                        <MessageIcon />
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {formatDistanceToNow(new Date(ticket.updatedAt), {
                          addSuffix: true,
                          locale: arSA
                        })}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => handleViewTicket(ticket)}
                      >
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}

      {tickets.length === 0 && !isLoading && (
        <Box sx={{ textAlign: 'center', py: 8, color: 'text.secondary' }}>
          <MessageIcon sx={{ fontSize: 64, mb: 2, opacity: 0.5 }} />
          <Typography variant="h6">لا توجد تذاكر دعم</Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all' ?
              'جرب مصطلح بحث مختلف أو تغيير الفلاتر' :
              'ابدأ بإنشاء تذكرة دعم جديدة'
            }
          </Typography>
          {!searchTerm && statusFilter === 'all' && priorityFilter === 'all' && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {
                setEditingTicket(null);
                setDialogOpen(true);
              }}
            >
              إنشاء تذكرة جديدة
            </Button>
          )}
        </Box>
      )}

      {/* Support Ticket Form Dialog */}
      <SupportTicketFormDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditingTicket(null);
        }}
        ticket={editingTicket}
        onSubmit={handleFormSubmit}
        loading={createMutation.isPending || updateMutation.isPending}
      />
    </Box>
  );
}
