// src/pages/admin/AppearanceSettingsPage.tsx
import  { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Divider,
  Stack,
  Chip,
  Avatar,
  IconButton,
  Tooltip,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Palette,
  ColorLens,
  Save,
  Refresh,
  Preview,
  Image,
    Brightness6,
} from '@mui/icons-material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from '../../utils/axios';

interface AppearanceSettings {
  primaryColor: string;
  secondaryColor: string;
  logo: string;
  favicon: string;
  appName: string;
  tagline: string;
  theme: 'light' | 'dark' | 'auto';
  language: 'ar' | 'en';
  enableAnimations: boolean;
  compactMode: boolean;
  fontSize: 'small' | 'medium' | 'large';
  borderRadius: 'none' | 'small' | 'medium' | 'large';
}

const defaultSettings: AppearanceSettings = {
  primaryColor: '#FF500D',
  secondaryColor: '#5D4037',
  logo: '',
  favicon: '',
  appName: 'بطواني',
  tagline: 'أفضل خدمة توصيل',
  theme: 'light',
  language: 'ar',
  enableAnimations: true,
  compactMode: false,
  fontSize: 'medium',
  borderRadius: 'medium',
};

const colorPresets = [
  { name: 'برتقالي', value: '#FF500D' },
  { name: 'أزرق', value: '#2196F3' },
  { name: 'أخضر', value: '#4CAF50' },
  { name: 'بنفسجي', value: '#9C27B0' },
  { name: 'أحمر', value: '#F44336' },
  { name: 'رمادي', value: '#607D8B' },
];

