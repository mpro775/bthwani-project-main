import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getUserOrders } from '../../api/orders';
import { useAuth } from '../../hooks/useAuth';
import type { Order } from '../../types';
import Loading from '../../components/common/Loading';
import {
  Box,
  Typography,
  Container,
  Card,
  Button as MuiButton,
  Chip,
  Paper,
  Fade,
  Slide,
  Avatar,
  IconButton,
  LinearProgress,
} from '@mui/material';
import {
  Inventory,
  Schedule,
  CheckCircle,
  Cancel,
  LocalShipping,
  Star,
} from '@mui/icons-material';

const Orders: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const loadOrders = useCallback(async (showRefreshIndicator = false) => {
    try {
      if (showRefreshIndicator) {
        setIsRefreshing(true);
      } else {
        setLoading(true);
      }
      const data = await getUserOrders(user!.id);
      setOrders(data);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [user]);

  const handleRefresh = () => {
    loadOrders(true);
  };
  useEffect(() => {
    if (user) {
      loadOrders();
    }
  }, [user, loadOrders]);



  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Schedule sx={{ fontSize: 20, color: 'warning.main' }} />;
      case 'confirmed':
      case 'preparing':
        return <Inventory sx={{ fontSize: 20, color: 'info.main' }} />;
      case 'onTheWay':
        return <LocalShipping sx={{ fontSize: 20, color: 'secondary.main' }} />;
      case 'delivered':
        return <CheckCircle sx={{ fontSize: 20, color: 'success.main' }} />;
      case 'cancelled':
        return <Cancel sx={{ fontSize: 20, color: 'error.main' }} />;
      default:
        return <Inventory sx={{ fontSize: 20, color: 'text.secondary' }} />;
    }
  };

  const getStatusText = (status: string) => {
    return t(`orders.${status}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'confirmed':
      case 'preparing':
        return 'info';
      case 'onTheWay':
        return 'secondary';
      case 'delivered':
        return 'success';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const filteredOrders = orders.filter(order => {
    if (activeFilter === 'all') return true;
    return order.status === activeFilter;
  });

  const getOrderStats = () => {
    return {
      total: orders.length,
      pending: orders.filter(o => o.status === 'pending').length,
      preparing: orders.filter(o => o.status === 'preparing').length,
      onTheWay: orders.filter(o => o.status === 'onTheWay').length,
      delivered: orders.filter(o => o.status === 'delivered').length,
      cancelled: orders.filter(o => o.status === 'cancelled').length,
    };
  };

  if (loading) {
    return <Loading fullScreen />;
  }

  const stats = getOrderStats();

  if (orders.length === 0) {
    return (
      <Box sx={{
        minHeight: '100dvh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Background Pattern */}
        <Box sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.1,
          backgroundImage: 'radial-gradient(circle at 25% 25%, #ffffff 0%, transparent 50%), radial-gradient(circle at 75% 75%, #ffffff 0%, transparent 50%)',
          zIndex: 0
        }} />

        <Container maxWidth="md" sx={{
          paddingY: 8,
          textAlign: 'center',
          position: 'relative',
          zIndex: 1
        }}>
          <Fade in={true} timeout={1000}>
            <Paper elevation={8} sx={{
              padding: 6,
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              borderRadius: 4,
              textAlign: 'center'
            }}>
              <Avatar sx={{
                width: 100,
                height: 100,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                margin: '0 auto 24px',
                fontSize: '2.5rem'
              }}>
                🛒
              </Avatar>
              <Typography variant="h4" component="h2" sx={{
                fontWeight: 'bold',
                marginBottom: 2,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                لا توجد طلبات بعد
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ marginBottom: 4, fontSize: '1.1rem' }}>
                ابدأ رحلة تسوقك واستمتع بتجربة فريدة معنا
              </Typography>
              <MuiButton
                onClick={() => navigate('/')}
                variant="contained"
                size="large"
                startIcon={<Inventory />}
                sx={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)',
                  padding: '12px 32px',
                  fontSize: '1.1rem',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
                    boxShadow: '0 12px 35px rgba(102, 126, 234, 0.4)',
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                ابدأ التسوق الآن
              </MuiButton>
            </Paper>
          </Fade>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{
      minHeight: '100dvh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background Pattern */}
      <Box sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        opacity: 0.1,
        backgroundImage: 'radial-gradient(circle at 25% 25%, #ffffff 0%, transparent 50%), radial-gradient(circle at 75% 75%, #ffffff 0%, transparent 50%)',
        zIndex: 0
      }} />

      <Container maxWidth="lg" sx={{
        paddingY: 4,
        paddingBottom: { xs: 20, md: 8 },
        position: 'relative',
        zIndex: 1
      }}>
        {/* Header */}
        <Slide direction="down" in={true} mountOnEnter unmountOnExit>
          <Paper elevation={8} sx={{
            padding: 3,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: '0 0 24px 24px',
            marginBottom: 3
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
              <Box>
                <Typography variant="h4" component="h1" sx={{
                  fontWeight: 'bold',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 0.5
                }}>
                  {t('orders.title')}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  إدارة وتتبع جميع طلباتك في مكان واحد
                </Typography>
              </Box>

              <IconButton
                onClick={handleRefresh}
                disabled={isRefreshing}
                sx={{
                  backgroundColor: 'rgba(102, 126, 234, 0.1)',
                  '&:hover': {
                    backgroundColor: 'rgba(102, 126, 234, 0.2)',
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                {isRefreshing ? <LinearProgress /> : <Inventory />}
              </IconButton>
            </Box>

            {/* Stats Cards */}
            <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', pb: 1 }}>
              <Card sx={{
                minWidth: 100,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                textAlign: 'center',
                p: 2,
                flex: 1
              }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                  {stats.total}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  إجمالي الطلبات
                </Typography>
              </Card>

              <Card sx={{
                minWidth: 100,
                background: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
                color: 'white',
                textAlign: 'center',
                p: 2,
                flex: 1
              }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                  {stats.delivered}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  تم التسليم
                </Typography>
              </Card>

              <Card sx={{
                minWidth: 100,
                background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
                color: 'white',
                textAlign: 'center',
                p: 2,
                flex: 1
              }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                  {stats.pending}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  قيد الانتظار
                </Typography>
              </Card>
            </Box>
          </Paper>
        </Slide>

        {/* Filter Tabs */}
        <Fade in={true} timeout={800}>
          <Paper elevation={4} sx={{
            marginBottom: 3,
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
            borderRadius: 3
          }}>
            <Box sx={{ display: 'flex', gap: 1, p: 1 }}>
              {[
                { key: 'all', label: 'الكل', count: stats.total, icon: '📦' },
                { key: 'pending', label: 'قيد الانتظار', count: stats.pending, icon: '⏳' },
                { key: 'preparing', label: 'قيد التحضير', count: stats.preparing, icon: '👨‍🍳' },
                { key: 'onTheWay', label: 'في الطريق', count: stats.onTheWay, icon: '🚚' },
                { key: 'delivered', label: 'تم التسليم', count: stats.delivered, icon: '✅' },
                { key: 'cancelled', label: 'ملغي', count: stats.cancelled, icon: '❌' },
              ].map((filter) => (
                <MuiButton
                  key={filter.key}
                  onClick={() => setActiveFilter(filter.key)}
                  variant={activeFilter === filter.key ? 'contained' : 'text'}
                  sx={{
                    flex: 1,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: activeFilter === filter.key ? 'bold' : 'normal',
                    background: activeFilter === filter.key
                      ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                      : 'transparent',
                    color: activeFilter === filter.key ? 'white' : 'text.primary',
                    '&:hover': {
                      backgroundColor: activeFilter === filter.key
                        ? 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)'
                        : 'rgba(102, 126, 234, 0.05)',
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2">{filter.icon}</Typography>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="body2" sx={{ lineHeight: 1 }}>
                        {filter.label}
                      </Typography>
                      <Typography variant="caption" sx={{
                        opacity: 0.8,
                        fontSize: '0.7rem'
                      }}>
                        {filter.count}
                      </Typography>
                    </Box>
                  </Box>
                </MuiButton>
              ))}
            </Box>
          </Paper>
        </Fade>

        {/* Orders List */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {filteredOrders.map((order, index) => (
            <Fade in={true} timeout={600 + (index * 100)}>
              <Card
                sx={{
                  padding: 3,
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: 3,
                  boxShadow: 3,
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  border: '1px solid',
                  borderColor: 'rgba(102, 126, 234, 0.1)',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 8,
                    borderColor: 'rgba(102, 126, 234, 0.3)',
                  },
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onClick={() => navigate(`/orders/${order.id}`)}
              >
                {/* Status Indicator */}
                <Box sx={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  width: 0,
                  height: 0,
                  borderStyle: 'solid',
                  borderWidth: '0 40px 40px 0',
                  borderColor: `transparent ${getStatusColor(order.status)}.main transparent transparent`,
                  opacity: 0.1
                }} />

                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 3 }}>
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, marginBottom: 1 }}>
                      <Avatar sx={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        width: 40,
                        height: 40
                      }}>
                        {getStatusIcon(order.status)}
                      </Avatar>
                      <Box>
                        <Typography variant="h6" component="span" sx={{ fontWeight: 'bold' }}>
                          #{order.orderNumber}
                        </Typography>
                        <Chip
                          label={getStatusText(order.status)}
                          color={getStatusColor(order.status)}
                          size="small"
                          sx={{
                            fontWeight: 'medium',
                            ml: 1,
                            height: 24,
                            '& .MuiChip-label': { fontSize: '0.75rem' }
                          }}
                        />
                      </Box>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {new Date(order.createdAt).toLocaleDateString('ar-YE', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </Typography>
                  </Box>

                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                      {order.total.toFixed(2)} ر.ي
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {order.items.length} منتج
                    </Typography>
                  </Box>
                </Box>

                {order.store && (
                  <Box sx={{ marginBottom: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Avatar sx={{
                        backgroundColor: 'rgba(102, 126, 234, 0.1)',
                        width: 24,
                        height: 24
                      }}>
                        🏪
                      </Avatar>
                      <Typography variant="body2" sx={{ fontWeight: 'medium', color: 'text.primary' }}>
                        المتجر
                      </Typography>
                    </Box>
                    <Typography variant="body1" sx={{ fontWeight: 'medium', color: 'text.primary' }}>
                      {order.store.name}
                    </Typography>
                  </Box>
                )}

                <Box sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  p: 2,
                  backgroundColor: 'rgba(102, 126, 234, 0.05)',
                  borderRadius: 2,
                  border: '1px solid rgba(102, 126, 234, 0.1)'
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      المجموع الإجمالي
                    </Typography>
                    <Chip
                      label={`${order.items.length} منتج`}
                      size="small"
                      sx={{
                        backgroundColor: 'rgba(102, 126, 234, 0.1)',
                        color: '#667eea',
                        fontSize: '0.75rem'
                      }}
                    />
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                    {order.total.toFixed(2)} ر.ي
                  </Typography>
                </Box>

                {order.status === 'delivered' && !order.rating && (
                  <Box sx={{ marginTop: 3 }}>
                    <MuiButton
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/orders/${order.id}`);
                      }}
                      variant="contained"
                      fullWidth
                      size="small"
                      startIcon={<Star />}
                      sx={{
                        background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
                        boxShadow: '0 4px 15px rgba(255, 152, 0, 0.3)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #f57c00 0%, #ff9800 100%)',
                          boxShadow: '0 6px 20px rgba(255, 152, 0, 0.4)',
                          transform: 'translateY(-1px)',
                        },
                        transition: 'all 0.3s ease'
                      }}
                    >
                      قيم هذا الطلب
                    </MuiButton>
                  </Box>
                )}
              </Card>
            </Fade>
          ))}
        </Box>

        {/* Loading Progress Bar */}
        {isRefreshing && (
          <Box sx={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999 }}>
            <LinearProgress sx={{
              backgroundColor: 'rgba(102, 126, 234, 0.2)',
              '& .MuiLinearProgress-bar': {
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              }
            }} />
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default Orders;
