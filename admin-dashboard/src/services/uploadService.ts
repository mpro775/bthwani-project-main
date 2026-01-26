// src/services/uploadService.ts
import axios from '../utils/axios';

export interface UploadResult {
  uploadUrl: string;
  publicUrl: string;
  fileName: string;
}

export class UploadService {
  /**
   * احصل على توقيع للرفع المباشر
   */
  static async getUploadSignature(fileName?: string): Promise<UploadResult> {
    try {
      const response = await axios.post('/media/sign-upload', {
        fileName: fileName || `upload-${Date.now()}.jpg`,
      });
      return response.data;
    } catch (error) {
      console.error('Failed to get upload signature:', error);
      throw new Error('فشل في الحصول على توقيع الرفع');
    }
  }

  /**
   * ارفع ملف مباشرة إلى التخزين
   */
  static async uploadFile(file: File, signature: UploadResult): Promise<string> {
    try {
      await axios.put(signature.uploadUrl, file, {
        headers: {
          'Content-Type': file.type,
        },
      });
      return signature.publicUrl;
    } catch (error) {
      console.error('Failed to upload file:', error);
      throw new Error('فشل في رفع الملف');
    }
  }

  /**
   * ارفع ملف كاملاً (توقيع + رفع)
   */
  static async uploadFileComplete(file: File): Promise<string> {
    try {
      const signature = await this.getUploadSignature();
      return await this.uploadFile(file, signature);
    } catch (error) {
      console.error('Failed to upload file complete:', error);
      throw error;
    }
  }

  /**
   * احذف ملف من التخزين
   */
  static async deleteFile(fileUrl: string): Promise<void> {
    try {
      // استخراج اسم الملف من الـ URL
      const fileName = fileUrl.split('/').pop();
      if (!fileName) {
        throw new Error('Invalid file URL');
      }

      await axios.delete(`/media/delete/${fileName}`);
    } catch (error) {
      console.error('Failed to delete file:', error);
      throw new Error('فشل في حذف الملف');
    }
  }

  /**
   * تحقق من صحة الملف
   */
  static validateFile(file: File, options: {
    maxSize?: number;
    allowedTypes?: string[];
  } = {}): void {
    const { maxSize = 10 * 1024 * 1024, allowedTypes = [] } = options;

    if (file.size > maxSize) {
      throw new Error(`حجم الملف كبير جداً. الحد الأقصى ${Math.round(maxSize / 1024 / 1024)}MB`);
    }

    if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
      throw new Error(`نوع الملف غير مسموح. الأنواع المسموحة: ${allowedTypes.join(', ')}`);
    }
  }
}

export default UploadService;
