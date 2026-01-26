import { useState } from 'react';
import { verifyOTP } from '../../api/auth';
import {
  Container,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Box,
  Alert,
  Fade,
  Slide,
  useTheme,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import {
  CheckCircle,
  ArrowForward,
  Verified,
} from '@mui/icons-material';

export default function OTPVerification() {
  const theme = useTheme();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await verifyOTP({ code });
      setOk(true);
    } catch (err: unknown) {
      setError((err as Error)?.message || 'رمز غير صحيح.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: `linear-gradient(135deg, ${theme.palette.info.light}15 0%, ${theme.palette.success.light}10 100%)`,
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Ccircle cx="7" cy="7" r="7"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
          zIndex: 1,
        },
        p: 2,
      }}
    >
      <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 2 }}>
        <Fade in timeout={800}>
          <Card
            sx={{
              borderRadius: 4,
              boxShadow: theme.shadows[12],
              overflow: 'visible',
              background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.grey[50]} 100%)`,
              border: '1px solid',
              borderColor: 'divider',
              position: 'relative',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: `linear-gradient(135deg, ${theme.palette.info.light}08 0%, ${theme.palette.success.light}05 100%)`,
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
                      background: 'linear-gradient(135deg, #2196F3 0%, #03DAC6 100%)',
                      boxShadow: '0 4px 12px rgba(33, 150, 243, 0.3)'
                    }}>
                      <Verified sx={{ fontSize: 32, color: 'white' }} />
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
                        background: 'linear-gradient(45deg, #2196F3 30%, #03DAC6 90%)',
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                      }}
                    >
                      التحقق برمز OTP
                    </Typography>
                    <Typography
                      variant="h6"
                      sx={{
                        fontSize: '1.1rem',
                        fontWeight: 500,
                        opacity: 0.8,
                        mb: 1
                      }}
                    >
                      أدخل رمز التحقق المرسل إليك
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        color: 'text.secondary',
                        opacity: 0.7
                      }}
                    >
                      تحقق من بريدك الإلكتروني أو هاتفك للحصول على الرمز
                    </Typography>
                  </Box>
                </Slide>
              </Box>

              {!ok ? (
                <Fade in timeout={1000}>
                  <Box component="form" onSubmit={submit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <TextField
                      fullWidth
                      placeholder="ادخل الرمز"
                      dir="auto"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      variant="outlined"
                      inputProps={{
                        style: {
                          textAlign: 'center',
                          fontSize: '1.5rem',
                          letterSpacing: '0.5rem',
                        },
                        maxLength: 6,
                      }}
                      sx={{
                        '& .MuiInputBase-root': {
                          borderRadius: 2,
                          transition: 'all 0.3s ease-in-out',
                          border: code ? `2px solid ${theme.palette.info.main}` : '1px solid',
                          borderColor: code ? 'info.main' : 'divider',
                          boxShadow: code ? `0 0 0 3px ${theme.palette.info.light}30` : 'none',
                          background: code ? 'linear-gradient(135deg, #fff 0%, #f8f9fa 100%)' : 'transparent',
                        },
                        '& .MuiInputLabel-root': {
                          color: code ? 'info.main' : 'text.secondary',
                          fontWeight: code ? 600 : 400,
                          transition: 'all 0.3s ease-in-out',
                        },
                        '& .MuiOutlinedInput-notchedOutline': {
                          border: 'none',
                        }
                      }}
                    />

                    {error && (
                      <Alert
                        severity="error"
                        sx={{
                          borderRadius: 2,
                          background: 'linear-gradient(135deg, rgba(244, 67, 54, 0.1) 0%, rgba(244, 67, 54, 0.05) 100%)',
                          border: '1px solid',
                          borderColor: 'error.light'
                        }}
                      >
                        {error}
                      </Alert>
                    )}

                    <Fade in timeout={1400}>
                      <Button
                        type="submit"
                        disabled={loading || code.length < 6}
                        variant="contained"
                        fullWidth
                        size="large"
                        sx={{
                          borderRadius: 3,
                          py: 2,
                          textTransform: 'none',
                          fontSize: '1.1rem',
                          fontWeight: 700,
                          background: 'linear-gradient(135deg, #2196F3 0%, #03DAC6 100%)',
                          boxShadow: '0 4px 12px rgba(33, 150, 243, 0.3)',
                          transition: 'all 0.3s ease-in-out',
                          '&:hover': {
                            background: 'linear-gradient(135deg, #1976D2 0%, #00BFA5 100%)',
                            transform: 'translateY(-2px)',
                            boxShadow: '0 8px 25px rgba(33, 150, 243, 0.4)',
                          },
                          '&:disabled': {
                            background: 'linear-gradient(135deg, #ccc 0%, #999 100%)',
                            color: '#666',
                            boxShadow: 'none'
                          }
                        }}
                      >
                        {loading ? (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box sx={{
                              width: 20,
                              height: 20,
                              border: '2px solid transparent',
                              borderTop: '2px solid white',
                              borderRadius: '50%',
                              animation: 'spin 1s linear infinite'
                            }} />
                            جارٍ التحقق…
                          </Box>
                        ) : (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Verified sx={{ fontSize: 20 }} />
                            تحقق من الرمز
                          </Box>
                        )}
                      </Button>
                    </Fade>
                  </Box>
                </Fade>
              ) : (
                <Fade in timeout={600}>
                  <Box sx={{ textAlign: 'center', py: 3 }}>
                    <Slide in direction="up" timeout={800}>
                      <Alert
                        severity="success"
                        icon={<CheckCircle sx={{ fontSize: 28 }} />}
                        sx={{
                          mb: 3,
                          borderRadius: 3,
                          background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(76, 175, 80, 0.05) 100%)',
                          border: '1px solid',
                          borderColor: 'success.light',
                          '& .MuiAlert-icon': {
                            color: 'success.main'
                          },
                          '& .MuiAlert-message': {
                            fontSize: '1.1rem',
                            fontWeight: 600
                          }
                        }}
                      >
                        تم تفعيل حسابك بنجاح!
                      </Alert>
                    </Slide>

                    <Slide in direction="up" timeout={1000}>
                      <Box sx={{ mb: 4 }}>
                        <Typography variant="h6" sx={{
                          mb: 2,
                          fontWeight: 600,
                          color: 'success.main'
                        }}>
                          مرحباً بك في تطبيقنا!
                        </Typography>
                        <Typography variant="body1" sx={{
                          color: 'text.secondary',
                          opacity: 0.8,
                          mb: 2
                        }}>
                          تم تفعيل حسابك بنجاح ويمكنك الآن الاستمتاع بجميع المزايا
                        </Typography>
                        <Typography variant="body2" sx={{
                          color: 'text.secondary',
                          opacity: 0.6,
                          fontSize: '0.9rem'
                        }}>
                          استمتع بتجربة تسوق ممتعة وآمنة معنا
                        </Typography>
                      </Box>
                    </Slide>

                    <Slide in direction="up" timeout={1200}>
                      <Button
                        component={RouterLink}
                        to="/"
                        variant="contained"
                        size="large"
                        sx={{
                          borderRadius: 3,
                          px: 4,
                          py: 2,
                          textTransform: 'none',
                          fontSize: '1.1rem',
                          fontWeight: 700,
                          background: 'linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%)',
                          boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)',
                          transition: 'all 0.3s ease-in-out',
                          '&:hover': {
                            background: 'linear-gradient(135deg, #388E3C 0%, #4CAF50 100%)',
                            transform: 'translateY(-2px)',
                            boxShadow: '0 8px 25px rgba(76, 175, 80, 0.4)',
                          }
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <ArrowForward sx={{ fontSize: 20 }} />
                          اذهب للصفحة الرئيسية
                        </Box>
                      </Button>
                    </Slide>
                  </Box>
                </Fade>
              )}
            </CardContent>
          </Card>
        </Fade>
      </Container>
    </Box>
  );
}
