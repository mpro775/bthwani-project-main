import { useState } from "react";
import {
  listSlides,
  createSlide,
  upsertSlide,
  deleteSlide,
  type OnboardingSlide,
} from "../../api/cmsApi";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { Add, Delete, Edit } from "@mui/icons-material";
import { uploadFileToBunny } from "../../services/uploadFileToCloudinary"; // أو دالة الرفع التي لديك

export default function OnboardingAdminPage() {
  const [rows, setRows] = useState<OnboardingSlide[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<OnboardingSlide | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadPct, setUploadPct] = useState<number | null>(null);

  if (loading) return <CircularProgress />;
  async function handlePickAndUpload(accept: string) {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = accept; // "application/json" للوتي أو "image/*" للصور
    input.onchange = async () => {
      const f = input.files?.[0];
      if (!f || !editing) return;
      try {
        // إن رغبت في progress استعمل دالة رفع تدعم onProgress وتحدث setUploadPct
        const url = await uploadFileToBunny(f);

        // تحديد النوع تلقائياً
        const isLottie =
          f.name.toLowerCase().endsWith(".json") ||
          f.type === "application/json";
        const mediaType: "lottie" | "image" = isLottie ? "lottie" : "image";

        setEditing((prev) => {
          if (!prev) return prev as OnboardingSlide | null;
          return { ...prev, media: { type: mediaType, url } };
        });
      } catch (e: unknown) {
        alert(e instanceof Error ? e.message : "فشل الرفع");
      } finally {
        setUploadPct(null);
      }
    };
    input.click();
  }

  async function load() {
    setLoading(true);
    try {
      const data = await listSlides();
      setRows(data);
    } finally {
      setLoading(false);
    }
  }
  

  function newSlide() {
    setEditing({
      key: "",
      order: 0,
      active: true,
      media: { type: "lottie", url: "" },
    });
    setOpen(true);
  }

  function editSlide(s: OnboardingSlide) {
    setEditing({ ...s });
    setOpen(true);
  }

  async function save() {
    if (!editing) return;
    if (editing._id) await upsertSlide(editing);
    else await createSlide(editing);
    setOpen(false);
    setEditing(null);
    load();
  }

  async function remove(id?: string) {
    if (!id) return;
    if (!confirm("تأكيد الحذف؟")) return;
    await deleteSlide(id);
    load();
  }

  return (
    <Box>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h5">Onboarding Slides</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={newSlide}>
          إضافة
        </Button>
      </Stack>

      <Grid container spacing={2}>
        {rows.map((r) => (
            <Grid  size={{xs: 12, md: 6, lg: 4}} key={r._id || r.key}>
            <Card>
              <CardHeader
                title={
                  <Typography fontWeight={600}>
                    {r.title?.ar || r.title?.en || r.key}
                  </Typography>
                }
                subheader={
                  <Chip
                    size="small"
                    label={`${r.media?.type || "-"} | ${r.order ?? 0}`}
                  />
                }
                action={
                  <Stack direction="row" spacing={1}>
                    <IconButton onClick={() => editSlide(r)}>
                      <Edit />
                    </IconButton>
                    <IconButton color="error" onClick={() => remove(r._id)}>
                      <Delete />
                    </IconButton>
                  </Stack>
                }
              />
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  {r.subtitle?.ar || r.subtitle?.en || "-"}
                </Typography>
                <Stack direction="row" alignItems="center" spacing={1} mt={1}>
                  <Typography variant="caption">Active</Typography>
                  <Switch checked={!!r.active} disabled />
                </Stack>
                <Typography variant="caption" color="text.secondary">
                  {r.media?.url}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {open && editing && (
        <Dialog
          open={open}
          onClose={() => setOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            {editing?._id ? "تحرير شريحة" : "إضافة شريحة"}
          </DialogTitle>
          <DialogContent>
            <Stack spacing={2} mt={1}>
              <TextField
                label="Key"
                value={editing.key || ""}
                onChange={(e) =>
                  setEditing((v) => ({
                    ...(v as OnboardingSlide),
                    key: e.target.value,
                  }))
                }
              />

              <Stack direction="row" spacing={2}>
                <TextField
                  fullWidth
                  label="Title (ar)"
                  value={editing.title?.ar || ""}
                  onChange={(e) =>
                    setEditing((v) => ({
                      ...(v as OnboardingSlide),
                      title: { ...(v?.title || {}), ar: e.target.value },
                    }))
                  }
                />
                <TextField
                  fullWidth
                  label="Title (en)"
                  value={editing.title?.en || ""}
                  onChange={(e) =>
                    setEditing((v) => ({
                      ...(v as OnboardingSlide),
                      title: { ...(v?.title || {}), en: e.target.value },
                    }))
                  }
                />
              </Stack>

              <Stack direction="row" spacing={2}>
                <TextField
                  fullWidth
                  label="Subtitle (ar)"
                  value={editing.subtitle?.ar || ""}
                  onChange={(e) =>
                    setEditing((v) => ({
                      ...(v as OnboardingSlide),
                      subtitle: { ...(v?.subtitle || {}), ar: e.target.value },
                    }))
                  }
                />
                <TextField
                  fullWidth
                  label="Subtitle (en)"
                  value={editing.subtitle?.en || ""}
                  onChange={(e) =>
                    setEditing((v) => ({
                      ...(v as OnboardingSlide),
                      subtitle: { ...(v?.subtitle || {}), en: e.target.value },
                    }))
                  }
                />
              </Stack>

              <Stack direction="row" spacing={2}>
                <TextField
                  select
                  SelectProps={{ native: true }}
                  label="Media Type"
                  value={editing.media?.type || "lottie"}
                  onChange={(e) =>
                    setEditing((v) => ({
                      ...(v as OnboardingSlide),
                      media: {
                        type: e.target.value as "lottie" | "image",
                        url: v?.media?.url || "",
                      },
                    }))
                  }
                >
                  <option value="lottie">lottie</option>
                  <option value="image">image</option>
                </TextField>
                <TextField
                  fullWidth
                  label="Media URL"
                  value={editing.media?.url || ""}
                  onChange={(e) =>
                    setEditing((v) => ({
                      ...(v as OnboardingSlide),
                      media: {
                        type: v?.media?.type || "lottie",
                        url: e.target.value,
                      },
                    }))
                  }
                />
              </Stack>

              <Stack direction="row" spacing={1}>
                <Button
                  variant="outlined"
                  onClick={() => handlePickAndUpload("application/json")}
                >
                  رفع Lottie (.json)
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => handlePickAndUpload("image/*")}
                >
                  رفع صورة
                </Button>
                {uploadPct !== null && (
                  <Typography variant="caption">
                    جارٍ الرفع: {uploadPct}%
                  </Typography>
                )}
              </Stack>

              {/* معاينة الميديا */}
              {editing.media?.url && (
                <Box mt={1}>
                  {editing.media.type === "image" ? (
                    <img
                      src={editing.media.url}
                      alt="preview"
                      style={{ maxWidth: 320, borderRadius: 12 }}
                    />
                  ) : (
                    <Typography variant="caption" color="text.secondary">
                      Lottie URL: {editing.media.url}
                    </Typography>
                  )}
                </Box>
              )}

              <Stack direction="row" spacing={2} alignItems="center">
                <TextField
                  label="Order"
                  type="number"
                  value={editing.order ?? 0}
                  onChange={(e) =>
                    setEditing((v) => ({
                      ...(v as OnboardingSlide),
                      order: Number(e.target.value),
                    }))
                  }
                />
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Typography>Active</Typography>
                  <Switch
                    checked={!!editing.active}
                    onChange={(_, b) =>
                      setEditing((v) => ({
                        ...(v as OnboardingSlide),
                        active: b,
                      }))
                    }
                  />
                </Stack>
              </Stack>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpen(false)}>إلغاء</Button>
            <Button variant="contained" onClick={save}>
              حفظ
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
}
