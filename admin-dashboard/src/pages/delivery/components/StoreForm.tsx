// src/pages/admin/delivery/components/StoreForm.tsx
import {
  Box,
  TextField,
  MenuItem,
  Button,
  Typography,
  Switch,
  useTheme,
  FormControl,
  InputLabel,
  Select,
  FormControlLabel,
} from "@mui/material";
import FileUploader from "../../../components/FileUploader";
import WeeklySchedule from "./WeeklySchedule";
import type { Category, StoreForm_type } from "../../../type/delivery";
import { LocationOn } from "@mui/icons-material";

interface Props {
  form: StoreForm_type;
  categories: Category[];
  onChange: (f: Partial<StoreForm_type>) => void;
  onMapOpen: () => void;
}

export default function StoreForm({
  form,
  categories,
  onChange,
  onMapOpen,
}: Props) {
  const theme = useTheme();

  return (
    <Box
      component="form"
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 3,
        mt: 2,
        "& .MuiTextField-root": {
          backgroundColor: theme.palette.background.paper,
        },
      }}
    >
      {/* الصف الأول: الاسم والعنوان */}
      <Box sx={{ display: "flex", gap: 3 }}>
        <Box sx={{ width: "50%" }}>
          <TextField
            label="اسم المتجر"
            fullWidth
            value={form.name}
            onChange={(e) => onChange({ name: e.target.value })}
            variant="outlined"
            size="medium"
            InputLabelProps={{ shrink: true }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "12px",
              },
            }}
          />
        </Box>

        <Box sx={{ width: "50%" }}>
          <TextField
            label="العنوان التفصيلي"
            fullWidth
            value={form.address}
            onChange={(e) => onChange({ address: e.target.value })}
            variant="outlined"
            size="medium"
            InputLabelProps={{ shrink: true }}
          />
        </Box>
      </Box>

      {/* الصف الثاني: القسم والموقع */}
      <Box sx={{ display: "flex", gap: 3 }}>
        <Box sx={{ width: "50%" }}>
          <FormControl fullWidth>
            <InputLabel id="category-label">القسم</InputLabel>
            <Select
              labelId="category-label"
              label="القسم"
              value={form.categoryId}
              onChange={(e) =>
                onChange({ categoryId: e.target.value as string })
              }
              variant="outlined"
              sx={{
                borderRadius: "12px",
              }}
            >
              {categories.map((c) => (
                <MenuItem key={c._id} value={c._id}>
                  {c.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Box sx={{ width: "50%" }}>
          <Button
            type="button"          // ← هذا يمنعه من أن يكون submit
            fullWidth
            variant="outlined"
            startIcon={<LocationOn />}
            onClick={onMapOpen}
            sx={{
              height: "56px",
              borderRadius: "12px",
              borderColor: form.lat
                ? theme.palette.success.main
                : theme.palette.divider,
              color: form.lat
                ? theme.palette.success.main
                : theme.palette.text.secondary,
              "&:hover": {
                borderColor: theme.palette.primary.main,
              },
            }}
          >
            {form.lat && form.lng
              ? `📍 ${Number(form.lat).toFixed(4)}, ${Number(form.lng).toFixed(
                  4
                )}`
              : "اختر الموقع على الخريطة"}
          </Button>
        </Box>
      </Box>

      {/* الصف الثالث: رفع الصور */}
      <Box sx={{ display: "flex", gap: 3 }}>
        <Box sx={{ width: "50%" }}>
          <FileUploader
            label="صورة الغلاف للمتجر"
            value={form.image || undefined}
            onChange={(url) => onChange({ image: url })}
            accept="image/*"
            maxSize={5 * 1024 * 1024} // 5MB
          />
        </Box>

        <Box sx={{ width: "50%" }}>
          <FileUploader
            label="شعار المتجر"
            value={form.logo || undefined}
            onChange={(url) => onChange({ logo: url })}
            accept="image/*"
            maxSize={5 * 1024 * 1024} // 5MB
          />
        </Box>
      </Box>

      {/* حالة المتجر */}
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        p={2}
        sx={{
          borderRadius: "12px",
          backgroundColor: theme.palette.grey[100],
        }}
      >
        <Typography variant="body1" fontWeight="medium">
          حالة المتجر
        </Typography>
        <Box display="flex" alignItems="center">
          <Typography
            variant="body2"
            color={form.isActive ? "success.main" : "error.main"}
            mr={1}
          >
            {form.isActive ? "نشط" : "معطل"}
          </Typography>
          <Switch
            checked={form.isActive}
            onChange={(e) => onChange({ isActive: e.target.checked })}
            color="primary"
            sx={{
              "& .MuiSwitch-switchBase.Mui-checked": {
                color: theme.palette.success.main,
              },
              "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                backgroundColor: theme.palette.success.main,
              },
            }}
          />
        </Box>
      </Box>
<TextField
  label="نسبة العمولة (%)"
  type="number"
  value={form.commissionRate}
  onChange={e => onChange({ commissionRate: e.target.value })}
/>
<FormControlLabel
  control={
    <Switch
      checked={form.isTrending}
      onChange={e => onChange({ isTrending: e.target.checked })}
    />
  }
  label="رائج"
/>
<FormControlLabel
  control={
    <Switch
      checked={form.isFeatured}
      onChange={e => onChange({ isFeatured: e.target.checked })}
    />
  }
  label="مميز"
/>
<Select
  label="استراتيجية التسعير"
  value={form.pricingStrategyType}
  onChange={e => onChange({ pricingStrategyType: e.target.value })}
  fullWidth
>
  <MenuItem value="">افتراضي</MenuItem>
  <MenuItem value="auto">تلقائي</MenuItem>
  <MenuItem value="manual">يدوي</MenuItem>
</Select>
      {/* جدول الدوام */}
      <Box>
        <WeeklySchedule
          schedule={form.schedule}
          onChange={(sched) => onChange({ schedule: sched })}
        />
      </Box>
    </Box>
  );
}
