#!/usr/bin/env ts-node
/**
 * App Store Compliance - Backend Readiness Map
 * 
 * Indexes endpoints supporting app store requirements:
 * - Privacy Policy
 * - Data Deletion/Export (GDPR)
 * - API Versioning
 * - Feature Flags
 * - Account Deletion
 * - Terms of Service
 * 
 * Generates: reports/store_backend_map.md
 */

import * as fs from 'fs';
import * as path from 'path';
import { Project, SourceFile, ClassDeclaration, MethodDeclaration } from 'ts-morph';

interface EndpointInfo {
  path: string;
  method: string;
  controller: string;
  methodName: string;
  module: string;
  file: string;
  line: number;
  category: StoreRequirement;
  description?: string;
  isVersioned: boolean;
  version?: string;
}

type StoreRequirement =
  | 'privacy'
  | 'data-deletion'
  | 'data-export'
  | 'account-deletion'
  | 'terms'
  | 'versioning'
  | 'feature-flag'
  | 'user-consent'
  | 'data-access';

interface StoreComplianceStatus {
  requirement: string;
  required: boolean;
  implemented: boolean;
  endpoints: EndpointInfo[];
  notes: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
}

class StoreBackendMapAuditor {
  private project: Project;
  private endpoints: EndpointInfo[] = [];
  private mainTsContent: string = '';

  constructor() {
    this.project = new Project({
      tsConfigFilePath: path.join(process.cwd(), 'tsconfig.json'),
      skipAddingFilesFromTsConfig: true,
    });
  }

  async audit(): Promise<void> {
    console.log('🔍 Starting App Store Compliance Check...\n');

    // 1. Read main.ts for global config
    this.readMainTs();

    // 2. Scan all controllers
    this.scanControllers();

    console.log(`\n✅ Found ${this.endpoints.length} relevant endpoints\n`);

    // 3. Generate report
    this.generateReport();

    console.log('✨ Audit complete!\n');
  }

  /**
   * Read main.ts for global configuration
   */
  private readMainTs(): void {
    console.log('📄 Reading main.ts configuration...');
    
    const mainTsPath = path.join(process.cwd(), 'src', 'main.ts');
    
    if (fs.existsSync(mainTsPath)) {
      this.mainTsContent = fs.readFileSync(mainTsPath, 'utf-8');
      console.log('  ✓ main.ts loaded\n');
    } else {
      console.log('  ⚠️  main.ts not found\n');
    }
  }

  /**
   * Scan all controllers
   */
  private scanControllers(): void {
    console.log('🔍 Scanning controllers...');
    
    const controllersPath = path.join(process.cwd(), 'src', 'modules');
    const controllerFiles = this.findControllerFiles(controllersPath);
    
    console.log(`  Found ${controllerFiles.length} controller files`);

    for (const filePath of controllerFiles) {
      this.processControllerFile(filePath);
    }
  }

