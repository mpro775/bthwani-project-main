import  { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Grid,
  Divider,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Chip,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Save as SaveIcon,
  History as HistoryIcon,
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from '../../../utils/axios';
import { AxiosError } from 'axios';

interface CommissionRates {
  platformItemsCommission: number; // نسبة المنصة من العناصر
  platformDeliveryCommission: number; // نسبة المنصة من رسوم التوصيل
  driverDeliveryShare: number; // نسبة السائق من رسوم التوصيل
  vendorCommission: number; // نسبة المتجر من العناصر
  tipsDistribution: 'driver' | 'platform' | 'split'; // توزيع الإكرامية
  tipsSplitRatio?: number; // نسبة تقسيم الإكرامية إذا كان split
  taxEnabled: boolean;
  taxRate: number; // نسبة الضريبة
  taxBase: 'subtotal' | 'delivery' | 'total'; // أساس حساب الضريبة
}


interface AuditLog {
  _id: string;
  action: string;
  oldValues?: CommissionRates;
  newValues?: CommissionRates;
  changedBy: string;
  changedAt: Date;
  reason?: string;
}

const defaultCommissionRates: CommissionRates = {
  platformItemsCommission: 12,
  platformDeliveryCommission: 30,
  driverDeliveryShare: 70,
  vendorCommission: 12,
  tipsDistribution: 'driver',
  taxEnabled: false,
  taxRate: 15,
  taxBase: 'total',
};

export default function CommissionSettingsPage() {
  const queryClient = useQueryClient();
  const [settings, setSettings] = useState<CommissionRates>(defaultCommissionRates);
  const [hasChanges, setHasChanges] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });
  const [historyDialog, setHistoryDialog] = useState(false);

  // Fetch current commission settings
  const { data: currentSettings, isLoading } = useQuery({
    queryKey: ['commission-settings'],
    queryFn: async () => {
      try {
        const { data } = await axios.get('/finance/commissions/settings');
        return data.settings;
      } catch {
        // Return default settings if none exist
        return { ...defaultCommissionRates, effectiveFrom: new Date() };
      }
    },
  });

  // Fetch audit log
  const { data: auditLog = [] } = useQuery({
    queryKey: ['commission-audit-log'],
    queryFn: async () => {
      const { data } = await axios.get('/finance/commissions/audit-log');
      return data.logs;
    },
  });

  // Update settings mutation
  const updateMutation = useMutation({
    mutationFn: async (newSettings: CommissionRates & { reason?: string }) => {
      const { data } = await axios.post('/finance/commissions/settings', {
        ...newSettings,
        effectiveFrom: new Date(),
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commission-settings'] });
      queryClient.invalidateQueries({ queryKey: ['commission-audit-log'] });
      setHasChanges(false);
      setSnackbar({
        open: true,
        message: 'تم حفظ إعدادات العمولات بنجاح',
        severity: 'success',
      });
    },
    onError: (error: Error | AxiosError) => {
      const errorMessage = error instanceof AxiosError
        ? error.response?.data?.message || error.message
        : error.message;
      setSnackbar({
        open: true,
        message: errorMessage || 'خطأ في حفظ إعدادات العمولات',
        severity: 'error',
      });
    },
  });

  useEffect(() => {
    if (currentSettings) {
      setSettings(currentSettings);
    }
  }, [currentSettings]);

  const handleSettingChange = (field: keyof CommissionRates, value: CommissionRates[keyof CommissionRates]) => {
    setSettings(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    updateMutation.mutate(settings);
  };

  const handleReset = () => {
    if (currentSettings) {
      setSettings(currentSettings);
      setHasChanges(false);
    }
  };

  const validateSettings = () => {
    const errors: string[] = [];

    if (settings.platformItemsCommission < 0 || settings.platformItemsCommission > 100) {
      errors.push('نسبة عمولة المنصة من العناصر يجب أن تكون بين 0 و 100');
    }

    if (settings.platformDeliveryCommission < 0 || settings.platformDeliveryCommission > 100) {
      errors.push('نسبة عمولة المنصة من التوصيل يجب أن تكون بين 0 و 100');
    }

    if (settings.driverDeliveryShare < 0 || settings.driverDeliveryShare > 100) {
      errors.push('نسبة السائق من التوصيل يجب أن تكون بين 0 و 100');
    }

    if (settings.vendorCommission < 0 || settings.vendorCommission > 100) {
      errors.push('نسبة عمولة المتجر يجب أن تكون بين 0 و 100');
    }

    if (settings.platformDeliveryCommission + settings.driverDeliveryShare !== 100) {
      errors.push('مجموع نسبة المنصة والسائق من التوصيل يجب أن يساوي 100%');
    }

    if (settings.taxEnabled && (settings.taxRate < 0 || settings.taxRate > 100)) {
      errors.push('نسبة الضريبة يجب أن تكون بين 0 و 100');
    }

    if (settings.tipsDistribution === 'split' && (!settings.tipsSplitRatio || settings.tipsSplitRatio < 0 || settings.tipsSplitRatio > 100)) {
      errors.push('نسبة تقسيم الإكرامية يجب أن تكون بين 0 و 100 عند اختيار التقسيم');
    }

    return errors;
  };

  const validationErrors = validateSettings();

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            إعدادات العمولات والتقسيم المالي
          </Typography>
          <Typography variant="body2" color="text.secondary">
            إدارة نسب العمولات والتقسيم المالي للمنصة والسائقين والمتاجر
          </Typography>
        </Box>

        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            startIcon={<HistoryIcon />}
            onClick={() => setHistoryDialog(true)}
          >
            سجل التغييرات
          </Button>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleReset}
            disabled={!hasChanges}
          >
            إعادة تعيين
          </Button>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            disabled={!hasChanges || validationErrors.length > 0 || updateMutation.isPending}
          >
            {updateMutation.isPending ? <CircularProgress size={16} /> : 'حفظ التغييرات'}
          </Button>
        </Stack>
      </Box>

      {validationErrors.length > 0 && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            يرجى تصحيح الأخطاء التالية:
          </Typography>
          <ul>
            {validationErrors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Platform Commission Settings */}
        <Grid  size={{xs: 12, md: 6}}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TrendingUpIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">
                  عمولة المنصة
                </Typography>
              </Box>

              <Stack spacing={2}>
                <TextField
                  label="نسبة المنصة من العناصر (%)"
                  type="number"
                  value={settings.platformItemsCommission}
                  onChange={(e) => handleSettingChange('platformItemsCommission', Number(e.target.value))}
                  InputProps={{ inputProps: { min: 0, max: 100 } }}
                  helperText="النسبة المئوية التي تأخذها المنصة من قيمة العناصر"
                />

                <TextField
                  label="نسبة المنصة من رسوم التوصيل (%)"
                  type="number"
                  value={settings.platformDeliveryCommission}
                  onChange={(e) => handleSettingChange('platformDeliveryCommission', Number(e.target.value))}
                  InputProps={{ inputProps: { min: 0, max: 100 } }}
                  helperText={`النسبة المتبقية (${100 - settings.platformDeliveryCommission}%) ستذهب للسائق`}
                />

                <TextField
                  label="نسبة السائق من رسوم التوصيل (%)"
                  type="number"
                  value={settings.driverDeliveryShare}
                  onChange={(e) => handleSettingChange('driverDeliveryShare', Number(e.target.value))}
                  InputProps={{ inputProps: { min: 0, max: 100 } }}
                  helperText={`النسبة المتبقية (${100 - settings.driverDeliveryShare}%) ستذهب للمنصة`}
                />

                <Divider />

                <TextField
                  label="نسبة عمولة المتجر (%)"
                  type="number"
                  value={settings.vendorCommission}
                  onChange={(e) => handleSettingChange('vendorCommission', Number(e.target.value))}
                  InputProps={{ inputProps: { min: 0, max: 100 } }}
                  helperText="النسبة المئوية التي يدفعها المتجر للمنصة من قيمة العناصر"
                />
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Tips and Tax Settings */}
        <Grid  size={{xs: 12, md: 6}}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                الإكراميات والضرائب
              </Typography>

              <Stack spacing={2}>
                <FormControl fullWidth>
                  <InputLabel>توزيع الإكراميات</InputLabel>
                  <Select
                    value={settings.tipsDistribution}
                    onChange={(e) => handleSettingChange('tipsDistribution', e.target.value)}
                  >
                    <MenuItem value="driver">كاملة للسائق</MenuItem>
                    <MenuItem value="platform">كاملة للمنصة</MenuItem>
                    <MenuItem value="split">تقسيم بين السائق والمنصة</MenuItem>
                  </Select>
                </FormControl>

                {settings.tipsDistribution === 'split' && (
                  <TextField
                    label="نسبة السائق من الإكرامية (%)"
                    type="number"
                    value={settings.tipsSplitRatio || 50}
                    onChange={(e) => handleSettingChange('tipsSplitRatio', Number(e.target.value))}
                    InputProps={{ inputProps: { min: 0, max: 100 } }}
                    helperText="النسبة المتبقية ستذهب للمنصة"
                  />
                )}

                <Divider />

                <FormControl fullWidth>
                  <InputLabel>تفعيل الضريبة</InputLabel>
                  <Select
                    value={settings.taxEnabled ? 'enabled' : 'disabled'}
                    onChange={(e) => handleSettingChange('taxEnabled', e.target.value === 'enabled')}
                  >
                    <MenuItem value="disabled">معطلة</MenuItem>
                    <MenuItem value="enabled">مفعلة</MenuItem>
                  </Select>
                </FormControl>

                {settings.taxEnabled && (
                  <>
                    <TextField
                      label="نسبة الضريبة (%)"
                      type="number"
                      value={settings.taxRate}
                      onChange={(e) => handleSettingChange('taxRate', Number(e.target.value))}
                      InputProps={{ inputProps: { min: 0, max: 100 } }}
                    />

                    <FormControl fullWidth>
                      <InputLabel>أساس حساب الضريبة</InputLabel>
                      <Select
                        value={settings.taxBase}
                        onChange={(e) => handleSettingChange('taxBase', e.target.value)}
                      >
                        <MenuItem value="subtotal">المجموع الفرعي (قبل التوصيل)</MenuItem>
                        <MenuItem value="delivery">رسوم التوصيل فقط</MenuItem>
                        <MenuItem value="total">المجموع الكلي</MenuItem>
                      </Select>
                    </FormControl>
                  </>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Preview Card */}
          <Grid  size={{xs: 12}}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                معاينة التقسيم المالي
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                مثال: طلب بقيمة 100 ريال عناصر + 30 ريال توصيل + 5 ريال إكرامية
              </Typography>

              <Grid container spacing={2} sx={{ mt: 2 }}>
                <Grid  size={{xs: 12, md: 4}}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle2" color="primary" gutterBottom>
                        المتجر
                      </Typography>
                      <Typography variant="body2">
                        صافي العناصر: {100 - (100 * settings.vendorCommission / 100)} ريال
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        عمولة المنصة: {100 * settings.vendorCommission / 100} ريال
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid  size={{xs: 12, md: 4}}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle2" color="success.main" gutterBottom>
                        السائق
                      </Typography>
                      <Typography variant="body2">
                        رسوم التوصيل: {30 * settings.driverDeliveryShare / 100} ريال
                      </Typography>
                      <Typography variant="body2">
                        الإكرامية: {settings.tipsDistribution === 'driver' ? 5 : settings.tipsDistribution === 'split' ? (5 * (settings.tipsSplitRatio || 50) / 100) : 0} ريال
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid  size={{xs: 12, md: 4}}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle2" color="warning.main" gutterBottom>
                        المنصة
                      </Typography>
                      <Typography variant="body2">
                        عمولة العناصر: {100 * settings.platformItemsCommission / 100} ريال
                      </Typography>
                      <Typography variant="body2">
                        عمولة التوصيل: {30 * settings.platformDeliveryCommission / 100} ريال
                      </Typography>
                      <Typography variant="body2">
                        الإكرامية: {settings.tipsDistribution === 'platform' ? 5 : settings.tipsDistribution === 'split' ? (5 * (100 - (settings.tipsSplitRatio || 50)) / 100) : 0} ريال
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Audit Log Dialog */}
      <Dialog open={historyDialog} onClose={() => setHistoryDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          سجل تغييرات العمولات
        </DialogTitle>
        <DialogContent>
          {auditLog.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
              لا توجد تغييرات سابقة
            </Typography>
          ) : (
            <Stack spacing={2} sx={{ mt: 1 }}>
              {auditLog.map((log: AuditLog) => (
                <Card key={log._id} variant="outlined">
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Chip
                        label={log.action}
                        size="small"
                        color={log.action === 'تعديل' ? 'warning' : 'success'}
                      />
                      <Typography variant="caption" color="text.secondary">
                        {new Date(log.changedAt).toLocaleString('ar-SA')}
                      </Typography>
                    </Box>

                    <Typography variant="body2" gutterBottom>
                      تم التعديل بواسطة: {log.changedBy}
                    </Typography>

                    {log.reason && (
                      <Typography variant="body2" color="text.secondary">
                        السبب: {log.reason}
                      </Typography>
                    )}

                    {log.oldValues && log.newValues && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          التغييرات:
                        </Typography>
                        <Grid container spacing={1}>
                          {Object.keys(log.newValues).map((key) => {
                            const oldValue = log.oldValues?.[key as keyof CommissionRates];
                            const newValue = log.newValues?.[key as keyof CommissionRates];
                            if (oldValue !== newValue) {
                              return (
                                <Grid  size={{xs: 6}} key={key}>
                                  <Typography variant="caption" display="block">
                                    {key}: {oldValue} → {newValue}
                                  </Typography>
                                </Grid>
                              );
                            }
                            return null;
                          })}
                        </Grid>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              ))}
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setHistoryDialog(false)}>إغلاق</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
