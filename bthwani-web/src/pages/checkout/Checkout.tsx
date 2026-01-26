import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import useCartStore from '../../store/cartStore';
import { useAuth } from '../../hooks/useAuth';
import { useAuthGate } from '../../hooks/useAuthGate';
import AuthRequiredModal from '../../components/auth/AuthRequiredModal';
import { createOrder } from '../../api/orders';
import type { Address } from '../../types';
import Loading from '../../components/common/Loading';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Box,
  Button,
  Stepper,
  Step,
  StepLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Select,
  MenuItem,
  Divider,
  Chip,
  FormControl,
  Fade,
  Slide,
  IconButton,
} from '@mui/material';
import {
  LocationOn as MapPinIcon,
  CreditCard as CreditCardIcon,
  Schedule as ClockIcon,
  CheckCircle as CheckCircleIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  Home as HomeIcon,
  Work as WorkIcon,
  Payment as PaymentIcon,
  ShoppingCart as ShoppingCartIcon,
  Language,
} from '@mui/icons-material';

const Checkout: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { items, getTotal, clearCart } = useCartStore();
  const { user, isAuthenticated } = useAuth();
  const { ensureAuth, askAuthOpen, setAskAuthOpen } = useAuthGate();

  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [deliveryTime, setDeliveryTime] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('cash');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'address' | 'payment' | 'confirmation'>('address');

  const subtotal = getTotal();
  const deliveryFee = subtotal > 0 ? 5 : 0;
  const total = subtotal + deliveryFee;

  // Mock user addresses (should come from API in real app)
  const [addresses] = useState<Address[]>([
    {
      _id: '1',
      label: 'المنزل',
      city: 'صنعاء',
      street: 'شارع تعز، حي حدة',
      location: { lat: 15.3694, lng: 44.1910 },
      isDefault: true
    },
    {
      _id: '2',
      label: 'العمل',
      city: 'صنعاء',
      street: 'شارع الزبيري، مبنى التجارة',
      location: { lat: 15.3548, lng: 44.2067 },
      isDefault: false
    }
  ]);

  useEffect(() => {
    if (items.length === 0) {
      navigate('/cart');
      return;
    }

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // Set default address
    const defaultAddress = addresses.find(addr => addr.isDefault) || addresses[0];
    setSelectedAddress(defaultAddress);
  }, [items.length, isAuthenticated, navigate, addresses]);

  const deliveryTimeSlots = [
    'فوري (30 دقيقة)',
    'خلال ساعة',
    'خلال ساعتين',
    'اليوم (4-6 ساعات)',
    'غداً'
  ];

  const getStepIndex = (stepName: string) => {
    switch (stepName) {
      case 'address': return 0;
      case 'payment': return 1;
      case 'confirmation': return 2;
      default: return 0;
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress || !deliveryTime || !user) return;

    ensureAuth(async () => {
      // الفعل الفعلي هنا للمستخدم المسجّل
      setLoading(true);
      try {
        const orderData = {
          items: items.map(item => ({
            productId: item.id,
            quantity: item.quantity,
            price: item.price
          })),
          address: {
            label: selectedAddress.label,
            city: selectedAddress.city,
            street: selectedAddress.street,
            location: selectedAddress.location
          },
          deliveryTime,
          paymentMethod,
          price: subtotal,
          deliveryFee,
          companyShare: subtotal * 0.1, // 10% للشركة
          platformShare: subtotal * 0.05, // 5% للمنصة
        };

        await createOrder(orderData);
        clearCart();
        navigate('/orders');
      } catch (error) {
        console.error('Error placing order:', error);
      } finally {
        setLoading(false);
      }
    });
  };

  if (loading) {
    return <Loading fullScreen />;
  }

  if (items.length === 0) {
    return null;
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
      <Container maxWidth="md" sx={{ py: 6, pb: 12 }}>
      <Fade in timeout={800}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
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
              <ShoppingCartIcon sx={{ fontSize: 24, color: 'white' }} />
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
                {t('checkout.title')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                أكمل طلبك بخطوات بسيطة وآمنة
              </Typography>
            </Box>
          </Box>

          {/* Progress Steps */}
          <Box sx={{ mb: 6 }}>
            <Stepper
              activeStep={getStepIndex(step)}
              alternativeLabel
              sx={{
                '& .MuiStepConnector-line': {
                  height: 3,
                  border: 0,
                  backgroundColor: '#eaeaf0',
                  borderRadius: 1,
                },
                '& .MuiStepConnector-active .MuiStepConnector-line': {
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                },
                '& .MuiStepConnector-completed .MuiStepConnector-line': {
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                },
              }}
            >
              <Step>
                <StepLabel
                  icon={
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        background: step === 'address'
                          ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                          : getStepIndex(step) > 0
                            ? 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)'
                            : '#e0e0e0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: step === 'address' ? '0 4px 15px rgba(102, 126, 234, 0.3)' : 'none',
                      }}
                    >
                      <MapPinIcon sx={{ fontSize: 20, color: step === 'address' || getStepIndex(step) > 0 ? 'white' : 'grey.500' }} />
                    </Box>
                  }
                  sx={{
                    '& .MuiStepLabel-label': {
                      typography: 'body1',
                      fontWeight: step === 'address' ? 'bold' : 'normal',
                      color: step === 'address' ? 'primary.main' : 'text.secondary',
                      mt: 1,
                    },
                  }}
                >
                  {t('checkout.address')}
                </StepLabel>
              </Step>
              <Step>
                <StepLabel
                  icon={
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        background: step === 'payment'
                          ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                          : getStepIndex(step) > 1
                            ? 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)'
                            : getStepIndex(step) === 1
                              ? 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)'
                              : '#e0e0e0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: step === 'payment' ? '0 4px 15px rgba(102, 126, 234, 0.3)' : 'none',
                      }}
                    >
                      <PaymentIcon sx={{ fontSize: 20, color: (step === 'payment' || getStepIndex(step) > 1) ? 'white' : 'grey.500' }} />
                    </Box>
                  }
                  sx={{
                    '& .MuiStepLabel-label': {
                      typography: 'body1',
                      fontWeight: step === 'payment' ? 'bold' : 'normal',
                      color: step === 'payment' ? 'primary.main' : 'text.secondary',
                      mt: 1,
                    },
                  }}
                >
                  {t('checkout.payment')}
                </StepLabel>
              </Step>
              <Step>
                <StepLabel
                  icon={
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        background: step === 'confirmation'
                          ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                          : getStepIndex(step) === 2
                            ? 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)'
                            : '#e0e0e0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: step === 'confirmation' ? '0 4px 15px rgba(102, 126, 234, 0.3)' : 'none',
                      }}
                    >
                      <CheckCircleIcon sx={{ fontSize: 20, color: step === 'confirmation' ? 'white' : 'grey.500' }} />
                    </Box>
                  }
                  sx={{
                    '& .MuiStepLabel-label': {
                      typography: 'body1',
                      fontWeight: step === 'confirmation' ? 'bold' : 'normal',
                      color: step === 'confirmation' ? 'primary.main' : 'text.secondary',
                      mt: 1,
                    },
                  }}
                >
                  {t('checkout.confirmation')}
                </StepLabel>
              </Step>
            </Stepper>
          </Box>
        </Box>
      </Fade>

        {/* Address Selection */}
        {step === 'address' && (
          <Slide direction="up" in timeout={600}>
            <Card
              sx={{
                borderRadius: 3,
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                border: '1px solid',
                borderColor: 'rgba(102, 126, 234, 0.1)',
                mb: 4,
                background: 'linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%)',
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
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
                    <MapPinIcon sx={{ fontSize: 20, color: 'white' }} />
                  </Box>
                  <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                    {t('checkout.selectAddress')}
                  </Typography>
                </Box>

                <RadioGroup
                  value={selectedAddress?._id || ''}
                  onChange={(e) => {
                    const address = addresses.find(addr => addr._id === e.target.value);
                    if (address) setSelectedAddress(address);
                  }}
                >
                  {addresses.map((address, index) => (
                    <Fade key={address._id} in timeout={400 + index * 100}>
                      <FormControlLabel
                        value={address._id}
                        control={
                          <Radio
                            sx={{
                              color: 'primary.main',
                              '&.Mui-checked': {
                                color: 'primary.main',
                              },
                            }}
                          />
                        }
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%', ml: 1 }}>
                            <Box
                              sx={{
                                width: 48,
                                height: 48,
                                borderRadius: 2,
                                background: selectedAddress?._id === address._id
                                  ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                                  : 'rgba(102, 126, 234, 0.05)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.3s ease',
                              }}
                            >
                              {address.label === 'المنزل' ? (
                                <HomeIcon sx={{ fontSize: 24, color: selectedAddress?._id === address._id ? 'white' : 'primary.main' }} />
                              ) : (
                                <WorkIcon sx={{ fontSize: 24, color: selectedAddress?._id === address._id ? 'white' : 'primary.main' }} />
                              )}
                            </Box>
                            <Box sx={{ flex: 1 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                  {address.label}
                                </Typography>
                                {address.isDefault && (
                                  <Chip
                                    label="افتراضي"
                                    size="small"
                                    sx={{
                                      background: 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)',
                                      color: 'white',
                                      fontSize: '0.75rem',
                                      fontWeight: 'bold',
                                    }}
                                  />
                                )}
                              </Box>
                              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.4 }}>
                                {address.city}، {address.street}
                              </Typography>
                            </Box>
                          </Box>
                        }
                        sx={{
                          border: 2,
                          borderColor: selectedAddress?._id === address._id ? 'primary.main' : 'rgba(102, 126, 234, 0.2)',
                          borderRadius: 3,
                          p: 3,
                          mb: 2,
                          mx: 0,
                          width: '100%',
                          backgroundColor: selectedAddress?._id === address._id ? 'rgba(102, 126, 234, 0.02)' : 'transparent',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            backgroundColor: 'rgba(102, 126, 234, 0.02)',
                            borderColor: 'rgba(102, 126, 234, 0.4)',
                            transform: 'translateY(-2px)',
                            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.15)',
                          },
                        }}
                      />
                    </Fade>
                  ))}
                </RadioGroup>

                <Fade in timeout={800}>
                  <Button
                    onClick={() => navigate('/profile/addresses')}
                    variant="outlined"
                    fullWidth
                    sx={{
                      mt: 3,
                      borderRadius: 3,
                      py: 2,
                      textTransform: 'none',
                      fontSize: '1rem',
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
                    إضافة عنوان جديد
                  </Button>
                </Fade>
              </CardContent>
            </Card>
          </Slide>
        )}

        {/* Payment Method */}
        {step === 'payment' && (
          <Slide direction="up" in timeout={600}>
            <Card
              sx={{
                borderRadius: 3,
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                border: '1px solid',
                borderColor: 'rgba(102, 126, 234, 0.1)',
                mb: 4,
                background: 'linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%)',
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
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
                    <PaymentIcon sx={{ fontSize: 20, color: 'white' }} />
                  </Box>
                  <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                    {t('checkout.paymentMethod')}
                  </Typography>
                </Box>

                <RadioGroup
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  <Fade in timeout={400}>
                    <FormControlLabel
                      value="cash"
                      control={
                        <Radio
                          sx={{
                            color: 'primary.main',
                            '&.Mui-checked': {
                              color: 'primary.main',
                            },
                          }}
                        />
                      }
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%', ml: 1 }}>
                          <Box
                            sx={{
                              width: 48,
                              height: 48,
                              borderRadius: 2,
                              background: paymentMethod === 'cash'
                                ? 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)'
                                : 'rgba(76, 175, 80, 0.05)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'all 0.3s ease',
                            }}
                          >
                            <Typography variant="h6" sx={{ color: paymentMethod === 'cash' ? 'white' : 'success.main', fontWeight: 'bold' }}>
                              ₪
                            </Typography>
                          </Box>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                              دفع نقدي عند التسليم
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.4 }}>
                              ادفع للسائق عند استلام الطلب بأمان وسهولة
                            </Typography>
                          </Box>
                        </Box>
                      }
                      sx={{
                        border: 2,
                        borderColor: paymentMethod === 'cash' ? 'success.main' : 'rgba(76, 175, 80, 0.2)',
                        borderRadius: 3,
                        p: 3,
                        mb: 3,
                        mx: 0,
                        width: '100%',
                        backgroundColor: paymentMethod === 'cash' ? 'rgba(76, 175, 80, 0.02)' : 'transparent',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          backgroundColor: 'rgba(76, 175, 80, 0.02)',
                          borderColor: 'rgba(76, 175, 80, 0.4)',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 4px 12px rgba(76, 175, 80, 0.15)',
                        },
                      }}
                    />
                  </Fade>

                  <Fade in timeout={600}>
                    <FormControlLabel
                      value="card"
                      control={
                        <Radio
                          sx={{
                            color: 'primary.main',
                            '&.Mui-checked': {
                              color: 'primary.main',
                            },
                          }}
                        />
                      }
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%', ml: 1 }}>
                          <Box
                            sx={{
                              width: 48,
                              height: 48,
                              borderRadius: 2,
                              background: paymentMethod === 'card'
                                ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                                : 'rgba(102, 126, 234, 0.05)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'all 0.3s ease',
                            }}
                          >
                            <CreditCardIcon sx={{ fontSize: 24, color: paymentMethod === 'card' ? 'white' : 'primary.main' }} />
                          </Box>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                              بطاقة ائتمانية
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.4 }}>
                              ادفع آمنًا ببطاقتك الائتمانية مع حماية كاملة
                            </Typography>
                          </Box>
                        </Box>
                      }
                      sx={{
                        border: 2,
                        borderColor: paymentMethod === 'card' ? 'primary.main' : 'rgba(102, 126, 234, 0.2)',
                        borderRadius: 3,
                        p: 3,
                        mb: 3,
                        mx: 0,
                        width: '100%',
                        backgroundColor: paymentMethod === 'card' ? 'rgba(102, 126, 234, 0.02)' : 'transparent',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          backgroundColor: 'rgba(102, 126, 234, 0.02)',
                          borderColor: 'rgba(102, 126, 234, 0.4)',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 4px 12px rgba(102, 126, 234, 0.15)',
                        },
                      }}
                    />
                  </Fade>
                </RadioGroup>

                {/* Delivery Time */}
                <Fade in timeout={800}>
                  <Box sx={{ mt: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                      <Box
                        sx={{
                          width: 36,
                          height: 36,
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 2px 8px rgba(255, 152, 0, 0.3)',
                        }}
                      >
                        <ClockIcon sx={{ fontSize: 16, color: 'white' }} />
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                        وقت التسليم المفضل
                      </Typography>
                    </Box>
                    <FormControl fullWidth>
                      <Select
                        value={deliveryTime}
                        onChange={(e) => setDeliveryTime(e.target.value)}
                        displayEmpty
                        sx={{
                          borderRadius: 3,
                          border: 2,
                          borderColor: deliveryTime ? 'primary.main' : 'rgba(102, 126, 234, 0.2)',
                          backgroundColor: deliveryTime ? 'rgba(102, 126, 234, 0.02)' : 'transparent',
                          transition: 'all 0.3s ease',
                          '& .MuiSelect-select': {
                            py: 2.5,
                            px: 3,
                            fontSize: '1rem',
                          },
                          '&:hover': {
                            borderColor: 'rgba(102, 126, 234, 0.4)',
                          },
                          '&.Mui-focused': {
                            borderColor: 'primary.main',
                            boxShadow: '0 0 0 2px rgba(102, 126, 234, 0.2)',
                          },
                        }}
                      >
                        <MenuItem value="" disabled>
                          <Typography color="text.secondary">اختر وقت التسليم المفضل</Typography>
                        </MenuItem>
                        {deliveryTimeSlots.map((slot) => (
                          <MenuItem key={slot} value={slot}>
                            <Typography variant="body1">{slot}</Typography>
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                </Fade>
              </CardContent>
            </Card>
          </Slide>
        )}

        {/* Order Summary & Confirmation */}
        {step === 'confirmation' && (
          <Slide direction="up" in timeout={600}>
            <Card
              sx={{
                borderRadius: 3,
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                border: '1px solid',
                borderColor: 'rgba(102, 126, 234, 0.1)',
                mb: 4,
                background: 'linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%)',
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 4px 15px rgba(76, 175, 80, 0.3)',
                    }}
                  >
                    <CheckCircleIcon sx={{ fontSize: 20, color: 'white' }} />
                  </Box>
                  <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                    تأكيد الطلب
                  </Typography>
                </Box>

                <Box sx={{ mb: 4 }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3, color: 'text.primary' }}>
                    ملخص الطلب
                  </Typography>

                  <Fade in timeout={400}>
                    <Box sx={{ mb: 3, p: 3, backgroundColor: 'rgba(102, 126, 234, 0.05)', borderRadius: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <MapPinIcon sx={{ fontSize: 20, color: 'primary.main' }} />
                        <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                          عنوان التسليم
                        </Typography>
                      </Box>
                      <Typography variant="body1" color="text.primary" sx={{ ml: 5 }}>
                        {selectedAddress?.label}: {selectedAddress?.city}، {selectedAddress?.street}
                      </Typography>
                    </Box>
                  </Fade>

                  <Fade in timeout={600}>
                    <Box sx={{ mb: 3, p: 3, backgroundColor: 'rgba(102, 126, 234, 0.05)', borderRadius: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <PaymentIcon sx={{ fontSize: 20, color: 'primary.main' }} />
                        <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                          طريقة الدفع
                        </Typography>
                      </Box>
                      <Typography variant="body1" color="text.primary" sx={{ ml: 5 }}>
                        {paymentMethod === 'cash' ? 'دفع نقدي عند التسليم' : 'بطاقة ائتمانية'}
                      </Typography>
                    </Box>
                  </Fade>

                  <Fade in timeout={800}>
                    <Box sx={{ mb: 4, p: 3, backgroundColor: 'rgba(255, 152, 0, 0.05)', borderRadius: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <ClockIcon sx={{ fontSize: 20, color: 'warning.main' }} />
                        <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                          وقت التسليم
                        </Typography>
                      </Box>
                      <Typography variant="body1" color="text.primary" sx={{ ml: 5 }}>
                        {deliveryTime || 'لم يحدد'}
                      </Typography>
                    </Box>
                  </Fade>

                  <Divider sx={{ my: 3, borderColor: 'rgba(102, 126, 234, 0.2)' }} />

                  <Fade in timeout={1000}>
                    <Box sx={{ p: 4, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: 3, color: 'white' }}>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3, textAlign: 'center' }}>
                        تفاصيل الدفع
                      </Typography>

                      <Box sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2" color="rgba(255,255,255,0.8)">
                            المجموع الفرعي
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                            {subtotal.toFixed(2)} ر.ي
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2" color="rgba(255,255,255,0.8)">
                            رسوم التوصيل
                          </Typography>
                          <Typography
                            variant="body1"
                            sx={{
                              fontWeight: 'medium',
                              color: deliveryFee === 0 ? 'success.light' : 'inherit'
                            }}
                          >
                            {deliveryFee === 0 ? 'مجاني' : `${deliveryFee.toFixed(2)} ر.ي`}
                          </Typography>
                        </Box>
                        <Divider sx={{ my: 2, backgroundColor: 'rgba(255,255,255,0.2)' }} />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                            المجموع الكلي
                          </Typography>
                          <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                            {total.toFixed(2)} ر.ي
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Fade>
                </Box>
              </CardContent>
            </Card>
          </Slide>
        )}

        {/* Navigation Buttons */}
        <Fade in timeout={1000}>
          <Box sx={{ display: 'flex', gap: 3 }}>
            {step !== 'address' && (
              <Button
                onClick={() => {
                  if (step === 'payment') setStep('address');
                  if (step === 'confirmation') setStep('payment');
                }}
                variant="outlined"
                startIcon={<ArrowBackIcon />}
                sx={{
                  flex: 1,
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
                    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                  },
                }}
              >
                السابق
              </Button>
            )}

            <Button
              onClick={() => {
                if (step === 'address' && selectedAddress) {
                  setStep('payment');
                } else if (step === 'payment' && deliveryTime) {
                  setStep('confirmation');
                } else if (step === 'confirmation') {
                  handlePlaceOrder();
                }
              }}
              disabled={
                (step === 'address' && !selectedAddress) ||
                (step === 'payment' && !deliveryTime) ||
                (step === 'confirmation' && loading)
              }
              variant="contained"
              endIcon={step !== 'confirmation' ? <ArrowForwardIcon /> : undefined}
              sx={{
                flex: step === 'address' ? 1 : 2,
                borderRadius: 3,
                py: 2,
                textTransform: 'none',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                background: step === 'confirmation'
                  ? 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)'
                  : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                boxShadow: step === 'confirmation'
                  ? '0 8px 25px rgba(76, 175, 80, 0.4)'
                  : '0 8px 25px rgba(102, 126, 234, 0.4)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: step === 'confirmation'
                    ? '0 12px 35px rgba(76, 175, 80, 0.5)'
                    : '0 12px 35px rgba(102, 126, 234, 0.5)',
                },
                '&:disabled': {
                  background: 'linear-gradient(135deg, #e0e0e0 0%, #f5f5f5 100%)',
                  color: 'text.secondary',
                  boxShadow: 'none',
                },
              }}
            >
              {step === 'confirmation'
                ? (loading ? 'جاري المعالجة...' : 'تأكيد الطلب')
                : step === 'payment' ? 'التالي' : 'التالي'}
            </Button>
          </Box>
        </Fade>

        {/* مودال التحقق من المصادقة */}
        <AuthRequiredModal
          open={askAuthOpen}
          onClose={() => setAskAuthOpen(false)}
        />
      </Container>
    </>
  );
};

export default Checkout;
