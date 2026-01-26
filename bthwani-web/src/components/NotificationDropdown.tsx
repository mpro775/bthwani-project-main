import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import {
  getUserNotifications,
  getUnreadNotificationsCount,
  markNotificationAsRead,
} from "../api/notifications";
import type { Notification } from "../types";
import {
  Card,
  Typography,
  Button,
  Box,
  Badge,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  CircularProgress,
} from "@mui/material";
import {
  Notifications as NotificationsIcon,
  Inventory as PackageIcon,
  LocalShipping as TruckIcon,
  CardGiftcard as GiftIcon,
  Settings as SettingsIcon,
  Launch as ExternalLinkIcon,
} from "@mui/icons-material";

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  isOpen,
  onClose,
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const loadNotifications = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const data = await getUserNotifications(10);
      setNotifications(data);
    } catch (error) {
      console.error("Error loading notifications:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const loadUnreadCount = useCallback(async () => {
    if (!user) return;

    try {
      const count = await getUnreadNotificationsCount();
      setUnreadCount(count);
    } catch (error) {
      console.error("Error loading unread count:", error);
    }
  }, [user]);

  useEffect(() => {
    if (isOpen && user) {
      loadNotifications();
      loadUnreadCount();
    }
  }, [isOpen, user, loadNotifications, loadUnreadCount]);


  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.read) {
      try {
        await markNotificationAsRead(notification.id);
        setNotifications((prev) =>
          prev.map((n) => (n.id === notification.id ? { ...n, read: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (error) {
        console.error("Error marking notification as read:", error);
      }
    }

    if (notification.actionUrl) {
      navigate(notification.actionUrl);
      onClose();
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      // Mark all as read in the UI for now
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "order":
        return <PackageIcon sx={{ fontSize: 20, color: 'primary.main' }} />;
      case "delivery":
        return <TruckIcon sx={{ fontSize: 20, color: 'success.main' }} />;
      case "promotion":
        return <GiftIcon sx={{ fontSize: 20, color: 'secondary.main' }} />;
      case "system":
        return <SettingsIcon sx={{ fontSize: 20, color: 'text.secondary' }} />;
      default:
        return <NotificationsIcon sx={{ fontSize: 20, color: 'text.secondary' }} />;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return "الآن";
    if (diffInMinutes < 60) return `قبل ${diffInMinutes} دقيقة`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `قبل ${diffInHours} ساعة`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `قبل ${diffInDays} يوم`;

    return date.toLocaleDateString("ar-YE");
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <Box
        sx={{
          position: 'fixed',
          inset: 0,
          zIndex: 40,
        }}
        onClick={onClose}
      />

      {/* Dropdown */}
      <Card
        sx={{
          position: 'absolute',
          left: 0,
          top: '100%',
          mt: 1,
          width: 384,
          maxHeight: 384,
          zIndex: 50,
          boxShadow: 3,
        }}
      >
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <NotificationsIcon sx={{ fontSize: 20 }} />
            <Typography variant="h6" sx={{ fontWeight: 'medium' }}>
              الإشعارات
            </Typography>
            {unreadCount > 0 && (
              <Badge
                badgeContent={unreadCount}
                sx={{
                  '& .MuiBadge-badge': {
                    backgroundColor: 'error.main',
                    color: 'white',
                    fontSize: '0.75rem',
                  },
                }}
              />
            )}
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {unreadCount > 0 && (
              <Button
                onClick={handleMarkAllAsRead}
                size="small"
                sx={{
                  fontSize: '0.875rem',
                  color: 'primary.main',
                  '&:hover': {
                    backgroundColor: 'primary.light',
                  },
                  textTransform: 'none',
                }}
              >
                تعليم الكل كمقروء
              </Button>
            )}
            <Button
              onClick={() => navigate("/notifications")}
              size="small"
              sx={{
                fontSize: '0.875rem',
                color: 'text.secondary',
                '&:hover': {
                  color: 'text.primary',
                  backgroundColor: 'grey.100',
                },
                textTransform: 'none',
              }}
            >
              عرض الكل
            </Button>
          </Box>
        </Box>

        {/* Notifications List */}
        <List sx={{ maxHeight: 384, overflow: 'auto', p: 0 }}>
          {loading ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', p: 4 }}>
              <CircularProgress size={24} sx={{ color: 'primary.main', mb: 1 }} />
              <Typography variant="body2" color="text.secondary">
                جاري التحميل...
              </Typography>
            </Box>
          ) : notifications.length === 0 ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', p: 4 }}>
              <NotificationsIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
              <Typography variant="body2" color="text.secondary">
                لا توجد إشعارات
              </Typography>
            </Box>
          ) : (
            notifications.map((notification) => (
              <ListItem key={notification.id} disablePadding>
                <ListItemButton
                  onClick={() => handleNotificationClick(notification)}
                  sx={{
                    backgroundColor: !notification.read ? 'primary.light' : 'transparent',
                    '&:hover': {
                      backgroundColor: !notification.read ? 'primary.light' : 'grey.50',
                    },
                    transition: 'background-color 0.2s',
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    {getNotificationIcon(notification.type)}
                  </ListItemIcon>

                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: !notification.read ? 'medium' : 'normal',
                            color: !notification.read ? 'text.primary' : 'text.secondary',
                            fontSize: '0.875rem',
                          }}
                        >
                          {notification.title}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ fontSize: '0.75rem', mr: 1 }}
                        >
                          {formatTimeAgo(notification.createdAt)}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography
                          variant="body2"
                          sx={{
                            color: !notification.read ? 'text.primary' : 'text.secondary',
                            fontSize: '0.875rem',
                            mt: 0.5,
                          }}
                        >
                          {notification.message}
                        </Typography>
                        {notification.actionUrl && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
                            <ExternalLinkIcon sx={{ fontSize: 12, color: 'primary.main' }} />
                            <Typography variant="caption" color="primary.main">
                              عرض التفاصيل
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    }
                  />

                  {!notification.read && (
                    <ListItemSecondaryAction>
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          backgroundColor: 'primary.main',
                        }}
                      />
                    </ListItemSecondaryAction>
                  )}
                </ListItemButton>
              </ListItem>
            ))
          )}
        </List>

        {/* Footer */}
        {notifications.length > 0 && (
          <Box sx={{ p: 1.5, borderTop: 1, borderColor: 'divider', backgroundColor: 'grey.50' }}>
            <Button
              onClick={() => navigate("/notifications")}
              fullWidth
              size="small"
              sx={{
                fontSize: '0.875rem',
                color: 'primary.main',
                fontWeight: 'medium',
                '&:hover': {
                  color: 'primary.dark',
                  backgroundColor: 'primary.light',
                },
                textTransform: 'none',
              }}
            >
              عرض جميع الإشعارات
            </Button>
          </Box>
        )}
      </Card>
    </>
  );
};

export default NotificationDropdown;
