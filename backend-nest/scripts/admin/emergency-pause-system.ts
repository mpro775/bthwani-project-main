#!/usr/bin/env ts-node

/**
 * Emergency System Pause Script
 *
 * This script pauses the entire system by setting a maintenance flag.
 * Use only in emergency situations!
 *
 * Usage:
 *   npm run script:pause-system -- --reason="Emergency maintenance"
 */

import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../src/app.module';
import { SettingsService } from '../../src/modules/admin/services/settings.service';
import * as readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function pauseSystem() {
  console.log('⚠️  EMERGENCY SYSTEM PAUSE SCRIPT');
  console.log('=====================================\n');

  const reason =
    process.argv.find((arg) => arg.startsWith('--reason='))?.split('=')[1] ||
    'Emergency maintenance';

  console.log(`Reason: ${reason}\n`);
  console.log('⚠️  WARNING: This will affect all users!');
  console.log('Are you sure you want to continue? (yes/no): ');

  rl.question('', (answer) => {
    if (answer.toLowerCase() !== 'yes') {
      console.log('Operation cancelled.');
      rl.close();
      process.exit(0);
    }

    void executeMaintenancePause(reason);
  });
}

async function executeMaintenancePause(reason: string) {
  try {
    const app = await NestFactory.createApplicationContext(AppModule);
    const settingsService = app.get(SettingsService);

    // تفعيل وضع الصيانة في قاعدة البيانات
    console.log('\n🔄 Activating maintenance mode...');

    // التحقق من وجود الإعداد أو إنشائه
    let maintenanceSetting =
      await settingsService.getSetting('maintenance_mode');

    if (!maintenanceSetting) {
      console.log('⚙️  Creating maintenance_mode setting...');
      maintenanceSetting = await settingsService.createSetting({
        key: 'maintenance_mode',
        value: true,
        type: 'boolean',
        category: 'system',
        description: 'وضع الصيانة - يوقف الوصول للنظام',
        isPublic: true,
        adminId: 'system',
      });
    } else {
      await settingsService.updateSetting('maintenance_mode', true, 'system');
    }

    // حفظ سبب الصيانة ووقتها
    const maintenanceReasonKey = 'maintenance_reason';
    const maintenanceStartKey = 'maintenance_started_at';

    const reasonSetting =
      await settingsService.getSetting(maintenanceReasonKey);
    if (reasonSetting) {
      await settingsService.updateSetting(
        maintenanceReasonKey,
        reason,
        'system',
      );
    } else {
      await settingsService.createSetting({
        key: maintenanceReasonKey,
        value: reason,
        type: 'string',
        category: 'system',
        description: 'سبب آخر صيانة',
        isPublic: false,
        adminId: 'system',
      });
    }

    const startTimeSetting =
      await settingsService.getSetting(maintenanceStartKey);
    if (startTimeSetting) {
      await settingsService.updateSetting(
        maintenanceStartKey,
        new Date().toISOString(),
        'system',
      );
    } else {
      await settingsService.createSetting({
        key: maintenanceStartKey,
        value: new Date().toISOString(),
        type: 'string',
        category: 'system',
        description: 'وقت بدء آخر صيانة',
        isPublic: false,
        adminId: 'system',
      });
    }

    console.log('\n✅ System paused successfully');
    console.log(`Reason: ${reason}`);
    console.log(`Time: ${new Date().toISOString()}`);
    console.log('\n⚠️  MAINTENANCE MODE ACTIVE:');
    console.log('  - All API endpoints are now restricted');
    console.log('  - Users will see maintenance message');
    console.log('  - Use "npm run script:resume-system" to resume');

    rl.close();
    await app.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to pause system:', error);
    rl.close();
    process.exit(1);
  }
}

void pauseSystem();
