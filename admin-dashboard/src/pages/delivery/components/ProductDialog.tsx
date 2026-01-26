// src/pages/admin/delivery/components/ProductDialog.tsx
import { 
  Box,
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  Button, 
  TextField, 
  MenuItem, 
  Switch, 
  Typography,
  useTheme
} from "@mui/material";
import { CloudUpload } from "@mui/icons-material";
import type {
  DeliveryProduct,
  DeliveryProductSubCategory
} from "../../../type/delivery";

type Form = {
  name: string;
  description: string;
  price: string;
  subCategoryId: string;
  isAvailable: boolean;
  image: File | null;
};

type Props = {
  open: boolean;
  editing?: DeliveryProduct | null;
  form: Form;
  subCategories: DeliveryProductSubCategory[];
  onChange: (upd: Partial<Form>) => void;
  onClose: () => void;
  onSave: () => void;
};

export default function ProductDialog({
  open, editing, form, subCategories,
  onChange, onClose, onSave
}: Props) {
  const theme = useTheme();

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '16px'
        }
      }}
    >
      <DialogTitle sx={{ 
        borderBottom: `1px solid ${theme.palette.divider}`,
        pb: 2
      }}>
        {editing ? "تعديل المنتج" : "إضافة منتج"}
      </DialogTitle>
      <DialogContent sx={{ py: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <TextField
            label="اسم المنتج" 
            value={form.name}
            onChange={(e) => onChange({ name: e.target.value })}
            fullWidth
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '8px'
              }
            }}
          />
          <TextField
            label="الوصف" 
            value={form.description}
            onChange={(e) => onChange({ description: e.target.value })}
            fullWidth
            multiline
            rows={3}
          />
          <TextField
            type="number" 
            label="السعر" 
            value={form.price}
            onChange={(e) => onChange({ price: e.target.value })}
            fullWidth
          />
          <TextField
            select 
            label="الفئة الداخلية" 
            value={form.subCategoryId}
            onChange={(e) => onChange({ subCategoryId: e.target.value })}
            fullWidth
          >
            {subCategories.map((s) => (
              <MenuItem key={s._id} value={s._id}>{s.name}</MenuItem>
            ))}
          </TextField>
          <Button 
            variant="outlined" 
            component="label" 
            startIcon={<CloudUpload />}
            sx={{
              borderRadius: '8px',
              py: 1.5
            }}
          >
            {form.image ? form.image.name : "تحميل صورة المنتج"}
            <input
              hidden 
              accept="image/*" 
              type="file"
              onChange={(e) => onChange({ image: e.target.files?.[0] || null })}
            />
          </Button>
          <Box 
            display="flex" 
            alignItems="center" 
            justifyContent="space-between"
            p={2}
            sx={{
              borderRadius: '8px',
              backgroundColor: theme.palette.grey[100]
            }}
          >
            <Typography>متوفر للطلب</Typography>
            <Switch
              checked={form.isAvailable}
              onChange={(e) => onChange({ isAvailable: e.target.checked })}
              color="primary"
            />
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ 
        borderTop: `1px solid ${theme.palette.divider}`,
        pt: 2,
        px: 3
      }}>
        <Button 
          onClick={onClose}
          variant="outlined"
          sx={{
            borderRadius: '8px',
            px: 3
          }}
        >
          إلغاء
        </Button>
        <Button 
          variant="contained" 
          onClick={onSave}
          sx={{
            borderRadius: '8px',
            px: 4,
            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`
          }}
        >
          {editing ? "تحديث" : "إضافة"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}