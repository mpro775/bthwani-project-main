import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Card,
  Box,
  Chip,
  Button as MuiButton,
  IconButton,
  Fade,
  Grow,
  useTheme,
  alpha,
  Avatar,
} from '@mui/material';
import {
  LocalOffer,
  ArrowBack,
  ShoppingCart,
  Store,
  TrendingUp,
} from '@mui/icons-material';

interface Deal {
  id: string;
  title: string;
  description: string;
  originalPrice: number;
  discountedPrice: number;
  discountPercentage: number;
  image: string;
  storeName: string;
  storeId: string;
  validUntil: string;
  category: string;
}

const Deals: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  const [loading, setLoading] = useState(true);
  const [deals, setDeals] = useState<Deal[]>([]);

  useEffect(() => {
    loadDeals();
  }, []);

  const loadDeals = async () => {
    try {
      setLoading(true);
      // Mock deals data - should come from API in real app
      const mockDeals: Deal[] = [
        {
          id: '1',
          title: 'عرض خاص على الدجاج المشوي',
          description: 'وجبة دجاج مشوي كاملة مع الخضروات والأرز بخصم 40%',
          originalPrice: 15000,
          discountedPrice: 9000,
          discountPercentage: 40,
          image: '/api/placeholder/300/200',
          storeName: 'مطعم الفرسان',
          storeId: 'store1',
          validUntil: '2025-01-15',
          category: 'مطاعم'
        },
        {
          id: '2',
          title: 'خصم على القهوة المختصة',
          description: 'جميع أنواع القهوة المختصة بخصم 25% في الصباح',
          originalPrice: 8000,
          discountedPrice: 6000,
          discountPercentage: 25,
          image: '/api/placeholder/300/200',
          storeName: 'كوفي هاوس',
          storeId: 'store2',
          validUntil: '2025-01-20',
          category: 'مطاعم'
        },
        {
          id: '3',
          title: 'عرض على المنتجات الطازجة',
          description: 'خضروات وفواكه طازجة بخصم 30% عند الشراء بالجملة',
          originalPrice: 25000,
          discountedPrice: 17500,
          discountPercentage: 30,
          image: '/api/placeholder/300/200',
          storeName: 'سوق الخضروات الطازجة',
          storeId: 'store3',
          validUntil: '2025-01-25',
          category: 'متاجر'
        },
        {
          id: '4',
          title: 'توصيل مجاني على الطلبات الكبيرة',
          description: 'توصيل مجاني للطلبات فوق 50000 ريال مع عرض خاص على المشروبات',
          originalPrice: 55000,
          discountedPrice: 50000,
          discountPercentage: 9,
          image: '/api/placeholder/300/200',
          storeName: 'سوبر ماركت المدينة',
          storeId: 'store4',
          validUntil: '2025-01-30',
          category: 'متاجر'
        }
      ];

      setDeals(mockDeals);
    } catch (error) {
      console.error('Error loading deals:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ar-YE', {
      style: 'decimal',
      minimumFractionDigits: 0,
    }).format(price) + ' ريال';
  };

  if (loading) {
    return (
      <Box sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: `linear-gradient(135deg, ${theme.palette.primary.main}15 0%, ${theme.palette.secondary.main}15 100%)`,
      }}>
        <Card sx={{ padding: 4, borderRadius: 3 }}>
          <Typography>جاري التحميل...</Typography>
        </Card>
      </Box>
    );
  }

  return (
    <Box sx={{
      minHeight: '100vh',
      background: `linear-gradient(135deg, ${theme.palette.primary.main}15 0%, ${theme.palette.secondary.main}15 100%)`,
      paddingY: 2,
    }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: 4,
          paddingY: 2,
        }}>
          <IconButton
            onClick={() => navigate('/')}
            sx={{
              marginRight: 2,
              background: alpha(theme.palette.primary.main, 0.1),
              color: 'primary.main',
              '&:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.2),
              },
            }}
          >
            <ArrowBack />
          </IconButton>
          <Box>
            <Typography
              variant="h3"
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
              العروض الخاصة 🔥
            </Typography>
            <Typography variant="body1" color="text.secondary">
              استفد من أفضل العروض والخصومات الحصرية
            </Typography>
          </Box>
        </Box>

        {/* Deals Grid */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {deals.map((deal, index) => (
            <Grow in timeout={600 + (index * 100)}>
              <Card
                key={deal.id}
                sx={{
                  padding: 3,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                  borderRadius: 3,
                  background: 'rgba(255,255,255,0.95)',
                  backdropFilter: 'blur(20px)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 16px 40px rgba(0,0,0,0.15)',
                  },
                }}
              >
                <Box sx={{ display: 'flex', gap: 3, alignItems: 'center' }}>
                  {/* Deal Image */}
                  <Box sx={{
                    width: 120,
                    height: 120,
                    borderRadius: 2,
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}20, ${theme.palette.secondary.main}20)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    overflow: 'hidden',
                  }}>
                    <Avatar
                      src={deal.image}
                      variant="rounded"
                      sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    >
                      <LocalOffer sx={{ fontSize: 40, color: 'primary.main' }} />
                    </Avatar>

                    {/* Discount Badge */}
                    <Box sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      background: 'error.main',
                      color: 'white',
                      paddingX: 1,
                      paddingY: 0.5,
                      borderRadius: 1,
                      fontSize: '0.75rem',
                      fontWeight: 'bold',
                    }}>
                      {deal.discountPercentage}% خصم
                    </Box>
                  </Box>

                  {/* Deal Info */}
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, marginBottom: 1 }}>
                      <Chip
                        label={deal.category}
                        size="small"
                        sx={{
                          background: alpha(theme.palette.primary.main, 0.1),
                          color: 'primary.main',
                        }}
                      />
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Store sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          {deal.storeName}
                        </Typography>
                      </Box>
                    </Box>

                    <Typography variant="h6" sx={{ fontWeight: 'bold', marginBottom: 1 }}>
                      {deal.title}
                    </Typography>

                    <Typography variant="body2" color="text.secondary" sx={{ marginBottom: 2 }}>
                      {deal.description}
                    </Typography>

                    {/* Price Info */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, marginBottom: 2 }}>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                        {formatPrice(deal.discountedPrice)}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          textDecoration: 'line-through',
                          color: 'text.secondary'
                        }}
                      >
                        {formatPrice(deal.originalPrice)}
                      </Typography>
                      <Chip
                        label={`${deal.discountPercentage}% خصم`}
                        color="error"
                        size="small"
                        sx={{ fontWeight: 'bold' }}
                      />
                    </Box>

                    {/* Valid Until */}
                    <Typography variant="caption" color="text.secondary">
                      صالح حتى: {new Date(deal.validUntil).toLocaleDateString('ar-YE')}
                    </Typography>
                  </Box>

                  {/* Action Buttons */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <MuiButton
                      variant="contained"
                      size="small"
                      startIcon={<ShoppingCart />}
                      sx={{
                        borderRadius: 2,
                        background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                      }}
                    >
                      أضف للسلة
                    </MuiButton>
                    <MuiButton
                      variant="outlined"
                      size="small"
                      startIcon={<Store />}
                      onClick={() => navigate(`/business/${deal.storeId}`)}
                      sx={{
                        borderRadius: 2,
                        borderColor: 'primary.main',
                        color: 'primary.main',
                      }}
                    >
                      زيارة المتجر
                    </MuiButton>
                  </Box>
                </Box>
              </Card>
            </Grow>
          ))}
        </Box>

        {deals.length === 0 && (
          <Fade in timeout={600}>
            <Box sx={{
              textAlign: 'center',
              paddingY: 8,
              paddingX: 4,
            }}>
              <Card sx={{
                padding: 4,
                maxWidth: 500,
                margin: '0 auto',
                boxShadow: '0 16px 40px rgba(0,0,0,0.1)',
                borderRadius: 3,
                background: 'rgba(255,255,255,0.95)',
                backdropFilter: 'blur(20px)',
              }}>
                <Avatar sx={{
                  width: 80,
                  height: 80,
                  background: alpha(theme.palette.primary.main, 0.1),
                  color: 'primary.main',
                  margin: '0 auto 16px',
                }}>
                  <TrendingUp sx={{ fontSize: 40 }} />
                </Avatar>
                <Typography variant="h4" component="h2" sx={{
                  fontWeight: 'bold',
                  marginBottom: 2,
                  color: 'text.primary',
                }}>
                  لا توجد عروض حاليًا
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ marginBottom: 4 }}>
                  تابعونا للحصول على أحدث العروض والخصومات الحصرية قريبًا
                </Typography>
                <MuiButton
                  onClick={() => navigate('/')}
                  variant="contained"
                  startIcon={<ArrowBack />}
                  size="large"
                  sx={{
                    borderRadius: 2,
                    paddingY: 1.5,
                    paddingX: 3,
                    fontSize: '1rem',
                    background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                    boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                    },
                  }}
                >
                  العودة للرئيسية
                </MuiButton>
              </Card>
            </Box>
          </Fade>
        )}

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
            top: '15%',
            left: '10%',
            width: 120,
            height: 120,
            borderRadius: '50%',
            background: theme.palette.primary.main,
            animation: 'float 6s ease-in-out infinite',
          }} />
          <Box sx={{
            position: 'absolute',
            top: '70%',
            right: '20%',
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
      </Container>
    </Box>
  );
};

export default Deals;
