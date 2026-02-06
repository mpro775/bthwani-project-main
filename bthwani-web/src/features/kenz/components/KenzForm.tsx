// مطابق لـ app-user KenzCreateScreen / KenzEditScreen
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import {
  ArrowBack,
  Add as AddIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import type { KenzItem, CreateKenzPayload, UpdateKenzPayload } from "../types";
import { KENZ_CATEGORIES, KENZ_YEMEN_CITIES, KENZ_CURRENCIES } from "../types";
import { uploadKenzImageToBunny } from "../../../utils/uploadToBunny";

const MAX_IMAGES = 8;

interface KenzFormProps {
  item?: KenzItem;
  loading?: boolean;
  onSubmit: (data: CreateKenzPayload | UpdateKenzPayload) => Promise<void>;
  onCancel?: () => void;
  mode: "create" | "edit";
  ownerId?: string;
}

const KenzForm: React.FC<KenzFormProps> = ({
  item,
  loading = false,
  onSubmit,
  onCancel,
  mode,
  ownerId = "",
}) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: undefined as number | undefined,
    category: undefined as string | undefined,
    metadata: {
      contact: "",
      location: "",
      condition: "جديد",
      brand: "",
      model: "",
      year: "",
      mileage: "",
    },
    city: undefined as string | undefined,
    keywords: [] as string[],
    currency: "ريال يمني" as string,
    quantity: 1,
    status: "draft" as string,
    postedOnBehalfOfPhone: "" as string,
    deliveryOption: undefined as "meetup" | "delivery" | "both" | undefined,
    deliveryFee: undefined as number | undefined,
  });
  const [keywordsText, setKeywordsText] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (item && mode === "edit") {
      setFormData({
        title: item.title,
        description: item.description || "",
        price: item.price,
        category: item.category,
        metadata: {
          contact: item.metadata?.contact || "",
          location: item.metadata?.location || "",
          condition: item.metadata?.condition || "جديد",
          brand: item.metadata?.brand || "",
          model: item.metadata?.model || "",
          year: item.metadata?.year || "",
          mileage: item.metadata?.mileage || "",
        },
        city: item.city,
        keywords: item.keywords || [],
        currency: item.currency ?? "ريال يمني",
        quantity: item.quantity ?? 1,
        status: item.status,
        postedOnBehalfOfPhone: item.postedOnBehalfOfPhone ?? "",
        deliveryOption: item.deliveryOption,
        deliveryFee: item.deliveryFee,
      });
      setKeywordsText((item.keywords ?? []).join("، "));
      setImageUrls(item.images ?? []);
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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const total = imageUrls.length + newFiles.length + files.length;
    if (total > MAX_IMAGES) {
      setError(`يمكنك إضافة حتى ${MAX_IMAGES} صور فقط`);
      return;
    }
    setNewFiles((prev) =>
      [...prev, ...Array.from(files)].slice(0, MAX_IMAGES - imageUrls.length)
    );
    setError(null);
  };

  const removeExistingImage = (index: number) => {
    setImageUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const removeNewFile = (index: number) => {
    setNewFiles((prev) => prev.filter((_, i) => i !== index));
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
    const qty = formData.quantity ?? 1;
    if (qty < 1) {
      setError("الكمية يجب أن تكون 1 على الأقل");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      let allImageUrls = [...imageUrls];
      if (newFiles.length > 0) {
        setUploadingImages(true);
        for (const file of newFiles) {
          const url = await uploadKenzImageToBunny(file);
          allImageUrls.push(url);
        }
        setUploadingImages(false);
      }

      const keywords = keywordsText
        .split(/[،,]/)
        .map((s) => s.trim())
        .filter(Boolean);

      const payload: CreateKenzPayload | UpdateKenzPayload = {
        title: formData.title,
        description: formData.description || undefined,
        price: formData.price,
        category: formData.category,
        metadata: {
          ...formData.metadata,
          ...(formData.metadata.brand && { brand: formData.metadata.brand }),
          ...(formData.metadata.model && { model: formData.metadata.model }),
          ...(formData.metadata.year && { year: formData.metadata.year }),
          ...(formData.metadata.mileage && {
            mileage: formData.metadata.mileage,
          }),
        },
        images: allImageUrls.length ? allImageUrls : undefined,
        city: formData.city,
        keywords: keywords.length ? keywords : undefined,
        currency: formData.currency,
        quantity: qty,
        postedOnBehalfOfPhone:
          formData.postedOnBehalfOfPhone?.trim() || undefined,
        deliveryOption: formData.deliveryOption,
        deliveryFee:
          formData.deliveryOption === "delivery" ||
          formData.deliveryOption === "both"
            ? formData.deliveryFee
            : undefined,
      };

      if (mode === "create") {
        (payload as CreateKenzPayload).ownerId = ownerId;
      }
      if (mode === "edit") {
        (payload as UpdateKenzPayload).status = formData.status as any;
      }

      await onSubmit(payload);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "حدث خطأ أثناء حفظ الإعلان"
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading && mode === "edit") {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
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
        <Typography variant="h5" fontWeight={700}>
          {mode === "create" ? "إضافة إعلان جديد" : "تعديل الإعلان"}
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
                label="عنوان الإعلان *"
                value={formData.title}
                onChange={(e) => updateForm("title", e.target.value)}
                placeholder="مثال: iPhone 14 Pro مستعمل بحالة ممتازة"
                inputProps={{ maxLength: 100 }}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="تفاصيل الإعلان"
                value={formData.description}
                onChange={(e) => updateForm("description", e.target.value)}
                placeholder="وصف تفصيلي للمنتج أو الخدمة..."
                multiline
                rows={4}
                inputProps={{ maxLength: 1000 }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth>
                <InputLabel>الفئة</InputLabel>
                <Select
                  value={formData.category || ""}
                  label="الفئة"
                  onChange={(e) =>
                    updateForm("category", e.target.value || undefined)
                  }
                >
                  <MenuItem value="">اختر الفئة</MenuItem>
                  {KENZ_CATEGORIES.map((c) => (
                    <MenuItem key={c} value={c}>
                      {c}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="السعر"
                type="number"
                value={formData.price ?? ""}
                onChange={(e) =>
                  updateForm(
                    "price",
                    e.target.value ? parseFloat(e.target.value) : undefined
                  )
                }
                placeholder="مثال: 3500"
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth>
                <InputLabel>العملة</InputLabel>
                <Select
                  value={formData.currency}
                  label="العملة"
                  onChange={(e) => updateForm("currency", e.target.value)}
                >
                  {KENZ_CURRENCIES.map((c) => (
                    <MenuItem key={c} value={c}>
                      {c}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
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
                label="الموقع"
                value={formData.metadata.location}
                onChange={(e) => updateMetadata("location", e.target.value)}
                placeholder="مثال: الرياض، حي العليا"
                inputProps={{ maxLength: 100 }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth>
                <InputLabel>المدينة</InputLabel>
                <Select
                  value={formData.city || ""}
                  label="المدينة"
                  onChange={(e) =>
                    updateForm("city", e.target.value || undefined)
                  }
                >
                  <MenuItem value="">اختر المدينة</MenuItem>
                  {KENZ_YEMEN_CITIES.map((c) => (
                    <MenuItem key={c} value={c}>
                      {c}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="نشر بالنيابة عن (رقم الهاتف)"
                value={formData.postedOnBehalfOfPhone ?? ""}
                onChange={(e) =>
                  updateForm("postedOnBehalfOfPhone", e.target.value)
                }
                placeholder="اختياري: أدخل رقم هاتف من تنشر الإعلان باسمه"
                inputProps={{ maxLength: 20 }}
                helperText="اتركه فارغاً إذا كنت تنشر الإعلان باسمك"
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth>
                <InputLabel>طريقة التسليم</InputLabel>
                <Select
                  value={formData.deliveryOption ?? ""}
                  label="طريقة التسليم"
                  onChange={(e) =>
                    updateForm("deliveryOption", e.target.value || undefined)
                  }
                >
                  <MenuItem value="">اختياري</MenuItem>
                  <MenuItem value="meetup">لقاء</MenuItem>
                  <MenuItem value="delivery">توصيل</MenuItem>
                  <MenuItem value="both">لقاء وتوصيل</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            {(formData.deliveryOption === "delivery" ||
              formData.deliveryOption === "both") && (
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="رسوم التوصيل"
                  type="number"
                  value={formData.deliveryFee ?? ""}
                  onChange={(e) =>
                    updateForm(
                      "deliveryFee",
                      e.target.value ? parseFloat(e.target.value) : undefined
                    )
                  }
                  placeholder="مثال: 500"
                />
              </Grid>
            )}

            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth>
                <InputLabel>حالة المنتج</InputLabel>
                <Select
                  value={formData.metadata.condition}
                  label="حالة المنتج"
                  onChange={(e) => updateMetadata("condition", e.target.value)}
                >
                  <MenuItem value="جديد">جديد</MenuItem>
                  <MenuItem value="مستعمل - ممتاز">مستعمل - ممتاز</MenuItem>
                  <MenuItem value="مستعمل - جيد">مستعمل - جيد</MenuItem>
                  <MenuItem value="مستعمل - مقبول">مستعمل - مقبول</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {mode === "edit" && (
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth>
                  <InputLabel>حالة الإعلان</InputLabel>
                  <Select
                    value={formData.status}
                    label="حالة الإعلان"
                    onChange={(e) => updateForm("status", e.target.value)}
                  >
                    <MenuItem value="draft">مسودة</MenuItem>
                    <MenuItem value="pending">في الانتظار</MenuItem>
                    <MenuItem value="confirmed">متاح</MenuItem>
                    <MenuItem value="completed">مباع</MenuItem>
                    <MenuItem value="cancelled">ملغي</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            )}

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="الكمية"
                type="number"
                value={formData.quantity}
                onChange={(e) =>
                  updateForm(
                    "quantity",
                    Math.max(1, parseInt(e.target.value || "1", 10) || 1)
                  )
                }
                inputProps={{ min: 1 }}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="كلمات مفتاحية"
                value={keywordsText}
                onChange={(e) => setKeywordsText(e.target.value)}
                placeholder="مفصولة بفواصل، مثال: جوال، أيفون، مستعمل"
                multiline
              />
            </Grid>

            {/* Category-specific fields */}
            {formData.category === "إلكترونيات" && (
              <>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="الماركة"
                    value={formData.metadata.brand}
                    onChange={(e) => updateMetadata("brand", e.target.value)}
                    placeholder="مثال: Apple"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="الموديل"
                    value={formData.metadata.model}
                    onChange={(e) => updateMetadata("model", e.target.value)}
                    placeholder="مثال: iPhone 14 Pro"
                  />
                </Grid>
              </>
            )}

            {formData.category === "سيارات" && (
              <>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField
                    fullWidth
                    label="الماركة"
                    value={formData.metadata.brand}
                    onChange={(e) => updateMetadata("brand", e.target.value)}
                    placeholder="مثال: Toyota"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField
                    fullWidth
                    label="سنة الصنع"
                    value={formData.metadata.year}
                    onChange={(e) => updateMetadata("year", e.target.value)}
                    placeholder="مثال: 2020"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField
                    fullWidth
                    label="عدد الكيلومترات"
                    value={formData.metadata.mileage}
                    onChange={(e) => updateMetadata("mileage", e.target.value)}
                  />
                </Grid>
              </>
            )}

            {/* Images */}
            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                صور الإعلان (حد أقصى {MAX_IMAGES})
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                {imageUrls.map((url, i) => (
                  <Box
                    key={`url-${i}`}
                    sx={{
                      position: "relative",
                      width: 80,
                      height: 80,
                    }}
                  >
                    <Box
                      component="img"
                      src={url}
                      alt=""
                      sx={{
                        width: 80,
                        height: 80,
                        borderRadius: 1,
                        objectFit: "cover",
                      }}
                    />
                    <IconButton
                      size="small"
                      onClick={() => removeExistingImage(i)}
                      sx={{
                        position: "absolute",
                        top: -8,
                        right: -8,
                        backgroundColor: "error.main",
                        color: "white",
                        "&:hover": { backgroundColor: "error.dark" },
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                ))}
                {newFiles.map((file, i) => (
                  <Box
                    key={`new-${i}`}
                    sx={{
                      position: "relative",
                      width: 80,
                      height: 80,
                    }}
                  >
                    <Box
                      component="img"
                      src={URL.createObjectURL(file)}
                      alt=""
                      sx={{
                        width: 80,
                        height: 80,
                        borderRadius: 1,
                        objectFit: "cover",
                      }}
                    />
                    <IconButton
                      size="small"
                      onClick={() => removeNewFile(i)}
                      sx={{
                        position: "absolute",
                        top: -8,
                        right: -8,
                        backgroundColor: "error.main",
                        color: "white",
                        "&:hover": { backgroundColor: "error.dark" },
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                ))}
                {imageUrls.length + newFiles.length < MAX_IMAGES && (
                  <Button
                    variant="outlined"
                    component="label"
                    sx={{
                      width: 80,
                      height: 80,
                      borderStyle: "dashed",
                    }}
                    disabled={saving || uploadingImages}
                  >
                    <AddIcon />
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      multiple
                      onChange={handleFileSelect}
                    />
                  </Button>
                )}
              </Box>
              {uploadingImages && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ mt: 1 }}
                >
                  جاري رفع الصور...
                </Typography>
              )}
            </Grid>
          </Grid>

          <Box sx={{ display: "flex", gap: 2, mt: 4 }}>
            <Button
              type="submit"
              variant="contained"
              disabled={saving || uploadingImages}
              startIcon={
                saving || uploadingImages ? (
                  <CircularProgress size={16} color="inherit" />
                ) : null
              }
            >
              {mode === "create" ? "إضافة الإعلان" : "حفظ التغييرات"}
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

export default KenzForm;
