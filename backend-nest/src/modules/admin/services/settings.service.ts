import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AppSettings } from '../entities/app-settings.entity';
import { SettingsQuery } from '../interfaces/admin.interfaces';

@Injectable()
export class SettingsService {
  constructor(
    @InjectModel(AppSettings.name)
    private settingsModel: Model<AppSettings>,
  ) {}

  async getSetting(key: string): Promise<AppSettings | null> {
    return await this.settingsModel.findOne({ key });
  }

  async getSettings(category?: string) {
    const query: SettingsQuery = {};
    if (category) query.category = category;

    const settings = await this.settingsModel.find(query).sort({ key: 1 });

    return { data: settings, total: settings.length };
  }

  async getPublicSettings() {
    const settings = await this.settingsModel
      .find({ isPublic: true })
      .select('key value type description')
      .sort({ key: 1 });

    return { data: settings, total: settings.length };
  }

  async updateSetting(
    key: string,
    value: unknown,
    adminId: string,
  ): Promise<AppSettings> {
    const setting = await this.settingsModel.findOne({ key });

    if (!setting) {
      throw new NotFoundException({
        code: 'SETTING_NOT_FOUND',
        userMessage: 'الإعداد غير موجود',
      });
    }

    setting.value = value;
    setting.updatedBy = new Types.ObjectId(adminId);

    await setting.save();

    // TODO: Clear cache for this setting
    // TODO: Log audit trail

    return setting;
  }

  async createSetting(data: {
    key: string;
    value: unknown;
    type: string;
    description?: string;
    category?: string;
    isPublic?: boolean;
    validation?: {
      min?: number;
      max?: number;
      pattern?: string;
      enum?: string[];
    };
    adminId: string;
  }): Promise<AppSettings> {
    const existing = await this.settingsModel.findOne({ key: data.key });
    if (existing) {
      throw new Error('Setting with this key already exists');
    }

    const setting = new this.settingsModel({
      key: data.key,
      value: data.value,
      type: data.type,
      description: data.description,
      category: data.category,
      isPublic: data.isPublic || false,
      validation: data.validation,
      updatedBy: new Types.ObjectId(data.adminId),
    });

    return await setting.save();
  }

  async deleteSetting(key: string): Promise<void> {
    const result = await this.settingsModel.deleteOne({ key });
    if (result.deletedCount === 0) {
      throw new NotFoundException({
        code: 'SETTING_NOT_FOUND',
        userMessage: 'الإعداد غير موجود',
      });
    }
  }

  async getAppearanceSettings() {
    const appearanceSettings = await this.settingsModel
      .find({ category: 'appearance' })
      .sort({ key: 1 });

    // Convert to key-value object
    const settings: Record<string, any> = {};
    for (const setting of appearanceSettings) {
      settings[setting.key] = setting.value;
    }

    // Set defaults if no settings exist
    if (Object.keys(settings).length === 0) {
      settings.primaryColor = '#007bff';
      settings.secondaryColor = '#6c757d';
      settings.logoUrl = '';
      settings.faviconUrl = '';
      settings.appName = 'Bthwani';
      settings.description = 'منصة التوصيل الذكية';
      settings.enableDarkMode = false;
      settings.fontFamily = 'Arial';
    }

    return settings;
  }

  async updateAppearanceSettings(updates: Record<string, any>) {
    const results: AppSettings[] = [];

    for (const [key, value] of Object.entries(updates)) {
      const setting = await this.settingsModel.findOneAndUpdate(
        { key, category: 'appearance' },
        {
          key,
          value,
          category: 'appearance',
          type: typeof value,
          description: `إعداد المظهر: ${key}`,
          isPublic: true,
        },
        { upsert: true, new: true }
      );
      results.push(setting);
    }

    return {
      success: true,
      message: 'تم تحديث إعدادات المظهر',
      settings: results,
    };
  }

  async seedDefaultSettings() {
    const defaults = [
      {
        key: 'delivery_fee',
        value: 15,
        type: 'number',
        category: 'delivery',
        description: 'رسوم التوصيل الافتراضية',
        isPublic: true,
      },
      {
        key: 'commission_rate',
        value: 0.15,
        type: 'number',
        category: 'commission',
        description: 'نسبة العمولة من المتاجر',
        isPublic: false,
      },
      {
        key: 'min_order_amount',
        value: 20,
        type: 'number',
        category: 'order',
        description: 'الحد الأدنى لقيمة الطلب',
        isPublic: true,
      },
      {
        key: 'max_delivery_distance',
        value: 50,
        type: 'number',
        category: 'delivery',
        description: 'أقصى مسافة توصيل بالكيلومتر',
        isPublic: true,
      },
    ];

    for (const setting of defaults) {
      const exists = await this.settingsModel.findOne({ key: setting.key });
      if (!exists) {
        await this.settingsModel.create(setting);
      }
    }

    return { success: true, message: 'تم تهيئة الإعدادات الافتراضية' };
  }
}

