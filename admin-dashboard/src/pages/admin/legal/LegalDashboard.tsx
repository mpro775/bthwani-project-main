/**
 * Legal System Dashboard
 */

import { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  IconButton,
} from '@mui/material';
import { Add, ToggleOn } from '@mui/icons-material';
import { usePrivacyPolicies, useTermsOfService, useConsentStatistics, useLegalAPI } from '@/api/legal';
import type { CreatePrivacyPolicyDto, CreateTermsOfServiceDto } from '@/types/legal';

export default function LegalDashboard() {
  const { data: privacyData, loading: privacyLoading, refetch: refetchPrivacy } = usePrivacyPolicies();
  const { data: termsData, loading: termsLoading, refetch: refetchTerms } = useTermsOfService();
  const { data: statsData } = useConsentStatistics();
  const api = useLegalAPI();

  const [openPrivacyDialog, setOpenPrivacyDialog] = useState(false);
  const [openTermsDialog, setOpenTermsDialog] = useState(false);
  const [privacyForm, setPrivacyForm] = useState<CreatePrivacyPolicyDto>({
    version: '',
    content: { ar: '', en: '' },
    effectiveDate: new Date().toISOString().split('T')[0],
  });
  const [termsForm, setTermsForm] = useState<CreateTermsOfServiceDto>({
    version: '',
    content: { ar: '', en: '' },
    effectiveDate: new Date().toISOString().split('T')[0],
  });

  const handleCreatePrivacy = async () => {
    try {
      await api.createPrivacyPolicy(privacyForm);
      refetchPrivacy();
      setOpenPrivacyDialog(false);
      setPrivacyForm({ version: '', content: { ar: '', en: '' }, effectiveDate: new Date().toISOString().split('T')[0] });
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateTerms = async () => {
    try {
      await api.createTermsOfService(termsForm);
      refetchTerms();
      setOpenTermsDialog(false);
      setTermsForm({ version: '', content: { ar: '', en: '' }, effectiveDate: new Date().toISOString().split('T')[0] });
    } catch (err) {
      console.error(err);
    }
  };

  const handleActivatePrivacy = async (id: string) => {
    try {
      await api.activatePrivacyPolicy(id);
      refetchPrivacy();
    } catch (err) {
      console.error(err);
    }
  };

  const handleActivateTerms = async (id: string) => {
    try {
      await api.activateTermsOfService(id);
      refetchTerms();
    } catch (err) {
      console.error(err);
    }
  };

  if (privacyLoading || termsLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  const privacyPolicies = privacyData?.data || [];
  const termsOfService = termsData?.data || [];
  const stats = statsData?.data;

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        النظام القانوني
      </Typography>

      {/* Statistics */}
      {stats && (
        <Grid container spacing={3} mb={3}>
          <Grid  size={{xs: 12, sm: 6, md: 3}}>
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary">إجمالي المستخدمين</Typography>
                <Typography variant="h4">{stats.totalUsers}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid  size={{xs: 12, sm: 6, md: 3}}>
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary">موافقات الخصوصية</Typography>
                <Typography variant="h4">{stats.privacyPolicyConsents}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid  size={{xs: 12, sm: 6, md: 3}}>
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary">موافقات الشروط</Typography>
                <Typography variant="h4">{stats.termsOfServiceConsents}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid  size={{xs: 12, sm: 6, md: 3}}>
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary">معدل الموافقة</Typography>
                <Typography variant="h4">{stats.consentRate.toFixed(1)}%</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      <Grid container spacing={3}>
        {/* Privacy Policies */}
        <Grid  size={{xs: 12, md: 6}}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">سياسات الخصوصية</Typography>
                <Button
                  startIcon={<Add />}
                  size="small"
                  onClick={() => setOpenPrivacyDialog(true)}
                >
                  إضافة
                </Button>
              </Box>
              <List>
                {privacyPolicies.map((policy) => (
                  <ListItem key={policy.id}>
                    <ListItemText
                      primary={`الإصدار ${policy.version}`}
                      secondary={new Date(policy.effectiveDate).toLocaleDateString('ar-SA')}
                    />
                    {policy.isActive ? (
                      <Chip label="نشط" color="success" size="small" />
                    ) : (
                      <IconButton size="small" onClick={() => handleActivatePrivacy(policy.id)}>
                        <ToggleOn />
                      </IconButton>
                    )}
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Terms of Service */}
          <Grid  size={{xs: 12, md: 6}}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">شروط الخدمة</Typography>
                <Button
                  startIcon={<Add />}
                  size="small"
                  onClick={() => setOpenTermsDialog(true)}
                >
                  إضافة
                </Button>
              </Box>
              <List>
                {termsOfService.map((terms) => (
                  <ListItem key={terms.id}>
                    <ListItemText
                      primary={`الإصدار ${terms.version}`}
                      secondary={new Date(terms.effectiveDate).toLocaleDateString('ar-SA')}
                    />
                    {terms.isActive ? (
                      <Chip label="نشط" color="success" size="small" />
                    ) : (
                      <IconButton size="small" onClick={() => handleActivateTerms(terms.id)}>
                        <ToggleOn />
                      </IconButton>
                    )}
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Privacy Policy Dialog */}
      <Dialog open={openPrivacyDialog} onClose={() => setOpenPrivacyDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>إضافة سياسة خصوصية جديدة</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="رقم الإصدار"
              value={privacyForm.version}
              onChange={(e) => setPrivacyForm({ ...privacyForm, version: e.target.value })}
              fullWidth
            />
            <TextField
              label="المحتوى (عربي)"
              value={privacyForm.content.ar}
              onChange={(e) => setPrivacyForm({ ...privacyForm, content: { ...privacyForm.content, ar: e.target.value } })}
              fullWidth
              multiline
              rows={10}
            />
            <TextField
              label="المحتوى (إنجليزي)"
              value={privacyForm.content.en}
              onChange={(e) => setPrivacyForm({ ...privacyForm, content: { ...privacyForm.content, en: e.target.value } })}
              fullWidth
              multiline
              rows={10}
            />
            <TextField
              label="تاريخ السريان"
              type="date"
              value={privacyForm.effectiveDate}
              onChange={(e) => setPrivacyForm({ ...privacyForm, effectiveDate: e.target.value })}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPrivacyDialog(false)}>إلغاء</Button>
          <Button onClick={handleCreatePrivacy} variant="contained">إضافة</Button>
        </DialogActions>
      </Dialog>

      {/* Terms Dialog */}
      <Dialog open={openTermsDialog} onClose={() => setOpenTermsDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>إضافة شروط خدمة جديدة</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="رقم الإصدار"
              value={termsForm.version}
              onChange={(e) => setTermsForm({ ...termsForm, version: e.target.value })}
              fullWidth
            />
            <TextField
              label="المحتوى (عربي)"
              value={termsForm.content.ar}
              onChange={(e) => setTermsForm({ ...termsForm, content: { ...termsForm.content, ar: e.target.value } })}
              fullWidth
              multiline
              rows={10}
            />
            <TextField
              label="المحتوى (إنجليزي)"
              value={termsForm.content.en}
              onChange={(e) => setTermsForm({ ...termsForm, content: { ...termsForm.content, en: e.target.value } })}
              fullWidth
              multiline
              rows={10}
            />
            <TextField
              label="تاريخ السريان"
              type="date"
              value={termsForm.effectiveDate}
              onChange={(e) => setTermsForm({ ...termsForm, effectiveDate: e.target.value })}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenTermsDialog(false)}>إلغاء</Button>
          <Button onClick={handleCreateTerms} variant="contained">إضافة</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

