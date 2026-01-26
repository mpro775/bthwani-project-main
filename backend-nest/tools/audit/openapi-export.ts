#!/usr/bin/env ts-node
/**
 * OpenAPI Export Script
 *
 * Bootstraps NestFactory without starting the server to generate OpenAPI specification
 * Generates: reports/openapi.json and reports/openapi.yaml
 */

import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';
import { config as dotenvConfig } from 'dotenv';

// Load .env file if it exists, otherwise use dummy values
const envPath = path.join(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  dotenvConfig({ path: envPath });
} else {
  // Set dummy environment variables for validation
  process.env.NODE_ENV = 'development';
  process.env.PORT = '3000';
  process.env.MONGODB_URI = 'mongodb://localhost:27017/bthwani';
  process.env.JWT_SECRET = 'dummy-jwt-secret-for-audit';
  process.env.JWT_EXPIRES_IN = '7d';
  process.env.VENDOR_JWT_SECRET = 'dummy-vendor-jwt-secret';
  process.env.MARKETER_JWT_SECRET = 'dummy-marketer-jwt-secret';
  process.env.REFRESH_TOKEN_SECRET = 'dummy-refresh-token-secret';
  process.env.FIREBASE_PROJECT_ID = 'dummy-project';
  process.env.FIREBASE_CLIENT_EMAIL = 'dummy@example.com';
  process.env.FIREBASE_PRIVATE_KEY = 'dummy-key';
  process.env.FIREBASE_STORAGE_BUCKET = 'dummy-bucket';
  process.env.REDIS_HOST = 'localhost';
  process.env.REDIS_PORT = '6379';
  process.env.REDIS_PASSWORD = 'dummy-password';
}

// Now import modules that require env variables
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from '../../src/app.module';

async function exportOpenAPI() {
  console.log('🔍 Starting OpenAPI Export...\n');

  try {
    // Create NestJS application WITHOUT listening to port
    const app = await NestFactory.create(AppModule, {
      logger: false, // Disable logging during export
      abortOnError: false, // Don't abort on errors during bootstrap
    });

    console.log('✅ NestJS application bootstrapped\n');

    // Use the same Swagger configuration from main.ts
    const config = new DocumentBuilder()
      .setTitle('Bthwani API v2')
      .setDescription('NestJS API Documentation - نظام إدارة الطلبات والتجارة')
      .setVersion('2.0')
      .addBearerAuth()
      .addTag('Auth', 'المصادقة وتسجيل الدخول')
      .addTag('User', 'إدارة المستخدمين')
      .addTag('Wallet', 'المحفظة والمعاملات المالية')
      .addTag('Order', 'إدارة الطلبات')
      .addTag('Driver', 'عمليات السائقين')
      .addTag('Vendor', 'إدارة التجار')
      .addTag('Store', 'المتاجر والمنتجات')
      .addTag('Finance', 'المحاسبة والتقارير المالية')
      .build();

    console.log('📝 Building OpenAPI document...\n');

    // Create OpenAPI document
    const document = SwaggerModule.createDocument(app, config);

    // Ensure reports directory exists
    const reportsDir = path.join(process.cwd(), 'reports');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    // Export as JSON
    const jsonPath = path.join(reportsDir, 'openapi.json');
    fs.writeFileSync(jsonPath, JSON.stringify(document, null, 2), 'utf-8');
    console.log(`✅ JSON exported: ${jsonPath}`);

    // Export as YAML
    const yamlPath = path.join(reportsDir, 'openapi.yaml');
    const yamlContent = yaml.dump(document, {
      indent: 2,
      lineWidth: -1,
      noRefs: true,
    });
    fs.writeFileSync(yamlPath, yamlContent, 'utf-8');
    console.log(`✅ YAML exported: ${yamlPath}`);

    // Print statistics
    const paths = Object.keys(document.paths || {});
    const tags = document.tags || [];
    const schemas = Object.keys(document.components?.schemas || {});

    console.log('\n📊 OpenAPI Statistics:');
    console.log(`   - Total Paths: ${paths.length}`);
    console.log(`   - Total Tags: ${tags.length}`);
    console.log(`   - Total Schemas: ${schemas.length}`);
    console.log(`   - OpenAPI Version: ${document.openapi}`);
    console.log(`   - API Version: ${document.info.version}`);

    console.log('\n✨ OpenAPI export complete!\n');

    // Close the application
    await app.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during OpenAPI export:', error);
    process.exit(1);
  }
}

// Run the export
exportOpenAPI();
