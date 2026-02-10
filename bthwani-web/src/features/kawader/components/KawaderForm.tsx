// مطابق لـ app-user KawaderCreateScreen / KawaderEditScreen
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
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import { ArrowBack, Save as SaveIcon } from "@mui/icons-material";
import type {
  KawaderItem,
  CreateKawaderPayload,
  UpdateKawaderPayload,
  KawaderOfferType,
  KawaderJobType,
} from "../types";
import { WORK_SCOPES } from "../types";

interface KawaderFormProps {
  item?: KawaderItem;
  loading?: boolean;
  saving?: boolean;
  onSubmit: (
    data: CreateKawaderPayload | UpdateKawaderPayload
  ) => Promise<void>;
  onCancel?: () => void;
  mode: "create" | "edit";
  ownerId?: string;
}

const KawaderForm: React.FC<KawaderFormProps> = ({
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
    scope: "",
    budget: "" as string | number,
    metadata: {
      experience: "",
      skills: [] as string[],
      location: "",
      contact: "",
      remote: false,
    },
    status: "draft" as string,
  });
  const [skillsInput, setSkillsInput] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (item && mode === "edit") {
      setFormData({
        title: item.title,
        description: item.description || "",
        scope: item.scope || "",
        budget: item.budget ?? "",
        offerType: item.offerType ?? "",
        jobType: item.jobType ?? "",
        location: item.location ?? "",
        salary: item.salary ?? "",
        metadata: {
          experience: item.metadata?.experience || "",
          skills: item.metadata?.skills || [],
          location: item.metadata?.location || "",
          contact: item.metadata?.contact || "",
          remote: item.metadata?.remote ?? false,
        },
        status: item.status,
      });
      setSkillsInput((item.metadata?.skills || []).join(", "));
    }
  }, [item, mode]);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleMetadataChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      metadata: { ...prev.metadata, [field]: value },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError("يرجى إدخال عنوان العرض الوظيفي");
      return;
    }
    if (mode === "create" && !ownerId) {
      setError("يجب تسجيل الدخول أولاً");
      return;
    }

    const processedSkills = skillsInput
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    try {
      setError(null);
      const numBudget = formData.budget
        ? parseFloat(String(formData.budget))
        : undefined;
      const numSalary = formData.salary
        ? parseFloat(String(formData.salary))
        : undefined;
      const payload: CreateKawaderPayload | UpdateKawaderPayload = {
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        scope: formData.scope.trim() || undefined,
        budget: numBudget,
        offerType: formData.offerType || undefined,
        jobType: formData.jobType || undefined,
        location: formData.location.trim() || undefined,
        salary: numSalary,
        metadata: {
          experience: formData.metadata.experience.trim() || undefined,
          skills: processedSkills.length ? processedSkills : undefined,
          location: formData.metadata.location.trim() || undefined,
          contact: formData.metadata.contact.trim() || undefined,
          remote: formData.metadata.remote,
        },
      };
      if (mode === "create") {
        (payload as CreateKawaderPayload).ownerId = ownerId;
        (payload as CreateKawaderPayload).status = formData.status as any;
      } else if (mode === "edit") {
        (payload as UpdateKawaderPayload).status = formData.status as any;
      }
      await onSubmit(payload);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "حدث خطأ أثناء حفظ العرض الوظيفي"
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
          {mode === "create" ? "إضافة عرض وظيفي جديد" : "تعديل العرض الوظيفي"}
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
                label="عنوان العرض الوظيفي *"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="مثال: مطور Full Stack مطلوب لمشروع تقني"
                inputProps={{ maxLength: 100 }}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="تفاصيل العرض"
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                placeholder="وصف تفصيلي للعرض الوظيفي أو الخدمة المهنية..."
                multiline
                rows={4}
                inputProps={{ maxLength: 500 }}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                نطاق العمل
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {WORK_SCOPES.map((scope) => (
                  <Chip
                    key={scope}
                    label={scope}
                    onClick={() => handleInputChange("scope", scope)}
                    color={formData.scope === scope ? "primary" : "default"}
                    variant={formData.scope === scope ? "filled" : "outlined"}
                  />
                ))}
              </Box>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                نوع العرض
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {[
                  { key: "job" as KawaderOfferType, label: "وظيفة" },
                  { key: "service" as KawaderOfferType, label: "خدمة" },
                ].map(({ key, label }) => (
                  <Chip
                    key={key}
                    label={label}
                    onClick={() => handleInputChange("offerType", key)}
                    color={formData.offerType === key ? "primary" : "default"}
                    variant={formData.offerType === key ? "filled" : "outlined"}
                  />
                ))}
              </Box>
            </Grid>

            {formData.offerType === "job" && (
              <Grid size={{ xs: 12 }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  نوع الوظيفة
                </Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                  {[
                    { key: "full_time" as KawaderJobType, label: "دوام كامل" },
                    { key: "part_time" as KawaderJobType, label: "جزئي" },
                    { key: "remote" as KawaderJobType, label: "عن بُعد" },
                  ].map(({ key, label }) => (
                    <Chip
                      key={key}
                      label={label}
                      onClick={() => handleInputChange("jobType", key)}
                      color={formData.jobType === key ? "primary" : "default"}
                      variant={formData.jobType === key ? "filled" : "outlined"}
                    />
                  ))}
                </Box>
              </Grid>
            )}

            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="الموقع"
                value={formData.location}
                onChange={(e) => handleInputChange("location", e.target.value)}
                placeholder="مثال: صنعاء، عدن"
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="الميزانية / الراتب (ريال)"
                type="number"
                value={formData.salary || formData.budget}
                onChange={(e) => {
                  const v = e.target.value ? parseFloat(e.target.value) : "";
                  handleInputChange("salary", v);
                  handleInputChange("budget", v);
                }}
                placeholder="مثال: 15000"
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                بيانات إضافية
              </Typography>
              <TextField
                fullWidth
                label="الخبرة المطلوبة"
                value={formData.metadata.experience}
                onChange={(e) =>
                  handleMetadataChange("experience", e.target.value)
                }
                placeholder="مثال: 3+ سنوات"
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="المهارات المطلوبة (مفصولة بفاصلة)"
                value={skillsInput}
                onChange={(e) => setSkillsInput(e.target.value)}
                placeholder="مثال: React, Node.js, MongoDB"
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="الموقع"
                value={formData.metadata.location}
                onChange={(e) =>
                  handleMetadataChange("location", e.target.value)
                }
                placeholder="مثال: الرياض، جدة"
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="رقم التواصل (اختياري)"
                value={formData.metadata.contact}
                onChange={(e) =>
                  handleMetadataChange("contact", e.target.value)
                }
                placeholder="+966512345678"
                sx={{ mb: 2 }}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.metadata.remote}
                    onChange={(e) =>
                      handleMetadataChange("remote", e.target.checked)
                    }
                  />
                }
                label="متاح العمل عن بعد"
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                {mode === "create" ? "الحالة الأولية" : "حالة العرض"}
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {(mode === "create"
                  ? [
                      { key: "draft", label: "مسودة" },
                      { key: "pending", label: "في الانتظار" },
                    ]
                  : [
                      { key: "draft", label: "مسودة" },
                      { key: "pending", label: "في الانتظار" },
                      { key: "confirmed", label: "مؤكد" },
                      { key: "completed", label: "مكتمل" },
                      { key: "cancelled", label: "ملغي" },
                    ]
                ).map((opt) => (
                  <Chip
                    key={opt.key}
                    label={opt.label}
                    onClick={() => handleInputChange("status", opt.key)}
                    color={formData.status === opt.key ? "primary" : "default"}
                    variant={
                      formData.status === opt.key ? "filled" : "outlined"
                    }
                  />
                ))}
              </Box>
            </Grid>
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
              {mode === "create" ? "إنشاء العرض الوظيفي" : "حفظ التغييرات"}
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

export default KawaderForm;
