/**
 * App Settings Manager
 * إدارة إعدادات التطبيق
 */

import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Switch,
  FormControlLabel,
  CircularProgress,
  Alert,
  Grid,
 
} from '@mui/material';
import { Save } from '@mui/icons-material';
import { useAppSettings, useContentAPI } from '@/api/content';
import type { UpdateAppSettingsDto } from '@/types/content';

export default function AppSettingsManager() {
  const { data, loading, error, refetch } = useAppSettings();
  const api = useContentAPI();
  
  const [formData, setFormData] = useState<UpdateAppSettingsDto>({
    maintenanceMode: false,
    maintenanceMessage: '',
    minimumAppVersion: { ios: '1.0.0', android: '1.0.0' },
    forceUpdate: false,
    contactEmail: '',
    contactPhone: '',
    socialMedia: {},
    deliveryFee: 0,
    minimumOrderAmount: 0,
    currency: 'SAR',
    taxRate: 0,
  });

  useEffect(() => {
    if (data?.data) {
      setFormData({
        maintenanceMode: data.data.maintenanceMode,
        maintenanceMessage: data.data.maintenanceMessage || '',
        minimumAppVersion: data.data.minimumAppVersion,
        forceUpdate: data.data.forceUpdate,
        contactEmail: data.data.contactEmail,
        contactPhone: data.data.contactPhone,
        socialMedia: data.data.socialMedia || {},
        deliveryFee: data.data.deliveryFee,
        minimumOrderAmount: data.data.minimumOrderAmount,
        currency: data.data.currency,
        taxRate: data.data.taxRate,
      });
    }
  }, [data]);

  const handleSubmit = async () => {
    try {
      await api.updateAppSettings(formData);
      refetch();
      alert('تم تحديث الإعدادات بنجاح');
    } catch (err) {
      console.error(err);
      alert('حدث خطأ أثناء التحديث');
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">خطأ في تحميل البيانات: {error.message}</Alert>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">إعدادات التطبيق</Typography>
        <Button
          variant="contained"
          startIcon={<Save />}
          onClick={handleSubmit}
        >
          حفظ التغييرات
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Maintenance Mode */}
        <Grid  size={{xs: 12}}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                وضع الصيانة
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.maintenanceMode || false}
                    onChange={(e) =>
                      setFormData({ ...formData, maintenanceMode: e.target.checked })
                    }
                  />
                }
                label="تفعيل وضع الصيانة"
              />
              <TextField
                label="رسالة الصيانة"
                value={formData.maintenanceMessage || ''}
                onChange={(e) =>
                  setFormData({ ...formData, maintenanceMessage: e.target.value })
                }
                fullWidth
                multiline
                rows={2}
                sx={{ mt: 2 }}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* App Versions */}
        <Grid  size={{xs: 12, md: 6}}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                إصدارات التطبيق
              </Typography>
              <TextField
                label="iOS Minimum Version"
                value={formData.minimumAppVersion?.ios || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    minimumAppVersion: {
                      ...formData.minimumAppVersion!,
                      ios: e.target.value,
                    },
                  })
                }
                fullWidth
                sx={{ mb: 2 }}
              />
              <TextField
                label="Android Minimum Version"
                value={formData.minimumAppVersion?.android || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    minimumAppVersion: {
                      ...formData.minimumAppVersion!,
                      android: e.target.value,
                    },
                  })
                }
                fullWidth
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.forceUpdate || false}
                    onChange={(e) =>
                      setFormData({ ...formData, forceUpdate: e.target.checked })
                    }
                  />
                }
                label="فرض التحديث"
                sx={{ mt: 2 }}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Contact Info */}
        <Grid  size={{xs: 12, md: 6}}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                معلومات التواصل
              </Typography>
              <TextField
                label="البريد الإلكتروني"
                value={formData.contactEmail || ''}
                onChange={(e) =>
                  setFormData({ ...formData, contactEmail: e.target.value })
                }
                fullWidth
                sx={{ mb: 2 }}
              />
              <TextField
                label="رقم الهاتف"
                value={formData.contactPhone || ''}
                onChange={(e) =>
                  setFormData({ ...formData, contactPhone: e.target.value })
                }
                fullWidth
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Social Media */}
        <Grid  size={{xs: 12}}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                وسائل التواصل الاجتماعي
              </Typography>
              <Grid container spacing={2}>
                <Grid  size={{xs: 12, sm: 6, md: 3}}>
                  <TextField
                    label="Facebook"
                    value={formData.socialMedia?.facebook || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        socialMedia: {
                          ...formData.socialMedia,
                          facebook: e.target.value,
                        },
                      })
                    }
                    fullWidth
                  />
                </Grid>
                <Grid  size={{xs: 12, sm: 6, md: 3}}>
                  <TextField
                    label="Twitter"
                    value={formData.socialMedia?.twitter || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        socialMedia: {
                          ...formData.socialMedia,
                          twitter: e.target.value,
                        },
                      })
                    }
                    fullWidth
                  />
                </Grid>
                <Grid  size={{xs: 12, sm: 6, md: 3}}>
                  <TextField
                    label="Instagram"
                    value={formData.socialMedia?.instagram || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        socialMedia: {
                          ...formData.socialMedia,
                          instagram: e.target.value,
                        },
                      })
                    }
                    fullWidth
                  />
                </Grid>
                <Grid  size={{xs: 12, sm: 6, md: 3}}>
                  <TextField
                    label="Snapchat"
                    value={formData.socialMedia?.snapchat || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        socialMedia: {
                          ...formData.socialMedia,
                          snapchat: e.target.value,
                        },
                      })
                    }
                    fullWidth
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Financial Settings */}
        <Grid  size={{xs: 12}}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                الإعدادات المالية
              </Typography>
              <Grid container spacing={2}>
                <Grid  size={{xs: 12, sm: 6, md: 3}}>
                  <TextField
                    label="رسوم التوصيل"
                    type="number"
                    value={formData.deliveryFee || 0}
                    onChange={(e) =>
                      setFormData({ ...formData, deliveryFee: parseFloat(e.target.value) })
                    }
                    fullWidth
                  />
                </Grid>
                <Grid  size={{xs: 12, sm: 6, md: 3}}>
                  <TextField
                    label="الحد الأدنى للطلب"
                    type="number"
                    value={formData.minimumOrderAmount || 0}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        minimumOrderAmount: parseFloat(e.target.value),
                      })
                    }
                    fullWidth
                  />
                </Grid>
                  <Grid  size={{xs: 12, sm: 6, md: 3}}>
                  <TextField
                    label="العملة"
                    value={formData.currency || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, currency: e.target.value })
                    }
                    fullWidth
                  />
                </Grid>
                  <Grid  size={{xs: 12, sm: 6, md: 3}}>
                  <TextField
                    label="نسبة الضريبة (%)"
                    type="number"
                    value={formData.taxRate || 0}
                    onChange={(e) =>
                      setFormData({ ...formData, taxRate: parseFloat(e.target.value) })
                    }
                    fullWidth
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

