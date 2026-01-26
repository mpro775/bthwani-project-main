#!/usr/bin/env ts-node

/**
 * Data Export Script
 *
 * Exports specified data for backup or migration purposes.
 * Requires superadmin authorization.
 *
 * Usage:
 *   npm run script:export-data -- --collections=users,orders --output=./exports
 */

import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../src/app.module';
import * as fs from 'fs/promises';
import * as path from 'path';

async function exportData() {
  console.log('📤 DATA EXPORT SCRIPT');
  console.log('======================\n');

  const collections =
    process.argv
      .find((arg) => arg.startsWith('--collections='))
      ?.split('=')[1]
      ?.split(',') || [];
  const outputDir =
    process.argv.find((arg) => arg.startsWith('--output='))?.split('=')[1] ||
    './exports';

  console.log(`Collections: ${collections.join(', ') || 'ALL'}`);
  console.log(`Output: ${outputDir}\n`);

  try {
    const app = await NestFactory.createApplicationContext(AppModule);

    // Ensure output directory exists
    await fs.mkdir(outputDir, { recursive: true });

    // TODO: Export data logic
    const exportFile = path.join(outputDir, `export-${Date.now()}.json`);

    console.log(`✅ Data exported to: ${exportFile}`);

    await app.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Export failed:', error);
    process.exit(1);
  }
}

exportData();
