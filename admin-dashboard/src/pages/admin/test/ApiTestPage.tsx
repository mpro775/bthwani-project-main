/**
 * صفحة اختبار للـ Admin API Hook
 */

import { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
  Stack,
  Chip,
} from '@mui/material';
import { useAdminAPI } from '@/hooks/useAdminAPI';
import { ALL_ADMIN_ENDPOINTS, ENDPOINTS_STATS } from '@/config/admin-endpoints';

export default function ApiTestPage() {
  const { callEndpoint, loading, error, data } = useAdminAPI({
    onSuccess: (data) => {
      console.log('✅ API Call Success:', data);
    },
    onError: (error) => {
      console.error('❌ API Call Failed:', error);
    },
  });

  const [selectedEndpoint, setSelectedEndpoint] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<any[]>([]);

  // اختبار endpoint محدد
  async function testEndpoint(endpointId: string) {
    const endpoint = ALL_ADMIN_ENDPOINTS.find((ep) => ep.id === endpointId);

    if (!endpoint) {
      alert('Endpoint not found');
      return;
    }

    setSelectedEndpoint(endpointId);

    try {
      const result = await callEndpoint(endpoint, {
        query: {
          page: '1',
          limit: '5',
        },
      });

      setTestResults((prev) => [
        ...prev,
        {
          endpoint: endpoint.summary,
          method: endpoint.method,
          status: 'success',
          timestamp: new Date().toLocaleTimeString('ar-SA'),
          data: result,
        },
      ]);
    } catch (err) {
      setTestResults((prev) => [
        ...prev,
        {
          endpoint: endpoint.summary,
          method: endpoint.method,
          status: 'error',
          timestamp: new Date().toLocaleTimeString('ar-SA'),
          error: (err as Error).message,
        },
      ]);
    }
  }

  // اختبار جميع GET endpoints
  async function testAllGETEndpoints() {
    const getEndpoints = ALL_ADMIN_ENDPOINTS.filter(
      (ep) => ep.method === 'GET'
    ).slice(0, 5); // فقط أول 5 للاختبار

    for (const endpoint of getEndpoints) {
      await testEndpoint(endpoint.id);
      // انتظر قليلاً بين كل request
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        🧪 اختبار Admin API Hook
      </Typography>

      {/* الإحصائيات */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            📊 إحصائيات Endpoints
          </Typography>
          <Stack direction="row" spacing={2}>
            <Chip label={`الكل: ${ENDPOINTS_STATS.total}`} color="primary" />
            <Chip label={`GET: ${ENDPOINTS_STATS.byMethod.GET}`} />
            <Chip label={`POST: ${ENDPOINTS_STATS.byMethod.POST}`} />
            <Chip label={`PATCH: ${ENDPOINTS_STATS.byMethod.PATCH}`} />
            <Chip label={`DELETE: ${ENDPOINTS_STATS.byMethod.DELETE}`} />
          </Stack>
        </CardContent>
      </Card>

      {/* أزرار الاختبار السريع */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            🚀 اختبار سريع
          </Typography>
          <Stack direction="row" spacing={2} flexWrap="wrap">
            <Button
              variant="contained"
              onClick={() => testEndpoint('admin-dashboard')}
              disabled={loading}
            >
              Dashboard
            </Button>
            <Button
              variant="contained"
              onClick={() => testEndpoint('admin-drivers-all')}
              disabled={loading}
            >
              Drivers
            </Button>
            <Button
              variant="contained"
              onClick={() => testEndpoint('admin-withdrawals-all')}
              disabled={loading}
            >
              Withdrawals
            </Button>
            <Button
              variant="contained"
              color="secondary"
              onClick={testAllGETEndpoints}
              disabled={loading}
            >
              اختبار أول 5 GET Endpoints
            </Button>
          </Stack>

          {loading && (
            <Box mt={2} display="flex" alignItems="center" gap={2}>
              <CircularProgress size={20} />
              <Typography>
                جاري اختبار: {selectedEndpoint}
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* الأخطاء */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <strong>خطأ:</strong> {error.message}
        </Alert>
      )}

      {/* البيانات */}
      {data && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              ✅ آخر استجابة ناجحة
            </Typography>
            <Box
              component="pre"
              sx={{
                p: 2,
                bgcolor: 'grey.100',
                borderRadius: 1,
                overflow: 'auto',
                maxHeight: '300px',
              }}
            >
              {JSON.stringify(data, null, 2)}
            </Box>
          </CardContent>
        </Card>
      )}

      {/* نتائج الاختبارات */}
      {testResults.length > 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              📋 سجل الاختبارات ({testResults.length})
            </Typography>

            <Stack spacing={2}>
              {testResults.map((result, index) => (
                <Card
                  key={index}
                  variant="outlined"
                  sx={{
                    borderLeftWidth: 4,
                    borderLeftColor:
                      result.status === 'success' ? 'success.main' : 'error.main',
                  }}
                >
                  <CardContent>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Box>
                        <Typography variant="subtitle1">
                          {result.endpoint}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {result.method} • {result.timestamp}
                        </Typography>
                      </Box>
                      <Chip
                        label={result.status === 'success' ? '✅ نجح' : '❌ فشل'}
                        color={result.status === 'success' ? 'success' : 'error'}
                        size="small"
                      />
                    </Stack>

                    {result.error && (
                      <Alert severity="error" sx={{ mt: 1 }}>
                        {result.error}
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              ))}
            </Stack>

            <Button
              variant="outlined"
              fullWidth
              sx={{ mt: 2 }}
              onClick={() => setTestResults([])}
            >
              مسح السجل
            </Button>
          </CardContent>
        </Card>
      )}

      {/* معلومات إضافية */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            ℹ️ معلومات
          </Typography>
          <Typography variant="body2" color="text.secondary">
            • هذه الصفحة تستخدم <code>useAdminAPI</code> Hook لاختبار الـ
            endpoints
            <br />
            • جميع الـ requests تستخدم التكوين من{' '}
            <code>@/config/admin-endpoints</code>
            <br />
            • يمكنك فتح Console للاطلاع على التفاصيل الكاملة
            <br />• Base URL:{' '}
            {import.meta.env.VITE_API_BASE_URL || 'https://api.bthwani.com/api/v1'}
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}

