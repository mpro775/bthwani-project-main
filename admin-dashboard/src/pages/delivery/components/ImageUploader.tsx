// src/pages/admin/delivery/components/ImageUploader.tsx
import { 
  Box, 
  Typography, 
  Button, 
  useTheme,
  IconButton
} from "@mui/material";
import { AddAPhoto, Delete } from "@mui/icons-material";
import { motion } from "framer-motion";

interface Props {
  label: string;
  file: File|null;
  onChange: (f: File|null) => void;
}

export default function ImageUploader({ label, file, onChange }: Props) {
  const theme = useTheme();
  const previewUrl = file ? URL.createObjectURL(file) : null;

  return (
    <Box>
      <Typography variant="subtitle2" fontWeight="medium" mb={1}>
        {label}
      </Typography>
      
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2
        }}
      >
        {previewUrl ? (
          <Box
            sx={{
              position: 'relative',
              borderRadius: '12px',
              overflow: 'hidden',
              width: 120,
              height: 120,
              border: `2px dashed ${theme.palette.divider}`
            }}
          >
            <img
              src={previewUrl}
              alt="Preview"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
            <IconButton
              onClick={() => onChange(null)}
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                backgroundColor: theme.palette.error.main,
                color: theme.palette.error.contrastText,
                '&:hover': {
                  backgroundColor: theme.palette.error.dark,
                }
              }}
            >
              <Delete fontSize="small" />
            </IconButton>
          </Box>
        ) : (
          <motion.div whileHover={{ scale: 1.02 }}>
            <Button
              component="label"
              variant="outlined"
              startIcon={<AddAPhoto />}
              sx={{
                borderRadius: '12px',
                height: 120,
                width: 120,
                border: `2px dashed ${theme.palette.primary.main}`,
                backgroundColor: theme.palette.primary.light + '10',
                '&:hover': {
                  backgroundColor: theme.palette.primary.light + '20',
                }
              }}
            >
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={e => onChange(e.target.files?.[0] || null)}
              />
            </Button>
          </motion.div>
        )}
        
        <Typography variant="caption" color="text.secondary">
          {previewUrl ? 
            "انقر على أيقونة الحذف لإزالة الصورة" : 
            "انقر لرفع صورة (JPG, PNG)"}
        </Typography>
      </Box>
    </Box>
  );
}