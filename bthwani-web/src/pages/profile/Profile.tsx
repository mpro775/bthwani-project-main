import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../hooks/useAuth";
import {
  Container,
  Typography,
  Card,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Button as MuiButton,
  Box,
  Avatar,
  Fade,
  Grow,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Person,
  Place,
  Settings,
  Help,
  Logout,
  ArrowForward,
  Language,
  Email,
  Phone,
  Verified,
} from '@mui/icons-material';

const Profile: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();

  const toggleLanguage = () => {
    const newLang = i18n.language === "ar" ? "en" : "ar";
    i18n.changeLanguage(newLang);
    document.documentElement.dir = newLang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = newLang;
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (!isAuthenticated) {
    return (
      <Box sx={{
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 2,
      }}>
        <Container maxWidth="sm">
          <Fade in timeout={800}>
            <Card sx={{
              padding: 4,
              textAlign: 'center',
              boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
              borderRadius: 3,
              background: 'rgba(255,255,255,0.98)',
              backdropFilter: 'blur(20px)',
            }}>
              <Avatar sx={{
                width: 80,
                height: 80,
                background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                margin: '0 auto 16px',
              }}>
                <Person sx={{ fontSize: 40 }} />
              </Avatar>
              <Typography variant="h4" component="h2" sx={{
                fontWeight: 'bold',
                marginBottom: 2,
                background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                يجب تسجيل الدخول
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ marginBottom: 3 }}>
                قم بتسجيل الدخول للوصول إلى ملفك الشخصي وإدارة حسابك
              </Typography>
              <MuiButton
                onClick={() => navigate("/login")}
                variant="contained"
                size="large"
                sx={{
                  borderRadius: 2,
                  paddingY: 1.5,
                  paddingX: 3,
                  fontSize: '1.1rem',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                  },
                }}
              >
                {t("auth.login")}
              </MuiButton>
            </Card>
          </Fade>
        </Container>
      </Box>
    );
  }

  const menuItems = [
    {
      icon: Person,
      label: t("profile.editProfile"),
      onClick: () => navigate("/profile/edit"),
    },
    {
      icon: Place,
      label: t("profile.addresses"),
      onClick: () => navigate("/profile/addresses"),
    },
    {
      icon: Settings,
      label: t("profile.settings"),
      onClick: () => navigate("/profile/edit"),
    },
    {
      icon: Language,
      label: t("profile.language"),
      onClick: toggleLanguage,
      value: i18n.language === "ar" ? "العربية" : "English",
    },
    {
      icon: Help,
      label: t("profile.help"),
      onClick: () => {
        // يمكن إضافة صفحة مساعدة لاحقاً أو توجيه إلى الصفحة الرئيسية
        navigate("/");
      },
    },
  ];

  return (
    <Box sx={{
      minHeight: '100vh',
      background: `linear-gradient(135deg, ${theme.palette.primary.main}15 0%, ${theme.palette.secondary.main}15 100%)`,
      paddingY: 2,
    }}>
      <Container maxWidth="lg" sx={{ paddingBottom: { xs: 20, md: 8 } }}>
        {/* Header */}
        <Box sx={{
          textAlign: 'center',
          marginBottom: 4,
          paddingY: 3,
        }}>
          <Typography
            variant="h3"
            component="h1"
            sx={{
              fontWeight: 'bold',
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: 2,
            }}
          >
            الملف الشخصي
          </Typography>
          <Typography variant="body1" color="text.secondary">
            إدارة حسابك وتفضيلاتك الشخصية
          </Typography>
        </Box>

        {/* Person Info */}
        <Grow in timeout={600}>
          <Card sx={{
            padding: 3,
            marginBottom: 3,
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            borderRadius: 3,
            background: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(20px)',
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <Avatar
                sx={{
                  width: 96,
                  height: 96,
                  background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  fontSize: '2.5rem',
                  fontWeight: 'bold',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
                }}
              >
                {user?.fullName?.charAt(0) || user?.email?.charAt(0) || "U"}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, marginBottom: 1 }}>
                  <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                    {user?.fullName || "مستخدم"}
                  </Typography>
                  <Verified sx={{ color: 'primary.main', fontSize: 20 }} />
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Email sx={{ color: 'text.secondary', fontSize: 18 }} />
                    <Typography variant="body1" color="text.secondary">
                      {user?.email}
                    </Typography>
                  </Box>
                  {user?.phone && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Phone sx={{ color: 'text.secondary', fontSize: 18 }} />
                      <Typography variant="body1" color="text.secondary">
                        {user.phone}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>
            </Box>
          </Card>
        </Grow>

        {/* Menu Items */}
        <Grow in timeout={800}>
          <Card sx={{
            marginBottom: 3,
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            borderRadius: 3,
            background: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(20px)',
            overflow: 'hidden',
          }}>
            <List disablePadding>
              {menuItems.map((item, index) => (
                <ListItem key={index} disablePadding>
                  <ListItemButton
                    onClick={item.onClick}
                    sx={{
                      paddingY: 2,
                      paddingX: 3,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.08),
                        transform: 'translateX(4px)',
                      },
                    }}
                  >
                    <ListItemIcon sx={{
                      minWidth: 40,
                      color: 'primary.main',
                    }}>
                      <item.icon sx={{ fontSize: 24 }} />
                    </ListItemIcon>
                    <ListItemText
                      primary={item.label}
                      secondary={item.value}
                      primaryTypographyProps={{
                        fontWeight: 'medium',
                        fontSize: '1rem',
                      }}
                      secondaryTypographyProps={{
                        color: 'text.secondary',
                      }}
                    />
                    <ArrowForward sx={{
                      color: 'text.secondary',
                      transition: 'transform 0.3s ease',
                      '.MuiListItemButton-root:hover &': {
                        transform: 'translateX(4px)',
                      },
                    }} />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Card>
        </Grow>

        {/* Logout Button */}
        <Grow in timeout={1000}>
          <MuiButton
            onClick={handleLogout}
            variant="outlined"
            fullWidth
            startIcon={<Logout />}
            sx={{
              paddingY: 2,
              fontSize: '1.1rem',
              fontWeight: 'bold',
              borderRadius: 3,
              color: 'error.main',
              borderColor: 'error.main',
              background: alpha(theme.palette.error.main, 0.05),
              boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
              transition: 'all 0.3s ease',
              '&:hover': {
                backgroundColor: 'error.main',
                color: 'white',
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                borderColor: 'error.main',
              },
            }}
          >
            {t("auth.logout")}
          </MuiButton>
        </Grow>
      </Container>

      {/* Background decoration */}
      <Box sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'none',
        zIndex: -1,
        opacity: 0.1,
      }}>
        <Box sx={{
          position: 'absolute',
          top: '10%',
          left: '10%',
          width: 120,
          height: 120,
          borderRadius: '50%',
          background: theme.palette.primary.main,
          animation: 'float 6s ease-in-out infinite',
        }} />
        <Box sx={{
          position: 'absolute',
          top: '60%',
          right: '15%',
          width: 100,
          height: 100,
          borderRadius: '50%',
          background: theme.palette.secondary.main,
          animation: 'float 8s ease-in-out infinite reverse',
        }} />
      </Box>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
      `}</style>
    </Box>
  );
};

export default Profile;
