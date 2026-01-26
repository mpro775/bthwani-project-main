import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useCartStore from '../../store/cartStore';
import { useAuth } from '../../hooks/useAuth';
import type { Address } from '../../types';

import {
  Box,
  Typography,
  Container,
  Card,
  Button as MuiButton,
  TextField,
  RadioGroup,
  FormControlLabel,
  Radio,
  Checkbox,
  Divider,
  Stepper,
  Step,
  StepLabel,
  Chip,
  Slide,
  useTheme,
  alpha,
  Avatar,
} from '@mui/material';
import {
  CreditCard,
  Payment as PaymentIcon,
  AccountBalance,
  Place,
  Security,
  CheckCircle,
  MonetizationOn,
  ArrowBack,
  ArrowForward,
  Edit,
  Star,
  Verified,
  Lock,
} from '@mui/icons-material';

interface PaymentMethod {
  id: string;
  name: string;
  type: 'card' | 'wallet' | 'bank' | 'cash';
  icon: React.ReactNode;
  description: string;
  fee?: number;
  processingTime: string;
  color?: string;
  recommended?: boolean;
  secure?: boolean;
}

interface SavedCard {
  id: string;
  last4: string;
  brand: string;
  expiryMonth: number;
  expiryYear: number;
  isDefault: boolean;
  holderName?: string;
}

