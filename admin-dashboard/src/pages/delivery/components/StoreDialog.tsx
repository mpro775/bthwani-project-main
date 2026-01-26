// src/pages/admin/delivery/components/StoreDialog.tsx
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
  useTheme,
  IconButton,
  Typography,
} from "@mui/material";
import { Close } from "@mui/icons-material";
import type {
  Category,
  DeliveryStore,
  StoreForm_type,
} from "../../../type/delivery";
import StoreForm from "./StoreForm";
import { motion } from "framer-motion";
import { useState } from "react";
import SimpleMapPicker from "../../../components/LocationPicker";

interface Props {
  open: boolean;
  editing: DeliveryStore | null;
  form: StoreForm_type;
  categories: Category[];
  onClose: () => void;
  onChange: (f: Partial<StoreForm_type>) => void;
  onSave: () => void;
  saving?: boolean;
}

export default function StoreDialog({
  open,
  editing,
  form,
  categories,
  onClose,
  onChange,
  onSave,
  saving = false,
}: Props) {
  const theme = useTheme();
  const [showMap, setShowMap] = useState(false);
  const handleMapOpen = () => setShowMap(true);
  const handleMapClose = () => setShowMap(false);
  const handleMapSelect = (lat: number, lng: number) => {
    onChange({ lat: String(lat), lng: String(lng) });
    setShowMap(false);
  };
  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "16px",
            background: theme.palette.background.paper,
          },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: `1px solid ${theme.palette.divider}`,
            pb: 2,
          }}
        >
          <Typography variant="h6" fontWeight="bold">
            {editing ? "تعديل بيانات المتجر" : "إضافة متجر جديد"}
          </Typography>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ py: 3 }}>
          <StoreForm
            form={form}
            categories={categories}
            onChange={onChange}
            onMapOpen={handleMapOpen}
          />
        </DialogContent>

        <DialogActions
          sx={{
            px: 3,
            py: 2,
            borderTop: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Button
            onClick={onClose}
            variant="outlined"
            sx={{
              borderRadius: "8px",
              px: 3,
              py: 1,
            }}
            disabled={saving}
          >
            إلغاء
          </Button>
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
            <Button
              onClick={onSave}
              variant="contained"
              disabled={saving}
              sx={{
                borderRadius: "8px",
                px: 4,
                py: 1,
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                boxShadow: "none",
                "&:hover": {
                  boxShadow: `0 4px 8px ${theme.palette.primary.main}40`,
                },
              }}
            >
              {saving ? (
                <CircularProgress size={24} color="inherit" />
              ) : editing ? (
                "حفظ التعديلات"
              ) : (
                "إضافة المتجر"
              )}
            </Button>
          </motion.div>
        </DialogActions>
      </Dialog>
      <Dialog open={showMap} onClose={handleMapClose} maxWidth="lg" fullWidth>
        <DialogTitle>اختر الموقع على الخريطة</DialogTitle>
        <DialogContent sx={{ height: 600, p: 0 }}>
          <SimpleMapPicker
            initial={
              form.lat && form.lng
                ? { lat: +form.lat, lng: +form.lng }
                : undefined
            }
            onSelect={handleMapSelect}
            onClose={handleMapClose}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
