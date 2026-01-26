import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
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
  Alert,
} from '@mui/material';
import {
  Place,
  ArrowBack,
  MyLocation,
  Home,
  Work,
  LocationCity,
  Save,
  Map,
} from '@mui/icons-material';

const AddAddress: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { ensureAuth, askAuthOpen, setAskAuthOpen } = useAuthGate();
  const theme = useTheme();

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

  // Helper function to get address type icon
  const getAddressTypeIcon = (label: string) => {
    const lowerLabel = label.toLowerCase();
    if (lowerLabel.includes('منزل') || lowerLabel.includes('home')) {
      return <Home sx={{ fontSize: 20, color: 'success.main' }} />;
    } else if (lowerLabel.includes('عمل') || lowerLabel.includes('work')) {
      return <Work sx={{ fontSize: 20, color: 'primary.main' }} />;
    } else {
      return <LocationCity sx={{ fontSize: 20, color: 'secondary.main' }} />;
    }
  };

  const [formData, setFormData] = useState({
    label: "",
    city: "",
    street: "",
    isDefault: false,
  });
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number;
    lng: number;
    address?: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.label || !formData.city || !formData.street) {
      return;
    }

    ensureAuth(async () => {
      // الفعل الفعلي هنا للمستخدم المسجّل
      setLoading(true);
      try {
        // Mock API call - should integrate with real API
        const newAddress: Address = {
          _id: Date.now().toString(),
          label: formData.label,
          city: formData.city,
          street: formData.street,
          location: selectedLocation || { lat: 15.3694, lng: 44.191 }, // Use selected location or default
          isDefault: formData.isDefault,
        };

        // In real app, this would be an API call
        console.log("Adding address:", newAddress);

        navigate("/profile/addresses");
      } catch (error) {
        console.error("Error adding address:", error);
      } finally {
        setLoading(false);
      }
    });
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setSelectedLocation(location);
          setLoading(false);
        },
        (error) => {
          console.error("Error getting location:", error);
          setLoading(false);
        }
      );
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };


  return (
    <>
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
          gap: 2,
          marginBottom: 4,
          paddingY: 2,
        }}>
          <IconButton
            onClick={() => navigate("/profile/addresses")}
            sx={{
              background: alpha(theme.palette.primary.main, 0.1),
              '&:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.2),
                transform: 'scale(1.05)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            <ArrowBack sx={{ fontSize: 24 }} />
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
              إضافة عنوان جديد
            </Typography>
            <Typography variant="body1" color="text.secondary">
              أضف عنوانك الجديد لتسهيل عملية التوصيل
            </Typography>
          </Box>
        </Box>

        <Fade in timeout={600}>
          <Card sx={{
            padding: 4,
            maxWidth: 600,
            margin: '0 auto',
            boxShadow: '0 16px 40px rgba(0,0,0,0.1)',
            borderRadius: 4,
            background: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(20px)',
          }}>
            <form onSubmit={handleSubmit}>
              {/* Form Fields */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {/* Address Label */}
                <Box sx={{ position: 'relative' }}>
                  <Box sx={{
                    position: 'absolute',
                    left: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'text.secondary',
                    zIndex: 1,
                    display: formData.label ? 'block' : 'none',
                  }}>
                    {getAddressTypeIcon(formData.label)}
                  </Box>
                  <TextField
                    label="اسم العنوان"
                    type="text"
                    placeholder="مثال: المنزل، العمل، العائلة"
                    value={formData.label}
                    onChange={(e) => handleInputChange("label", e.target.value)}
                    required
                    fullWidth
                    variant="outlined"
                    error={!validateLabel(formData.label) && formData.label.length > 0}
                    helperText={!validateLabel(formData.label) && formData.label.length > 0 ? 'يجب أن يكون الاسم بين 2 و 30 حرف' : ''}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        paddingLeft: formData.label ? '48px' : '14px',
                        borderRadius: 2,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        },
                      },
                    }}
                  />
                </Box>

                {/* City */}
                <TextField
                  label="المدينة"
                  type="text"
                  placeholder="مثال: صنعاء، تعز، عدن"
                  value={formData.city}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                  required
                  fullWidth
                  variant="outlined"
                  error={!validateCity(formData.city) && formData.city.length > 0}
                  helperText={!validateCity(formData.city) && formData.city.length > 0 ? 'يرجى إدخال اسم المدينة بشكل صحيح' : ''}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      },
                    },
                  }}
                />

                {/* Street Address */}
                <TextField
                  label="العنوان التفصيلي"
                  multiline
                  rows={3}
                  placeholder="مثال: شارع تعز، حي حدة، قرب جامع الشعب"
                  value={formData.street}
                  onChange={(e) => handleInputChange("street", e.target.value)}
                  required
                  fullWidth
                  variant="outlined"
                  error={!validateStreet(formData.street) && formData.street.length > 0}
                  helperText={!validateStreet(formData.street) && formData.street.length > 0 ? 'يرجى إدخال عنوان أكثر تفصيلاً' : ''}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      },
                    },
                  }}
                />

                {/* Location Selection */}
                <Card sx={{
                  padding: 3,
                  background: alpha(theme.palette.primary.main, 0.05),
                  border: `1px solid ${theme.palette.primary.main}20`,
                }}>
                  <Typography variant="h6" sx={{
                    fontWeight: 'bold',
                    marginBottom: 2,
                    color: 'primary.main',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  }}>
                    <Map sx={{ fontSize: 20 }} />
                    تحديد الموقع (اختياري)
                  </Typography>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <MuiButton
                      type="button"
                      variant="outlined"
                      onClick={getCurrentLocation}
                      disabled={loading}
                      startIcon={<MyLocation />}
                      sx={{
                        borderRadius: 2,
                        paddingY: 1.5,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-1px)',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        },
                      }}
                    >
                      {loading ? "جاري تحديد الموقع..." : "استخدم موقعي الحالي"}
                    </MuiButton>

                    {selectedLocation && (
                      <Alert
                        severity="success"
                        sx={{
                          background: alpha(theme.palette.success.main, 0.1),
                          border: `1px solid ${theme.palette.success.main}`,
                          borderRadius: 2,
                        }}
                      >
                        <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                          تم تحديد الموقع بنجاح
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
                        </Typography>
                        {selectedLocation.address && (
                          <Typography variant="body2" color="text.secondary">
                            {selectedLocation.address}
                          </Typography>
                        )}
                      </Alert>
                    )}
                  </Box>
                </Card>

                {/* Default Address Toggle */}
                <Card sx={{
                  padding: 3,
                  background: alpha(theme.palette.info.main, 0.05),
                  border: `1px solid ${theme.palette.info.main}20`,
                }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.isDefault}
                        onChange={(e) => handleInputChange("isDefault", e.target.checked)}
                        sx={{ color: 'info.main' }}
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                          تعيين كعنوان افتراضي
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          سيتم استخدام هذا العنوان تلقائيًا في جميع طلباتك المستقبلية
                        </Typography>
                      </Box>
                    }
                  />
                </Card>

                {/* Location Note */}
                <Alert
                  severity="info"
                  sx={{
                    background: alpha(theme.palette.info.main, 0.1),
                    border: `1px solid ${theme.palette.info.main}`,
                    borderRadius: 2,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                    <Place sx={{ fontSize: 20, color: 'info.main', marginTop: 0.5 }} />
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 'medium', marginBottom: 0.5 }}>
                        تحديد الموقع الدقيق
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        يمكنك تحديد موقعك الدقيق للحصول على توصيل أسرع وأدق
                      </Typography>
                    </Box>
                  </Box>
                </Alert>
              </Box>

              {/* Submit Button */}
              <MuiButton
                type="submit"
                variant="contained"
                disabled={
                  loading ||
                  !formData.label ||
                  !formData.city ||
                  !formData.street ||
                  !validateLabel(formData.label) ||
                  !validateCity(formData.city) ||
                  !validateStreet(formData.street)
                }
                startIcon={loading ? undefined : <Save />}
                sx={{
                  marginTop: 3,
                  paddingY: 2,
                  paddingX: 4,
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  borderRadius: 3,
                  background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                  boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                  },
                  '&:disabled': {
                    background: 'grey.400',
                    transform: 'none',
                  },
                }}
              >
                {loading ? 'جاري الحفظ...' : 'حفظ العنوان'}
              </MuiButton>
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
            width: 100,
            height: 100,
            borderRadius: '50%',
            background: theme.palette.primary.main,
            animation: 'float 6s ease-in-out infinite',
          }} />
          <Box sx={{
            position: 'absolute',
            top: '70%',
            right: '20%',
            width: 80,
            height: 80,
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

        {/* مودال التحقق من المصادقة */}
        <AuthRequiredModal
          open={askAuthOpen}
          onClose={() => setAskAuthOpen(false)}
        />
    </Container>
  </Box>
</>
  );
};

export default AddAddress;
