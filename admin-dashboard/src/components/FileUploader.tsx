// src/components/FileUploader.tsx
import React, { useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  IconButton,

  Alert,
  useTheme,
  Stack,
  CircularProgress,
} from '@mui/material';
import {
  CloudUpload,
  Delete,
  Download,
  InsertDriveFile,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { uploadFileToBunny } from '../services/uploadFileToCloudinary';

interface FileUploaderProps {
  label: string;
  value?: string; // URL الملف الحالي
  onChange: (url: string | null) => void;
  accept?: string;
  maxSize?: number; // in bytes
  uploadEndpoint?: string;
  disabled?: boolean;
  error?: string;
}

export default function FileUploader({
  label,
  value,
  onChange,
  accept = "image/*,application/pdf,.doc,.docx,.txt",
  maxSize = 10 * 1024 * 1024, // 10MB default
  disabled = false,
  error,
}: FileUploaderProps) {
  const theme = useTheme();
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [progress, setProgress] = useState(0);

  const isImage = value && value.match(/\.(jpg|jpeg|png|gif|webp)$/i);
  const isPdf = value && value.match(/\.pdf$/i);

  const handleFileSelect = useCallback(async (file: File) => {
    try {
      // تحقق من صحة الملف
      if (file.size > maxSize) {
        throw new Error(`حجم الملف كبير جداً. الحد الأقصى ${Math.round(maxSize / 1024 / 1024)}MB`);
      }

      const allowedTypes = accept.split(',').map(type => type.trim());
      if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
        throw new Error(`نوع الملف غير مسموح. الأنواع المسموحة: ${allowedTypes.join(', ')}`);
      }

      setUploading(true);
      setProgress(0);

      // ارفع الملف باستخدام خدمة Bunny
      const publicUrl = await uploadFileToBunny(file);

      // احفظ URL الملف
      onChange(publicUrl);
    } catch (error: unknown) {
      console.error('Upload error:', error);
      alert((error as Error).message || 'فشل في رفع الملف');
    } finally {
      setUploading(false);
      setProgress(0);
    }
  }, [maxSize, accept, onChange]);

  const handleFileInput = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(false);

    const file = event.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOver(false);
  }, []);

  const handleRemove = useCallback(() => {
    onChange(null);
  }, [onChange]);

  const handleDownload = useCallback(() => {
    if (value) {
      // للملفات، قم بتحميلها مباشرة
      if (!isImage) {
        const link = document.createElement('a');
        link.href = value;
        link.download = value.split('/').pop() || 'file';
        link.click();
      } else {
        // للصور، افتحها في تبويب جديد
        window.open(value, '_blank');
      }
    }
  }, [value, isImage]);

  return (
    <Box>
      <Typography variant="subtitle2" fontWeight="medium" mb={1}>
        {label}
      </Typography>

      <Box
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        sx={{
          border: `2px dashed ${dragOver ? theme.palette.primary.main : theme.palette.divider}`,
          borderRadius: 2,
          p: 3,
          textAlign: 'center',
          backgroundColor: dragOver ? theme.palette.primary.light + '10' : 'transparent',
          transition: 'all 0.3s ease',
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.6 : 1,
        }}
      >
        {value ? (
          // عرض الملف الحالي
          <Box>
            {isImage ? (
              <Box sx={{ position: 'relative', display: 'inline-block', mb: 2 }}>
                <img
                  src={value}
                  alt="صورة تم رفعها للمعاينة"
                  style={{
                    maxWidth: 200,
                    maxHeight: 200,
                    borderRadius: 8,
                    objectFit: 'cover',
                  }}
                />
                <IconButton
                  onClick={handleRemove}
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    backgroundColor: theme.palette.error.main,
                    color: theme.palette.error.contrastText,
                    '&:hover': {
                      backgroundColor: theme.palette.error.dark,
                    },
                  }}
                >
                  <Delete fontSize="small" />
                </IconButton>
              </Box>
            ) : (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 2,
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: theme.palette.action.hover,
                  },
                  p: 2,
                  borderRadius: 1,
                }}
                onClick={handleDownload}
              >
                <InsertDriveFile sx={{ fontSize: 48, color: theme.palette.primary.main, mr: 2 }} />
                <Box>
                  <Typography variant="body1">
                    {isPdf ? 'ملف PDF' : 'ملف'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    انقر للتحميل
                  </Typography>
                </Box>
                <IconButton onClick={(e) => { e.stopPropagation(); handleRemove(); }} color="error">
                  <Delete />
                </IconButton>
              </Box>
            )}

            <Stack direction="row" spacing={1} justifyContent="center">
              <Button
                variant="outlined"
                startIcon={<Download />}
                onClick={handleDownload}
                size="small"
              >
                تحميل
              </Button>
              <Button
                variant="outlined"
                startIcon={<CloudUpload />}
                onClick={() => document.getElementById(`${label}-file-input`)?.click()}
                size="small"
              >
                استبدال
              </Button>
            </Stack>
          </Box>
        ) : (
          // منطقة الرفع
          <Box>
            <motion.div whileHover={{ scale: 1.05 }}>
              <Button
                component="label"
                variant="outlined"
                startIcon={<CloudUpload />}
                disabled={disabled || uploading}
                sx={{
                  mb: 2,
                  minHeight: 120,
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                {uploading ? (
                  <>
                    <CircularProgress size={24} sx={{ mb: 1 }} />
                    <Typography variant="caption">
                      جاري الرفع... {progress}%
                    </Typography>
                  </>
                ) : (
                  <>
                    <CloudUpload sx={{ fontSize: 48, mb: 1 }} />
                    <Typography variant="body2">
                      اسحب وأفلت الملف هنا
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      أو انقر للاختيار
                    </Typography>
                  </>
                )}
                <input
                  id={`${label}-file-input`}
                  type="file"
                  accept={accept}
                  hidden
                  onChange={handleFileInput}
                  disabled={disabled || uploading}
                />
              </Button>
            </motion.div>

            <Typography variant="caption" color="text.secondary">
              أنواع الملفات المسموحة: {accept.replace(/,/g, ', ')}
            </Typography>
            <br />
            <Typography variant="caption" color="text.secondary">
              الحد الأقصى: {Math.round(maxSize / 1024 / 1024)}MB
            </Typography>
          </Box>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mt: 1 }}>
          {error}
        </Alert>
      )}
    </Box>
  );
}
