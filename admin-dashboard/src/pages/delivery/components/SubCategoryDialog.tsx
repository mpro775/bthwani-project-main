// src/pages/admin/delivery/components/SubCategoryDialog.tsx
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  Button, 
  TextField,
  useTheme
} from "@mui/material";
import type { DeliveryProductSubCategory } from "../../../type/delivery";

type Props = {
  open: boolean;
  editing?: DeliveryProductSubCategory | null;
  name: string;
  onChange: (value: string) => void;
  onClose: () => void;
  onSave: () => void;
};

export default function SubCategoryDialog({
  open, editing, name, onChange, onClose, onSave
}: Props) {
  const theme = useTheme();

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      PaperProps={{
        sx: {
          borderRadius: '16px',
          minWidth: '400px'
        }
      }}
    >
      <DialogTitle sx={{ 
        borderBottom: `1px solid ${theme.palette.divider}`,
        pb: 2
      }}>
        {editing ? "تعديل الفئة" : "إضافة فئة"}
      </DialogTitle>
      <DialogContent sx={{ py: 3 }}>
        <TextField
          fullWidth
          label="اسم الفئة"
          value={name} 
          onChange={(e) => onChange(e.target.value)}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '8px'
            }
          }}
        />
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
          حفظ
        </Button>
      </DialogActions>
    </Dialog>
  );
}