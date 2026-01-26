import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Loading from '../../components/common/Loading';
import {
  Container,
  Typography,
  TextField,
  Button as MuiButton,
  Box,
  IconButton,
  Avatar,
  Card,
  Fade,
  useTheme,
  alpha,
  Alert,
} from '@mui/material';
import {
  ArrowBack,
  PhotoCamera,
  Save,
  Cancel,
  Person,
  Email,
  Phone,
} from '@mui/icons-material';

const EditProfile: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, updateProfile } = useAuth();
  const theme = useTheme();

  // Validation functions
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^(\+966|0)?[5][0-9]{8}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  };

  const validateName = (name: string): boolean => {
    return name.trim().length >= 2 && name.trim().length <= 50;
  };

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    profileImage: ''
  });
  const [loading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (user) {
      setFormData({
        fullName: user.fullName || '',
        email: user.email || '',
        phone: user.phone || '',
        profileImage: user.profileImage || ''
      });
    }
  }, [isAuthenticated, navigate, user]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.fullName.trim() || !formData.email.trim()) {
      return;
    }

    setSaving(true);
    try {
      await updateProfile({
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        profileImage: formData.profileImage
      });

      navigate('/profile');
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real app, you'd upload to cloud storage
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData(prev => ({
          ...prev,
          profileImage: e.target?.result as string
        }));
      };
      reader.readAsDataURL(file);
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
          gap: 2,
          marginBottom: 4,
          paddingY: 2,
        }}>
          <IconButton
            onClick={() => navigate('/profile')}
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
              تعديل الملف الشخصي
            </Typography>
            <Typography variant="body1" color="text.secondary">
              قم بتحديث معلوماتك الشخصية بسهولة وأمان
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
              {/* Profile Image */}
              <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                marginBottom: 4,
                padding: 3,
                background: alpha(theme.palette.primary.main, 0.05),
                borderRadius: 3,
              }}>
                <Box sx={{ position: 'relative', marginBottom: 2 }}>
                  <Avatar
                    sx={{
                      width: 120,
                      height: 120,
                      background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                      fontSize: '3rem',
                      fontWeight: 'bold',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'scale(1.05)',
                        boxShadow: '0 12px 32px rgba(0,0,0,0.3)',
                      },
                    }}
                    src={formData.profileImage}
                    alt="Profile"
                  >
                    {!formData.profileImage && (formData.fullName.charAt(0) || 'U')}
                  </Avatar>
                  <IconButton
                    component="label"
                    sx={{
                      position: 'absolute',
                      bottom: -8,
                      right: -8,
                      background: theme.palette.primary.main,
                      color: 'white',
                      width: 40,
                      height: 40,
                      boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        backgroundColor: theme.palette.primary.dark,
                        transform: 'scale(1.1)',
                      },
                    }}
                  >
                    <PhotoCamera sx={{ fontSize: 20 }} />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      hidden
                    />
                  </IconButton>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', fontStyle: 'italic' }}>
                  انقر على الأيقونة لتغيير الصورة الشخصية
                </Typography>
              </Box>

              {/* Form Fields */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {/* Full Name */}
                <Box sx={{ position: 'relative' }}>
                  <Person sx={{
                    position: 'absolute',
                    left: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'text.secondary',
                    zIndex: 1,
                  }} />
                  <TextField
                    label="الاسم الكامل"
                    type="text"
                    placeholder="أدخل اسمك الكامل"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    required
                    fullWidth
                    variant="outlined"
                    error={!validateName(formData.fullName) && formData.fullName.length > 0}
                    helperText={!validateName(formData.fullName) && formData.fullName.length > 0 ? 'يجب أن يكون الاسم بين 2 و 50 حرف' : ''}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        paddingLeft: '48px',
                        borderRadius: 2,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        },
                      },
                    }}
                  />
                </Box>

                {/* Email */}
                <Box sx={{ position: 'relative' }}>
                  <Email sx={{
                    position: 'absolute',
                    left: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'text.secondary',
                    zIndex: 1,
                  }} />
                  <TextField
                    label="البريد الإلكتروني"
                    type="email"
                    placeholder="أدخل بريدك الإلكتروني"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    required
                    fullWidth
                    variant="outlined"
                    error={!validateEmail(formData.email) && formData.email.length > 0}
                    helperText={!validateEmail(formData.email) && formData.email.length > 0 ? 'يرجى إدخال بريد إلكتروني صحيح' : ''}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        paddingLeft: '48px',
                        borderRadius: 2,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        },
                      },
                    }}
                  />
                </Box>

                {/* Phone */}
                <Box sx={{ position: 'relative' }}>
                  <Phone sx={{
                    position: 'absolute',
                    left: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'text.secondary',
                    zIndex: 1,
                  }} />
                  <TextField
                    label="رقم الهاتف"
                    type="tel"
                    placeholder="أدخل رقم هاتفك (05xxxxxxxx)"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    fullWidth
                    variant="outlined"
                    error={!validatePhone(formData.phone) && formData.phone.length > 0}
                    helperText={!validatePhone(formData.phone) && formData.phone.length > 0 ? 'يرجى إدخال رقم هاتف سعودي صحيح' : ''}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        paddingLeft: '48px',
                        borderRadius: 2,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        },
                      },
                    }}
                  />
                </Box>
              </Box>

              {/* Action Buttons */}
              <Box sx={{
                display: 'flex',
                gap: 2,
                marginTop: 4,
                paddingTop: 3,
                borderTop: `1px solid ${theme.palette.divider}`,
              }}>
                <MuiButton
                  type="button"
                  variant="outlined"
                  onClick={() => navigate('/profile')}
                  startIcon={<Cancel />}
                  sx={{
                    flex: 1,
                    borderRadius: 2,
                    paddingY: 1.5,
                    fontSize: '1rem',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                    },
                  }}
                >
                  إلغاء
                </MuiButton>
                <MuiButton
                  type="submit"
                  variant="contained"
                  disabled={
                    saving ||
                    !formData.fullName.trim() ||
                    !formData.email.trim() ||
                    !validateName(formData.fullName) ||
                    !validateEmail(formData.email) ||
                    (formData.phone ? !validatePhone(formData.phone) : false)
                  }
                  startIcon={saving ? undefined : <Save />}
                  sx={{
                    flex: 1,
                    borderRadius: 2,
                    paddingY: 1.5,
                    fontSize: '1rem',
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
                  {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                </MuiButton>
              </Box>

              {/* Info Alert */}
              <Alert
                severity="info"
                sx={{
                  marginTop: 3,
                  background: alpha(theme.palette.info.main, 0.1),
                  border: `1px solid ${theme.palette.info.main}`,
                  borderRadius: 2,
                }}
              >
                <Typography variant="body2">
                  سيتم حفظ جميع التغييرات تلقائياً في حسابك وسيتم إشعارك عند الانتهاء
                </Typography>
              </Alert>
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
      </Container>
    </Box>
  );
};

export default EditProfile;
