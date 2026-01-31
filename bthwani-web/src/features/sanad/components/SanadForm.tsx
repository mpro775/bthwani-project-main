// مطابق لـ app-user SanadCreateScreen / SanadEditScreen
import React, { useState, useEffect } from "react";
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
} from "@mui/material";
import { ArrowBack, Save as SaveIcon } from "@mui/icons-material";
import {
  WorkOutline,
  Warning,
  Favorite,
  HelpOutline,
} from "@mui/icons-material";
import type { SanadItem, SanadKind } from "../types";
import type { CreateSanadPayload, UpdateSanadPayload } from "../types";

interface SanadFormProps {
  item?: SanadItem;
  loading?: boolean;
  saving?: boolean;
  onSubmit: (
    data: CreateSanadPayload | UpdateSanadPayload
  ) => Promise<void>;
  onCancel?: () => void;
  mode: "create" | "edit";
  ownerId?: string;
}

const getKindIcon = (kind: SanadKind) => {
  switch (kind) {
    case "specialist":
      return <WorkOutline />;
    case "emergency":
      return <Warning />;
    case "charity":
      return <Favorite />;
    default:
      return <HelpOutline />;
  }
};

const getKindDescription = (kind: SanadKind) => {
  switch (kind) {
    case "specialist":
      return "طلب خدمة متخصصة أو استشارة";
    case "emergency":
      return "حالة طارئة تحتاج مساعدة فورية";
    case "charity":
      return "طلب مساعدة خيرية أو تبرع";
    default:
      return "";
  }
};

const SanadForm: React.FC<SanadFormProps> = ({
  item,
  loading = false,
  saving = false,
  onSubmit,
  onCancel,
  mode,
  ownerId = "",
}) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    kind: undefined as SanadKind | undefined,
    metadata: {
      location: "",
      contact: "",
    } as Record<string, string>,
    status: "pending" as string,
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (item && mode === "edit") {
      setFormData({
        title: item.title,
        description: item.description || "",
        kind: item.kind,
        metadata: {
          location: item.metadata?.location || "",
          contact: item.metadata?.contact || "",
        },
        status: item.status,
      });
    }
  }, [item, mode]);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleMetadataChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      metadata: { ...prev.metadata, [field]: value },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError("يرجى إدخال عنوان الطلب");
      return;
    }
    if (mode === "create" && !ownerId) {
      setError("يجب تسجيل الدخول أولاً");
      return;
    }

    const metadata: Record<string, string> = {};
    if (formData.metadata.location?.trim()) metadata.location = formData.metadata.location.trim();
    if (formData.metadata.contact?.trim()) metadata.contact = formData.metadata.contact.trim();

    try {
      setError(null);
      const payload: CreateSanadPayload | UpdateSanadPayload = {
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        kind: formData.kind,
        metadata: Object.keys(metadata).length ? metadata : undefined,
      };
      if (mode === "create") {
        (payload as CreateSanadPayload).ownerId = ownerId;
        (payload as CreateSanadPayload).status = formData.status as any;
      } else if (mode === "edit") {
        (payload as UpdateSanadPayload).status = formData.status as any;
      }
      await onSubmit(payload);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "حدث خطأ أثناء حفظ الطلب"
      );
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  const kinds: SanadKind[] = ["specialist", "emergency", "charity"];

  return (
    <Box sx={{ maxWidth: 800, mx: "auto", py: 4, pb: 6 }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
        {onCancel && (
          <IconButton onClick={onCancel} sx={{ mr: 1 }}>
            <ArrowBack />
          </IconButton>
        )}
        <Typography variant="h5" fontWeight={700}>
          {mode === "create" ? "إضافة طلب جديد" : "تعديل الطلب"}
        </Typography>
      </Box>

      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          <Grid container spacing={3}>
            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                نوع الطلب *
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {kinds.map((kind) => (
                  <Paper
                    key={kind}
                    variant="outlined"
                    sx={{
                      p: 2,
                      cursor: "pointer",
                      borderWidth: 2,
                      borderColor: formData.kind === kind ? "primary.main" : "divider",
                      backgroundColor: formData.kind === kind ? "action.hover" : "transparent",
                    }}
                    onClick={() => handleInputChange("kind", kind)}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      {getKindIcon(kind)}
                      <Box>
                        <Typography variant="subtitle1" fontWeight={600}>
                          {kind === "specialist" ? "متخصص" : kind === "emergency" ? "فزعة" : "خيري"}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {getKindDescription(kind)}
                        </Typography>
                      </Box>
                    </Box>
                  </Paper>
                ))}
              </Box>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="عنوان الطلب *"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="مثال: طلب فزعة لإسعاف عاجل"
                maxLength={100}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="تفاصيل الطلب"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="وصف تفصيلي لطلبك..."
                multiline
                rows={4}
                maxLength={500}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                بيانات إضافية
              </Typography>
              <TextField
                fullWidth
                label="الموقع"
                value={formData.metadata.location}
                onChange={(e) => handleMetadataChange("location", e.target.value)}
                placeholder="مثال: الرياض، النرجس"
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="معلومات التواصل"
                value={formData.metadata.contact}
                onChange={(e) => handleMetadataChange("contact", e.target.value)}
                placeholder="رقم هاتف أو بريد إلكتروني"
              />
            </Grid>

            {mode === "edit" && (
              <Grid size={{ xs: 12 }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  حالة الطلب
                </Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                  {[
                    { key: "draft", label: "مسودة" },
                    { key: "pending", label: "في الانتظار" },
                    { key: "confirmed", label: "مؤكد" },
                    { key: "completed", label: "مكتمل" },
                    { key: "cancelled", label: "ملغي" },
                  ].map((opt) => (
                    <Button
                      key={opt.key}
                      variant={formData.status === opt.key ? "contained" : "outlined"}
                      size="small"
                      onClick={() => handleInputChange("status", opt.key)}
                    >
                      {opt.label}
                    </Button>
                  ))}
                </Box>
              </Grid>
            )}
          </Grid>

          <Box sx={{ display: "flex", gap: 2, mt: 4 }}>
            <Button
              type="submit"
              variant="contained"
              disabled={saving}
              startIcon={
                saving ? (
                  <CircularProgress size={16} color="inherit" />
                ) : (
                  <SaveIcon />
                )
              }
            >
              {mode === "create" ? "إنشاء الطلب" : "حفظ التغييرات"}
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

export default SanadForm;
