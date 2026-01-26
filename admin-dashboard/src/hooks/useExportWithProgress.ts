import { useState, useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';

export interface ExportProgress {
  stage: 'preparing' | 'processing' | 'generating' | 'downloading' | 'completed' | 'error';
  progress: number;
  message: string;
  estimatedTime?: number;
  currentRecord?: number;
  totalRecords?: number;
}

export interface UseExportOptions {
  onProgress?: (progress: ExportProgress) => void;
  onComplete?: (filename: string) => void;
  onError?: (error: Error) => void;
  showNotifications?: boolean;
}

export function useExportWithProgress(options: UseExportOptions = {}) {
  const [exportProgress, setExportProgress] = useState<ExportProgress>({
    stage: 'preparing',
    progress: 0,
    message: 'جاري التحضير...'
  });


  const exportMutation = useMutation({
    mutationFn: async (params: {
      reportType: string;
      exportFunction: () => Promise<Blob>;
      filename: string;
    }) => {
      const { exportFunction, filename } = params;

      // تحديث حالة البداية
      setExportProgress({
        stage: 'preparing',
        progress: 0,
        message: 'جاري التحضير للتصدير...'
      });
      options.onProgress?.(exportProgress);

      // انتظار قصير لإظهار حالة التحضير
      await new Promise(resolve => setTimeout(resolve, 500));

      // بدء المعالجة
      setExportProgress({
        stage: 'processing',
        progress: 10,
        message: 'جاري معالجة البيانات...'
      });
      options.onProgress?.(exportProgress);

      // استدعاء دالة التصدير
      const blob = await exportFunction();

      // تحديث حالة التوليد
      setExportProgress({
        stage: 'generating',
        progress: 60,
        message: 'جاري توليد الملف...',
        estimatedTime: 2000
      });
      options.onProgress?.(exportProgress);

      // انتظار توليد الملف
      await new Promise(resolve => setTimeout(resolve, 1000));

      // تحديث حالة التحميل
      setExportProgress({
        stage: 'downloading',
        progress: 90,
        message: 'جاري تحضير التحميل...'
      });
      options.onProgress?.(exportProgress);

      // إنشاء رابط التحميل
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      // تحديث حالة الإكمال
      setExportProgress({
        stage: 'completed',
        progress: 100,
        message: 'تم التصدير بنجاح!'
      });
      options.onProgress?.(exportProgress);

      options.onComplete?.(filename);

      if (options.showNotifications !== false) {
        toast.success(`تم تصدير ${filename} بنجاح!`);
      }

      return { filename, size: blob.size };
    },
    onError: (error: Error) => {
      setExportProgress({
        stage: 'error',
        progress: 0,
        message: 'فشل في التصدير: ' + error.message
      });
      options.onProgress?.(exportProgress);

      options.onError?.(error);

      if (options.showNotifications !== false) {
        toast.error('فشل في تصدير التقرير: ' + error.message);
      }
    }
  });

  const exportWithProgress = useCallback(async (
    exportFunction: () => Promise<Blob>,
    filename: string,
    reportType?: string
  ) => {
    await exportMutation.mutateAsync({
      reportType: reportType || 'report',
      exportFunction,
      filename
    });
  }, [exportMutation]);

  const resetProgress = useCallback(() => {
    setExportProgress({
      stage: 'preparing',
      progress: 0,
      message: 'جاري التحضير...'
    });
  }, []);

  return {
    exportWithProgress,
    exportProgress,
    isExporting: exportMutation.isPending,
    exportError: exportMutation.error,
    resetProgress
  };
}

export default useExportWithProgress;
