import { api } from '../services/api';

// أنواع البيانات
export interface AdminUser {
  _id: string;
  username: string;
  roles: string[];
  permissions: Record<string, {
    view?: boolean;
    create?: boolean;
    edit?: boolean;
    delete?: boolean;
    approve?: boolean;
    export?: boolean;
  }>;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
  isActive: boolean;
}

export interface CreateAdminRequest {
  name: string;
  email: string;
  password: string;
  roles?: string[];
  permissions?: Record<string, unknown>;
}

export interface UpdateAdminRequest {
  name?: string;
  email?: string;
  roles?: string[];
  permissions?: Record<string, unknown>;
  isActive?: boolean;
}

// جلب قائمة المسؤولين
export const getAdmins = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  isActive?: boolean;
}): Promise<{
  admins: AdminUser[];
  total: number;
  page: number;
  totalPages: number;
}> => {
  try {
    const mapped = {
      q: params?.search,
      page: params?.page,
      per_page: params?.limit,
      // filters إضافية عند الحاجة
    };
    const response = await api.get('/admin/users', { params: mapped });
    return response.data;
  } catch (error) {
    console.error('خطأ في جلب المسؤولين:', error);
    throw error;
  }
};

// إنشاء مسؤول جديد
export const createAdmin = async (data: CreateAdminRequest): Promise<AdminUser> => {
  try {
    const response = await api.post('/admin/users', data);
    return response.data;
  } catch (error) {
    console.error('خطأ في إنشاء المسؤول:', error);
    throw error;
  }
};

// جلب مسؤول واحد
export const getAdmin = async (id: string): Promise<AdminUser> => {
  try {
    const response = await api.get(`/admin/users/${id}`);
    return response.data;
  } catch (error) {
    console.error('خطأ في جلب المسؤول:', error);
    throw error;
  }
};

// تحديث مسؤول
export const updateAdmin = async (id: string, data: UpdateAdminRequest): Promise<AdminUser> => {
  try {
    const response = await api.patch(`/admin/users/${id}`, data);
    return response.data;
  } catch (error) {
    console.error('خطأ في تحديث المسؤول:', error);
    throw error;
  }
};

// تحديث حالة المسؤول (تفعيل/تعطيل)
export const updateAdminStatus = async (id: string, isActive: boolean): Promise<AdminUser> => {
  try {
    const response = await api.patch(`/admin/users/${id}/status`, { isActive });
    return response.data;
  } catch (error) {
    console.error('خطأ في تحديث حالة المسؤول:', error);
    throw error;
  }
};

// تحديث صلاحيات المسؤول
export const updateAdminPermissions = async (
  id: string,
  permissions: Record<string, unknown>
): Promise<AdminUser> => {
  try {
    const response = await api.patch(`/admin/users/${id}/permissions`, { permissions });
    return response.data;
  } catch (error) {
    console.error('خطأ في تحديث صلاحيات المسؤول:', error);
    throw error;
  }
};

// حذف مسؤول
export const deleteAdmin = async (id: string): Promise<void> => {
  try {
    const response = await api.delete(`/admin/users/${id}`);
    return response.data;
  } catch (error) {
    console.error('خطأ في حذف المسؤول:', error);
    throw error;
  }
};

// جلب تعريف الموديولات والقدرات
export const getModules = async (): Promise<{
  modules: Array<{
    name: string;
    displayName: string;
    permissions: string[];
  }>;
}> => {
  try {
    const response = await api.get('/admin/modules');
    return response.data;
  } catch (error) {
    console.error('خطأ في جلب تعريف الموديولات:', error);
    throw error;
  }
};
