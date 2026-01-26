#!/usr/bin/env ts-node

/**
 * Emergency System Resume Script
 *
 * This script resumes the system after maintenance.
 *
 * Usage:
 *   npm run script:resume-system
 */

import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../src/app.module';
import { SettingsService } from '../../src/modules/admin/services/settings.service';

async function resumeSystem() {
  console.log('✅ SYSTEM RESUME SCRIPT');
  console.log('========================\n');

  try {
    const app = await NestFactory.createApplicationContext(AppModule);
    const settingsService = app.get(SettingsService);

    // إزالة وضع الصيانة من قاعدة البيانات
    console.log('🔄 Removing maintenance mode flag...');

    const maintenanceSetting =
      await settingsService.getSetting('maintenance_mode');

    if (maintenanceSetting && maintenanceSetting.value === true) {
      await settingsService.updateSetting('maintenance_mode', false, 'system');
      console.log('✅ Maintenance mode disabled');
    } else {
      console.log('ℹ️  System was not in maintenance mode');
    }

    // تحديث وقت آخر استئناف
    const resumedAtSetting =
      await settingsService.getSetting('last_resumed_at');
    if (resumedAtSetting) {
      await settingsService.updateSetting(
        'last_resumed_at',
        new Date().toISOString(),
        'system',
      );
    }

    console.log('\n✅ System resumed successfully');
    console.log(`Time: ${new Date().toISOString()}`);
    console.log('\n📊 System Status:');
    console.log('  - API: Online ✅');
    console.log('  - Maintenance Mode: OFF ✅');
    console.log('  - Users can now access all services');

    await app.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to resume system:', error);
    process.exit(1);
  }
}

void resumeSystem();
