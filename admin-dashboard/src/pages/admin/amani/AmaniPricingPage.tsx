import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Alert,
  Snackbar,
  CircularProgress,
  Stack,
} from '@mui/material';
import { Save as SaveIcon } from '@mui/icons-material';
import { getAmaniPricing, updateAmaniPricing, type AmaniPricingSettings } from '../../../api/amani';
import { AxiosError } from 'axios';

const defaultSettings: AmaniPricingSettings = {
  baseFee: 250,
  perKm: 120,
};

export default function AmaniPricingPage() {
  const [settings, setSettings] = useState<AmaniPricingSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await getAmaniPricing();
      setSettings(data);
      setHasChanges(false);
    } catch {
      setSettings(defaultSettings);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleChange = (field: keyof AmaniPricingSettings, value: number) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (settings.baseFee < 0 || settings.perKm < 0) {
      setSnackbar({
        open: true,
        message: 'القيم يجب أن تكون أكبر من أو تساوي صفر',
        severity: 'error',
      });
      return;
    }
    try {
      setSaving(true);
      await updateAmaniPricing(settings);
      setHasChanges(false);
      setSnackbar({
        open: true,
        message: 'تم حفظ إعدادات أسعار أماني بنجاح',
        severity: 'success',
      });
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>;
      setSnackbar({
        open: true,
        message: err.response?.data?.message || 'حدث خطأ أثناء الحفظ',
        severity: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  const exampleDistance = 10;
  const exampleTotal =
    settings.baseFee + settings.perKm * exampleDistance;

  if (loading) {
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
            إدارة أسعار أماني
          </Typography>
          <Typography variant="body2" color="text.secondary">
            تحديد الرسوم الأساسية وسعر الكيلومتر لخدمة النقل النسائي (أماني)
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={saving ? <CircularProgress size={16} /> : <SaveIcon />}
          onClick={handleSave}
          disabled={!hasChanges || saving}
        >
          حفظ التغييرات
        </Button>
      </Box>

      <Card sx={{ maxWidth: 480 }}>
        <CardContent>
          <Stack spacing={3}>
            <TextField
              label="الرسوم الأساسية (ريال)"
              type="number"
              value={settings.baseFee}
              onChange={(e) => handleChange('baseFee', Number(e.target.value) || 0)}
              InputProps={{ inputProps: { min: 0 } }}
              helperText="المبلغ الثابت الذي يُضاف لكل مشوار"
              fullWidth
            />
            <TextField
              label="سعر الكيلومتر (ريال)"
              type="number"
              value={settings.perKm}
              onChange={(e) => handleChange('perKm', Number(e.target.value) || 0)}
              InputProps={{ inputProps: { min: 0 } }}
              helperText="المبلغ المضاف عن كل كيلومتر مسافة"
              fullWidth
            />
            <Alert severity="info" sx={{ mt: 1 }}>
              <Typography variant="body2">
                مثال: مسافة {exampleDistance} كم ={' '}
                <strong>
                  {settings.baseFee} + ({settings.perKm} × {exampleDistance}) = {exampleTotal} ريال
                </strong>
              </Typography>
            </Alert>
          </Stack>
        </CardContent>
      </Card>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar((p) => ({ ...p, open: false }))}
        message={snackbar.message}
        ContentProps={{
          sx: {
            backgroundColor: snackbar.severity === 'error' ? 'error.main' : 'success.main',
            color: 'white',
          },
        }}
      />
    </Box>
  );
}