const Payment: React.FC = () => {
  const navigate = useNavigate();
  const { items, getTotal, clearCart } = useCartStore();
  const { isAuthenticated } = useAuth();
  const theme = useTheme();

  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'method' | 'details' | 'confirmation'>('method');
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [paymentDetails, setPaymentDetails] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    holderName: '',
    saveCard: false
  });

  // Animation states
  const [animateStep, setAnimateStep] = useState(false);

  // Mock data - should come from API
  const paymentMethods: PaymentMethod[] = [
    {
      id: 'cash',
      name: 'دفع نقدي عند التسليم',
      type: 'cash',
      icon: <MonetizationOn sx={{ fontSize: 24, color: 'success.main' }} />,
      description: 'ادفع للسائق عند استلام الطلب',
      fee: 0,
      processingTime: 'فوري',
      color: 'success.main',
      recommended: true,
    },
    {
      id: 'mada',
      name: 'مدى',
      type: 'card',
      icon: <CreditCard sx={{ fontSize: 24, color: 'primary.main' }} />,
      description: 'بطاقات مدى السعودية - آمن وسريع',
      fee: 0,
      processingTime: 'فوري',
      color: 'primary.main',
      recommended: true,
      secure: true,
    },
    {
      id: 'visa',
      name: 'فيزا / ماستركارد',
      type: 'card',
      icon: <CreditCard sx={{ fontSize: 24, color: 'primary.main' }} />,
      description: 'بطاقات فيزا وماستركارد الدولية',
      fee: 0,
      processingTime: 'فوري',
      color: 'primary.main',
      secure: true,
    },
    {
      id: 'stcpay',
      name: 'STC Pay',
      type: 'wallet',
      icon: <PaymentIcon sx={{ fontSize: 24, color: 'secondary.main' }} />,
      description: 'محفظة STC Pay الرقمية الآمنة',
      fee: 0,
      processingTime: 'فوري',
      color: 'secondary.main',
      recommended: true,
    },
    {
      id: 'bank',
      name: 'تحويل بنكي',
      type: 'bank',
      icon: <AccountBalance sx={{ fontSize: 24, color: 'info.main' }} />,
      description: 'تحويل مباشر لحساب البنك',
      fee: 2.50,
      processingTime: '1-3 أيام عمل',
      color: 'info.main',
    }
  ];

  const savedCards: SavedCard[] = [
    {
      id: '1',
      last4: '1234',
      brand: 'visa',
      expiryMonth: 12,
      expiryYear: 2025,
      isDefault: true,
      holderName: 'أحمد محمد'
    },
    {
      id: '2',
      last4: '5678',
      brand: 'mastercard',
      expiryMonth: 8,
      expiryYear: 2026,
      isDefault: false,
      holderName: 'أحمد محمد'
    }
  ];

  // Mock addresses - should come from API
  const [addresses] = useState<Address[]>([
    {
      _id: '1',
      label: 'المنزل',
      city: 'صنعاء',
      street: 'شارع تعز، حي حدة',
      location: { lat: 15.3694, lng: 44.1910 },
      isDefault: true
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

  const subtotal = getTotal();
  const deliveryFee = subtotal > 0 ? 5 : 0;
  const paymentFee = paymentMethods.find(m => m.id === selectedMethod)?.fee || 0;
  const total = subtotal + deliveryFee + paymentFee;

  const handlePaymentSubmit = async () => {
    if (!selectedMethod || !selectedAddress) return;

    setLoading(true);
    try {
      // Mock payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Clear cart and navigate to success
      clearCart();
      navigate('/orders');
    } catch (error) {
      console.error('Payment error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Validation functions
  const validateCardNumber = (number: string): boolean => {
    const cleanNumber = number.replace(/\s/g, '');
    return cleanNumber.length >= 13 && cleanNumber.length <= 19;
  };

  const validateExpiryDate = (expiry: string): boolean => {
    const match = expiry.match(/^(\d{2})\/(\d{2})$/);
    if (!match) return false;
    const month = parseInt(match[1]);
    const year = parseInt('20' + match[2]);
    const now = new Date();
    const expiryDate = new Date(year, month - 1);
    return month >= 1 && month <= 12 && expiryDate > now;
  };

  const validateCVV = (cvv: string): boolean => {
    return cvv.length >= 3 && cvv.length <= 4;
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  // Animation handlers
  const handleStepChange = (newStep: 'method' | 'details' | 'confirmation') => {
    setAnimateStep(true);
    setTimeout(() => {
      setStep(newStep);
      setAnimateStep(false);
    }, 150);
  };

  const getCardBrandIcon = (brand: string) => {
    switch (brand.toLowerCase()) {
      case 'visa':
        return <Avatar sx={{ width: 24, height: 24, bgcolor: 'primary.main' }}>V</Avatar>;
      case 'mastercard':
        return <Avatar sx={{ width: 24, height: 24, bgcolor: 'secondary.main' }}>MC</Avatar>;
      default:
        return <CreditCard sx={{ fontSize: 20, color: 'text.secondary' }} />;
    }
  };

  if (items.length === 0) {
    return null;
  }

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
            إتمام الطلب
          </Typography>
          <Typography variant="body1" color="text.secondary">
            اختر طريقة الدفع والتأكد من تفاصيل الطلب
          </Typography>
        </Box>

        {/* Progress Steps */}
        <Box sx={{ marginBottom: 4 }}>
          <Card sx={{
            padding: 3,
            background: 'rgba(255,255,255,0.9)',
            backdropFilter: 'blur(20px)',
          }}>
            <Stepper
              activeStep={step === 'method' ? 0 : step === 'details' ? 1 : 2}
              alternativeLabel
              sx={{
                '& .MuiStepConnector-line': {
                  borderColor: theme.palette.primary.main,
                  borderWidth: 2,
                },
              }}
            >
              <Step>
                <StepLabel
                  icon={
                    <Avatar sx={{
                      bgcolor: 'primary.main',
                      width: 40,
                      height: 40,
                    }}>
                      <PaymentIcon sx={{ fontSize: 20 }} />
                    </Avatar>
                  }
                  sx={{
                    '& .MuiStepLabel-label': {
                      fontWeight: step === 'method' ? 'bold' : 'normal',
                      color: step === 'method' ? 'primary.main' : 'text.secondary',
                    },
                  }}
                >
                  طريقة الدفع
                </StepLabel>
              </Step>
              <Step>
                <StepLabel
                  icon={
                    <Avatar sx={{
                      bgcolor: 'primary.main',
                      width: 40,
                      height: 40,
                    }}>
                      <Security sx={{ fontSize: 20 }} />
                    </Avatar>
                  }
                  sx={{
                    '& .MuiStepLabel-label': {
                      fontWeight: step === 'details' ? 'bold' : 'normal',
                      color: step === 'details' ? 'primary.main' : 'text.secondary',
                    },
                  }}
                >
                  تفاصيل الدفع
                </StepLabel>
              </Step>
              <Step>
                <StepLabel
                  icon={
                    <Avatar sx={{
                      bgcolor: 'primary.main',
                      width: 40,
                      height: 40,
                    }}>
                      <CheckCircle sx={{ fontSize: 20 }} />
                    </Avatar>
                  }
                  sx={{
                    '& .MuiStepLabel-label': {
                      fontWeight: step === 'confirmation' ? 'bold' : 'normal',
                      color: step === 'confirmation' ? 'primary.main' : 'text.secondary',
                    },
                  }}
                >
                  تأكيد الطلب
                </StepLabel>
              </Step>
            </Stepper>
          </Card>
        </Box>

        {/* Main Content */}
        <Slide in={animateStep} direction="up" timeout={300}>
          <Box sx={{
            display: 'flex',
            flexDirection: { xs: 'column', lg: 'row' },
            gap: 3,
            minHeight: '60vh',
          }}>
            {/* Payment Methods Selection */}
            {step === 'method' && (
              <Box sx={{ flex: { xs: 'none', lg: 2 } }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {/* Address Selection */}
                  <Card sx={{
                    padding: 3,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                    borderRadius: 3,
                    background: 'rgba(255,255,255,0.95)',
                    backdropFilter: 'blur(20px)',
                  }}>
                    <Typography variant="h6" component="h2" sx={{
                      fontWeight: 'bold',
                      marginBottom: 2,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      color: 'primary.main',
                    }}>
                      <Place sx={{ fontSize: 20 }} />
                      عنوان التسليم
                    </Typography>

                    <RadioGroup
                      value={selectedAddress?._id || ''}
                      onChange={(e) => {
                        const address = addresses.find(addr => addr._id === e.target.value);
                        if (address) setSelectedAddress(address);
                      }}
                    >
                      {addresses.map((address) => (
                        <FormControlLabel
                          key={address._id}
                          value={address._id}
                          control={<Radio sx={{ color: 'primary.main' }} />}
                          label={
                            <Box sx={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              width: '100%',
                              marginLeft: 1,
                            }}>
                              <Box>
                                <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                                  {address.label}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {address.city}، {address.street}
                                </Typography>
                              </Box>
                              {address.isDefault && (
                                <Chip
                                  label="افتراضي"
                                  size="small"
                                  color="primary"
                                  icon={<Star sx={{ fontSize: 16 }} />}
                                />
                              )}
                            </Box>
                          }
                          sx={{
                            margin: 0,
                            padding: 2,
                            border: '1px solid',
                            borderColor: 'divider',
                            borderRadius: 2,
                            marginBottom: 1,
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              backgroundColor: alpha(theme.palette.primary.main, 0.05),
                              borderColor: 'primary.main',
                              transform: 'translateY(-2px)',
                              boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                            },
                          }}
                        />
                      ))}
                    </RadioGroup>
                  </Card>

                  {/* Payment Methods */}
                  <Card sx={{
                    padding: 3,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                    borderRadius: 3,
                    background: 'rgba(255,255,255,0.95)',
                    backdropFilter: 'blur(20px)',
                  }}>
                    <Typography variant="h6" component="h2" sx={{
                      fontWeight: 'bold',
                      marginBottom: 3,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      color: 'primary.main',
                    }}>
                      <CreditCard sx={{ fontSize: 20 }} />
                      اختر طريقة الدفع
                    </Typography>

                    <RadioGroup
                      value={selectedMethod}
                      onChange={(e) => setSelectedMethod(e.target.value)}
                    >
                      {paymentMethods.map((method) => (
                        <FormControlLabel
                          key={method.id}
                          value={method.id}
                          control={<Radio sx={{ color: 'primary.main' }} />}
                          label={
                            <Box sx={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              width: '100%',
                              marginLeft: 1,
                              padding: 1,
                            }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Box sx={{
                                  padding: 1,
                                  borderRadius: 2,
                                  background: alpha(method.color || theme.palette.primary.main, 0.1),
                                  color: method.color || theme.palette.primary.main,
                                }}>
                                  {method.icon}
                                </Box>
                                <Box>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                                      {method.name}
                                    </Typography>
                                    {method.recommended && (
                                      <Chip
                                        label="موصى به"
                                        size="small"
                                        color="primary"
                                        variant="outlined"
                                        sx={{ height: 20 }}
                                      />
                                    )}
                                    {method.secure && (
                                      <Verified sx={{ fontSize: 16, color: 'success.main' }} />
                                    )}
                                  </Box>
                                  <Typography variant="body2" color="text.secondary">
                                    {method.description}
                                  </Typography>
                                </Box>
                              </Box>
                              <Box sx={{ textAlign: 'right' }}>
                                <Typography variant="body2" color="text.secondary">
                                  {method.processingTime}
                                </Typography>
                                {method.fee && method.fee > 0 && (
                                  <Typography variant="body2" sx={{ color: 'error.main' }}>
                                    +{method.fee} ر.ي
                                  </Typography>
                                )}
                              </Box>
                            </Box>
                          }
                          sx={{
                            margin: 0,
                            padding: 2,
                            border: '1px solid',
                            borderColor: 'divider',
                            borderRadius: 2,
                            marginBottom: 2,
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              backgroundColor: alpha(theme.palette.primary.main, 0.05),
                              borderColor: 'primary.main',
                              transform: 'translateY(-2px)',
                              boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                            },
                          }}
                        />
                      ))}
                    </RadioGroup>
                  </Card>

                  {/* Continue Button */}
                  <MuiButton
                    onClick={() => handleStepChange('details')}
                    disabled={!selectedMethod || !selectedAddress}
                    fullWidth
                    size="large"
                    variant="contained"
                    sx={{
                      paddingY: 1.5,
                      fontSize: '1.1rem',
                      fontWeight: 'bold',
                      borderRadius: 3,
                      boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                      },
                    }}
                  >
                    متابعة للدفع
                    <ArrowForward sx={{ marginLeft: 1 }} />
                  </MuiButton>
            </Box>
          </Box>
        )}

            {/* Payment Details */}
            {step === 'details' && (
              <Box sx={{ flex: { xs: 'none', lg: 2 } }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {selectedMethod !== 'cash' && (
                    <Card sx={{
                      padding: 3,
                      boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                      borderRadius: 3,
                      background: 'rgba(255,255,255,0.95)',
                      backdropFilter: 'blur(20px)',
                    }}>
                      <Typography variant="h6" component="h2" sx={{
                        fontWeight: 'bold',
                        marginBottom: 3,
                        color: 'primary.main',
                      }}>
                        بيانات الدفع الآمنة
                      </Typography>

                      {/* Saved Cards */}
                      {savedCards.length > 0 && (
                        <Box sx={{ marginBottom: 3 }}>
                          <Typography variant="subtitle1" sx={{
                            fontWeight: 'medium',
                            marginBottom: 2,
                            color: 'text.primary',
                          }}>
                            البطاقات المحفوظة
                          </Typography>
                          <RadioGroup name="savedCard">
                            {savedCards.map((card) => (
                              <FormControlLabel
                                key={card.id}
                                value={card.id}
                                control={<Radio sx={{ color: 'primary.main' }} />}
                                label={
                                  <Box sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 2,
                                    marginLeft: 1,
                                    padding: 1,
                                  }}>
                                    {getCardBrandIcon(card.brand)}
                                    <Box>
                                      <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                                        •••• •••• •••• {card.last4}
                                      </Typography>
                                      <Typography variant="body2" color="text.secondary">
                                        تنتهي {card.expiryMonth}/{card.expiryYear} • {card.holderName}
                                      </Typography>
                                    </Box>
                                    {card.isDefault && (
                                      <Chip
                                        label="افتراضية"
                                        size="small"
                                        color="primary"
                                        icon={<Star sx={{ fontSize: 16 }} />}
                                      />
                                    )}
                                  </Box>
                                }
                                sx={{
                                  margin: 0,
                                  padding: 2,
                                  border: '1px solid',
                                  borderColor: 'divider',
                                  borderRadius: 2,
                                  marginBottom: 1,
                                  transition: 'all 0.3s ease',
                                  '&:hover': {
                                    backgroundColor: alpha(theme.palette.primary.main, 0.05),
                                    borderColor: 'primary.main',
                                  },
                                }}
                              />
                            ))}
                          </RadioGroup>
                        </Box>
                      )}

                      {/* New Card Form */}
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <FormControlLabel
                          control={<Radio name="paymentType" value="new" defaultChecked sx={{ color: 'primary.main' }} />}
                          label={<Typography variant="body1" sx={{ fontWeight: 'medium' }}>إضافة بطاقة جديدة</Typography>}
                        />

                        <TextField
                          label="رقم البطاقة"
                          type="text"
                          placeholder="1234 5678 9012 3456"
                          value={paymentDetails.cardNumber}
                          onChange={(e) => setPaymentDetails(prev => ({
                            ...prev,
                            cardNumber: formatCardNumber(e.target.value)
                          }))}
                          inputProps={{ maxLength: 19 }}
                          fullWidth
                          variant="outlined"
                          error={!validateCardNumber(paymentDetails.cardNumber) && paymentDetails.cardNumber.length > 0}
                          helperText={!validateCardNumber(paymentDetails.cardNumber) && paymentDetails.cardNumber.length > 0 ? 'رقم البطاقة غير صحيح' : ''}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                              '&:hover': {
                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                              },
                            },
                          }}
                        />

                        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                          <TextField
                            label="تاريخ الانتهاء"
                            type="text"
                            placeholder="MM/YY"
                            value={paymentDetails.expiryDate}
                            onChange={(e) => setPaymentDetails(prev => ({
                              ...prev,
                              expiryDate: formatExpiryDate(e.target.value)
                            }))}
                            inputProps={{ maxLength: 5 }}
                            fullWidth
                            variant="outlined"
                            error={!validateExpiryDate(paymentDetails.expiryDate) && paymentDetails.expiryDate.length > 0}
                            helperText={!validateExpiryDate(paymentDetails.expiryDate) && paymentDetails.expiryDate.length > 0 ? 'تاريخ غير صحيح' : ''}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                              },
                            }}
                          />
                          <TextField
                            label="CVV"
                            type="text"
                            placeholder="123"
                            value={paymentDetails.cvv}
                            onChange={(e) => setPaymentDetails(prev => ({
                              ...prev,
                              cvv: e.target.value.replace(/[^0-9]/g, '').slice(0, 4)
                            }))}
                            inputProps={{ maxLength: 4 }}
                            fullWidth
                            variant="outlined"
                            error={!validateCVV(paymentDetails.cvv) && paymentDetails.cvv.length > 0}
                            helperText={!validateCVV(paymentDetails.cvv) && paymentDetails.cvv.length > 0 ? 'رمز غير صحيح' : ''}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                              },
                            }}
                          />
                        </Box>

                        <TextField
                          label="اسم حامل البطاقة"
                          type="text"
                          placeholder="الاسم كما هو مكتوب على البطاقة"
                          value={paymentDetails.holderName}
                          onChange={(e) => setPaymentDetails(prev => ({
                            ...prev,
                            holderName: e.target.value
                          }))}
                          fullWidth
                          variant="outlined"
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                            },
                          }}
                        />

                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={paymentDetails.saveCard}
                              onChange={(e) => setPaymentDetails(prev => ({
                                ...prev,
                                saveCard: e.target.checked
                              }))}
                              sx={{ color: 'primary.main' }}
                            />
                          }
                          label={<Typography variant="body2">حفظ البطاقة للمدفوعات المستقبلية</Typography>}
                        />
                      </Box>
                    </Card>
                  )}

                  {/* Security Notice */}
                  <Card sx={{
                    background: alpha(theme.palette.success.main, 0.1),
                    border: `1px solid ${theme.palette.success.main}`,
                    borderRadius: 2,
                  }}>
                    <Box sx={{ padding: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{
                        bgcolor: 'success.main',
                        width: 40,
                        height: 40,
                      }}>
                        <Lock sx={{ fontSize: 20 }} />
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                          الدفع آمن 100%
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          جميع معاملات الدفع محمية بتشفير SSL وتتوافق مع معايير PCI DSS للأمان
                        </Typography>
                      </Box>
                    </Box>
                  </Card>

                  {/* Navigation */}
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <MuiButton
                      onClick={() => handleStepChange('method')}
                      variant="outlined"
                      sx={{
                        flex: 1,
                        borderRadius: 2,
                        paddingY: 1.5,
                      }}
                      startIcon={<ArrowBack />}
                    >
                      السابق
                    </MuiButton>
                    <MuiButton
                      onClick={() => handleStepChange('confirmation')}
                      variant="contained"
                      sx={{
                        flex: 1,
                        borderRadius: 2,
                        paddingY: 1.5,
                        fontSize: '1rem',
                      }}
                      disabled={selectedMethod === 'cash' ? false : (!paymentDetails.cardNumber || !paymentDetails.expiryDate || !paymentDetails.cvv || !paymentDetails.holderName)}
                    >
                      مراجعة الطلب
                      <ArrowForward sx={{ marginLeft: 1 }} />
                    </MuiButton>
                  </Box>
                </Box>
              </Box>
            )}

            {/* Confirmation */}
            {step === 'confirmation' && (
              <Box sx={{ flex: { xs: 'none', lg: 1 } }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {/* Order Summary */}
                  <Card sx={{
                    padding: 3,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                    borderRadius: 3,
                    background: 'rgba(255,255,255,0.95)',
                    backdropFilter: 'blur(20px)',
                  }}>
                    <Typography variant="h6" component="h2" sx={{
                      fontWeight: 'bold',
                      marginBottom: 3,
                      color: 'primary.main',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                    }}>
                      <CheckCircle sx={{ fontSize: 20 }} />
                      ملخص الطلب
                    </Typography>

                    <Box sx={{ marginBottom: 3 }}>
                      <Box sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: 2,
                        padding: 2,
                        background: alpha(theme.palette.primary.main, 0.05),
                        borderRadius: 2,
                      }}>
                        <Typography variant="body2" color="text.secondary">المجموع الفرعي</Typography>
                        <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                          {subtotal.toFixed(2)} ر.ي
                        </Typography>
                      </Box>
                      <Box sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: 2,
                        padding: 2,
                        background: alpha(theme.palette.primary.main, 0.05),
                        borderRadius: 2,
                      }}>
                        <Typography variant="body2" color="text.secondary">رسوم التوصيل</Typography>
                        <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                          {deliveryFee.toFixed(2)} ر.ي
                        </Typography>
                      </Box>
                      {paymentFee > 0 && (
                        <Box sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          marginBottom: 2,
                          padding: 2,
                          background: alpha(theme.palette.error.main, 0.05),
                          borderRadius: 2,
                        }}>
                          <Typography variant="body2" color="text.secondary">رسوم الدفع</Typography>
                          <Typography variant="body1" sx={{ fontWeight: 'medium', color: 'error.main' }}>
                            +{paymentFee.toFixed(2)} ر.ي
                          </Typography>
                        </Box>
                      )}
                      <Divider sx={{ marginY: 2 }} />
                      <Box sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        padding: 2,
                        background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                        borderRadius: 2,
                        color: 'white',
                      }}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>الإجمالي</Typography>
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                          {total.toFixed(2)} ر.ي
                        </Typography>
                      </Box>
                    </Box>
                  </Card>

                  {/* Delivery Address */}
                  <Card sx={{
                    padding: 3,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                    borderRadius: 3,
                    background: 'rgba(255,255,255,0.95)',
                    backdropFilter: 'blur(20px)',
                  }}>
                    <Typography variant="h6" component="h3" sx={{
                      fontWeight: 'bold',
                      marginBottom: 2,
                      color: 'primary.main',
                    }}>
                      عنوان التسليم
                    </Typography>
                    <Box sx={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 2,
                      padding: 2,
                      background: alpha(theme.palette.primary.main, 0.05),
                      borderRadius: 2,
                    }}>
                      <Avatar sx={{
                        bgcolor: 'primary.main',
                        width: 40,
                        height: 40,
                      }}>
                        <Place sx={{ fontSize: 20 }} />
                      </Avatar>
                      <Box>
                        <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                          {selectedAddress?.label}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {selectedAddress?.city}، {selectedAddress?.street}
                        </Typography>
                      </Box>
                    </Box>
                  </Card>

                  {/* Payment Method */}
                  <Card sx={{
                    padding: 3,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                    borderRadius: 3,
                    background: 'rgba(255,255,255,0.95)',
                    backdropFilter: 'blur(20px)',
                  }}>
                    <Typography variant="h6" component="h3" sx={{
                      fontWeight: 'bold',
                      marginBottom: 2,
                      color: 'primary.main',
                    }}>
                      طريقة الدفع
                    </Typography>
                    {(() => {
                      const method = paymentMethods.find(m => m.id === selectedMethod);
                      return method ? (
                        <Box sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 2,
                          padding: 2,
                          background: alpha(method.color || theme.palette.primary.main, 0.05),
                          borderRadius: 2,
                          border: `1px solid ${method.color || theme.palette.primary.main}20`,
                        }}>
                          <Avatar sx={{
                            bgcolor: method.color || theme.palette.primary.main,
                            width: 40,
                            height: 40,
                          }}>
                            {method.icon}
                          </Avatar>
                          <Box>
                            <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                              {method.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {method.description}
                            </Typography>
                          </Box>
                        </Box>
                      ) : null;
                    })()}
                  </Card>

                  {/* Process Payment */}
                  <MuiButton
                    onClick={handlePaymentSubmit}
                    disabled={loading}
                    fullWidth
                    size="large"
                    variant="contained"
                    sx={{
                      paddingY: 2,
                      fontSize: '1.2rem',
                      fontWeight: 'bold',
                      borderRadius: 3,
                      background: `linear-gradient(45deg, ${theme.palette.success.main}, ${theme.palette.success.dark})`,
                      boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 12px 32px rgba(0,0,0,0.3)',
                      },
                      '&:disabled': {
                        background: 'grey.400',
                        transform: 'none',
                      },
                    }}
                  >
                    {loading ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{
                          width: 20,
                          height: 20,
                          border: 2,
                          borderColor: 'white',
                          borderTopColor: 'transparent',
                          borderRadius: '50%',
                          animation: 'spin 1s linear infinite',
                        }} />
                        جاري معالجة الدفع...
                      </Box>
                    ) : (
                      <>
                        <CheckCircle sx={{ marginLeft: 1, fontSize: 24 }} />
                        تأكيد الدفع - {total.toFixed(2)} ر.ي
                      </>
                    )}
                  </MuiButton>

                  <MuiButton
                    onClick={() => handleStepChange('details')}
                    variant="outlined"
                    fullWidth
                    sx={{
                      borderRadius: 2,
                      paddingY: 1.5,
                    }}
                    startIcon={<Edit />}
                  >
                    تعديل بيانات الدفع
                  </MuiButton>
                </Box>
              </Box>
            )}
          </Box>
        </Slide>
      </Container>
    </Box>
  );
};

export default Payment;