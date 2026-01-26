#!/usr/bin/env ts-node
/**
 * Rate Limiting & Throttling Check Script
 * 
 * Checks for:
 * - @nestjs/throttler package presence
 * - express-rate-limit usage
 * - Throttle decorators in code
 * - Critical endpoints that need protection
 * 
 * Generates: reports/throttling_status.md
 */

import * as fs from 'fs';
import * as path from 'path';
import { Project, SourceFile, ClassDeclaration, MethodDeclaration } from 'ts-morph';

interface ThrottlingPackage {
  name: string;
  present: boolean;
  version?: string;
}

interface EndpointInfo {
  module: string;
  controller: string;
  method: string;
  httpMethod: string;
  path: string;
  hasThrottle: boolean;
  isCritical: boolean;
  criticalReason?: string;
  file: string;
  line: number;
}

interface ThrottlingUsage {
  file: string;
  type: 'decorator' | 'guard' | 'middleware' | 'config';
  location: string;
  code: string;
}

class ThrottlingCheckAuditor {
  private project: Project;
  private packagesInfo: ThrottlingPackage[] = [];
  private endpoints: EndpointInfo[] = [];
  private usage: ThrottlingUsage[] = [];
  private mainTsPath: string;

  constructor() {
    this.project = new Project({
      tsConfigFilePath: path.join(process.cwd(), 'tsconfig.json'),
      skipAddingFilesFromTsConfig: true,
    });
    this.mainTsPath = path.join(process.cwd(), 'src', 'main.ts');
  }

  async audit(): Promise<void> {
    console.log('🔍 Starting Rate Limiting/Throttling Check...\n');

    // 1. Check package.json
    this.checkPackages();

    // 2. Check main.ts for global rate limiting
    this.checkMainTs();

    // 3. Scan all controllers
    this.scanControllers();

    // 4. Check for throttling usage in code
    this.checkThrottlingUsage();

    console.log(`\n✅ Analysis complete!\n`);

    // 5. Generate report
    this.generateReport();

    console.log('✨ Audit complete!\n');
  }

  /**
   * Check packages in package.json
   */
  private checkPackages(): void {
    console.log('📦 Checking packages...');
    
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
    
    const allDeps = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies,
    };

    // Check for throttling packages
    const throttlingPackages = [
      '@nestjs/throttler',
      'express-rate-limit',
      'rate-limiter-flexible',
      'bottleneck',
    ];

    for (const pkg of throttlingPackages) {
      this.packagesInfo.push({
        name: pkg,
        present: !!allDeps[pkg],
        version: allDeps[pkg],
      });
    }

