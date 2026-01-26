import React, { useState, useEffect, useCallback   } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Alert,
  Box,
  Stack,
  Divider,
  FormControlLabel,
  Switch,
  IconButton,
  Tooltip,
  Grid,
} from "@mui/material";
import {
  AttachFile as AttachFileIcon,
  Info as InfoIcon,
  AccountBalance as BalanceIcon,
} from "@mui/icons-material";

import { formatCurrency } from "../types/driverFinance";
import {
  createDriverAdjustment,
  getDriverFinanceSummary,
  type CreateAdjustmentRequest,
  type DriverFinanceSummary,
} from "../api/driverFinance";

interface BalanceAdjustDialogProps {
  open: boolean;
  onClose: () => void;
  driverId?: string;
  onSuccess?: () => void;
}

const BalanceAdjustDialog: React.FC<BalanceAdjustDialogProps> = ({
  open,
  onClose,
  driverId,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [driverSummary, setDriverSummary] =
    useState<DriverFinanceSummary | null>(null);
  const [formData, setFormData] = useState<CreateAdjustmentRequest>({
    driverId: driverId || "",
    amount: 0,
    type: "bonus",
    reason: "",
    ref: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [previewMode, setPreviewMode] = useState(false);
  const [previewResult, setPreviewResult] = useState<{
    newBalance: number;
    willBeNegative: boolean;
  } | null>(null);

  const fetchDriverSummary = useCallback(async () => {
    if (!driverId) return;

    try {
      setLoading(true);
      const summary = await getDriverFinanceSummary(driverId);

      setDriverSummary(summary);
    } catch (error) {
      console.error("خطأ في جلب بيانات السائق:", error);
    } finally {
      setLoading(false);
    }
  }, [driverId]);
  // جلب بيانات السائق عند الفتح
  useEffect(() => {
    if (open && driverId) {
      fetchDriverSummary();
    }
    }, [open, driverId , fetchDriverSummary]);

  // حساب المعاينة عند تغيير البيانات
  useEffect(() => {
    if (formData.amount > 0 && driverSummary) {
      const currentBalance = driverSummary.currentBalance;
      const newBalance =
        formData.type === "bonus"
          ? currentBalance + formData.amount
          : currentBalance - formData.amount;

      setPreviewResult({
        newBalance,
        willBeNegative: newBalance < 0,
      });
    }
  }, [formData.amount, formData.type, driverSummary]);



  // التحقق من صحة النموذج
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.driverId) {
      newErrors.driverId = "يجب اختيار السائق";
    }

    if (formData.amount <= 0) {
      newErrors.amount = "يجب إدخال مبلغ صالح أكبر من صفر";
    }

    if (!formData.reason.trim()) {
      newErrors.reason = "يجب إدخال سبب التسوية";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // حفظ التسوية
  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      await createDriverAdjustment(formData);

      // إعادة جلب بيانات السائق لتحديث الرصيد
      if (driverId) {
        await fetchDriverSummary();
      }

      onSuccess?.();
      handleClose();
    } catch (error) {
      console.error("خطأ في حفظ التسوية:", error);
      setErrors({ submit: "فشل في حفظ التسوية. يرجى المحاولة مرة أخرى." });
    } finally {
      setLoading(false);
    }
  };

  // إغلاق النافذة وإعادة تعيين البيانات
  const handleClose = () => {
    setFormData({
      driverId: driverId || "",
      amount: 0,
      type: "bonus",
      reason: "",
      ref: "",
    });
    setErrors({});
    setPreviewResult(null);
    setPreviewMode(false);
    onClose();
  };

  // تحديث الحقول
  const handleFieldChange = (
    field: keyof CreateAdjustmentRequest,
    value: unknown
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field as string]) {
      setErrors((prev) => ({ ...prev, [field as string]: "" }));
    }
  };

  // رفع المرفق
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // هنا يمكن إضافة منطق رفع الملف إلى الخادم
      // للتبسيط، سنحفظ فقط اسم الملف
      handleFieldChange("ref", file.name);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <BalanceIcon />
          تسوية رصيد سائق
        </Box>
      </DialogTitle>

      <DialogContent>
        <Stack spacing={3} sx={{ pt: 1 }}>
          {/* معلومات السائق */}
          {driverSummary && (
            <Alert severity="info">
              <Typography variant="subtitle2" gutterBottom>
                معلومات السائق الحالية:
              </Typography>
              <Box sx={{ display: "flex", gap: 3, mt: 1 }}>
                <Typography variant="body2">
                  الاسم: {driverSummary.driver.fullName}
                </Typography>
                <Typography variant="body2">
                  الرصيد الحالي: {formatCurrency(driverSummary.currentBalance)}
                </Typography>
                <Typography variant="body2">
                  الشهر الحالي: {formatCurrency(driverSummary.totalAdjustments)}
                </Typography>
              </Box>
            </Alert>
          )}

          {/* نموذج التسوية */}
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="مبلغ التسوية"
                type="number"
                value={formData.amount}
                onChange={(e) =>
                  handleFieldChange("amount", Number(e.target.value))
                }
                error={!!errors.amount}
                helperText={errors.amount}
                required
                InputProps={{
                  startAdornment: (
                    <Typography variant="body2" sx={{ mr: 1 }}>
                      ريال
                    </Typography>
                  ),
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth>
                <InputLabel>نوع التسوية</InputLabel>
                <Select
                  value={formData.type}
                  onChange={(e) => handleFieldChange("type", e.target.value)}
                  label="نوع التسوية"
                >
                  <MenuItem value={"bonus"}>إضافة إلى الرصيد (+)</MenuItem>
                  <MenuItem value={"penalty"}>خصم من الرصيد (-)</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="سبب التسوية"
                value={formData.reason}
                onChange={(e) => handleFieldChange("reason", e.target.value)}
                error={!!errors.reason}
                helperText={errors.reason}
                required
                placeholder="أدخل سبب التسوية بالتفصيل..."
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="رقم المرجع (اختياري)"
                value={formData.ref}
                onChange={(e) => handleFieldChange("ref", e.target.value)}
                helperText="رقم مرجعي داخلي للتسوية"
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Box>
                <input
                  accept="image/*,.pdf,.doc,.docx"
                  style={{ display: "none" }}
                  id="attachment-upload"
                  type="file"
                  onChange={handleFileUpload}
                />
                <label htmlFor="attachment-upload">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<AttachFileIcon />}
                    fullWidth
                  >
                    إرفاق ملف (اختياري)
                  </Button>
                </label>
                {formData.ref && (
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    الملف المرفق: {formData.ref}
                  </Typography>
                )}
              </Box>
            </Grid>
          </Grid>

          <Divider />

          {/* معاينة التأثير */}
          <Box>
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={previewMode}
                    onChange={(e) => setPreviewMode(e.target.checked)}
                  />
                }
                label="معاينة التأثير على الرصيد"
              />
              <Tooltip title="معاينة كيف ستؤثر التسوية على رصيد السائق">
                <IconButton size="small">
                  <InfoIcon />
                </IconButton>
              </Tooltip>
            </Box>

            {previewMode && previewResult && (
              <Alert
                severity={previewResult.willBeNegative ? "warning" : "info"}
                sx={{ mb: 2 }}
              >
                <Typography variant="subtitle2" gutterBottom>
                  معاينة التأثير:
                </Typography>
                <Typography variant="body2">
                  الرصيد الحالي:{" "}
                  {formatCurrency(driverSummary?.currentBalance || 0)}
                </Typography>
                <Typography variant="body2">
                  {formData.type === "bonus" ? "سيتم إضافة" : "سيتم خصم"}:{" "}
                  {formatCurrency(formData.amount)}
                </Typography>
                <Typography variant="body2" fontWeight="bold">
                  الرصيد الجديد: {formatCurrency(previewResult.newBalance)}
                </Typography>
                {previewResult.willBeNegative && (
                  <Typography variant="body2" color="error" fontWeight="bold">
                    تحذير: سيصبح الرصيد سالباً!
                  </Typography>
                )}
              </Alert>
            )}
          </Box>

          {/* رسالة خطأ عامة */}
          {errors.submit && <Alert severity="error">{errors.submit}</Alert>}
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>إلغاء</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || !formData.amount || !formData.reason.trim()}
        >
          {loading ? "حفظ..." : "حفظ التسوية"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BalanceAdjustDialog;