export default function AppearanceSettingsPage() {
  const queryClient = useQueryClient();
  const [settings, setSettings] = useState<AppearanceSettings>(defaultSettings);
  const [previewMode, setPreviewMode] = useState(false);

  // Fetch current settings
  const { data: currentSettings, isLoading } = useQuery({
    queryKey: ['appearanceSettings'],
    queryFn: async () => {
      const { data } = await axios.get('/admin/settings/appearance');
      return data;
    },
  });

  // Handle settings update when data changes
  useEffect(() => {
    if (currentSettings) {
      setSettings({ ...defaultSettings, ...currentSettings });
    }
  }, [currentSettings]);

  // Save settings mutation
  const saveMutation = useMutation({
    mutationFn: async (newSettings: AppearanceSettings) => {
      const { data } = await axios.put('/admin/settings/appearance', newSettings);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appearanceSettings'] });
      // Apply settings to current session
      applySettings(settings);
    },
  });

  // Apply settings to current theme
  const applySettings = (newSettings: AppearanceSettings) => {
    // Update CSS variables for real-time preview
    const root = document.documentElement;
    root.style.setProperty('--primary-color', newSettings.primaryColor);
    root.style.setProperty('--secondary-color', newSettings.secondaryColor);

    // Store in localStorage for persistence
    localStorage.setItem('appearanceSettings', JSON.stringify(newSettings));
  };

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('appearanceSettings');
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      setSettings({ ...defaultSettings, ...parsed });
    }
  }, []);

  const handleSave = () => {
    saveMutation.mutate(settings);
  };

  const handleReset = () => {
    setSettings(defaultSettings);
    localStorage.removeItem('appearanceSettings');
  };

  const handlePreview = () => {
    setPreviewMode(!previewMode);
    if (!previewMode) {
      applySettings(settings);
    } else {
      // Reset preview
      applySettings(currentSettings || defaultSettings);
    }
  };

  const updateSetting = (key: keyof AppearanceSettings, value: AppearanceSettings[keyof AppearanceSettings]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          إعدادات المظهر والتصميم
        </Typography>

        <Stack direction="row" spacing={1}>
          <Tooltip title="معاينة التغييرات">
            <IconButton
              onClick={handlePreview}
              color={previewMode ? 'primary' : 'default'}
            >
              <Preview />
            </IconButton>
          </Tooltip>

          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={handleReset}
          >
            إعادة تعيين
          </Button>

          <Button
            variant="contained"
            startIcon={<Save />}
            onClick={handleSave}
            disabled={saveMutation.isPending}
          >
            {saveMutation.isPending ? <CircularProgress size={16} /> : 'حفظ التغييرات'}
          </Button>
        </Stack>
      </Box>

      {saveMutation.isSuccess && (
        <Alert severity="success" sx={{ mb: 2 }}>
          تم حفظ الإعدادات بنجاح!
        </Alert>
      )}

      {saveMutation.isError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          حدث خطأ أثناء حفظ الإعدادات
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Brand Settings */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <Image sx={{ mr: 1, verticalAlign: 'middle' }} />
                الهوية والعلامة التجارية
              </Typography>

              <Stack spacing={2}>
                <TextField
                  fullWidth
                  label="اسم التطبيق"
                  value={settings.appName}
                  onChange={(e) => updateSetting('appName', e.target.value)}
                />

                <TextField
                  fullWidth
                  label="الشعار الفرعي"
                  value={settings.tagline}
                  onChange={(e) => updateSetting('tagline', e.target.value)}
                />

                <TextField
                  fullWidth
                  label="رابط الشعار"
                  value={settings.logo}
                  onChange={(e) => updateSetting('logo', e.target.value)}
                  placeholder="https://example.com/logo.png"
                />

                <TextField
                  fullWidth
                  label="رابط الأيقونة المفضلة"
                  value={settings.favicon}
                  onChange={(e) => updateSetting('favicon', e.target.value)}
                  placeholder="https://example.com/favicon.ico"
                />
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Color Settings */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <Palette sx={{ mr: 1, verticalAlign: 'middle' }} />
                الألوان والثيم
              </Typography>

              <Stack spacing={2}>
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    اللون الأساسي
                  </Typography>
                  <Grid container spacing={1}>
                    {colorPresets.map((color) => (
                      <Grid key={color.value}>
                        <Tooltip title={color.name}>
                          <Avatar
                            sx={{
                              bgcolor: color.value,
                              width: 32,
                              height: 32,
                              cursor: 'pointer',
                              border: settings.primaryColor === color.value ? '3px solid #000' : '1px solid #ccc',
                            }}
                            onClick={() => updateSetting('primaryColor', color.value)}
                          />
                        </Tooltip>
                      </Grid>
                    ))}
                  </Grid>
                  <TextField
                    fullWidth
                    type="color"
                    label="لون مخصص"
                    value={settings.primaryColor}
                    onChange={(e) => updateSetting('primaryColor', e.target.value)}
                    sx={{ mt: 1 }}
                  />
                </Box>

                <TextField
                  fullWidth
                  type="color"
                  label="اللون الثانوي"
                  value={settings.secondaryColor}
                  onChange={(e) => updateSetting('secondaryColor', e.target.value)}
                />

                <FormControl fullWidth>
                  <InputLabel>الثيم</InputLabel>
                  <Select
                    value={settings.theme}
                    onChange={(e) => updateSetting('theme', e.target.value)}
                    label="الثيم"
                  >
                    <MenuItem value="light">فاتح</MenuItem>
                    <MenuItem value="dark">داكن</MenuItem>
                    <MenuItem value="auto">تلقائي</MenuItem>
                  </Select>
                </FormControl>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Interface Settings */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <ColorLens sx={{ mr: 1, verticalAlign: 'middle' }} />
                إعدادات الواجهة
              </Typography>

              <Stack spacing={2}>
                <FormControl fullWidth>
                  <InputLabel>اللغة</InputLabel>
                  <Select
                    value={settings.language}
                    onChange={(e) => updateSetting('language', e.target.value)}
                    label="اللغة"
                  >
                    <MenuItem value="ar">العربية</MenuItem>
                    <MenuItem value="en">English</MenuItem>
                  </Select>
                </FormControl>

                <FormControl fullWidth>
                  <InputLabel>حجم الخط</InputLabel>
                  <Select
                    value={settings.fontSize}
                    onChange={(e) => updateSetting('fontSize', e.target.value)}
                    label="حجم الخط"
                  >
                    <MenuItem value="small">صغير</MenuItem>
                    <MenuItem value="medium">متوسط</MenuItem>
                    <MenuItem value="large">كبير</MenuItem>
                  </Select>
                </FormControl>

                <FormControl fullWidth>
                  <InputLabel>انحناء الحواف</InputLabel>
                  <Select
                    value={settings.borderRadius}
                    onChange={(e) => updateSetting('borderRadius', e.target.value)}
                    label="انحناء الحواف"
                  >
                    <MenuItem value="none">بدون انحناء</MenuItem>
                    <MenuItem value="small">صغير</MenuItem>
                    <MenuItem value="medium">متوسط</MenuItem>
                    <MenuItem value="large">كبير</MenuItem>
                  </Select>
                </FormControl>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Preferences */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <Brightness6 sx={{ mr: 1, verticalAlign: 'middle' }} />
                التفضيلات
              </Typography>

              <Stack spacing={2}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.enableAnimations}
                      onChange={(e) => updateSetting('enableAnimations', e.target.checked)}
                    />
                  }
                  label="تفعيل الحركات المتحركة"
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.compactMode}
                      onChange={(e) => updateSetting('compactMode', e.target.checked)}
                    />
                  }
                  label="وضع مضغوط"
                />

                <Divider sx={{ my: 2 }} />

                <Typography variant="body2" color="text.secondary">
                  هذه الإعدادات ستُطبق على جميع التطبيقات والمنصات خلال 5 دقائق من الحفظ
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Preview Section */}
      {previewMode && (
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              معاينة التغييرات
            </Typography>

            <Box sx={{
              p: 3,
              bgcolor: settings.theme === 'dark' ? '#333' : '#f5f5f5',
              borderRadius: 1,
              color: settings.theme === 'dark' ? '#fff' : '#000',
            }}>
              <Typography variant="h5" sx={{ color: settings.primaryColor }}>
                {settings.appName}
              </Typography>
              <Typography variant="body1" sx={{ mt: 1 }}>
                {settings.tagline}
              </Typography>

              <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                <Chip label="عينة" sx={{ bgcolor: settings.primaryColor, color: 'white' }} />
                <Chip label="معاينة" variant="outlined" sx={{ borderColor: settings.secondaryColor }} />
              </Stack>
            </Box>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