    const presentPackages = this.packagesInfo.filter(p => p.present);
    console.log(`  ✓ Found ${presentPackages.length} rate limiting packages`);
    presentPackages.forEach(p => {
      console.log(`    - ${p.name}@${p.version}`);
    });
    console.log();
  }

  /**
   * Check main.ts for global rate limiting
   */
  private checkMainTs(): void {
    console.log('🔍 Checking main.ts for global rate limiting...');

    if (!fs.existsSync(this.mainTsPath)) {
      console.log('  ⚠️  main.ts not found');
      return;
    }

    const content = fs.readFileSync(this.mainTsPath, 'utf-8');

    // Check for express-rate-limit
    if (content.includes('rateLimit') || content.includes('express-rate-limit')) {
      const lines = content.split('\n');
      let startLine = -1;
      let endLine = -1;

      for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('rateLimit') && startLine === -1) {
          startLine = i;
        }
        if (startLine !== -1 && lines[i].includes('});') && endLine === -1) {
          endLine = i;
          break;
        }
      }

      if (startLine !== -1) {
        const rateLimitCode = lines.slice(startLine, endLine + 1).join('\n');
        
        this.usage.push({
          file: 'src/main.ts',
          type: 'middleware',
          location: `Line ${startLine + 1}-${endLine + 1}`,
          code: rateLimitCode.substring(0, 200) + (rateLimitCode.length > 200 ? '...' : ''),
        });

        console.log(`  ✓ Found global rate limiting at lines ${startLine + 1}-${endLine + 1}`);
        
        // Extract configuration
        const windowMatch = content.match(/windowMs:\s*(\d+)/);
        const maxMatch = content.match(/max:\s*(\d+)/);
        
        if (windowMatch && maxMatch) {
          const windowMs = parseInt(windowMatch[1]);
          const max = parseInt(maxMatch[1]);
          console.log(`    Window: ${windowMs}ms, Max: ${max} requests`);
        }
      }
    } else {
      console.log('  ⚠️  No global rate limiting found in main.ts');
    }
    console.log();
  }

  /**
   * Scan all controllers for endpoints
   */
  private scanControllers(): void {
    console.log('🔍 Scanning controllers...');
    
    const controllersPath = path.join(process.cwd(), 'src', 'modules');
    const controllerFiles = this.findControllerFiles(controllersPath);
    
    console.log(`  Found ${controllerFiles.length} controller files\n`);

    for (const filePath of controllerFiles) {
      this.processControllerFile(filePath);
    }

    console.log(`  ✓ Analyzed ${this.endpoints.length} endpoints`);
  }

  /**
   * Recursively find controller files
   */
  private findControllerFiles(dir: string): string[] {
    const files: string[] = [];

    if (!fs.existsSync(dir)) {
      return files;
    }

    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        files.push(...this.findControllerFiles(fullPath));
      } else if (entry.isFile() && entry.name.endsWith('.controller.ts')) {
        files.push(fullPath);
      }
    }

    return files;
  }

  /**
   * Process a single controller file
   */
  private processControllerFile(filePath: string): void {
    const sourceFile = this.project.addSourceFileAtPath(filePath);
    const relativePath = path.relative(process.cwd(), filePath);
    const moduleName = this.extractModuleName(filePath);

    const classes = sourceFile.getClasses();

    for (const classDecl of classes) {
      const controllerDecorator = classDecl.getDecorator('Controller');
      
      if (!controllerDecorator) {
        continue;
      }

      const controllerName = classDecl.getName() || 'UnnamedController';
      const controllerPath = this.extractDecoratorPath(controllerDecorator);

      // Check for class-level Throttle decorator
      const classHasThrottle = !!classDecl.getDecorator('Throttle');

      const methods = classDecl.getMethods();

      for (const method of methods) {
        const endpointInfo = this.processEndpointMethod(
          method,
          moduleName,
          controllerName,
          controllerPath,
          relativePath,
          classHasThrottle,
        );

        if (endpointInfo) {
          this.endpoints.push(endpointInfo);
        }
      }
    }

    this.project.removeSourceFile(sourceFile);
  }

  /**
   * Process endpoint method
   */
  private processEndpointMethod(
    method: MethodDeclaration,
    moduleName: string,
    controllerName: string,
    controllerPath: string,
    filePath: string,
    classHasThrottle: boolean,
  ): EndpointInfo | null {
    const httpMethods = ['Get', 'Post', 'Put', 'Patch', 'Delete'];
    let httpMethod = '';
    let routePath = '';

    for (const methodName of httpMethods) {
      const decorator = method.getDecorator(methodName);
      if (decorator) {
        httpMethod = methodName.toUpperCase();
        routePath = this.extractDecoratorPath(decorator);
        break;
      }
    }

    if (!httpMethod) {
      return null;
    }

    const fullPath = this.constructFullPath(controllerPath, routePath);
    const methodHasThrottle = !!method.getDecorator('Throttle');
    const hasThrottle = classHasThrottle || methodHasThrottle;

    // Determine if endpoint is critical
    const { isCritical, reason } = this.isEndpointCritical(
      fullPath,
      httpMethod,
      method.getName() || '',
    );

    return {
      module: moduleName,
      controller: controllerName,
      method: method.getName() || 'unknown',
      httpMethod,
      path: fullPath,
      hasThrottle,
      isCritical,
      criticalReason: reason,
      file: filePath,
      line: method.getStartLineNumber(),
    };
  }

  /**
   * Determine if endpoint is critical and needs throttling
   */
  private isEndpointCritical(
    path: string,
    httpMethod: string,
    methodName: string,
  ): { isCritical: boolean; reason?: string } {
    const pathLower = path.toLowerCase();
    const methodLower = methodName.toLowerCase();

    // Authentication endpoints
    if (
      pathLower.includes('/auth/') ||
      pathLower.includes('/login') ||
      pathLower.includes('/register') ||
      pathLower.includes('/signup')
    ) {
      return { isCritical: true, reason: 'Authentication endpoint - vulnerable to brute force' };
    }

    // Password/OTP endpoints
    if (
      pathLower.includes('password') ||
      pathLower.includes('otp') ||
      pathLower.includes('verify') ||
      pathLower.includes('confirm')
    ) {
      return { isCritical: true, reason: 'Security-sensitive endpoint' };
    }

    // Payment endpoints
    if (
      pathLower.includes('/payment') ||
      pathLower.includes('/wallet/topup') ||
      pathLower.includes('/wallet/transfer') ||
      pathLower.includes('/order') && httpMethod === 'POST'
    ) {
      return { isCritical: true, reason: 'Financial transaction endpoint' };
    }

    // File upload
    if (
      methodLower.includes('upload') ||
      pathLower.includes('/upload')
    ) {
      return { isCritical: true, reason: 'File upload - resource intensive' };
    }

    // Search/Query endpoints
    if (
      methodLower.includes('search') ||
      methodLower.includes('query') ||
      pathLower.includes('/search')
    ) {
      return { isCritical: true, reason: 'Search endpoint - resource intensive' };
    }

    // Bulk operations
    if (
      methodLower.includes('bulk') ||
      methodLower.includes('batch') ||
      pathLower.includes('/bulk')
    ) {
      return { isCritical: true, reason: 'Bulk operation - resource intensive' };
    }

    // Email/SMS sending
    if (
      methodLower.includes('send') ||
      methodLower.includes('notify') ||
      pathLower.includes('/notification')
    ) {
      return { isCritical: true, reason: 'Notification endpoint - can be abused' };
    }

    // Report generation
    if (
      methodLower.includes('report') ||
      methodLower.includes('export') ||
      pathLower.includes('/report')
    ) {
      return { isCritical: true, reason: 'Report generation - resource intensive' };
    }

    return { isCritical: false };
  }

  /**
   * Check for throttling usage in codebase
   */
  private checkThrottlingUsage(): void {
    console.log('\n🔍 Checking for throttling decorators...');

    const srcPath = path.join(process.cwd(), 'src');
    this.searchThrottlingInDirectory(srcPath);

    console.log(`  Found ${this.usage.filter(u => u.type === 'decorator').length} @Throttle decorator usages`);
  }

  /**
   * Recursively search for throttling usage
   */
  private searchThrottlingInDirectory(dir: string): void {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        this.searchThrottlingInDirectory(fullPath);
      } else if (entry.isFile() && entry.name.endsWith('.ts')) {
        const content = fs.readFileSync(fullPath, 'utf-8');
        const relativePath = path.relative(process.cwd(), fullPath);

        // Check for @Throttle decorator
        if (content.includes('@Throttle')) {
          const lines = content.split('\n');
          for (let i = 0; i < lines.length; i++) {
            if (lines[i].includes('@Throttle')) {
              this.usage.push({
                file: relativePath,
                type: 'decorator',
                location: `Line ${i + 1}`,
                code: lines[i].trim(),
              });
            }
          }
        }

        // Check for ThrottlerGuard
        if (content.includes('ThrottlerGuard')) {
          const lines = content.split('\n');
          for (let i = 0; i < lines.length; i++) {
            if (lines[i].includes('ThrottlerGuard')) {
              this.usage.push({
                file: relativePath,
                type: 'guard',
                location: `Line ${i + 1}`,
                code: lines[i].trim(),
              });
            }
          }
        }
      }
    }
  }

  /**
   * Extract module name from file path
   */
  private extractModuleName(filePath: string): string {
    const modulesPath = path.join(process.cwd(), 'src', 'modules');
    const relativePath = path.relative(modulesPath, filePath);
    const parts = relativePath.split(path.sep);
    return parts[0] || 'unknown';
  }

  /**
   * Extract path from decorator
   */
  private extractDecoratorPath(decorator: any): string {
    const args = decorator.getArguments();
    
    if (args.length === 0) {
      return '';
    }

    const firstArg = args[0];
    const text = firstArg.getText();
    
    return text.replace(/['"]/g, '').replace(/`/g, '');
  }

  /**
   * Construct full route path
   */
  private constructFullPath(controllerPath: string, routePath: string): string {
    const parts: string[] = [];

    if (controllerPath) {
      parts.push(controllerPath.startsWith('/') ? controllerPath.substring(1) : controllerPath);
    }

    if (routePath) {
      parts.push(routePath.startsWith('/') ? routePath.substring(1) : routePath);
    }

    return '/' + parts.join('/');
  }

  /**
   * Generate markdown report
   */
  private generateReport(): void {
    const reportPath = path.join(process.cwd(), 'reports', 'throttling_status.md');

    const reportsDir = path.dirname(reportPath);
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    let content = '# تقرير Rate Limiting & Throttling\n\n';
    content += `**التاريخ**: ${new Date().toLocaleDateString('ar-EG', { dateStyle: 'full' })}\n`;
    content += `**الوقت**: ${new Date().toLocaleTimeString('ar-EG')}\n\n`;
    content += '---\n\n';

    // Package Status
    content += '## 📦 حالة الحزم (Packages)\n\n';
    content += '| الحزمة | الحالة | الإصدار |\n';
    content += '|--------|--------|----------|\n';
    
    for (const pkg of this.packagesInfo) {
      content += `| ${pkg.name} | ${pkg.present ? '✅ مثبتة' : '❌ غير مثبتة'} | ${pkg.version || '-'} |\n`;
    }
    content += '\n';

    // Current Implementation
    content += '## 🛡️ التطبيق الحالي\n\n';
    
    const hasGlobalRateLimit = this.usage.some(u => u.type === 'middleware');
    const hasThrottleDecorators = this.usage.filter(u => u.type === 'decorator').length;
    
    if (hasGlobalRateLimit) {
      content += '### ✅ Global Rate Limiting\n\n';
      content += 'تم تطبيق rate limiting على مستوى التطبيق في `main.ts` باستخدام `express-rate-limit`.\n\n';
      
      const middleware = this.usage.find(u => u.type === 'middleware');
      if (middleware) {
        content += '```typescript\n';
        content += middleware.code + '\n';
        content += '```\n\n';
      }
    } else {
      content += '### ⚠️ لا يوجد Global Rate Limiting\n\n';
      content += 'لم يتم العثور على rate limiting على مستوى التطبيق. يُنصح بإضافته في `main.ts`.\n\n';
    }

    if (hasThrottleDecorators > 0) {
      content += `### ✅ استخدام @Throttle Decorator\n\n`;
      content += `تم العثور على ${hasThrottleDecorators} استخدام لـ @Throttle decorator.\n\n`;
    } else {
      content += '### ⚠️ لا يوجد استخدام لـ @Throttle Decorator\n\n';
      content += 'لم يتم العثور على استخدام لـ @Throttle على مستوى Controllers أو Routes.\n\n';
    }

    // Statistics
    content += '## 📊 إحصائيات Endpoints\n\n';
    
    const totalEndpoints = this.endpoints.length;
    const criticalEndpoints = this.endpoints.filter(e => e.isCritical).length;
    const protectedEndpoints = this.endpoints.filter(e => e.hasThrottle).length;
    const unprotectedCritical = this.endpoints.filter(e => e.isCritical && !e.hasThrottle).length;

    content += `- **إجمالي Endpoints**: ${totalEndpoints}\n`;
    content += `- **Endpoints حرجة**: ${criticalEndpoints} (${this.percentage(criticalEndpoints, totalEndpoints)}%)\n`;
    content += `- **Endpoints محمية**: ${protectedEndpoints} (${this.percentage(protectedEndpoints, totalEndpoints)}%)\n`;
    content += `- **Endpoints حرجة غير محمية**: ${unprotectedCritical} (${this.percentage(unprotectedCritical, criticalEndpoints)}%)\n\n`;

    // Progress bars
    content += this.generateProgressBar('Endpoints محمية', this.percentage(protectedEndpoints, totalEndpoints));
    content += this.generateProgressBar('تغطية Endpoints الحرجة', this.percentage(criticalEndpoints - unprotectedCritical, criticalEndpoints));
    content += '\n';

    // Critical Endpoints Table
    content += '## ⚠️ Endpoints حرجة تحتاج حماية\n\n';
    
    const unprotected = this.endpoints.filter(e => e.isCritical && !e.hasThrottle);
    
    if (unprotected.length === 0) {
      content += '_جميع Endpoints الحرجة محمية!_ 🎉\n\n';
    } else {
      content += `تم العثور على **${unprotected.length} endpoint حرج** بدون حماية throttling.\n\n`;
      content += '| المسار | HTTP | المودول | السبب | الملف |\n';
      content += '|--------|------|---------|-------|-------|\n';

      for (const endpoint of unprotected) {
        content += `| \`${endpoint.path}\` | ${endpoint.httpMethod} | ${endpoint.module} | ${endpoint.criticalReason} | \`${endpoint.file}:${endpoint.line}\` |\n`;
      }
      content += '\n';
    }

    // Critical Endpoints by Category
    content += '## 📋 تصنيف Endpoints الحرجة\n\n';
    
    const categories = new Map<string, EndpointInfo[]>();
    
    for (const endpoint of this.endpoints.filter(e => e.isCritical)) {
      const category = endpoint.criticalReason || 'Other';
      if (!categories.has(category)) {
        categories.set(category, []);
      }
      categories.get(category)!.push(endpoint);
    }

    for (const [category, endpoints] of Array.from(categories.entries()).sort((a, b) => b[1].length - a[1].length)) {
      const protectedCount = endpoints.filter(e => e.hasThrottle).length;
      const total = endpoints.length;
      
      content += `### ${category}\n\n`;
      content += `- **العدد**: ${total}\n`;
      content += `- **محمية**: ${protectedCount}/${total} (${this.percentage(protectedCount, total)}%)\n\n`;
      
      const needProtection = endpoints.filter(e => !e.hasThrottle);
      if (needProtection.length > 0) {
        content += '<details>\n<summary>عرض Endpoints غير المحمية</summary>\n\n';
        content += '| المسار | HTTP | المودول |\n';
        content += '|--------|------|----------|\n';
        for (const ep of needProtection) {
          content += `| \`${ep.path}\` | ${ep.httpMethod} | ${ep.module} |\n`;
        }
        content += '\n</details>\n\n';
      }
    }

    // Recommendations
    content += '## 💡 التوصيات\n\n';

    content += '### 1. إضافة @nestjs/throttler\n\n';
    
    const hasThrottler = this.packagesInfo.find(p => p.name === '@nestjs/throttler')?.present;
    
    if (!hasThrottler) {
      content += '**يُنصح بشدة** بإضافة `@nestjs/throttler` للحصول على تحكم أفضل في rate limiting:\n\n';
      content += '```bash\n';
      content += 'npm install @nestjs/throttler\n';
      content += '```\n\n';
      content += 'ثم تفعيله في `app.module.ts`:\n\n';
      content += '```typescript\n';
      content += 'import { ThrottlerModule, ThrottlerGuard } from \'@nestjs/throttler\';\n';
      content += 'import { APP_GUARD } from \'@nestjs/core\';\n\n';
      content += '@Module({\n';
      content += '  imports: [\n';
      content += '    ThrottlerModule.forRoot([{\n';
      content += '      ttl: 60000, // 60 seconds\n';
      content += '      limit: 10,  // 10 requests per ttl\n';
      content += '    }]),\n';
      content += '  ],\n';
      content += '  providers: [\n';
      content += '    {\n';
      content += '      provide: APP_GUARD,\n';
      content += '      useClass: ThrottlerGuard,\n';
      content += '    },\n';
      content += '  ],\n';
      content += '})\n';
      content += '```\n\n';
    }

    content += '### 2. حماية Endpoints الحرجة\n\n';
    
    if (unprotected.length > 0) {
      content += `يجب إضافة throttling لـ **${unprotected.length} endpoint**:\n\n`;
      
      // Group by module
      const byModule = new Map<string, EndpointInfo[]>();
      for (const ep of unprotected) {
        if (!byModule.has(ep.module)) {
          byModule.set(ep.module, []);
        }
        byModule.get(ep.module)!.push(ep);
      }

      for (const [module, endpoints] of Array.from(byModule.entries()).sort((a, b) => b[1].length - a[1].length).slice(0, 5)) {
        content += `#### ${module} (${endpoints.length} endpoints)\n\n`;
        content += '```typescript\n';
        content += 'import { Throttle } from \'@nestjs/throttler\';\n\n';
        content += `// في ${endpoints[0].controller}\n`;
        content += '@Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 requests per minute\n';
        content += `async ${endpoints[0].method}() {\n`;
        content += '  // ...\n';
        content += '}\n';
        content += '```\n\n';
      }
    }

    content += '### 3. معدلات Throttling المقترحة\n\n';
    content += '| نوع Endpoint | الحد الأقصى | المدة الزمنية |\n';
    content += '|--------------|-------------|---------------|\n';
    content += '| Authentication | 5 | 1 دقيقة |\n';
    content += '| Password Reset | 3 | 5 دقائق |\n';
    content += '| OTP/Verify | 3 | 1 دقيقة |\n';
    content += '| Payment | 10 | 1 دقيقة |\n';
    content += '| Search/Query | 20 | 1 دقيقة |\n';
    content += '| Upload | 5 | 5 دقائق |\n';
    content += '| Reports | 10 | 5 دقائق |\n';
    content += '| General API | 100 | 1 دقيقة |\n\n';

    content += '### 4. إضافات إضافية\n\n';
    content += '- **Redis للتخزين المؤقت**: استخدام Redis بدلاً من الذاكرة لـ rate limiting في بيئة multi-server\n';
    content += '- **Rate Limiting بناءً على المستخدم**: تطبيق حدود مختلفة بناءً على نوع المستخدم (guest, authenticated, premium)\n';
    content += '- **IP Whitelisting**: استثناء IPs معينة من rate limiting (monitoring tools, trusted partners)\n';
    content += '- **Dynamic Rate Limiting**: تعديل الحدود تلقائياً بناءً على الحمل\n\n';

    content += '## 📝 خطة العمل\n\n';
    content += '- [ ] تثبيت `@nestjs/throttler` إذا لم يكن مثبتاً\n';
    content += '- [ ] تفعيل ThrottlerGuard على مستوى التطبيق\n';
    content += `- [ ] إضافة @Throttle لـ ${unprotected.length} endpoint حرج\n`;
    content += '- [ ] اختبار rate limiting في بيئة التطوير\n';
    content += '- [ ] إعداد Redis للـ production\n';
    content += '- [ ] مراقبة rate limit metrics\n';
    content += '- [ ] توثيق rate limits في API documentation\n\n';

    content += '---\n\n';
    content += '_تم إنشاء هذا التقرير تلقائياً بواسطة `tools/audit/throttling-check.ts`_\n';

    fs.writeFileSync(reportPath, content, 'utf-8');
    console.log(`📊 Report generated: ${reportPath}`);
  }

  /**
   * Calculate percentage
   */
  private percentage(value: number, total: number): number {
    if (total === 0) return 0;
    return Math.round((value / total) * 100);
  }

  /**
   * Generate progress bar
   */
  private generateProgressBar(label: string, percent: number): string {
    const barLength = 30;
    const filledLength = Math.round((percent / 100) * barLength);
    const emptyLength = barLength - filledLength;

    const filled = '█'.repeat(filledLength);
    const empty = '░'.repeat(emptyLength);

    return `**${label}**: [${filled}${empty}] ${percent}%\n`;
  }
}

// Run the audit
const auditor = new ThrottlingCheckAuditor();
auditor.audit().catch((error) => {
  console.error('❌ Error during audit:', error);
  process.exit(1);
});

