import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User } from '../../auth/entities/user.entity';
import { SettingsService } from './settings.service';
import { logger } from '../../../config/logger.config';

const SALT_ROUNDS = 10;

/**
 * خدمة البذور - تهيئة الإعدادات الافتراضية وحساب الأدمن عند كل تشغيل للبذور.
 */
@Injectable()
export class SeedService implements OnModuleInit {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private readonly settingsService: SettingsService,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit() {
    try {
      await this.runAllSeeds();
    } catch (err) {
      logger.warn('Seed run warning: ' + (err?.message || err), 'SeedService');
    }
  }

  /**
   * تشغيل كل عمليات البذر: الإعدادات الافتراضية + حساب الأدمن الافتراضي.
   */
  async runAllSeeds(): Promise<{ settings: unknown; admin: unknown }> {
    const settings = await this.settingsService.seedDefaultSettings();
    const admin = await this.seedDefaultAdmin();
    return { settings, admin };
  }

  /**
   * إنشاء حساب أدمن افتراضي إذا لم يوجد أي مستخدم بدور admin أو superadmin.
   */
  async seedDefaultAdmin(): Promise<{ success: boolean; message: string; created?: boolean }> {
    const existingAdmin = await this.userModel.findOne({
      role: { $in: ['admin', 'superadmin'] },
    });

    if (existingAdmin) {
      return {
        success: true,
        message: 'يوجد بالفعل حساب أدمن، تم تخطي إنشاء الحساب الافتراضي',
        created: false,
      };
    }

    const email =
      this.configService.get<string>('ADMIN_SEED_EMAIL') ||
      this.configService.get<string>('SEED_ADMIN_EMAIL') ||
      'admin@bthwani.com';
    const plainPassword =
      this.configService.get<string>('ADMIN_SEED_PASSWORD') ||
      this.configService.get<string>('SEED_ADMIN_PASSWORD') ||
      'Admin@123!';
    const fullName =
      this.configService.get<string>('ADMIN_SEED_FULL_NAME') ||
      this.configService.get<string>('SEED_ADMIN_FULL_NAME') ||
      'مدير النظام';

    const hashedPassword = await bcrypt.hash(plainPassword, SALT_ROUNDS);

    await this.userModel.create({
      email: email.toLowerCase(),
      password: hashedPassword,
      fullName,
      role: 'superadmin',
      isActive: true,
      authProvider: 'local',
      emailVerified: true,
    });

    logger.log(
      `تم إنشاء حساب أدمن افتراضي: ${email}`,
      'SeedService',
    );

    return {
      success: true,
      message: 'تم إنشاء حساب الأدمن الافتراضي بنجاح',
      created: true,
    };
  }
}
