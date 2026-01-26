import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import useCartStore from '../../store/cartStore';
import { useAuthGate } from '../../hooks/useAuthGate';
import AuthRequiredModal from '../../components/auth/AuthRequiredModal';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Box,
  Grid,
  Button,
  IconButton,
  Divider,
  Chip,
  Fade,
  Slide,
} from '@mui/material';
import {
  Add as PlusIcon,
  Remove as MinusIcon,
  Delete as TrashIcon,
  ShoppingBag as ShoppingBagIcon,
  Clear as ClearIcon,
  LocalShipping as DeliveryIcon,
  Discount as DiscountIcon,
  Language,
} from '@mui/icons-material';

const Cart: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { items, updateQuantity, removeItem, getTotal, clearCart } = useCartStore();
  const { ensureAuth, askAuthOpen, setAskAuthOpen } = useAuthGate();

  const subtotal = getTotal();
  const deliveryFee = subtotal > 0 ? 5 : 0; // رسوم توصيل ثابتة
  const total = subtotal + deliveryFee;

  if (items.length === 0) {
    return (
      <Container maxWidth="md" sx={{ py: 12, textAlign: 'center' }}>
        <Fade in timeout={800}>
          <Box>
            <Box
              sx={{
                width: 120,
                height: 120,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 4,
                boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
              }}
            >
              <ShoppingBagIcon sx={{ fontSize: 48, color: 'white' }} />
            </Box>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 'bold',
                mb: 2,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {t('cart.empty')}
            </Typography>
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{ mb: 6, maxWidth: 400, mx: 'auto', lineHeight: 1.6 }}
            >
              لم تقم بإضافة أي منتجات بعد. اكتشف مجموعتنا المتنوعة من المنتجات الرائعة
            </Typography>
            <Button
              onClick={() => navigate('/')}
              variant="contained"
              size="large"
              sx={{
                borderRadius: 3,
                px: 6,
                py: 2,
                textTransform: 'none',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                boxShadow: '0 8px 25px rgba(102, 126, 234, 0.4)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 12px 35px rgba(102, 126, 234, 0.5)',
                },
              }}
            >
              {t('cart.continueShopping')}
            </Button>
          </Box>
        </Fade>
      </Container>
    );
  }

  return (
    <>
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
      <Container maxWidth="lg" sx={{ py: 6, pb: 12 }}>
      <Fade in timeout={600}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
                }}
              >
                <ShoppingBagIcon sx={{ fontSize: 24, color: 'white' }} />
              </Box>
              <Box>
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: 'bold',
                    background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  {t('cart.title')}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {items.length} منتج في سلتك
                </Typography>
              </Box>
            </Box>
            <Button
              onClick={clearCart}
              startIcon={<ClearIcon />}
              variant="outlined"
              sx={{
                color: 'error.main',
                borderColor: 'error.main',
                borderRadius: 2,
                px: 3,
                py: 1.5,
                textTransform: 'none',
                fontWeight: 'bold',
                transition: 'all 0.3s ease',
                '&:hover': {
                  color: 'error.dark',
                  borderColor: 'error.dark',
                  backgroundColor: 'rgba(244, 67, 54, 0.04)',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 4px 12px rgba(244, 67, 54, 0.3)',
                },
              }}
            >
              {t('clearCart')}
            </Button>
          </Box>
        </Box>
      </Fade>

      <Grid container spacing={4}>
        {/* Cart Items */}
        <Grid size={{xs: 12, lg: 8}}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {items.map((item, index) => {
            const finalPrice = item.discount
              ? item.price - (item.price * item.discount / 100)
              : item.price;

            return (
              <Slide key={item.id} direction="right" in timeout={500 + index * 100}>
                <Card
                  sx={{
                    borderRadius: 3,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                    border: '1px solid',
                    borderColor: 'rgba(102, 126, 234, 0.1)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 16px 48px rgba(0,0,0,0.15)',
                      borderColor: 'rgba(102, 126, 234, 0.3)',
                    },
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', gap: 3 }}>
                      {/* Image */}
                      <Box
                        sx={{
                          width: 120,
                          height: 120,
                          borderRadius: 2,
                          overflow: 'hidden',
                          flexShrink: 0,
                          position: 'relative',
                          '&:hover': {
                            '&::after': {
                              content: '""',
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              right: 0,
                              bottom: 0,
                              background: 'rgba(102, 126, 234, 0.1)',
                            }
                          }
                        }}
                      >
                        {item.image ? (
                          <Box
                            component="img"
                            src={item.image}
                            alt={item.name}
                            sx={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                              transition: 'transform 0.3s ease',
                              '&:hover': {
                                transform: 'scale(1.05)',
                              }
                            }}
                          />
                        ) : (
                          <Box
                            sx={{
                              width: '100%',
                              height: '100%',
                              background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <Typography
                              variant="h3"
                              sx={{
                                color: 'primary.main',
                                fontWeight: 'bold',
                              }}
                            >
                              {item.name.charAt(0)}
                            </Typography>
                          </Box>
                        )}
                        {item.discount && item.discount > 0 && (
                          <Chip
                            label={`-${item.discount}%`}
                            size="small"
                            sx={{
                              position: 'absolute',
                              top: 8,
                              right: 8,
                              background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)',
                              color: 'white',
                              fontWeight: 'bold',
                              fontSize: '0.75rem',
                            }}
                            icon={<DiscountIcon sx={{ fontSize: 14 }} />}
                          />
                        )}
                      </Box>

                      {/* Details */}
                      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <Box>
                          <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
                            {item.name}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                            <Typography
                              variant="h5"
                              sx={{
                                color: 'primary.main',
                                fontWeight: 'bold',
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                backgroundClip: 'text',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                              }}
                            >
                              {finalPrice.toFixed(2)} ر.ي
                            </Typography>
                            {item.discount && item.discount > 0 && (
                              <Typography
                                variant="body1"
                                sx={{
                                  color: 'text.secondary',
                                  textDecoration: 'line-through',
                                }}
                              >
                                {item.price.toFixed(2)} ر.ي
                              </Typography>
                            )}
                          </Box>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          {/* Quantity Controls */}
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Typography variant="body2" color="text.secondary" sx={{ minWidth: 60 }}>
                              الكمية: {item.quantity}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <IconButton
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                size="small"
                                sx={{
                                  border: 2,
                                  borderColor: 'primary.main',
                                  borderRadius: 2,
                                  backgroundColor: 'rgba(102, 126, 234, 0.05)',
                                  color: 'primary.main',
                                  transition: 'all 0.2s ease',
                                  '&:hover': {
                                    backgroundColor: 'primary.main',
                                    color: 'white',
                                    transform: 'scale(1.1)',
                                  },
                                }}
                              >
                                <MinusIcon sx={{ fontSize: 16 }} />
                              </IconButton>
                              <Typography
                                variant="h6"
                                sx={{
                                  fontWeight: 'bold',
                                  width: 40,
                                  textAlign: 'center',
                                  backgroundColor: 'rgba(102, 126, 234, 0.1)',
                                  borderRadius: 1,
                                  py: 0.5,
                                }}
                              >
                                {item.quantity}
                              </Typography>
                              <IconButton
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                size="small"
                                sx={{
                                  border: 2,
                                  borderColor: 'primary.main',
                                  borderRadius: 2,
                                  backgroundColor: 'rgba(102, 126, 234, 0.05)',
                                  color: 'primary.main',
                                  transition: 'all 0.2s ease',
                                  '&:hover': {
                                    backgroundColor: 'primary.main',
                                    color: 'white',
                                    transform: 'scale(1.1)',
                                  },
                                }}
                              >
                                <PlusIcon sx={{ fontSize: 16 }} />
                              </IconButton>
                            </Box>
                          </Box>

                          {/* Remove Button */}
                          <IconButton
                            onClick={() => removeItem(item.id)}
                            sx={{
                              color: 'error.main',
                              backgroundColor: 'rgba(244, 67, 54, 0.05)',
                              borderRadius: 2,
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                color: 'error.dark',
                                backgroundColor: 'rgba(244, 67, 54, 0.1)',
                                transform: 'scale(1.1)',
                              },
                            }}
                          >
                            <TrashIcon sx={{ fontSize: 20 }} />
                          </IconButton>
                        </Box>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Slide>
            );
          })}
          </Box>
        </Grid>

        {/* Order Summary */}
        <Grid size={{xs: 12, lg: 4}}>
          <Slide direction="left" in timeout={800}>
            <Card
              sx={{
                borderRadius: 3,
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                border: '1px solid',
                borderColor: 'rgba(102, 126, 234, 0.1)',
                position: 'sticky',
                top: 100,
                background: 'linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%)',
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
                    }}
                  >
                    <ShoppingBagIcon sx={{ fontSize: 20, color: 'white' }} />
                  </Box>
                  <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                    ملخص الطلب
                  </Typography>
                </Box>

                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, p: 2, backgroundColor: 'rgba(102, 126, 234, 0.05)', borderRadius: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <ShoppingBagIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                      <Typography variant="body2" color="text.secondary">
                        {t('cart.subtotal')}
                      </Typography>
                    </Box>
                    <Typography variant="body1" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                      {subtotal.toFixed(2)} ر.ي
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, p: 2, backgroundColor: 'rgba(102, 126, 234, 0.05)', borderRadius: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <DeliveryIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                      <Typography variant="body2" color="text.secondary">
                        {t('cart.delivery')}
                      </Typography>
                    </Box>
                    <Typography
                      variant="body1"
                      sx={{
                        fontWeight: 'bold',
                        color: deliveryFee === 0 ? 'success.main' : 'text.primary'
                      }}
                    >
                      {deliveryFee === 0 ? 'مجاني' : `${deliveryFee.toFixed(2)} ر.ي`}
                    </Typography>
                  </Box>

                  <Divider sx={{ my: 2, borderColor: 'rgba(102, 126, 234, 0.2)' }} />

                  <Box sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    p: 3,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    borderRadius: 2,
                    color: 'white'
                  }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      {t('cart.total')}
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                      {total.toFixed(2)} ر.ي
                    </Typography>
                  </Box>
                </Box>

                <Button
                  onClick={() => ensureAuth(() => {
                    // الفعل الفعلي هنا للمستخدم المسجّل
                    navigate('/checkout');
                  })}
                  variant="contained"
                  fullWidth
                  size="large"
                  sx={{
                    borderRadius: 3,
                    py: 2,
                    textTransform: 'none',
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    boxShadow: '0 8px 25px rgba(102, 126, 234, 0.4)',
                    mb: 2,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 12px 35px rgba(102, 126, 234, 0.5)',
                    },
                  }}
                >
                  {t('cart.checkout')}
                </Button>

                <Button
                  onClick={() => navigate('/')}
                  variant="outlined"
                  fullWidth
                  size="large"
                  sx={{
                    borderRadius: 3,
                    py: 2,
                    textTransform: 'none',
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    borderColor: 'primary.main',
                    color: 'primary.main',
                    backgroundColor: 'rgba(102, 126, 234, 0.02)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      borderColor: 'primary.dark',
                      color: 'primary.dark',
                      backgroundColor: 'rgba(102, 126, 234, 0.08)',
                      transform: 'translateY(-1px)',
                    },
                  }}
                >
                  {t('cart.continueShopping')}
                </Button>
              </CardContent>
            </Card>
          </Slide>
        </Grid>
      </Grid>

      {/* مودال التحقق من المصادقة */}
      <AuthRequiredModal
        open={askAuthOpen}
        onClose={() => setAskAuthOpen(false)}
      />
    </Container>
  </>
  );
};

export default Cart;
