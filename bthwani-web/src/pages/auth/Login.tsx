import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useTranslation } from 'react-i18next';
import {
  Container,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Box,
  Link as MuiLink,
  IconButton,
  InputAdornment,
  Fade,
  Slide,
  useTheme,
} from '@mui/material';
import {
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
  Login as LoginIcon,
  Person,
  ArrowForward,
  Security,
  Language,
} from '@mui/icons-material';

const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const location = useLocation();
  const { t, i18n } = useTranslation();

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFocus = (fieldName: string) => {
    setFocusedField(fieldName);
  };

  const handleBlur = () => {
    setFocusedField(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const result = await login(formData.email, formData.password);

    setLoading(false);

    if (result.success) {
      const from = (location.state as { from?: { pathname?: string } })?.from?.pathname || "/";
      navigate(from, { replace: true });
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: theme.palette.background.default,
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: 0,
          background: theme.palette.background.default,
          zIndex: 1,
        },
        p: 2,
      }}
    >
      {/* زر تبديل اللغة */}
      <IconButton
        onClick={() => i18n.changeLanguage(i18n.language === 'ar' ? 'en' : 'ar')}
        sx={{
          position: 'fixed',
          top: 20,
          right: 20,
          zIndex: 1000,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 1)',
            transform: 'scale(1.05)',
          },
          transition: 'all 0.3s ease-in-out',
        }}
      >
        <Language sx={{ fontSize: 24, color: 'primary.main' }} />
      </IconButton>
      <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 2 }}>
        <Fade in timeout={800}>
          <Card
            sx={{
              borderRadius: 4,
              boxShadow: theme.palette.primary.dark,
              overflow: 'visible',
              background: theme.palette.background.default,
              border: '1px solid',
              borderColor: 'divider',
              position: 'relative',
              '&::before': {
                content: '""',
                position: 'absolute',
                inset: 0,
                background: theme.palette.background.default,
                borderRadius: 4,
                zIndex: 1,
              }
            }}
          >
            <CardContent sx={{ p: 4, position: 'relative', zIndex: 2 }}>
              <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Slide in direction="down" timeout={600}>
                  <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 1,
                    mb: 2
                  }}>
                    <Box sx={{
                      p: 1.5,
                      borderRadius: 2,
                      background: theme.palette.primary.main,
                      boxShadow: theme.palette.primary.main,
                    }}>
                      <LoginIcon sx={{ fontSize: 32, color: 'white' }} />
                    </Box>
                  </Box>
                </Slide>

                <Slide in direction="up" timeout={800}>
                  <Box>
                    <Typography
                      variant="h3"
                      component="h1"
                      sx={{
                        fontWeight: 800,
                        mb: 1,
                        fontSize: '2.2rem',
                        background: theme.palette.primary.main,
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                      }}
                    >
                      {t('appName')}
                    </Typography>
                    <Typography variant="h6" sx={{ fontSize: '1.2rem', fontWeight: 700, opacity: 0.9 }}>
                      {t('welcomeBack')}
                    </Typography>
                    <Typography variant="body1" sx={{ color: 'text.secondary', opacity: 0.85 }}>
                      {t('loginToContinue')}
                    </Typography>
                  </Box>
                </Slide>
              </Box>

              <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Fade in timeout={1000}>
                  <TextField
                    name="email"
                    type="email"
                    label={t('email')}
                    placeholder="name@email.com"
                    value={formData.email}
                    onChange={handleChange}
                    onFocus={() => handleFocus('email')}
                    onBlur={handleBlur}
                    required
                    fullWidth
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailIcon sx={{
                            color: focusedField === 'email' ? 'primary.main' : 'text.secondary',
                            transition: 'color 0.3s ease-in-out'
                          }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiInputBase-root': {
                        borderRadius: 2,
                        transition: 'all 0.3s ease-in-out',
                        border: focusedField === 'email' ? `2px solid ${theme.palette.primary.main}` : '1px solid',
                        borderColor: focusedField === 'email' ? 'primary.main' : 'divider',
                        boxShadow: focusedField === 'email' ? `0 0 0 3px ${theme.palette.primary.light}` : 'none',
                        background: focusedField === 'email' ? 'linear-gradient(135deg, #fff 0%, #f8f9fa 100%)' : 'transparent',
                      },
                      '& .MuiInputLabel-root': {
                        color: focusedField === 'email' ? 'primary.main' : 'text.secondary',
                        fontWeight: focusedField === 'email' ? 700 : 500,
                        transition: 'all 0.3s ease-in-out',
                        fontFamily: theme.typography.fontFamily
                      },
                      '& .MuiOutlinedInput-notchedOutline': { border: 'none' }
                    }}
                  />
                </Fade>

                <Fade in timeout={1200}>
                  <TextField
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    label={t('password')}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    onFocus={() => handleFocus('password')}
                    onBlur={handleBlur}
                    required
                    fullWidth
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockIcon sx={{
                            color: focusedField === 'password' ? 'primary.main' : 'text.secondary',
                            transition: 'color 0.3s ease-in-out'
                          }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                            sx={{
                              color: focusedField === 'password' ? 'primary.main' : 'text.secondary',
                              transition: 'all 0.3s ease-in-out',
                              transform: showPassword ? 'scale(1.1)' : 'scale(1)'
                            }}
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiInputBase-root': {
                        borderRadius: 2,
                        transition: 'all 0.3s ease-in-out',
                        border: focusedField === 'password' ? `2px solid ${theme.palette.primary.main}` : '1px solid',
                        borderColor: focusedField === 'password' ? 'primary.main' : 'divider',
                        boxShadow: focusedField === 'password' ? `0 0 0 3px ${theme.palette.primary.light}` : 'none',
                        background: focusedField === 'password' ? 'linear-gradient(135deg, #fff 0%, #f8f9fa 100%)' : 'transparent',
                      },
                      '& .MuiInputLabel-root': {
                        color: focusedField === 'password' ? 'primary.main' : 'text.secondary',
                        fontWeight: focusedField === 'password' ? 700 : 500,
                        transition: 'all 0.3s ease-in-out',
                        fontFamily: theme.typography.fontFamily
                      },
                      '& .MuiOutlinedInput-notchedOutline': { border: 'none' }
                    }}
                  />
                </Fade>

                <Fade in timeout={1400}>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 1 }}>
                    <MuiLink
                      component={Link}
                      to="/forgot-password"
                      variant="body2"
                      sx={{
                        color: 'primary.main',
                        textDecoration: 'none',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                        transition: 'all 0.3s ease-in-out',
                        '&:hover': { color: 'primary.dark', transform: 'translateX(2px)' },
                        fontFamily: theme.typography.fontFamily
                      }}
                    >
                      <Security sx={{ fontSize: 16 }} />
                      {t('forgotPassword')}
                    </MuiLink>
                  </Box>
                </Fade>

                <Fade in timeout={1600}>
                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    size="large"
                    disabled={loading}
                    sx={{
                      borderRadius: 3,
                      py: 2,
                      fontSize: '1.1rem',
                      fontWeight: 800,
                      background: theme.palette.primary.main,
                      boxShadow: theme.palette.primary.dark,
                      '&:hover': {
                        background: theme.palette.primary.dark,
                        transform: 'translateY(-2px)'
                      }
                    }}
                  >
                    {loading ? t('loggingIn') : (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LoginIcon sx={{ fontSize: 20 }} />
                        {t('login')}
                      </Box>
                    )}
                  </Button>
                </Fade>

                <Fade in timeout={1800}>
                  <Box sx={{
                    textAlign: 'center',
                    pt: 2,
                    borderTop: '1px solid',
                    borderColor: 'divider',
                    mt: 3
                  }}>
                    <Typography variant="body2" sx={{ color: 'text.secondary', display: 'inline' }}>
                      {t('noAccount')} {' '}
                    </Typography>
                    <MuiLink
                      component={Link}
                      to="/register"
                      variant="body2"
                      sx={{
                        color: 'background.default',
                        fontWeight: 800,
                        textDecoration: 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 0.5,
                        px: 2,
                        py: 1,
                        borderRadius: 2,
                        background: theme.palette.primary.dark,
                        transition: 'all 0.3s ease-in-out',
                        '&:hover': { color: 'primary.dark', transform: 'translateY(-1px)' },
                        fontFamily: theme.typography.fontFamily
                      }}
                    >
                      <Person sx={{ fontSize: 16 }} />
                      {t('register')}
                      <ArrowForward sx={{ fontSize: 14 }} />
                    </MuiLink>
                    
                  </Box>
                </Fade>
              </Box>
            </CardContent>
          </Card>
        </Fade>
      </Container>
    </Box>
  );
};

export default Login;
