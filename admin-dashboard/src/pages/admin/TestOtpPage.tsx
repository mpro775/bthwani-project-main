import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  Alert,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Chip,
} from '@mui/material';
import { Send as SendIcon, CheckCircle as SuccessIcon } from '@mui/icons-material';

interface TestOtpResult {
  success: boolean;
  message: string;
  otp?: string;
  channel: string;
}

export default function TestOtpPage() {
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [channel, setChannel] = useState<'email' | 'sms' | 'whatsapp'>('email');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TestOtpResult | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!phone && !email) {
      setResult({
        success: false,
        message: 'يرجى إدخال رقم الهاتف أو البريد الإلكتروني',
        channel: channel
      });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const payload = channel === 'email'
        ? { email, userId: 'test-user' }
        : { phone: phone.startsWith('+966') ? phone : `+966${phone}`, userId: 'test-user' };

      const response = await fetch(`/api/v1/test/otp/${channel}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      setResult({
        success: data.success,
        message: data.message,
        otp: data.otp,
        channel
      });
      } catch {
      setResult({
        success: false,
        message: 'فشل في إرسال OTP',
        channel
      });
    } finally {
      setLoading(false);
    }
  };

  const getChannelLabel = (ch: string) => {
    switch (ch) {
      case 'email': return 'البريد الإلكتروني';
      case 'sms': return 'الرسائل النصية';
      case 'whatsapp': return 'واتساب';
      default: return ch;
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        اختبار إرسال OTP
      </Typography>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        اختبر إرسال رموز التحقق عبر القنوات المختلفة
      </Typography>

      <Card>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid size={{xs: 12}}>
                <FormControl fullWidth>
                  <InputLabel>قناة الإرسال</InputLabel>
                  <Select
                    value={channel}
                    label="قناة الإرسال"
                    onChange={(e) => setChannel(e.target.value as 'email' | 'sms' | 'whatsapp')}
                  >
                    <MenuItem value="email">البريد الإلكتروني</MenuItem>
                    <MenuItem value="sms">الرسائل النصية (SMS)</MenuItem>
                    <MenuItem value="whatsapp">واتساب</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {channel === 'email' ? (
                <Grid size={{xs: 12}}>
                  <TextField
                    fullWidth
                    label="البريد الإلكتروني"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="test@example.com"
                    required
                  />
                </Grid>
              ) : (
                <Grid size={{xs: 12}}>
                  <TextField
                    fullWidth
                    label="رقم الهاتف"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="501234567"
                    helperText="رقم الهاتف بدون رمز البلد (+966)"
                    required
                  />
                </Grid>
              )}

              <Grid size={{xs: 12}}>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<SendIcon />}
                  disabled={loading || (!email && !phone)}
                  fullWidth
                >
                  {loading ? 'جارٍ الإرسال...' : `إرسال OTP عبر ${getChannelLabel(channel)}`}
                </Button>
              </Grid>
            </Grid>
          </form>

          {result && (
            <Alert
              severity={result.success ? 'success' : 'error'}
              sx={{ mt: 3 }}
              icon={result.success ? <SuccessIcon /> : undefined}
            >
              <Typography variant="body2">
                {result.message}
              </Typography>
              {result.otp && (
                <Typography variant="body2" sx={{ mt: 1, fontFamily: 'monospace' }}>
                  رمز OTP: <strong>{result.otp}</strong>
                </Typography>
              )}
              <Chip
                label={`قناة: ${getChannelLabel(result.channel)}`}
                size="small"
                sx={{ mt: 1 }}
              />
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            تعليمات الاختبار
          </Typography>
          <Stack spacing={1}>
            <Typography variant="body2">
              • اختر القناة المطلوب اختبارها
            </Typography>
            <Typography variant="body2">
              • أدخل البريد الإلكتروني أو رقم الهاتف الصحيح
            </Typography>
            <Typography variant="body2">
              • رمز OTP سيظهر في النتيجة للمقارنة
            </Typography>
            <Typography variant="body2" color="warning.main">
              • تأكد من ضبط متغيرات البيئة المطلوبة في الخادم
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
