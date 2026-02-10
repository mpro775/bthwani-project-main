// مطابق لـ app-user Es3afniCreateScreen / Es3afniEditScreen
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  IconButton,
  Grid,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { ArrowBack, Map as MapIcon } from "@mui/icons-material";
import type {
  Es3afniItem,
  CreateEs3afniPayload,
  UpdateEs3afniPayload,
  Es3afniLocation,
} from "../types";
import { BLOOD_TYPES, URGENCY_LEVELS, URGENCY_LABELS } from "../types";
import { storage } from "../../../utils/storage";

interface Es3afniFormProps {
  item?: Es3afniItem;
  loading?: boolean;
  onSubmit: (
    data: CreateEs3afniPayload | UpdateEs3afniPayload
  ) => Promise<void>;
  onCancel?: () => void;
  mode: "create" | "edit";
  ownerId?: string;
}

const ES3AFNI_STORAGE_KEY = "es3afni_location";

const Es3afniForm: React.FC<Es3afniFormProps> = ({
  item,
  loading = false,
  onSubmit,
  onCancel,
  mode,
  ownerId = "",
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    bloodType: undefined as string | undefined,
    urgency: "normal" as string,
    location: undefined as Es3afniLocation | undefined,
    metadata: {
      contact: "",
      unitsNeeded: undefined as number | undefined,
    },
    status: "draft" as string,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // قراءة الموقع من التخزين بعد العودة من الخريطة
  useEffect(() => {
    const saved = storage.getSelectedLocation(ES3AFNI_STORAGE_KEY);
    if (saved) {
      setFormData((prev) => ({
        ...prev,
        location: {
          lat: saved.lat,
          lng: saved.lng,
          address: saved.address,
        },
      }));
      storage.clearSelectedLocation(ES3AFNI_STORAGE_KEY);
    }
  }, [location.pathname]);

  useEffect(() => {
    if (item && mode === "edit") {
      setFormData({
        title: item.title,
        description: item.description || "",
        bloodType: item.bloodType,
        urgency: (item as { urgency?: string }).urgency || "normal",
        location: item.location,
        metadata: {
          contact: item.metadata?.contact || "",
          unitsNeeded: item.metadata?.unitsNeeded,
        },
        status: item.status,
      });
    }
  }, [item, mode]);

  const updateForm = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const updateMetadata = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      metadata: { ...prev.metadata, [field]: value },
    }));
  };

  const handleSelectLocation = () => {
    const returnPath =
      mode === "create" ? "/es3afni/new" : `/es3afni/${item?._id}/edit`;
    navigate(
      `/select-location?storageKey=${ES3AFNI_STORAGE_KEY}&returnTo=${encodeURIComponent(
        returnPath
      )}`
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError("يرجى إدخال عنوان طلب التبرع");
      return;
    }
    if (mode === "create" && !ownerId) {
      setError("يجب تسجيل الدخول أولاً");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const payload: CreateEs3afniPayload | UpdateEs3afniPayload = {
        title: formData.title,
        description: formData.description || undefined,
        bloodType: formData.bloodType,
        urgency: formData.urgency,
        location: formData.location,
        metadata: {
          contact: formData.metadata.contact || undefined,
          unitsNeeded: formData.metadata.unitsNeeded,
        },
      };
      if (mode === "create") {
        (payload as CreateEs3afniPayload).ownerId = ownerId;
      }
      if (mode === "edit") {
        (payload as UpdateEs3afniPayload).status = formData.status as any;
      }
      await onSubmit(payload);
    } catch (err) {
      setError(err instanceof Error ? err.message : "حدث خطأ أثناء حفظ الطلب");
    } finally {
      setSaving(false);
    }
  };

  if (loading && mode === "edit") {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress color="error" />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 800, mx: "auto", py: 2, pb: 6 }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
        {onCancel && (
          <IconButton onClick={onCancel} sx={{ mr: 1 }}>
            <ArrowBack />
          </IconButton>
        )}
        <Typography variant="h5" fontWeight={700} color="error.main">
          {mode === "create" ? "إنشاء طلب تبرع" : "تعديل الطلب"}
        </Typography>
      </Box>

      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          {error && (
            <Alert
              severity="error"
              sx={{ mb: 2 }}
              onClose={() => setError(null)}
            >
              {error}
            </Alert>
          )}

          <Grid container spacing={3}>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="عنوان طلب التبرع *"
                value={formData.title}
                onChange={(e) => updateForm("title", e.target.value)}
                placeholder="مثال: حاجة عاجلة لفصيلة O+ في الرياض"
                inputProps={{ maxLength: 100 }}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="تفاصيل طلب التبرع"
                value={formData.description}
                onChange={(e) => updateForm("description", e.target.value)}
                placeholder="وصف تفصيلي للحاجة والحالة الطبية..."
                multiline
                rows={3}
                inputProps={{ maxLength: 500 }}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <FormControl fullWidth>
                <InputLabel>فصيلة الدم المطلوبة</InputLabel>
                <Select
                  value={formData.bloodType || ""}
                  label="فصيلة الدم المطلوبة"
                  onChange={(e) =>
                    updateForm("bloodType", e.target.value || undefined)
                  }
                >
                  <MenuItem value="">اختر فصيلة الدم</MenuItem>
                  {BLOOD_TYPES.map((bt) => (
                    <MenuItem key={bt} value={bt}>
                      {bt} {["O-", "AB-", "B-"].includes(bt) ? "(نادرة)" : ""}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                الموقع
              </Typography>
              {formData.location?.address ? (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    p: 2,
                    backgroundColor: "grey.100",
                    borderRadius: 1,
                    mb: 1,
                  }}
                >
                  <Typography variant="body2" sx={{ flex: 1 }}>
                    {formData.location.address}
                  </Typography>
                </Box>
              ) : (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 1 }}
                >
                  لم يتم اختيار موقع بعد
                </Typography>
              )}
              <Button
                variant="contained"
                color="error"
                startIcon={<MapIcon />}
                onClick={handleSelectLocation}
                fullWidth
              >
                {formData.location?.address
                  ? "تغيير الموقع من الخريطة"
                  : "اختر من الخريطة"}
              </Button>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="رقم التواصل"
                value={formData.metadata.contact}
                onChange={(e) => updateMetadata("contact", e.target.value)}
                placeholder="مثال: +9665XXXXXXXX"
                inputProps={{ maxLength: 20 }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="عدد الوحدات المطلوبة"
                type="number"
                value={formData.metadata.unitsNeeded ?? ""}
                onChange={(e) =>
                  updateMetadata(
                    "unitsNeeded",
                    e.target.value ? parseInt(e.target.value, 10) : undefined
                  )
                }
                placeholder="مثال: 3"
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth>
                <InputLabel>درجة الاستعجال</InputLabel>
                <Select
                  value={formData.urgency}
                  label="درجة الاستعجال"
                  onChange={(e) => updateForm("urgency", e.target.value)}
                >
                  {URGENCY_LEVELS.map((u) => (
                    <MenuItem key={u} value={u}>
                      {URGENCY_LABELS[u]}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {mode === "edit" && (
              <Grid size={{ xs: 12 }}>
                <FormControl fullWidth>
                  <InputLabel>حالة الطلب</InputLabel>
                  <Select
                    value={formData.status}
                    label="حالة الطلب"
                    onChange={(e) => updateForm("status", e.target.value)}
                  >
                    <MenuItem value="draft">مسودة</MenuItem>
                    <MenuItem value="pending">في الانتظار</MenuItem>
                    <MenuItem value="confirmed">مؤكد</MenuItem>
                    <MenuItem value="completed">مكتمل</MenuItem>
                    <MenuItem value="cancelled">ملغي</MenuItem>
                    <MenuItem value="expired">منتهي</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            )}
          </Grid>

          <Box sx={{ display: "flex", gap: 2, mt: 4 }}>
            <Button
              type="submit"
              variant="contained"
              color="error"
              disabled={saving}
              startIcon={
                saving ? <CircularProgress size={16} color="inherit" /> : null
              }
            >
              {mode === "create" ? "إنشاء طلب التبرع" : "حفظ التغييرات"}
            </Button>
            {onCancel && (
              <Button variant="outlined" onClick={onCancel} disabled={saving}>
                إلغاء
              </Button>
            )}
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default Es3afniForm;
