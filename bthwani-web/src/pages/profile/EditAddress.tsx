import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useAuthGate } from "../../hooks/useAuthGate";
import AuthRequiredModal from "../../components/auth/AuthRequiredModal";
import type { Address } from "../../types";
import {
  Container,
  Typography,
  TextField,
  Button as MuiButton,
  Box,
  IconButton,
  Card,
  Checkbox,
  FormControlLabel,
  Fade,
  useTheme,
  alpha,
} from '@mui/material';
import {
  ArrowBack,
  Save,
} from '@mui/icons-material';

const EditAddress: React.FC = () => {
  const navigate = useNavigate();
  const { addressId } = useParams<{ addressId: string }>();
  const { isAuthenticated } = useAuth();
  const { ensureAuth, askAuthOpen, setAskAuthOpen } = useAuthGate();
  const theme = useTheme();

  // Form state
  const [formData, setFormData] = useState({
    label: '',
    city: '',
    street: '',
    isDefault: false,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Validation functions
  const validateLabel = (label: string): boolean => {
    return label.trim().length >= 2 && label.trim().length <= 30;
  };

  const validateCity = (city: string): boolean => {
    return city.trim().length >= 2 && city.trim().length <= 50;
  };

  const validateStreet = (street: string): boolean => {
    return street.trim().length >= 5 && street.trim().length <= 100;
  };

  // Load address data when component mounts
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    loadAddress();
  }, [isAuthenticated, addressId]);

  const loadAddress = async () => {
    try {
      setLoading(true);
      // Mock data - should come from API in real app
      const mockAddress: Address = {
        _id: addressId || '',
        label: 'المنزل',
        city: 'صنعاء',
        street: 'شارع تعز، حي حدة',
        location: { lat: 15.3694, lng: 44.1910 },
        isDefault: true
      };

      setFormData({
        label: mockAddress.label,
        city: mockAddress.city,
        street: mockAddress.street,
        isDefault: mockAddress.isDefault || false,
      });
    } catch (error) {
      console.error('Error loading address:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle input changes
  const handleInputChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, isDefault: event.target.checked }));
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!validateLabel(formData.label)) {
      newErrors.label = 'يجب أن يكون اسم العنوان بين 2 و 30 حرف';
    }

    if (!validateCity(formData.city)) {
      newErrors.city = 'يجب أن يكون اسم المدينة بين 2 و 50 حرف';
    }

    if (!validateStreet(formData.street)) {
      newErrors.street = 'يجب أن يكون عنوان الشارع بين 5 و 100 حرف';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    ensureAuth(async () => {
      if (!validateForm()) {
        return;
      }

      try {
        setSaving(true);
        // Mock API call - should be replaced with real API call
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Navigate back to addresses list
        navigate('/profile/addresses');
      } catch (error) {
        console.error('Error saving address:', error);
      } finally {
        setSaving(false);
      }
    });
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
      <Container maxWidth="md">
        {/* Header */}
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: 4,
          paddingY: 2,
        }}>
          <IconButton
            onClick={() => navigate('/profile/addresses')}
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
              تعديل العنوان
            </Typography>
            <Typography variant="body1" color="text.secondary">
              قم بتعديل تفاصيل العنوان الخاص بك
            </Typography>
          </Box>
        </Box>

        <Fade in timeout={600}>
          <Card sx={{
            padding: 4,
            maxWidth: 600,
            margin: '0 auto',
            boxShadow: '0 16px 40px rgba(0,0,0,0.1)',
            borderRadius: 3,
            background: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(20px)',
          }}>
            <form onSubmit={handleSubmit}>
              {/* Label Field */}
              <Box sx={{ marginBottom: 3 }}>
                <Typography variant="h6" sx={{ marginBottom: 1, fontWeight: 'bold' }}>
                  اسم العنوان *
                </Typography>
                <TextField
                  fullWidth
                  value={formData.label}
                  onChange={handleInputChange('label')}
                  error={!!errors.label}
                  helperText={errors.label}
                  placeholder="مثال: المنزل، العمل، العائلة"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: 'rgba(0,0,0,0.02)',
                    },
                  }}
                />
              </Box>

              {/* City Field */}
              <Box sx={{ marginBottom: 3 }}>
                <Typography variant="h6" sx={{ marginBottom: 1, fontWeight: 'bold' }}>
                  المدينة *
                </Typography>
                <TextField
                  fullWidth
                  value={formData.city}
                  onChange={handleInputChange('city')}
                  error={!!errors.city}
                  helperText={errors.city}
                  placeholder="مثال: صنعاء، تعز، الحديدة"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: 'rgba(0,0,0,0.02)',
                    },
                  }}
                />
              </Box>

              {/* Street Field */}
              <Box sx={{ marginBottom: 3 }}>
                <Typography variant="h6" sx={{ marginBottom: 1, fontWeight: 'bold' }}>
                  عنوان الشارع *
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  value={formData.street}
                  onChange={handleInputChange('street')}
                  error={!!errors.street}
                  helperText={errors.street}
                  placeholder="اكتب العنوان بالتفصيل مع أي معلومات إضافية للمساعدة في الوصول"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: 'rgba(0,0,0,0.02)',
                    },
                  }}
                />
              </Box>

              {/* Default Address Checkbox */}
              <Box sx={{ marginBottom: 4 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.isDefault}
                      onChange={handleCheckboxChange}
                      sx={{
                        color: 'primary.main',
                        '&.Mui-checked': {
                          color: 'primary.main',
                        },
                      }}
                    />
                  }
                  label="تعيين كعنوان افتراضي"
                  sx={{ fontWeight: 'bold' }}
                />
              </Box>

              {/* Action Buttons */}
              <Box sx={{ display: 'flex', gap: 2, marginTop: 4 }}>
                <MuiButton
                  type="button"
                  onClick={() => navigate('/profile/addresses')}
                  variant="outlined"
                  fullWidth
                  sx={{
                    paddingY: 1.5,
                    borderRadius: 2,
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
                    },
                  }}
                >
                  إلغاء
                </MuiButton>
                <MuiButton
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={saving}
                  startIcon={<Save />}
                  sx={{
                    paddingY: 1.5,
                    borderRadius: 2,
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                    boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                    },
                    '&:disabled': {
                      background: 'rgba(0,0,0,0.1)',
                      color: 'rgba(0,0,0,0.3)',
                    },
                  }}
                >
                  {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                </MuiButton>
              </Box>
            </form>
          </Card>
        </Fade>

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

      <AuthRequiredModal
        open={askAuthOpen}
        onClose={() => setAskAuthOpen(false)}
      />
    </Box>
  );
};

export default EditAddress;
