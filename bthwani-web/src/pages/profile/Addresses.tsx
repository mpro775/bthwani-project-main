import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';
import type { Address } from '../../types';
import Loading from '../../components/common/Loading';
import {
  Container,
  Typography,
  Card,
  Button as MuiButton,
  Box,
  IconButton,
  Chip,
  Divider,
  Fade,
  Grow,
  useTheme,
  alpha,
  Avatar,
} from '@mui/material';
import {
  Place,
  Add,
  Edit,
  Delete,
  Star,
  Home,
  Work,
  LocationCity,
} from '@mui/icons-material';

const Addresses: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const theme = useTheme();

  // Helper function to get address icon
  const getAddressIcon = (label: string) => {
    const lowerLabel = label.toLowerCase();
    if (lowerLabel.includes('منزل') || lowerLabel.includes('home')) {
      return <Home sx={{ fontSize: 20, color: 'success.main' }} />;
    } else if (lowerLabel.includes('عمل') || lowerLabel.includes('work')) {
      return <Work sx={{ fontSize: 20, color: 'primary.main' }} />;
    } else {
      return <LocationCity sx={{ fontSize: 20, color: 'secondary.main' }} />;
    }
  };

  const [loading, setLoading] = useState(true);
  const [addresses, setAddresses] = useState<Address[]>([]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    loadAddresses();
  }, [isAuthenticated, navigate]);

  const loadAddresses = async () => {
    try {
      setLoading(true);
      // Mock data - should come from API in real app
      const mockAddresses: Address[] = [
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
        },
        {
          _id: '3',
          label: 'العائلة',
          city: 'صنعاء',
          street: 'شارع صخر، حي التحرير',
          location: { lat: 15.3589, lng: 44.1987 },
          isDefault: false
        }
      ];

      setAddresses(mockAddresses);
    } catch (error) {
      console.error('Error loading addresses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSetDefault = async (addressId: string) => {
    try {
      // Mock API call
      const updatedAddresses = addresses.map(addr => ({
        ...addr,
        isDefault: addr._id === addressId
      }));
      setAddresses(updatedAddresses);
    } catch (error) {
      console.error('Error setting default address:', error);
    }
  };

  const handleDelete = async (addressId: string) => {
    if (window.confirm(t('profile.confirmDeleteAddress'))) {
      try {
        // Mock API call
        const updatedAddresses = addresses.filter(addr => addr._id !== addressId);
        setAddresses(updatedAddresses);
      } catch (error) {
        console.error('Error deleting address:', error);
      }
    }
  };

  if (loading) {
    return <Loading fullScreen />;
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
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 4,
          paddingY: 2,
        }}>
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
              عناويني
            </Typography>
            <Typography variant="body1" color="text.secondary">
              إدارة عناوين التوصيل الخاصة بك بسهولة
            </Typography>
          </Box>
          <MuiButton
            onClick={() => navigate('/profile/addresses/add')}
            variant="contained"
            startIcon={<Add />}
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
            إضافة عنوان جديد
          </MuiButton>
        </Box>

        {addresses.length === 0 ? (
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
                  <Place sx={{ fontSize: 40 }} />
                </Avatar>
                <Typography variant="h4" component="h2" sx={{
                  fontWeight: 'bold',
                  marginBottom: 2,
                  color: 'text.primary',
                }}>
                  لا توجد عناوين بعد
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ marginBottom: 4 }}>
                  أضف عنوانك الأول لتسهيل عملية التوصيل وتسريع الخدمة
                </Typography>
                <MuiButton
                  onClick={() => navigate('/profile/addresses/add')}
                  variant="contained"
                  startIcon={<Add />}
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
                  إضافة عنوان جديد
                </MuiButton>
              </Card>
            </Box>
          </Fade>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {addresses.map((address, index) => (
              <Grow in timeout={600 + (index * 100)}>
                <Card
                  key={address._id}
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
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, marginBottom: 2 }}>
                        <Avatar sx={{
                          bgcolor: address.isDefault ? 'primary.main' : alpha(theme.palette.primary.main, 0.1),
                          color: address.isDefault ? 'white' : 'primary.main',
                          width: 40,
                          height: 40,
                        }}>
                          {getAddressIcon(address.label)}
                        </Avatar>
                        <Box>
                          <Typography variant="h6" component="h3" sx={{ fontWeight: 'bold' }}>
                            {address.label}
                          </Typography>
                          {address.isDefault && (
                            <Chip
                              label="العنوان الافتراضي"
                              size="small"
                              color="primary"
                              icon={<Star sx={{ fontSize: 16 }} />}
                              sx={{ marginTop: 0.5 }}
                            />
                          )}
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, color: 'text.secondary' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LocationCity sx={{ fontSize: 18 }} />
                          <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                            {address.city}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                          <Place sx={{ fontSize: 18, marginTop: 0.5 }} />
                          <Typography variant="body2">
                            {address.street}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton
                        onClick={() => navigate(`/profile/addresses/edit/${address._id}`)}
                        sx={{
                          background: alpha(theme.palette.primary.main, 0.1),
                          color: 'primary.main',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            backgroundColor: alpha(theme.palette.primary.main, 0.2),
                            transform: 'scale(1.1)',
                          },
                        }}
                      >
                        <Edit sx={{ fontSize: 20 }} />
                      </IconButton>
                      <IconButton
                        onClick={() => handleDelete(address._id)}
                        sx={{
                          background: alpha(theme.palette.error.main, 0.1),
                          color: 'error.main',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            backgroundColor: alpha(theme.palette.error.main, 0.2),
                            transform: 'scale(1.1)',
                          },
                        }}
                      >
                        <Delete sx={{ fontSize: 20 }} />
                      </IconButton>
                    </Box>
                  </Box>

                  <Divider sx={{ marginY: 3 }} />
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    {!address.isDefault && (
                      <MuiButton
                        onClick={() => handleSetDefault(address._id)}
                        variant="outlined"
                        size="small"
                        startIcon={<Star />}
                        sx={{
                          flex: 1,
                          borderRadius: 2,
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-1px)',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                          },
                        }}
                      >
                        تعيين كافتراضي
                      </MuiButton>
                    )}
                    <MuiButton
                      onClick={() => navigate(`/profile/addresses/edit/${address._id}`)}
                      variant="outlined"
                      size="small"
                      startIcon={<Edit />}
                      sx={{
                        flex: 1,
                        borderRadius: 2,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-1px)',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        },
                      }}
                    >
                      تعديل
                    </MuiButton>
                  </Box>
                </Card>
              </Grow>
            ))}
          </Box>
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

export default Addresses;