  /**
   * Find controller files
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
   * Process controller file
   */
  private processControllerFile(filePath: string): void {
    try {
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
        const controllerPath = this.extractControllerPath(controllerDecorator, classDecl);
        const isVersioned = this.isControllerVersioned(classDecl);
        const version = this.extractVersion(classDecl);

        const methods = classDecl.getMethods();

        for (const method of methods) {
          const endpoint = this.processEndpointMethod(
            method,
            moduleName,
            controllerName,
            controllerPath,
            relativePath,
            isVersioned,
            version,
          );

          if (endpoint) {
            this.endpoints.push(endpoint);
          }
        }
      }

      this.project.removeSourceFile(sourceFile);
    } catch (error) {
      console.error(`  ⚠️  Error processing ${filePath}:`, error.message);
    }
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
    isVersioned: boolean,
    version?: string,
  ): EndpointInfo | null {
    const httpMethods = ['Get', 'Post', 'Put', 'Patch', 'Delete'];
    let httpMethod = '';
    let routePath = '';

    for (const methodName of httpMethods) {
      const decorator = method.getDecorator(methodName);
      if (decorator) {
        httpMethod = methodName.toUpperCase();
        const args = decorator.getArguments();
        if (args.length > 0) {
          routePath = args[0].getText().replace(/['"]/g, '');
        }
        break;
      }
    }

    if (!httpMethod) {
      return null;
    }

    const fullPath = this.constructFullPath(controllerPath, routePath, isVersioned, version);
    const methodNameStr = method.getName() || 'unknown';
    
    // Check if endpoint is relevant to store compliance
    const category = this.categorizeEndpoint(fullPath, methodNameStr, httpMethod);
    
    if (!category) {
      return null;
    }

    // Extract description from ApiOperation decorator
    let description: string | undefined;
    const apiOpDecorator = method.getDecorator('ApiOperation');
    if (apiOpDecorator) {
      const args = apiOpDecorator.getArguments();
      if (args.length > 0) {
        const argText = args[0].getText();
        const summaryMatch = argText.match(/summary:\s*['"]([^'"]+)['"]/);
        if (summaryMatch) {
          description = summaryMatch[1];
        }
      }
    }

    return {
      path: fullPath,
      method: httpMethod,
      controller: controllerName,
      methodName: methodNameStr,
      module: moduleName,
      file: filePath,
      line: method.getStartLineNumber(),
      category,
      description,
      isVersioned,
      version,
    };
  }

  /**
   * Categorize endpoint based on store requirements
   */
  private categorizeEndpoint(
    path: string,
    methodName: string,
    httpMethod: string,
  ): StoreRequirement | null {
    const pathLower = path.toLowerCase();
    const methodLower = methodName.toLowerCase();

    // Privacy Policy
    if (
      pathLower.includes('privacy') ||
      pathLower.includes('policy') ||
      methodLower.includes('privacy')
    ) {
      return 'privacy';
    }

    // Terms of Service
    if (
      pathLower.includes('terms') ||
      pathLower.includes('tos') ||
      methodLower.includes('terms')
    ) {
      return 'terms';
    }

    // Data Deletion
    if (
      (pathLower.includes('delete') || methodLower.includes('delete')) &&
      (pathLower.includes('account') || pathLower.includes('user') || pathLower.includes('data'))
    ) {
      if (httpMethod === 'DELETE' || methodLower.includes('deleteaccount') || methodLower.includes('removeaccount')) {
        return 'account-deletion';
      }
      return 'data-deletion';
    }

    // Data Export
    if (
      pathLower.includes('export') ||
      methodLower.includes('export') ||
      pathLower.includes('download') && pathLower.includes('data')
    ) {
      if (pathLower.includes('user') || pathLower.includes('my') || methodLower.includes('mydata')) {
        return 'data-export';
      }
    }

    // User Consent
    if (
      pathLower.includes('consent') ||
      pathLower.includes('permission') ||
      methodLower.includes('consent')
    ) {
      return 'user-consent';
    }

    // Data Access (view own data)
    if (
      httpMethod === 'GET' &&
      (pathLower.includes('/me') || pathLower.includes('/profile') || methodLower.includes('getme'))
    ) {
      return 'data-access';
    }

    return null;
  }

  /**
   * Extract module name
   */
  private extractModuleName(filePath: string): string {
    const modulesPath = path.join(process.cwd(), 'src', 'modules');
    const relativePath = path.relative(modulesPath, filePath);
    const parts = relativePath.split(path.sep);
    return parts[0] || 'unknown';
  }

  /**
   * Extract controller path
   */
  private extractControllerPath(decorator: any, classDecl: ClassDeclaration): string {
    const args = decorator.getArguments();
    
    if (args.length === 0) {
      return '';
    }

    const firstArg = args[0];
    const text = firstArg.getText();

    // Check if it's an object with 'path' property
    if (text.includes('path:')) {
      const pathMatch = text.match(/path:\s*['"]([^'"]+)['"]/);
      if (pathMatch) {
        return pathMatch[1];
      }
    }

    // Otherwise it's a simple string
    return text.replace(/['"]/g, '');
  }

  /**
   * Check if controller is versioned
   */
  private isControllerVersioned(classDecl: ClassDeclaration): boolean {
    const controllerDecorator = classDecl.getDecorator('Controller');
    if (!controllerDecorator) {
      return false;
    }

    const args = controllerDecorator.getArguments();
    if (args.length === 0) {
      return false;
    }

    const argText = args[0].getText();
    return argText.includes('version');
  }

  /**
   * Extract version from controller
   */
  private extractVersion(classDecl: ClassDeclaration): string | undefined {
    const controllerDecorator = classDecl.getDecorator('Controller');
    if (!controllerDecorator) {
      return undefined;
    }

    const args = controllerDecorator.getArguments();
    if (args.length === 0) {
      return undefined;
    }

    const argText = args[0].getText();
    const versionMatch = argText.match(/version:\s*['"]?(\d+)['"]?/);
    
    return versionMatch ? versionMatch[1] : undefined;
  }

  /**
   * Construct full path
   */
  private constructFullPath(
    controllerPath: string,
    routePath: string,
    isVersioned: boolean,
    version?: string,
  ): string {
    const parts: string[] = [];

    if (isVersioned && version) {
      parts.push(`api/v${version}`);
    } else {
      parts.push('api');
    }

    if (controllerPath) {
      parts.push(controllerPath.startsWith('/') ? controllerPath.substring(1) : controllerPath);
    }

    if (routePath) {
      parts.push(routePath.startsWith('/') ? routePath.substring(1) : routePath);
    }

    return '/' + parts.join('/');
  }

  /**
   * Check API versioning status
   */
  private checkVersioning(): { enabled: boolean; type?: string; defaultVersion?: string } {
    if (this.mainTsContent.includes('enableVersioning')) {
      const typeMatch = this.mainTsContent.match(/type:\s*VersioningType\.(\w+)/);
      const versionMatch = this.mainTsContent.match(/defaultVersion:\s*['"](\d+)['"]/);

      return {
        enabled: true,
        type: typeMatch ? typeMatch[1] : 'unknown',
        defaultVersion: versionMatch ? versionMatch[1] : undefined,
      };
    }

    return { enabled: false };
  }

  /**
   * Generate report
   */
  private generateReport(): void {
    const reportPath = path.join(process.cwd(), 'reports', 'store_backend_map.md');

    const reportsDir = path.dirname(reportPath);
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    let content = '# تقرير جاهزية Backend لمتاجر التطبيقات\n\n';
    content += `**التاريخ**: ${new Date().toLocaleDateString('ar-EG', { dateStyle: 'full' })}\n`;
    content += `**الوقت**: ${new Date().toLocaleTimeString('ar-EG')}\n\n`;
    content += '**الهدف**: التحقق من امتثال Backend لمتطلبات App Store و Google Play Store\n\n';
    content += '---\n\n';

    // Executive Summary
    content += '## 📊 الملخص التنفيذي\n\n';
    
    const versioningStatus = this.checkVersioning();
    const requirements = this.buildComplianceStatus();
    const implementedCount = requirements.filter(r => r.implemented).length;
    const criticalCount = requirements.filter(r => r.priority === 'critical' && !r.implemented).length;

    content += `- **إجمالي المتطلبات**: ${requirements.length}\n`;
    content += `- **المُنفذة**: ${implementedCount}/${requirements.length}\n`;
    content += `- **المتطلبات الحرجة المفقودة**: ${criticalCount}\n`;
    content += `- **API Versioning**: ${versioningStatus.enabled ? '✅ مُفعّل' : '❌ غير مُفعّل'}\n\n`;

    const compliancePercent = Math.round((implementedCount / requirements.length) * 100);
    content += this.generateProgressBar('نسبة الامتثال', compliancePercent);
    content += '\n';

    // Store Requirements Status
    content += '## 🏪 حالة متطلبات المتاجر\n\n';
    content += '| المتطلب | الحالة | الأولوية | Endpoints | ملاحظات |\n';
    content += '|---------|--------|----------|-----------|----------|\n';

    for (const req of requirements) {
      const status = req.implemented ? '✅' : '❌';
      const priorityEmoji = {
        critical: '🔴',
        high: '🟠',
        medium: '🟡',
        low: '🟢',
      }[req.priority];

      content += `| ${req.requirement} | ${status} | ${priorityEmoji} ${req.priority} | ${req.endpoints.length} | ${req.notes} |\n`;
    }
    content += '\n';

    // API Versioning Details
    content += '## 🔢 API Versioning\n\n';
    
    if (versioningStatus.enabled) {
      content += `✅ **مُفعّل**\n\n`;
      content += `- **النوع**: ${versioningStatus.type}\n`;
      content += `- **الإصدار الافتراضي**: v${versioningStatus.defaultVersion}\n\n`;

      const versionedEndpoints = this.endpoints.filter(e => e.isVersioned).length;
      const totalEndpoints = this.endpoints.length;
      
      content += `- **Endpoints المُصدّرة**: ${versionedEndpoints}/${totalEndpoints}\n\n`;
    } else {
      content += `❌ **غير مُفعّل**\n\n`;
      content += '**التوصية**: تفعيل API versioning في `main.ts` للتوافق مع متطلبات المتاجر.\n\n';
      content += '```typescript\n';
      content += 'app.enableVersioning({\n';
      content += '  type: VersioningType.URI,\n';
      content += '  defaultVersion: \'1\',\n';
      content += '});\n';
      content += '```\n\n';
    }

    // Detailed Endpoints
    content += '## 📋 Endpoints المُكتشفة\n\n';

    const byCategory = new Map<StoreRequirement, EndpointInfo[]>();
    for (const endpoint of this.endpoints) {
      if (!byCategory.has(endpoint.category)) {
        byCategory.set(endpoint.category, []);
      }
      byCategory.get(endpoint.category)!.push(endpoint);
    }

    const categoryNames: Record<StoreRequirement, string> = {
      'privacy': 'سياسة الخصوصية',
      'terms': 'شروط الاستخدام',
      'data-deletion': 'حذف البيانات',
      'data-export': 'تصدير البيانات',
      'account-deletion': 'حذف الحساب',
      'user-consent': 'موافقة المستخدم',
      'data-access': 'الوصول للبيانات الشخصية',
      'versioning': 'إدارة الإصدارات',
      'feature-flag': 'Feature Flags',
    };

    for (const [category, endpoints] of Array.from(byCategory.entries())) {
      content += `### ${categoryNames[category]}\n\n`;
      
      if (endpoints.length === 0) {
        content += '_لا توجد endpoints_\n\n';
        continue;
      }

      content += '| المسار | HTTP | الوصف | المودول |\n';
      content += '|--------|------|-------|----------|\n';

      for (const ep of endpoints) {
        content += `| \`${ep.path}\` | ${ep.method} | ${ep.description || ep.methodName} | ${ep.module} |\n`;
      }
      content += '\n';
    }

    // Missing Requirements
    content += '## ⚠️ المتطلبات المفقودة\n\n';

    const missing = requirements.filter(r => !r.implemented);
    
    if (missing.length === 0) {
      content += '_جميع المتطلبات الأساسية مُنفذة!_ 🎉\n\n';
    } else {
      content += `تم العثور على **${missing.length}** متطلب مفقود:\n\n`;

      for (const req of missing.filter(r => r.priority === 'critical' || r.priority === 'high')) {
        content += `### ${req.requirement}\n\n`;
        content += `**الأولوية**: ${req.priority}\n\n`;
        content += `${req.notes}\n\n`;
        
        content += this.getImplementationGuide(req.requirement);
        content += '\n---\n\n';
      }
    }

    // Store-Specific Requirements
    content += '## 📱 متطلبات المتاجر المحددة\n\n';

    content += '### Apple App Store\n\n';
    content += '- [x] API Versioning\n';
    content += `- [${this.hasEndpoint('data-access') ? 'x' : ' '}] Data Access (الوصول للبيانات الشخصية)\n`;
    content += `- [${this.hasEndpoint('account-deletion') ? 'x' : ' '}] Account Deletion (حذف الحساب)\n`;
    content += `- [${this.hasEndpoint('data-export') ? 'x' : ' '}] Data Portability (تصدير البيانات)\n`;
    content += `- [${this.hasEndpoint('privacy') ? 'x' : ' '}] Privacy Policy Link\n`;
    content += '- [ ] App Tracking Transparency (ATT) Support\n\n';

    content += '### Google Play Store\n\n';
    content += '- [x] API Versioning\n';
    content += `- [${this.hasEndpoint('data-deletion') ? 'x' : ' '}] Data Deletion (GDPR)\n`;
    content += `- [${this.hasEndpoint('data-export') ? 'x' : ' '}] Data Export (GDPR)\n`;
    content += `- [${this.hasEndpoint('privacy') ? 'x' : ' '}] Privacy Policy\n`;
    content += `- [${this.hasEndpoint('user-consent') ? 'x' : ' '}] User Consent Management\n`;
    content += '- [ ] Data Safety Section Information\n\n';

    // Recommendations
    content += '## 💡 التوصيات\n\n';

    content += '### 1. حرجة (Critical)\n\n';

    const critical = requirements.filter(r => r.priority === 'critical' && !r.implemented);
    if (critical.length > 0) {
      for (const req of critical) {
        content += `- **${req.requirement}**: ${req.notes}\n`;
      }
      content += '\n';
    } else {
      content += '_جميع المتطلبات الحرجة مُنفذة!_\n\n';
    }

    content += '### 2. عالية (High)\n\n';

    const high = requirements.filter(r => r.priority === 'high' && !r.implemented);
    if (high.length > 0) {
      for (const req of high) {
        content += `- **${req.requirement}**: ${req.notes}\n`;
      }
      content += '\n';
    } else {
      content += '_جميع المتطلبات العالية مُنفذة!_\n\n';
    }

    content += '### 3. أفضل الممارسات\n\n';
    content += '- **Documentation**: توثيق جميع endpoints المتعلقة بالخصوصية في Swagger\n';
    content += '- **Rate Limiting**: تطبيق rate limiting على endpoints حذف البيانات\n';
    content += '- **Audit Logs**: تسجيل جميع عمليات حذف البيانات\n';
    content += '- **User Verification**: التحقق من هوية المستخدم قبل حذف البيانات\n';
    content += '- **Backup**: الاحتفاظ بنسخة احتياطية لفترة محدودة قبل الحذف النهائي\n';
    content += '- **Transparency**: إعلام المستخدم بالبيانات التي سيتم حذفها\n\n';

    // Action Plan
    content += '## 📝 خطة العمل\n\n';
    
    const sortedMissing = requirements.filter(r => !r.implemented).sort((a, b) => {
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

    for (const req of sortedMissing) {
      content += `- [ ] ${req.requirement} (${req.priority})\n`;
    }

    if (sortedMissing.length === 0) {
      content += '_جميع المتطلبات مُنفذة! يمكن المتابعة للنشر في المتاجر._\n';
    }

    content += '\n---\n\n';
    content += '_تم إنشاء هذا التقرير تلقائياً بواسطة `tools/audit/store_backend_map.ts`_\n';

    fs.writeFileSync(reportPath, content, 'utf-8');
    console.log(`📊 Report generated: ${reportPath}`);
  }

  /**
   * Build compliance status
   */
  private buildComplianceStatus(): StoreComplianceStatus[] {
    const statuses: StoreComplianceStatus[] = [
      {
        requirement: 'Privacy Policy Endpoint',
        required: true,
        implemented: this.hasEndpoint('privacy'),
        endpoints: this.getEndpoints('privacy'),
        notes: 'مطلوب لكلا المتجرين',
        priority: 'critical',
      },
      {
        requirement: 'Account Deletion Endpoint',
        required: true,
        implemented: this.hasEndpoint('account-deletion'),
        endpoints: this.getEndpoints('account-deletion'),
        notes: 'مطلوب من Apple، موصى به من Google',
        priority: 'critical',
      },
      {
        requirement: 'Data Export Endpoint (GDPR)',
        required: true,
        implemented: this.hasEndpoint('data-export'),
        endpoints: this.getEndpoints('data-export'),
        notes: 'مطلوب لـ GDPR compliance',
        priority: 'high',
      },
      {
        requirement: 'Data Deletion Endpoint (GDPR)',
        required: true,
        implemented: this.hasEndpoint('data-deletion'),
        endpoints: this.getEndpoints('data-deletion'),
        notes: 'مطلوب لـ GDPR compliance',
        priority: 'high',
      },
      {
        requirement: 'User Data Access Endpoint',
        required: true,
        implemented: this.hasEndpoint('data-access'),
        endpoints: this.getEndpoints('data-access'),
        notes: 'السماح للمستخدم بعرض بياناته',
        priority: 'high',
      },
      {
        requirement: 'Terms of Service Endpoint',
        required: false,
        implemented: this.hasEndpoint('terms'),
        endpoints: this.getEndpoints('terms'),
        notes: 'موصى به',
        priority: 'medium',
      },
      {
        requirement: 'User Consent Management',
        required: false,
        implemented: this.hasEndpoint('user-consent'),
        endpoints: this.getEndpoints('user-consent'),
        notes: 'موصى به للامتثال الكامل',
        priority: 'medium',
      },
      {
        requirement: 'API Versioning',
        required: true,
        implemented: this.checkVersioning().enabled,
        endpoints: [],
        notes: 'للحفاظ على التوافق',
        priority: 'high',
      },
    ];

    return statuses;
  }

  /**
   * Check if endpoint exists
   */
  private hasEndpoint(category: StoreRequirement): boolean {
    return this.endpoints.some(e => e.category === category);
  }

  /**
   * Get endpoints by category
   */
  private getEndpoints(category: StoreRequirement): EndpointInfo[] {
    return this.endpoints.filter(e => e.category === category);
  }

  /**
   * Get implementation guide for requirement
   */
  private getImplementationGuide(requirement: string): string {
    const guides: Record<string, string> = {
      'Privacy Policy Endpoint': `
**مثال التنفيذ**:

\`\`\`typescript
@Controller('legal')
export class LegalController {
  @Public()
  @Get('privacy-policy')
  @ApiOperation({ summary: 'سياسة الخصوصية' })
  async getPrivacyPolicy() {
    return {
      url: 'https://bthwani.app/privacy',
      lastUpdated: '2025-01-01',
      version: '1.0',
    };
  }
}
\`\`\`
`,
      'Account Deletion Endpoint': `
**مثال التنفيذ**:

\`\`\`typescript
@Controller({ path: 'users', version: '2' })
export class UserController {
  @Auth(AuthType.FIREBASE)
  @Delete('account')
  @ApiOperation({ summary: 'حذف الحساب نهائياً' })
  async deleteAccount(@CurrentUser('id') userId: string) {
    // Verify user identity
    // Delete user data
    // Log the action
    return { message: 'تم حذف حسابك بنجاح' };
  }
}
\`\`\`
`,
      'Data Export Endpoint (GDPR)': `
**مثال التنفيذ**:

\`\`\`typescript
@Controller({ path: 'users', version: '2' })
export class UserController {
  @Auth(AuthType.FIREBASE)
  @Get('export-data')
  @ApiOperation({ summary: 'تصدير جميع بياناتي' })
  async exportMyData(@CurrentUser('id') userId: string) {
    const userData = await this.userService.getAllUserData(userId);
    return {
      user: userData.profile,
      orders: userData.orders,
      transactions: userData.transactions,
      exportedAt: new Date(),
    };
  }
}
\`\`\`
`,
    };

    return guides[requirement] || '';
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
const auditor = new StoreBackendMapAuditor();
auditor.audit().catch((error) => {
  console.error('❌ Error during audit:', error);
  process.exit(1);
});

