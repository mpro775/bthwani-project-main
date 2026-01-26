import api from '../utils/axios';

// أنواع البيانات متوافقة مع النموذج الموجود في الباك إند
export interface NotificationCampaign {
  _id: string;
  title: string;
  name?: string;
  message: {
    title: string;
    body: string;
    data?: Record<string, unknown>;
    channelId?: string;
    collapseId?: string;
  };
  audience: {
    apps: string[];
    platforms: string[];
    cities?: string[];
    minOrders?: number;
    lastActiveDays?: number;
    optedInPromosOnly?: boolean;
  };
  schedule: {
    type: 'now' | 'cron' | 'datetime';
    when?: string;
    cron?: string;
  };
  status: 'draft' | 'scheduled' | 'running' | 'completed' | 'cancelled' | 'failed';
  stats: {
    queued: number;
    sent: number;
    delivered: number;
    failed: number;
    uniqueUsers: number;
  };
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationTemplate {
  _id: string;
  title: string;
  name?: string;
  message: {
    title: string;
    body: string;
    data?: Record<string, unknown>;
    channelId?: string;
    collapseId?: string;
  };
  audience: {
    apps: string[];
    platforms: string[];
    cities?: string[];
    minOrders?: number;
    lastActiveDays?: number;
    optedInPromosOnly?: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateCampaignRequest {
  title: string;
  message: {
    title: string;
    body: string;
    data?: Record<string, unknown>;
    channelId?: string;
    collapseId?: string;
  };
  audience: {
    apps: string[];
    platforms: string[];
    cities?: string[];
    minOrders?: number;
    lastActiveDays?: number;
    optedInPromosOnly?: boolean;
  };
  schedule?: {
    type: 'now' | 'cron' | 'datetime';
    when?: string;
    cron?: string;
  };
}

export interface UpdateCampaignRequest extends Partial<CreateCampaignRequest> {
  status?: string;
}

// جلب قائمة الحملات
export const getNotificationCampaigns = async (): Promise<NotificationCampaign[]> => {
  try {
    const response = await api.get('/admin/notifications/campaigns');
    return response.data;
  } catch (error) {
    console.error('خطأ في جلب حملات الإشعارات:', error);
    throw error;
  }
};

// إنشاء حملة جديدة
export const createNotificationCampaign = async (data: CreateCampaignRequest): Promise<NotificationCampaign> => {
  try {
    const response = await api.post('/admin/notifications/campaigns', data);
    return response.data;
  } catch (error) {
    console.error('خطأ في إنشاء حملة الإشعارات:', error);
    throw error;
  }
};

// تحديث حملة
export const updateNotificationCampaign = async (id: string, data: UpdateCampaignRequest): Promise<NotificationCampaign> => {
  try {
    const response = await api.patch(`/admin/notifications/campaigns/${id}`, data);
    return response.data;
  } catch (error) {
    console.error('خطأ في تحديث حملة الإشعارات:', error);
    throw error;
  }
};

// إرسال حملة فوري
export const sendNotificationCampaign = async (id: string): Promise<{ ok: boolean }> => {
  try {
    const response = await api.post(`/admin/notifications/campaigns/${id}/send`);
    return response.data;
  } catch (error) {
    console.error('خطأ في إرسال حملة الإشعارات:', error);
    throw error;
  }
};

// إلغاء حملة
export const cancelNotificationCampaign = async (id: string): Promise<{ ok: boolean }> => {
  try {
    const response = await api.post(`/admin/notifications/campaigns/${id}/cancel`);
    return response.data;
  } catch (error) {
    console.error('خطأ في إلغاء حملة الإشعارات:', error);
    throw error;
  }
};

// معاينة الجمهور
export const previewCampaignAudience = async (id: string): Promise<{
  count: number;
  sample: unknown[];
}> => {
  try {
    const response = await api.post(`/admin/notifications/campaigns/${id}/audience-preview`);
    return response.data;
  } catch (error) {
    console.error('خطأ في معاينة جمهور الحملة:', error);
    throw error;
  }
};

// جلب القوالب
export const getNotificationTemplates = async (): Promise<NotificationTemplate[]> => {
  try {
    const response = await api.get('/admin/notifications/templates');
    return response.data;
  } catch (error) {
    console.error('خطأ في جلب قوالب الإشعارات:', error);
    throw error;
  }
};

// إنشاء قالب جديد
export const createNotificationTemplate = async (data: Omit<NotificationTemplate, '_id' | 'createdAt' | 'updatedAt'>): Promise<NotificationTemplate> => {
  try {
    const response = await api.post('/admin/notifications/templates', data);
    return response.data;
  } catch (error) {
    console.error('خطأ في إنشاء قالب الإشعارات:', error);
    throw error;
  }
};
