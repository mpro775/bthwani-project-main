// مطابق لـ app-user MaaroufCreateScreen / MaaroufEditScreen
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
  Chip,
} from "@mui/material";
import { ArrowBack, Save as SaveIcon } from "@mui/icons-material";
import type { MaaroufItem, MaaroufKind } from "../types";
import type { CreateMaaroufPayload, UpdateMaaroufPayload } from "../types";

interface MaaroufFormProps {
  item?: MaaroufItem;
  loading?: boolean;
  saving?: boolean;
  onSubmit: (
    data: CreateMaaroufPayload | UpdateMaaroufPayload
  ) => Promise<void>;
  onCancel?: () => void;
  mode: "create" | "edit";
  ownerId?: string;
}

const MaaroufForm: React.FC<MaaroufFormProps> = ({
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
    kind: undefined as MaaroufKind | undefined,
    tags: [] as string[],
    metadata: {
      color: "",
      location: "",
      date: "",
      contact: "",
    } as Record<string, string>,
    status: "draft" as string,
  });
  const [tagsInput, setTagsInput] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (item && mode === "edit") {
      setFormData({
        title: item.title,
        description: item.description || "",
        kind: item.kind,
        tags: item.tags || [],
        metadata: {
          color: item.metadata?.color || "",
          location: item.metadata?.location || "",
          date: item.metadata?.date || "",
          contact: item.metadata?.contact || "",
        },
        status: item.status,
      });
      setTagsInput((item.tags || []).join(", "));
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
      setError("يرجى إدخال عنوان الإعلان");
      return;
    }
    if (mode === "create" && !ownerId) {
      setError("يجب تسجيل الدخول أولاً");
      return;
    }

    const processedTags = tagsInput
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const metadata: Record<string, string> = {};
    if (formData.metadata.color?.trim()) metadata.color = formData.metadata.color.trim();
    if (formData.metadata.location?.trim()) metadata.location = formData.metadata.location.trim();
    if (formData.metadata.date?.trim()) metadata.date = formData.metadata.date.trim();
    if (formData.metadata.contact?.trim()) metadata.contact = formData.metadata.contact.trim();

    try {
      setError(null);
      const payload: CreateMaaroufPayload | UpdateMaaroufPayload = {
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        kind: formData.kind,
        tags: processedTags.length ? processedTags : undefined,
        metadata: Object.keys(metadata).length ? metadata : undefined,
      };
      if (mode === "create") {
        (payload as CreateMaaroufPayload).ownerId = ownerId;
        (payload as CreateMaaroufPayload).status = formData.status as any;
      } else if (mode === "edit") {
        (payload as UpdateMaaroufPayload).status = formData.status as any;
      }
      await onSubmit(payload);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "حدث خطأ أثناء حفظ الإعلان"
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

  return (
    <Box sx={{ maxWidth: 800, mx: "auto", py: 4, pb: 6 }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
        {onCancel && (
          <IconButton onClick={onCancel} sx={{ mr: 1 }}>
            <ArrowBack />
          </IconButton>
        )}
        <Typography variant="h5" fontWeight={700}>
          {mode === "create" ? "إضافة إعلان جديد" : "تعديل الإعلان"}
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
                نوع الإعلان *
              </Typography>
              <Box sx={{ display: "flex", gap: 2 }}>
                <Chip
                  label="مفقود"
                  onClick={() => handleInputChange("kind", "lost")}
                  color={formData.kind === "lost" ? "primary" : "default"}
                  variant={formData.kind === "lost" ? "filled" : "outlined"}
                  sx={{ borderWidth: 2, borderColor: "primary.main" }}
                />
                <Chip
                  label="موجود"
                  onClick={() => handleInputChange("kind", "found")}
                  color={formData.kind === "found" ? "primary" : "default"}
                  variant={formData.kind === "found" ? "filled" : "outlined"}
                  sx={{ borderWidth: 2, borderColor: "primary.main" }}
                />
              </Box>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="عنوان الإعلان *"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="مثال: محفظة سوداء مفقودة في منطقة النرجس"
                inputProps={{ maxLength: 100 }}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="تفاصيل الإعلان"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="وصف تفصيلي للشيء المفقود أو الموجود..."
                multiline
                rows={4}
                inputProps={{ maxLength: 500 }}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="العلامات (مفصولة بفاصلة)"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="مثال: محفظة، سوداء، بطاقات، نرجس"
              />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
                استخدم علامات لتسهيل البحث عن إعلانك
              </Typography>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                بيانات إضافية
              </Typography>
              <TextField
                fullWidth
                label="اللون"
                value={formData.metadata.color}
                onChange={(e) => handleMetadataChange("color", e.target.value)}
                placeholder="مثال: أسود، أحمر، أزرق"
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="الموقع"
                value={formData.metadata.location}
                onChange={(e) => handleMetadataChange("location", e.target.value)}
                placeholder="مثال: النرجس، الروضة"
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="التاريخ"
                value={formData.metadata.date}
                onChange={(e) => handleMetadataChange("date", e.target.value)}
                placeholder="مثال: 2024-01-15"
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
                  حالة العرض
                </Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                  {[
                    { key: "draft", label: "مسودة" },
                    { key: "pending", label: "في الانتظار" },
                    { key: "confirmed", label: "مؤكد" },
                    { key: "completed", label: "مكتمل" },
                    { key: "cancelled", label: "ملغي" },
                  ].map((opt) => (
                    <Chip
                      key={opt.key}
                      label={opt.label}
                      onClick={() => handleInputChange("status", opt.key)}
                      color={formData.status === opt.key ? "primary" : "default"}
                      variant={formData.status === opt.key ? "filled" : "outlined"}
                    />
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
              {mode === "create" ? "إنشاء الإعلان" : "حفظ التغييرات"}
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

export default MaaroufForm;
