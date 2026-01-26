import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';
import {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  getNotificationSettings,
  updateNotificationSettings
} from '../../api/notifications';
import type { Notification, NotificationSettings } from '../../types';
import Loading from '../../components/common/Loading';
import {
  Box,
  Typography,
  IconButton,
  Container,
  Card,
  Button as MuiButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Switch,
  FormControlLabel,
  Paper,
  Fade,
  Slide,
  Chip,
  Badge,
  Avatar,
  LinearProgress,
  CircularProgress,
} from '@mui/material';
import {
  Notifications as BellIcon,
  ShoppingBag,
  LocalShipping,
  CardGiftcard,
  Settings,
  Check,
  Delete,
  ArrowBack,
} from '@mui/icons-material';

const Notifications: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');
  const [filterType, setFilterType] = useState<Notification['type'] | 'all'>('all');
  const [showSettings, setShowSettings] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadData = useCallback(async (showRefreshIndicator = false) => {
    if (!user) return;

    try {
      if (showRefreshIndicator) {
        setIsRefreshing(true);
      } else {
        setLoading(true);
      }

      const [notificationsData, settingsData] = await Promise.all([
        getUserNotifications(100),
        getNotificationSettings()
      ]);

      setNotifications(notificationsData);
      setSettings(settingsData);
    } catch (error) {
      console.error('Error loading notifications data:', error);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [user]);

  const handleRefresh = () => {
    loadData(true);
  };
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    loadData();
  }, [isAuthenticated, navigate, loadData]);


  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markNotificationAsRead(notificationId);
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleDelete = async (notificationId: string) => {
    if (!window.confirm('هل أنت متأكد من حذف هذه الإشعار؟')) return;

    try {
      await deleteNotification(notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const handleSettingsUpdate = async (key: keyof NotificationSettings, value: boolean) => {
    if (!settings) return;

    try {
      const updatedSettings = await updateNotificationSettings({ [key]: value });
      setSettings(updatedSettings);
    } catch (error) {
      console.error('Error updating settings:', error);
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (activeTab === 'unread' && notification.read) return false;
    if (filterType !== 'all' && notification.type !== filterType) return false;
    return true;
  });

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'order':
        return <ShoppingBag sx={{ fontSize: 24, color: 'info.main' }} />;
      case 'delivery':
        return <LocalShipping sx={{ fontSize: 24, color: 'success.main' }} />;
      case 'promotion':
        return <CardGiftcard sx={{ fontSize: 24, color: 'secondary.main' }} />;
      case 'system':
        return <Settings sx={{ fontSize: 24, color: 'text.secondary' }} />;
      default:
        return <BellIcon sx={{ fontSize: 24, color: 'text.secondary' }} />;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'الآن';
    if (diffInMinutes < 60) return `قبل ${diffInMinutes} دقيقة`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `قبل ${diffInHours} ساعة`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `قبل ${diffInDays} يوم`;

    return date.toLocaleDateString('ar-YE');
  };

  if (loading) {
    return <Loading fullScreen />;
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
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <IconButton
                  onClick={() => navigate(-1)}
                  sx={{
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    '&:hover': {
                      backgroundColor: 'rgba(102, 126, 234, 0.2)',
                      transform: 'scale(1.05)',
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  <ArrowBack />
                </IconButton>

                <Box>
                  <Typography variant="h4" component="h1" sx={{
                    fontWeight: 'bold',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    mb: 0.5
                  }}>
                    {t('notifications.title')}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {notifications.length} إشعار • آخر تحديث: {formatTimeAgo(notifications[0]?.createdAt || new Date().toISOString())}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
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
                  {isRefreshing ? <CircularProgress size={20} /> : <BellIcon />}
                </IconButton>

                <MuiButton
                  variant="outlined"
                  onClick={() => setShowSettings(!showSettings)}
                  startIcon={<Settings />}
                  size="small"
                  sx={{
                    borderColor: 'rgba(102, 126, 234, 0.3)',
                    color: '#667eea',
                    '&:hover': {
                      borderColor: '#667eea',
                      backgroundColor: 'rgba(102, 126, 234, 0.05)',
                    }
                  }}
                >
                  {t('notifications.settings')}
                </MuiButton>
              </Box>
            </Box>

            {/* Stats Cards */}
            <Box sx={{ display: 'flex', gap: 2, mt: 3, overflowX: 'auto', pb: 1 }}>
              <Card sx={{
                minWidth: 120,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                textAlign: 'center',
                p: 2
              }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  {notifications.length}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  إجمالي الإشعارات
                </Typography>
              </Card>

              <Card sx={{
                minWidth: 120,
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                color: 'white',
                textAlign: 'center',
                p: 2
              }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  {notifications.filter(n => !n.read).length}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  غير مقروءة
                </Typography>
              </Card>

              <Card sx={{
                minWidth: 120,
                background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                color: 'white',
                textAlign: 'center',
                p: 2
              }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  {notifications.filter(n => n.type === 'order').length}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  الطلبات
                </Typography>
              </Card>
            </Box>
          </Paper>
        </Slide>

        {/* Tabs */}
        <Fade in={true} timeout={800}>
          <Paper elevation={4} sx={{
            marginBottom: 3,
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
            borderRadius: 3
          }}>
            <Tabs
              value={activeTab}
              onChange={(_, newValue) => setActiveTab(newValue)}
              variant="fullWidth"
              sx={{
                '& .MuiTabs-indicator': {
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  height: 3,
                  borderRadius: '3px 3px 0 0'
                },
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontWeight: 'bold',
                  fontSize: '1rem',
                  minHeight: 64,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    backgroundColor: 'rgba(102, 126, 234, 0.05)',
                  }
                }
              }}
            >
              <Tab
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <BellIcon />
                    <Box>
                      <Typography variant="subtitle1">{t('notifications.all')}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {notifications.length} إشعار
                      </Typography>
                    </Box>
                  </Box>
                }
                value="all"
              />
              <Tab
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Badge badgeContent={notifications.filter(n => !n.read).length} color="error">
                      <BellIcon />
                    </Badge>
                    <Box>
                      <Typography variant="subtitle1">{t('notifications.unread')}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {notifications.filter(n => !n.read).length} إشعار
                      </Typography>
                    </Box>
                  </Box>
                }
                value="unread"
              />
            </Tabs>
          </Paper>
        </Fade>

        {/* Filters */}
        <Fade in={true} timeout={1000}>
          <Paper elevation={3} sx={{
            padding: 3,
            marginBottom: 3,
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
            borderRadius: 3
          }}>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
              <FormControl size="small" sx={{
                minWidth: 200,
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  borderRadius: 2,
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  }
                }
              }}>
                <InputLabel>{t('notifications.filterByType')}</InputLabel>
                <Select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as Notification['type'] | 'all')}
                  label={t('notifications.filterByType')}
                >
                  <MenuItem value="all">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <BellIcon sx={{ fontSize: 16 }} />
                      {t('notifications.allTypes')}
                    </Box>
                  </MenuItem>
                  <MenuItem value="order">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <ShoppingBag sx={{ fontSize: 16, color: 'info.main' }} />
                      {t('notifications.orderNotifications')}
                    </Box>
                  </MenuItem>
                  <MenuItem value="delivery">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LocalShipping sx={{ fontSize: 16, color: 'success.main' }} />
                      {t('notifications.deliveryNotifications')}
                    </Box>
                  </MenuItem>
                  <MenuItem value="promotion">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CardGiftcard sx={{ fontSize: 16, color: 'secondary.main' }} />
                      {t('notifications.promotionNotifications')}
                    </Box>
                  </MenuItem>
                  <MenuItem value="system">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Settings sx={{ fontSize: 16, color: 'text.secondary' }} />
                      {t('notifications.systemNotifications')}
                    </Box>
                  </MenuItem>
                </Select>
              </FormControl>

              {notifications.some(n => !n.read) && (
                <MuiButton
                  onClick={handleMarkAllAsRead}
                  variant="contained"
                  startIcon={<Check />}
                  size="small"
                  sx={{
                    background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
                    boxShadow: '0 4px 15px rgba(76, 175, 80, 0.3)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #45a049 0%, #4CAF50 100%)',
                      boxShadow: '0 6px 20px rgba(76, 175, 80, 0.4)',
                      transform: 'translateY(-2px)',
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  {t('notifications.markAllAsRead')}
                </MuiButton>
              )}

              <Chip
                label={`${filteredNotifications.length} إشعار`}
                variant="outlined"
                sx={{
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  borderColor: 'rgba(102, 126, 234, 0.3)',
                  color: '#667eea'
                }}
              />
            </Box>
          </Paper>
        </Fade>

        {/* Settings Panel */}
        {showSettings && settings && (
          <Fade in={showSettings} timeout={500}>
            <Paper elevation={6} sx={{
              padding: 4,
              marginBottom: 3,
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(15px)',
              borderRadius: 4,
              border: '1px solid rgba(102, 126, 234, 0.1)'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Avatar sx={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  width: 40,
                  height: 40
                }}>
                  <Settings />
                </Avatar>
                <Box>
                  <Typography variant="h6" component="h3" sx={{
                    fontWeight: 'bold',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}>
                    {t('notifications.settings')}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    تخصيص تفضيلات الإشعارات الخاصة بك
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 4 }}>
                <Box>
                  <Typography variant="subtitle1" sx={{
                    fontWeight: 'bold',
                    marginBottom: 3,
                    color: 'text.primary',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}>
                    <BellIcon sx={{ fontSize: 20, color: '#667eea' }} />
                    {t('notifications.notificationTypes')}
                  </Typography>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Paper elevation={1} sx={{
                      p: 2,
                      background: 'rgba(255, 255, 255, 0.7)',
                      borderRadius: 2,
                      border: '1px solid rgba(0, 0, 0, 0.05)'
                    }}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={settings.orderUpdates}
                            onChange={(e) => handleSettingsUpdate('orderUpdates', e.target.checked)}
                            color="primary"
                            sx={{
                              '& .MuiSwitch-switchBase.Mui-checked': {
                                color: '#667eea',
                                '& + .MuiSwitch-track': {
                                  backgroundColor: '#667eea',
                                },
                              },
                            }}
                          />
                        }
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <ShoppingBag sx={{ fontSize: 16, color: 'info.main' }} />
                            <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                              {t('notifications.orderUpdates')}
                            </Typography>
                          </Box>
                        }
                      />
                    </Paper>

                    <Paper elevation={1} sx={{
                      p: 2,
                      background: 'rgba(255, 255, 255, 0.7)',
                      borderRadius: 2,
                      border: '1px solid rgba(0, 0, 0, 0.05)'
                    }}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={settings.promotions}
                            onChange={(e) => handleSettingsUpdate('promotions', e.target.checked)}
                            color="primary"
                            sx={{
                              '& .MuiSwitch-switchBase.Mui-checked': {
                                color: '#667eea',
                                '& + .MuiSwitch-track': {
                                  backgroundColor: '#667eea',
                                },
                              },
                            }}
                          />
                        }
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CardGiftcard sx={{ fontSize: 16, color: 'secondary.main' }} />
                            <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                              {t('notifications.promotions')}
                            </Typography>
                          </Box>
                        }
                      />
                    </Paper>

                    <Paper elevation={1} sx={{
                      p: 2,
                      background: 'rgba(255, 255, 255, 0.7)',
                      borderRadius: 2,
                      border: '1px solid rgba(0, 0, 0, 0.05)'
                    }}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={settings.deliveryUpdates}
                            onChange={(e) => handleSettingsUpdate('deliveryUpdates', e.target.checked)}
                            color="primary"
                            sx={{
                              '& .MuiSwitch-switchBase.Mui-checked': {
                                color: '#667eea',
                                '& + .MuiSwitch-track': {
                                  backgroundColor: '#667eea',
                                },
                              },
                            }}
                          />
                        }
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <LocalShipping sx={{ fontSize: 16, color: 'success.main' }} />
                            <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                              {t('notifications.deliveryUpdates')}
                            </Typography>
                          </Box>
                        }
                      />
                    </Paper>

                    <Paper elevation={1} sx={{
                      p: 2,
                      background: 'rgba(255, 255, 255, 0.7)',
                      borderRadius: 2,
                      border: '1px solid rgba(0, 0, 0, 0.05)'
                    }}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={settings.systemAnnouncements}
                            onChange={(e) => handleSettingsUpdate('systemAnnouncements', e.target.checked)}
                            color="primary"
                            sx={{
                              '& .MuiSwitch-switchBase.Mui-checked': {
                                color: '#667eea',
                                '& + .MuiSwitch-track': {
                                  backgroundColor: '#667eea',
                                },
                              },
                            }}
                          />
                        }
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Settings sx={{ fontSize: 16, color: 'text.secondary' }} />
                            <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                              {t('notifications.systemAnnouncements')}
                            </Typography>
                          </Box>
                        }
                      />
                    </Paper>
                  </Box>
                </Box>

                <Box>
                  <Typography variant="subtitle1" sx={{
                    fontWeight: 'bold',
                    marginBottom: 3,
                    color: 'text.primary',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}>
                    <Typography variant="body2" sx={{
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '0.75rem',
                      fontWeight: 'bold'
                    }}>
                      📱
                    </Typography>
                    {t('notifications.notificationMethods')}
                  </Typography>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Paper elevation={1} sx={{
                      p: 2,
                      background: 'rgba(255, 255, 255, 0.7)',
                      borderRadius: 2,
                      border: '1px solid rgba(0, 0, 0, 0.05)'
                    }}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={settings.pushNotifications}
                            onChange={(e) => handleSettingsUpdate('pushNotifications', e.target.checked)}
                            color="primary"
                            sx={{
                              '& .MuiSwitch-switchBase.Mui-checked': {
                                color: '#667eea',
                                '& + .MuiSwitch-track': {
                                  backgroundColor: '#667eea',
                                },
                              },
                            }}
                          />
                        }
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body2" sx={{
                              width: 20,
                              height: 20,
                              borderRadius: '50%',
                              backgroundColor: '#667eea',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'white',
                              fontSize: '0.75rem'
                            }}>
                              📱
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                              {t('notifications.pushNotifications')}
                            </Typography>
                          </Box>
                        }
                      />
                    </Paper>

                    <Paper elevation={1} sx={{
                      p: 2,
                      background: 'rgba(255, 255, 255, 0.7)',
                      borderRadius: 2,
                      border: '1px solid rgba(0, 0, 0, 0.05)'
                    }}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={settings.emailNotifications}
                            onChange={(e) => handleSettingsUpdate('emailNotifications', e.target.checked)}
                            color="primary"
                            sx={{
                              '& .MuiSwitch-switchBase.Mui-checked': {
                                color: '#667eea',
                                '& + .MuiSwitch-track': {
                                  backgroundColor: '#667eea',
                                },
                              },
                            }}
                          />
                        }
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body2" sx={{
                              width: 20,
                              height: 20,
                              borderRadius: '50%',
                              backgroundColor: '#667eea',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'white',
                              fontSize: '0.75rem'
                            }}>
                              ✉️
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                              {t('notifications.emailNotifications')}
                            </Typography>
                          </Box>
                        }
                      />
                    </Paper>

                    <Paper elevation={1} sx={{
                      p: 2,
                      background: 'rgba(255, 255, 255, 0.7)',
                      borderRadius: 2,
                      border: '1px solid rgba(0, 0, 0, 0.05)'
                    }}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={settings.smsNotifications}
                            onChange={(e) => handleSettingsUpdate('smsNotifications', e.target.checked)}
                            color="primary"
                            sx={{
                              '& .MuiSwitch-switchBase.Mui-checked': {
                                color: '#667eea',
                                '& + .MuiSwitch-track': {
                                  backgroundColor: '#667eea',
                                },
                              },
                            }}
                          />
                        }
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body2" sx={{
                              width: 20,
                              height: 20,
                              borderRadius: '50%',
                              backgroundColor: '#667eea',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'white',
                              fontSize: '0.75rem'
                            }}>
                              💬
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                              {t('notifications.smsNotifications')}
                            </Typography>
                          </Box>
                        }
                      />
                    </Paper>
                  </Box>
                </Box>
              </Box>
            </Paper>
          </Fade>
        )}

        {/* Notifications List */}
        {filteredNotifications.length === 0 ? (
          <Fade in={true} timeout={1200}>
            <Paper elevation={4} sx={{
              textAlign: 'center',
              paddingY: 8,
              paddingX: 4,
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(10px)',
              borderRadius: 4,
              border: '1px solid rgba(102, 126, 234, 0.1)'
            }}>
              <Avatar sx={{
                width: 80,
                height: 80,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                margin: '0 auto 16px',
                fontSize: '2rem'
              }}>
                📭
              </Avatar>
              <Typography variant="h5" component="h2" sx={{
                fontWeight: 'bold',
                marginBottom: 2,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                {activeTab === 'unread' ? t('notifications.noUnreadNotifications') : t('notifications.noNotifications')}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                {activeTab === 'unread'
                  ? t('notifications.allRead')
                  : t('notifications.notificationsWillAppear')
                }
              </Typography>
              <MuiButton
                onClick={handleRefresh}
                variant="outlined"
                startIcon={<BellIcon />}
                sx={{
                  borderColor: 'rgba(102, 126, 234, 0.3)',
                  color: '#667eea',
                  '&:hover': {
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.05)',
                  }
                }}
              >
                تحديث الإشعارات
              </MuiButton>
            </Paper>
          </Fade>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {filteredNotifications.map((notification, index) => (
              <Fade key={notification.id} in={true} timeout={600 + (index * 100)}>
                <Paper elevation={3} sx={{
                  padding: 3,
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: 3,
                  border: !notification.read ? '2px solid' : '1px solid',
                  borderColor: !notification.read ? 'rgba(102, 126, 234, 0.3)' : 'rgba(0, 0, 0, 0.05)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 8,
                    borderColor: !notification.read ? '#667eea' : 'rgba(0, 0, 0, 0.1)',
                  },
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  {/* Unread Indicator */}
                  {!notification.read && (
                    <Box sx={{
                      position: 'absolute',
                      top: 0,
                      right: 0,
                      width: 0,
                      height: 0,
                      borderStyle: 'solid',
                      borderWidth: '0 20px 20px 0',
                      borderColor: 'transparent #667eea transparent transparent',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: -18,
                        right: 2,
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        backgroundColor: '#667eea',
                      }
                    }} />
                  )}

                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 3 }}>
                    <Avatar sx={{
                      background: notification.read
                        ? 'rgba(102, 126, 234, 0.1)'
                        : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: notification.read ? '#667eea' : 'white',
                      width: 48,
                      height: 48,
                      flexShrink: 0
                    }}>
                      {getNotificationIcon(notification.type)}
                    </Avatar>

                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1 }}>
                        <Box sx={{ flex: 1 }}>
                          <Typography
                            variant="h6"
                            component="h3"
                            sx={{
                              fontWeight: 'bold',
                              color: !notification.read ? 'text.primary' : 'text.secondary',
                              marginBottom: 0.5,
                              lineHeight: 1.3,
                            }}
                          >
                            {notification.title}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              color: !notification.read ? 'text.primary' : 'text.secondary',
                              marginBottom: 1.5,
                              lineHeight: 1.4,
                            }}
                          >
                            {notification.message}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Chip
                              label={formatTimeAgo(notification.createdAt)}
                              size="small"
                              variant="outlined"
                              sx={{
                                height: 24,
                                fontSize: '0.75rem',
                                backgroundColor: 'rgba(102, 126, 234, 0.05)',
                                borderColor: 'rgba(102, 126, 234, 0.2)',
                                color: '#667eea'
                              }}
                            />
                            <Chip
                              label={notification.type}
                              size="small"
                              sx={{
                                height: 24,
                                fontSize: '0.75rem',
                                backgroundColor: notification.read
                                  ? 'rgba(0, 0, 0, 0.05)'
                                  : 'rgba(102, 126, 234, 0.1)',
                                color: notification.read ? 'text.secondary' : '#667eea'
                              }}
                            />
                          </Box>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, marginLeft: 2 }}>
                          {!notification.read && (
                            <IconButton
                              onClick={() => handleMarkAsRead(notification.id)}
                              size="small"
                              sx={{
                                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                                color: '#667eea',
                                '&:hover': {
                                  backgroundColor: '#667eea',
                                  color: 'white',
                                  transform: 'scale(1.05)',
                                },
                                transition: 'all 0.2s ease'
                              }}
                              title="تعليم كمقروء"
                            >
                              <Check fontSize="small" />
                            </IconButton>
                          )}

                          <IconButton
                            onClick={() => handleDelete(notification.id)}
                            size="small"
                            sx={{
                              backgroundColor: 'rgba(244, 67, 54, 0.1)',
                              color: '#f44336',
                              '&:hover': {
                                backgroundColor: '#f44336',
                                color: 'white',
                                transform: 'scale(1.05)',
                              },
                              transition: 'all 0.2s ease'
                            }}
                            title="حذف الإشعار"
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Box>
                      </Box>

                      {notification.actionUrl && (
                        <Box sx={{ marginTop: 2 }}>
                          <MuiButton
                            size="small"
                            variant="outlined"
                            onClick={() => navigate(notification.actionUrl!)}
                            startIcon={<ArrowBack sx={{ transform: 'rotate(180deg)' }} />}
                            sx={{
                              borderColor: 'rgba(102, 126, 234, 0.3)',
                              color: '#667eea',
                              '&:hover': {
                                borderColor: '#667eea',
                                backgroundColor: 'rgba(102, 126, 234, 0.05)',
                                transform: 'translateY(-1px)',
                              },
                              transition: 'all 0.2s ease'
                            }}
                          >
                            عرض التفاصيل
                          </MuiButton>
                        </Box>
                      )}
                    </Box>
                  </Box>
                </Paper>
              </Fade>
            ))}
          </Box>
        )}

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

export default Notifications;
