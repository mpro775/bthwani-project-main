import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { confirmPayment } from '../../api/payments';
import {
  Box,
  Typography,
  Container,
  CircularProgress,
  Alert,
  Fade,
  Grow,
  Card,
  useTheme,
  alpha,
} from '@mui/material';
import {
  CheckCircle,
  Error,
  Payment,
  Schedule,
} from '@mui/icons-material';

export default function PaymentCallback() {
  const [search] = useSearchParams();
  const navigate = useNavigate();
  const [msg, setMsg] = useState('جاري التحقق من عملية الدفع…');
  const [ok, setOk] = useState<boolean | null>(null);
  const theme = useTheme();

  useEffect(() => {
    (async () => {
      const sessionId = search.get('session_id') || undefined;
      const orderId = search.get('order_id') || undefined;
      const status = search.get('status') || undefined;
      try {
        await confirmPayment({ sessionId, orderId, status });
        setOk(true);
        setMsg('تم تأكيد الدفع بنجاح.');
        setTimeout(() => navigate(orderId ? `/orders/${orderId}` : '/orders'), 2000);
      } catch (e: unknown) {
        setOk(false);
        setMsg((e as Error)?.message || 'تعذر تأكيد الدفع.');
      }
    })();
  }, [search, navigate]);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 2,
      }}
    >
      <Container maxWidth="sm">
        <Fade in timeout={800}>
          <Card
            sx={{
              padding: 4,
              textAlign: 'center',
              boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
              borderRadius: 3,
              background: 'rgba(255,255,255,0.98)',
              backdropFilter: 'blur(20px)',
            }}
          >
            <Box sx={{ marginBottom: 3 }}>
              <Payment
                sx={{
                  fontSize: 48,
                  color: theme.palette.primary.main,
                  marginBottom: 2,
                }}
              />
              <Typography
                variant="h4"
                component="h1"
                sx={{
                  fontWeight: 'bold',
                  background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  marginBottom: 1,
                }}
              >
                نتيجة الدفع
              </Typography>
              <Typography variant="body1" color="text.secondary">
                جاري معالجة طلبك...
              </Typography>
            </Box>

            <Grow in={ok !== null} timeout={500}>
              <Box>
                {ok === null ? (
                  <Box sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 3,
                    paddingY: 3,
                  }}>
                    <CircularProgress
                      size={60}
                      thickness={4}
                      sx={{
                        color: theme.palette.primary.main,
                        animation: 'pulse 2s infinite',
                      }}
                    />
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h6" sx={{ fontWeight: 'medium', marginBottom: 1 }}>
                        جاري التحقق...
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {msg}
                      </Typography>
                    </Box>
                  </Box>
                ) : ok ? (
                  <Alert
                    severity="success"
                    icon={<CheckCircle sx={{ fontSize: 28 }} />}
                    sx={{
                      marginTop: 2,
                      background: alpha(theme.palette.success.main, 0.1),
                      border: `1px solid ${theme.palette.success.main}`,
                      borderRadius: 2,
                      '& .MuiAlert-icon': {
                        color: theme.palette.success.main,
                      },
                    }}
                  >
                    <Typography variant="h6" sx={{ fontWeight: 'bold', marginBottom: 1 }}>
                      تم الدفع بنجاح! 🎉
                    </Typography>
                    <Typography variant="body1">
                      {msg}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ marginTop: 1 }}>
                      سيتم توجيهك إلى صفحة الطلبات خلال ثوانٍ...
                    </Typography>
                  </Alert>
                ) : (
                  <Alert
                    severity="error"
                    icon={<Error sx={{ fontSize: 28 }} />}
                    sx={{
                      marginTop: 2,
                      background: alpha(theme.palette.error.main, 0.1),
                      border: `1px solid ${theme.palette.error.main}`,
                      borderRadius: 2,
                      '& .MuiAlert-icon': {
                        color: theme.palette.error.main,
                      },
                    }}
                  >
                    <Typography variant="h6" sx={{ fontWeight: 'bold', marginBottom: 1 }}>
                      فشل في عملية الدفع
                    </Typography>
                    <Typography variant="body1">
                      {msg}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ marginTop: 1 }}>
                      يرجى المحاولة مرة أخرى أو التواصل مع الدعم الفني
                    </Typography>
                  </Alert>
                )}
              </Box>
            </Grow>

            {/* Status Indicator */}
            <Box sx={{
              position: 'absolute',
              top: 16,
              right: 16,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              padding: 1,
              borderRadius: 2,
              background: alpha(theme.palette.background.default, 0.8),
            }}>
              <Schedule sx={{ fontSize: 16, color: theme.palette.text.secondary }} />
              <Typography variant="caption" color="text.secondary">
                {new Date().toLocaleTimeString('ar-SA')}
              </Typography>
            </Box>
          </Card>
        </Fade>

        {/* Background decoration */}
        <Box sx={{
          position: 'absolute',
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
            width: 100,
            height: 100,
            borderRadius: '50%',
            background: theme.palette.primary.main,
            animation: 'float 6s ease-in-out infinite',
          }} />
          <Box sx={{
            position: 'absolute',
            top: '60%',
            right: '15%',
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: theme.palette.secondary.main,
            animation: 'float 8s ease-in-out infinite reverse',
          }} />
        </Box>
      </Container>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
      `}</style>
    </Box>
  );
}
