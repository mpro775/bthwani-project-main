// صفحة سجّل كمتبرع / ملف المتبرع - مطابق لـ app-user
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  IconButton,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
} from "@mui/material";
import { ArrowBack, Map as MapIcon } from "@mui/icons-material";
import {
  getDonorProfile,
  registerDonor,
  updateDonor,
} from "../../features/es3afni/api";
import type {
  Es3afniDonorProfile,
  RegisterDonorPayload,
  Es3afniLocation,
} from "../../features/es3afni/types";
import { BLOOD_TYPES } from "../../features/es3afni/types";
import { storage } from "../../utils/storage";

const ES3AFNI_DONOR_LOCATION_KEY = "es3afni_donor_location";

const Es3afniDonorPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [profile, setProfile] = useState<Es3afniDonorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState<RegisterDonorPayload>({
    bloodType: "O+",
    available: true,
    city: "",
    governorate: "",
  });
  const [locationData, setLocationData] = useState<
    Es3afniLocation | undefined
  >();

  // تحميل الملف أو التحضير للتسجيل
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getDonorProfile();
        if (!cancelled) {
          setProfile(data);
          setFormData({
            bloodType: data.bloodType,
            lastDonation: data.lastDonation || undefined,
            available: data.available,
            city: data.city || "",
            governorate: data.governorate || "",
          });
          if (data.location) setLocationData(data.location);
        }
      } catch (err: unknown) {
        if (!cancelled) {
          const status = (err as { response?: { status?: number } })?.response
            ?.status;
          if (status !== 404) {
            setError("فشل في تحميل ملف المتبرع");
          }
          setProfile(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // قراءة الموقع من التخزين بعد العودة من الخريطة
  useEffect(() => {
    const saved = storage.getSelectedLocation(ES3AFNI_DONOR_LOCATION_KEY);
    if (saved) {
      setLocationData({
        lat: saved.lat,
        lng: saved.lng,
        address: saved.address,
      });
      storage.clearSelectedLocation(ES3AFNI_DONOR_LOCATION_KEY);
    }
  }, [location.pathname]);

  const updateForm = (
    field: keyof RegisterDonorPayload,
    value: string | boolean | Es3afniLocation | undefined
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (field === "location" || (field as string) === "locationData") {
      setLocationData(value as Es3afniLocation | undefined);
    }
  };

  const handleSelectLocation = () => {
    navigate(
      `/select-location?storageKey=${ES3AFNI_DONOR_LOCATION_KEY}&returnTo=${encodeURIComponent(
        "/es3afni/donor"
      )}`
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.bloodType) {
      setError("يرجى اختيار فصيلة الدم");
      return;
    }
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const payload: RegisterDonorPayload = {
        bloodType: formData.bloodType,
        lastDonation: formData.lastDonation,
        available: formData.available ?? true,
        city: formData.city || undefined,
        governorate: formData.governorate || undefined,
        location: locationData,
      };
      if (profile) {
        const updated = await updateDonor(payload);
        setProfile(updated);
        setSuccess("تم تحديث ملف المتبرع بنجاح");
      } else {
        const created = await registerDonor(payload);
        setProfile(created);
        setSuccess("تم تسجيلك كمتبرع بنجاح");
      }
    } catch (err: unknown) {
      const msg = (
        err as { response?: { data?: { message?: string | string[] } } }
      )?.response?.data?.message;
      setError(Array.isArray(msg) ? msg[0] : msg || "فشل في الحفظ");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: 300,
        }}
      >
        <CircularProgress color="error" />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 600, mx: "auto", py: 2, pb: 6 }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
        <IconButton onClick={() => navigate("/es3afni")} sx={{ mr: 1 }}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h5" fontWeight={700} color="error.main">
          {profile ? "ملف المتبرع" : "سجّل كمتبرع"}
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
          {success && (
            <Alert
              severity="success"
              sx={{ mb: 2 }}
              onClose={() => setSuccess(null)}
            >
              {success}
            </Alert>
          )}

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>فصيلة الدم *</InputLabel>
            <Select
              value={formData.bloodType}
              label="فصيلة الدم *"
              onChange={(e) => updateForm("bloodType", e.target.value)}
            >
              {BLOOD_TYPES.map((bt) => (
                <MenuItem key={bt} value={bt}>
                  {bt}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControlLabel
            control={
              <Switch
                checked={formData.available ?? true}
                onChange={(e) => updateForm("available", e.target.checked)}
                color="error"
              />
            }
            label="متاح للتبرع الآن"
            sx={{ mb: 2, display: "block" }}
          />

          <TextField
            fullWidth
            label="تاريخ آخر تبرع (اختياري)"
            value={formData.lastDonation || ""}
            onChange={(e) =>
              updateForm("lastDonation", e.target.value || undefined)
            }
            placeholder="مثال: 2024-01-15"
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="المدينة"
            value={formData.city || ""}
            onChange={(e) => updateForm("city", e.target.value)}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="المحافظة"
            value={formData.governorate || ""}
            onChange={(e) => updateForm("governorate", e.target.value)}
            sx={{ mb: 2 }}
          />

          <Box sx={{ mb: 2 }}>
            <Typography
              variant="subtitle2"
              color="text.secondary"
              sx={{ mb: 1 }}
            >
              الموقع (اختياري)
            </Typography>
            {locationData?.address ? (
              <Box
                sx={{
                  p: 1.5,
                  backgroundColor: "grey.100",
                  borderRadius: 1,
                  mb: 1,
                }}
              >
                <Typography variant="body2">{locationData.address}</Typography>
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                لم يتم اختيار موقع
              </Typography>
            )}
            <Button
              variant="outlined"
              color="error"
              startIcon={<MapIcon />}
              onClick={handleSelectLocation}
              fullWidth
            >
              {locationData?.address ? "تغيير الموقع" : "اختر من الخريطة"}
            </Button>
          </Box>

          <Button
            type="submit"
            variant="contained"
            color="error"
            fullWidth
            disabled={saving}
            startIcon={
              saving ? <CircularProgress size={20} color="inherit" /> : null
            }
          >
            {profile ? "حفظ التغييرات" : "تسجيل كمتبرع"}
          </Button>
        </form>
      </Paper>
    </Box>
  );
};

export default Es3afniDonorPage;
