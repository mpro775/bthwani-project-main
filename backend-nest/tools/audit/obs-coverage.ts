#!/usr/bin/env ts-node
/**
 * Observability Coverage Audit Script
 * 
 * Checks for:
 * - Logger usage in services
 * - RequestId/Correlation ID tracking
 * - Metrics/Counters usage
 * 
 * Generates: reports/observability_coverage.md
 * Reports: % of services with Logs + Metrics + Traces
 */

import * as fs from 'fs';
import * as path from 'path';
import { Project, SourceFile, ClassDeclaration, SyntaxKind } from 'ts-morph';

interface ServiceObservability {
  module: string;
  service: string;
  file: string;
  hasLogger: boolean;
  loggerType: 'winston' | 'nestjs' | 'none';
  logStatements: number;
  hasCorrelationId: boolean;
  hasMetrics: boolean;
  metricsCount: number;
  hasTracing: boolean;
  hasErrorHandling: boolean;
  tryBlocksCount: number;
  score: number; // 0-100
}

interface ModuleStats {
  totalServices: number;
  withLogs: number;
  withMetrics: number;
  withTracing: number;
  withCorrelation: number;
  withErrorHandling: number;
  fullyCovered: number; // Has all 3: logs, metrics, correlation
  averageScore: number;
}

class ObservabilityCoverageAuditor {
  private project: Project;
  private servicesPath: string;
  private services: ServiceObservability[] = [];

  constructor() {
    this.project = new Project({
      tsConfigFilePath: path.join(process.cwd(), 'tsconfig.json'),
      skipAddingFilesFromTsConfig: true,
    });
    this.servicesPath = path.join(process.cwd(), 'src', 'modules');
  }

  async audit(): Promise<void> {
    console.log('🔍 Starting Observability Coverage Audit...\n');

    // Find all service files
    const serviceFiles = this.findServiceFiles(this.servicesPath);
    console.log(`📁 Found ${serviceFiles.length} service files\n`);

    // Process each service file
    for (const filePath of serviceFiles) {
      this.processServiceFile(filePath);
    }

    console.log(`\n✅ Analyzed ${this.services.length} services\n`);

    // Generate report
    this.generateMarkdownReport();

    console.log('✨ Audit complete!\n');
  }

  /**
   * Recursively find all service files
   */
  private findServiceFiles(dir: string): string[] {
    const files: string[] = [];

    if (!fs.existsSync(dir)) {
      return files;
    }

    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        files.push(...this.findServiceFiles(fullPath));
      } else if (
        entry.isFile() &&
        entry.name.endsWith('.service.ts') &&
        !entry.name.endsWith('.spec.ts')
      ) {
        files.push(fullPath);
      }
    }

    return files;
  }

  /**
   * Process a single service file
   */
  private processServiceFile(filePath: string): void {
    const sourceFile = this.project.addSourceFileAtPath(filePath);
    const relativePath = path.relative(process.cwd(), filePath);
    const moduleName = this.extractModuleName(filePath);

    console.log(`  📄 Processing: ${relativePath}`);

    // Find all classes with @Injectable decorator
    const classes = sourceFile.getClasses();

    for (const classDecl of classes) {
      const injectableDecorator = classDecl.getDecorator('Injectable');

      if (!injectableDecorator) {
        continue;
      }

      const serviceName = classDecl.getName() || 'UnnamedService';

      const observability: ServiceObservability = {
        module: moduleName,
        service: serviceName,
        file: relativePath,
        hasLogger: this.checkHasLogger(sourceFile, classDecl),
        loggerType: this.detectLoggerType(sourceFile, classDecl),
        logStatements: this.countLogStatements(classDecl),
        hasCorrelationId: this.checkHasCorrelationId(sourceFile, classDecl),
        hasMetrics: this.checkHasMetrics(sourceFile, classDecl),
        metricsCount: this.countMetrics(sourceFile, classDecl),
        hasTracing: this.checkHasTracing(sourceFile, classDecl),
        hasErrorHandling: this.checkHasErrorHandling(classDecl),
        tryBlocksCount: this.countTryBlocks(classDecl),
        score: 0,
      };

      // Calculate observability score (0-100)
      observability.score = this.calculateScore(observability);

      this.services.push(observability);
    }

    // Remove the source file to free memory
    this.project.removeSourceFile(sourceFile);
  }

  /**
   * Extract module name from file path
   */
  private extractModuleName(filePath: string): string {
    const relativePath = path.relative(this.servicesPath, filePath);
    const parts = relativePath.split(path.sep);
    return parts[0] || 'unknown';
  }

  /**
   * Check if service has a logger
   */
  private checkHasLogger(
    sourceFile: SourceFile,
    classDecl: ClassDeclaration,
  ): boolean {
    // Check for Logger import
    const hasLoggerImport = sourceFile
      .getImportDeclarations()
      .some(
        (imp) =>
          imp.getModuleSpecifierValue().includes('@nestjs/common') &&
          imp
            .getNamedImports()
            .some((named) => named.getName() === 'Logger'),
      );

    // Check for winston logger
    const hasWinstonImport = sourceFile
      .getImportDeclarations()
      .some(
        (imp) =>
          imp.getModuleSpecifierValue().includes('winston') ||
          imp.getModuleSpecifierValue().includes('nest-winston'),
      );

    // Check for logger property in class
    const hasLoggerProperty = classDecl
      .getProperties()
      .some(
        (prop) =>
          prop.getName().toLowerCase().includes('logger') ||
          prop.getType().getText().includes('Logger'),
      );

    return (hasLoggerImport || hasWinstonImport) && hasLoggerProperty;
  }

  /**
   * Detect logger type
   */
  private detectLoggerType(
    sourceFile: SourceFile,
    classDecl: ClassDeclaration,
  ): 'winston' | 'nestjs' | 'none' {
    const hasWinston = sourceFile
      .getImportDeclarations()
      .some(
        (imp) =>
          imp.getModuleSpecifierValue().includes('winston') ||
          imp.getModuleSpecifierValue().includes('nest-winston'),
      );

    const hasNestLogger = sourceFile
      .getImportDeclarations()
      .some(
        (imp) =>
          imp.getModuleSpecifierValue().includes('@nestjs/common') &&
          imp
            .getNamedImports()
            .some((named) => named.getName() === 'Logger'),
      );

    if (hasWinston) return 'winston';
    if (hasNestLogger) return 'nestjs';
    return 'none';
  }

  /**
   * Count log statements (log, error, warn, debug, info)
   */
  private countLogStatements(classDecl: ClassDeclaration): number {
    let count = 0;
    const text = classDecl.getText();

    const logMethods = [
      'logger.log',
      'logger.error',
      'logger.warn',
      'logger.debug',
      'logger.info',
      'this.logger.log',
      'this.logger.error',
      'this.logger.warn',
      'this.logger.debug',
      'this.logger.info',
    ];

    for (const method of logMethods) {
      const regex = new RegExp(method.replace('.', '\\.'), 'g');
      const matches = text.match(regex);
      if (matches) {
        count += matches.length;
      }
    }

    return count;
  }

  /**
   * Check if service uses correlation/request IDs
   */
  private checkHasCorrelationId(
    sourceFile: SourceFile,
    classDecl: ClassDeclaration,
  ): boolean {
    const text = sourceFile.getText() + classDecl.getText();

    const correlationKeywords = [
      'correlationId',
      'correlation_id',
      'requestId',
      'request_id',
      'traceId',
      'trace_id',
      'causationId',
      'causation_id',
    ];

    return correlationKeywords.some((keyword) => text.includes(keyword));
  }

  /**
   * Check if service uses metrics
   */
  private checkHasMetrics(
    sourceFile: SourceFile,
    classDecl: ClassDeclaration,
  ): boolean {
    // Check for Prometheus imports
    const hasPrometheusImport = sourceFile
      .getImportDeclarations()
      .some((imp) =>
        imp.getModuleSpecifierValue().includes('nestjs-prometheus'),
      );

    // Check for metric decorators/injections
    const text = sourceFile.getText();
    const metricsKeywords = [
      '@InjectMetric',
      'Counter',
      'Histogram',
      'Gauge',
      'Summary',
      'counter.inc',
      'histogram.observe',
      'gauge.set',
    ];

    return (
      hasPrometheusImport ||
      metricsKeywords.some((keyword) => text.includes(keyword))
    );
  }

  /**
   * Count metrics usage
   */
  private countMetrics(
    sourceFile: SourceFile,
    classDecl: ClassDeclaration,
  ): number {
    let count = 0;
    const text = classDecl.getText();

    const metricsPatterns = [
      /counter\.inc/g,
      /histogram\.observe/g,
      /gauge\.set/g,
      /summary\.observe/g,
      /@InjectMetric/g,
    ];

    for (const pattern of metricsPatterns) {
      const matches = text.match(pattern);
      if (matches) {
        count += matches.length;
      }
    }

    return count;
  }

  /**
   * Check if service has tracing (OpenTelemetry, etc.)
   */
  private checkHasTracing(
    sourceFile: SourceFile,
    classDecl: ClassDeclaration,
  ): boolean {
    const text = sourceFile.getText();

    const tracingKeywords = [
      '@opentelemetry',
      'opentracing',
      '@Span',
      '@Trace',
      'tracer.',
      'span.',
      'startSpan',
    ];

    return tracingKeywords.some((keyword) => text.includes(keyword));
  }

  /**
   * Check if service has proper error handling
   */
  private checkHasErrorHandling(classDecl: ClassDeclaration): boolean {
    const methods = classDecl.getMethods();

    for (const method of methods) {
      const tryStatements = method.getDescendantsOfKind(
        SyntaxKind.TryStatement,
      );
      if (tryStatements.length > 0) {
        return true;
      }
    }

    return false;
  }

  /**
   * Count try-catch blocks
   */
  private countTryBlocks(classDecl: ClassDeclaration): number {
    let count = 0;
    const methods = classDecl.getMethods();

    for (const method of methods) {
      const tryStatements = method.getDescendantsOfKind(
        SyntaxKind.TryStatement,
      );
      count += tryStatements.length;
    }

    return count;
  }

  /**
   * Calculate observability score (0-100)
   */
  private calculateScore(obs: ServiceObservability): number {
    let score = 0;

    // Logger: 30 points
    if (obs.hasLogger) {
      score += 20;
      if (obs.logStatements > 0) score += 5;
      if (obs.logStatements >= 3) score += 5;
    }

    // Correlation ID: 25 points
    if (obs.hasCorrelationId) {
      score += 25;
    }

    // Metrics: 25 points
    if (obs.hasMetrics) {
      score += 15;
      if (obs.metricsCount > 0) score += 5;
      if (obs.metricsCount >= 3) score += 5;
    }

    // Tracing: 10 points
    if (obs.hasTracing) {
      score += 10;
    }

    // Error Handling: 10 points
    if (obs.hasErrorHandling) {
      score += 5;
      if (obs.tryBlocksCount >= 2) score += 5;
    }

    return Math.min(score, 100);
  }

  /**
   * Calculate module statistics
   */
  private calculateModuleStats(): Map<string, ModuleStats> {
    const statsMap = new Map<string, ModuleStats>();

    for (const service of this.services) {
      if (!statsMap.has(service.module)) {
        statsMap.set(service.module, {
          totalServices: 0,
          withLogs: 0,
          withMetrics: 0,
          withTracing: 0,
          withCorrelation: 0,
          withErrorHandling: 0,
          fullyCovered: 0,
          averageScore: 0,
        });
      }

      const stats = statsMap.get(service.module)!;
      stats.totalServices++;
      if (service.hasLogger) stats.withLogs++;
      if (service.hasMetrics) stats.withMetrics++;
      if (service.hasTracing) stats.withTracing++;
      if (service.hasCorrelationId) stats.withCorrelation++;
      if (service.hasErrorHandling) stats.withErrorHandling++;
      if (
        service.hasLogger &&
        service.hasMetrics &&
        service.hasCorrelationId
      ) {
        stats.fullyCovered++;
      }
    }

    // Calculate average scores
    for (const [module, stats] of statsMap.entries()) {
      const moduleServices = this.services.filter(
        (s) => s.module === module,
      );
      const totalScore = moduleServices.reduce(
        (sum, s) => sum + s.score,
        0,
      );
      stats.averageScore = totalScore / moduleServices.length;
    }

    return statsMap;
  }

  /**
   * Calculate overall statistics
   */
  private calculateOverallStats(): ModuleStats {
    const stats: ModuleStats = {
      totalServices: this.services.length,
      withLogs: 0,
      withMetrics: 0,
      withTracing: 0,
      withCorrelation: 0,
      withErrorHandling: 0,
      fullyCovered: 0,
      averageScore: 0,
    };

    for (const service of this.services) {
      if (service.hasLogger) stats.withLogs++;
      if (service.hasMetrics) stats.withMetrics++;
      if (service.hasTracing) stats.withTracing++;
      if (service.hasCorrelationId) stats.withCorrelation++;
      if (service.hasErrorHandling) stats.withErrorHandling++;
      if (
        service.hasLogger &&
        service.hasMetrics &&
        service.hasCorrelationId
      ) {
        stats.fullyCovered++;
      }
    }

    const totalScore = this.services.reduce((sum, s) => sum + s.score, 0);
    stats.averageScore = totalScore / this.services.length;

    return stats;
  }

  /**
   * Generate markdown report
   */
  private generateMarkdownReport(): void {
    const reportPath = path.join(
      process.cwd(),
      'reports',
      'observability_coverage.md',
    );

    // Ensure reports directory exists
    const reportsDir = path.dirname(reportPath);
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    const moduleStats = this.calculateModuleStats();
    const overallStats = this.calculateOverallStats();

    let content = '# تقرير تغطية المراقبة (Observability Coverage)\n\n';
    content += `**التاريخ**: ${new Date().toLocaleDateString('ar-EG', { dateStyle: 'full' })}\n`;
    content += `**الوقت**: ${new Date().toLocaleTimeString('ar-EG')}\n\n`;
    content += '---\n\n';

    // Overall Summary
    content += '## 📊 الملخص العام\n\n';
    content += `- **إجمالي الخدمات**: ${overallStats.totalServices}\n`;
    content += `- **الخدمات مع Logs**: ${overallStats.withLogs} (${this.percentage(overallStats.withLogs, overallStats.totalServices)}%)\n`;
    content += `- **الخدمات مع Metrics**: ${overallStats.withMetrics} (${this.percentage(overallStats.withMetrics, overallStats.totalServices)}%)\n`;
    content += `- **الخدمات مع Tracing**: ${overallStats.withTracing} (${this.percentage(overallStats.withTracing, overallStats.totalServices)}%)\n`;
    content += `- **الخدمات مع Correlation ID**: ${overallStats.withCorrelation} (${this.percentage(overallStats.withCorrelation, overallStats.totalServices)}%)\n`;
    content += `- **الخدمات مع Error Handling**: ${overallStats.withErrorHandling} (${this.percentage(overallStats.withErrorHandling, overallStats.totalServices)}%)\n`;
    content += `- **التغطية الكاملة (Logs+Metrics+Correlation)**: ${overallStats.fullyCovered} (${this.percentage(overallStats.fullyCovered, overallStats.totalServices)}%)\n`;
    content += `- **متوسط النقاط**: ${overallStats.averageScore.toFixed(1)}/100\n\n`;

    // Coverage Bar
    const coveragePercent = this.percentage(
      overallStats.fullyCovered,
      overallStats.totalServices,
    );
    content += this.generateProgressBar(
      'التغطية الكاملة',
      coveragePercent,
    );
    content += this.generateProgressBar(
      'Logs',
      this.percentage(overallStats.withLogs, overallStats.totalServices),
    );
    content += this.generateProgressBar(
      'Metrics',
      this.percentage(overallStats.withMetrics, overallStats.totalServices),
    );
    content += this.generateProgressBar(
      'Correlation',
      this.percentage(
        overallStats.withCorrelation,
        overallStats.totalServices,
      ),
    );
    content += '\n';

    // Module Statistics
    content += '## 📦 إحصائيات المودولات\n\n';
    content += '| المودول | الخدمات | Logs | Metrics | Correlation | Error Handling | متوسط النقاط |\n';
    content += '|---------|---------|------|---------|-------------|---------------|---------------|\n';

    const sortedModules = Array.from(moduleStats.entries()).sort(
      (a, b) => b[1].averageScore - a[1].averageScore,
    );

    for (const [module, stats] of sortedModules) {
      content += `| ${module} | ${stats.totalServices} | `;
      content += `${stats.withLogs}/${stats.totalServices} | `;
      content += `${stats.withMetrics}/${stats.totalServices} | `;
      content += `${stats.withCorrelation}/${stats.totalServices} | `;
      content += `${stats.withErrorHandling}/${stats.totalServices} | `;
      content += `${stats.averageScore.toFixed(1)}/100 |\n`;
    }
    content += '\n';

    // Top Performers
    content += '## 🏆 الخدمات الأفضل (Top 10)\n\n';
    const topServices = [...this.services]
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    content += '| الخدمة | المودول | النقاط | Logs | Metrics | Correlation |\n';
    content += '|--------|---------|--------|------|---------|-------------|\n';

    for (const service of topServices) {
      content += `| ${service.service} | ${service.module} | `;
      content += `${service.score}/100 | `;
      content += `${service.hasLogger ? '✅' : '❌'} | `;
      content += `${service.hasMetrics ? '✅' : '❌'} | `;
      content += `${service.hasCorrelationId ? '✅' : '❌'} |\n`;
    }
    content += '\n';

    // Services Needing Improvement
    content += '## ⚠️ الخدمات التي تحتاج تحسين (Score < 50)\n\n';
    const needsImprovement = this.services
      .filter((s) => s.score < 50)
      .sort((a, b) => a.score - b.score);

    if (needsImprovement.length === 0) {
      content += '_جميع الخدمات تحقق الحد الأدنى من التغطية!_ 🎉\n\n';
    } else {
      content += '| الخدمة | المودول | النقاط | مشاكل |\n';
      content += '|--------|---------|--------|-------|\n';

      for (const service of needsImprovement) {
        const issues: string[] = [];
        if (!service.hasLogger) issues.push('No Logger');
        if (!service.hasMetrics) issues.push('No Metrics');
        if (!service.hasCorrelationId) issues.push('No Correlation');
        if (!service.hasErrorHandling) issues.push('No Error Handling');

        content += `| ${service.service} | ${service.module} | `;
        content += `${service.score}/100 | `;
        content += `${issues.join(', ')} |\n`;
      }
      content += '\n';
    }

    // Detailed Services Table
    content += '## 📋 تفاصيل جميع الخدمات\n\n';
    content += '<details>\n<summary>عرض التفاصيل الكاملة</summary>\n\n';
    content += '| الخدمة | المودول | Logger | Logs# | Metrics | Corr | Error | النقاط | الملف |\n';
    content += '|--------|---------|--------|-------|---------|------|-------|--------|-------|\n';

    for (const service of this.services) {
      content += `| ${service.service} | ${service.module} | `;
      content += `${service.loggerType} | `;
      content += `${service.logStatements} | `;
      content += `${service.hasMetrics ? '✅' : '❌'} | `;
      content += `${service.hasCorrelationId ? '✅' : '❌'} | `;
      content += `${service.hasErrorHandling ? '✅' : '❌'} | `;
      content += `${service.score}/100 | `;
      content += `\`${service.file}\` |\n`;
    }
    content += '\n</details>\n\n';

    // Recommendations
    content += '## 💡 التوصيات\n\n';
    content += '### 1. تحسين التغطية\n\n';

    const noLogger = this.services.filter((s) => !s.hasLogger).length;
    const noMetrics = this.services.filter((s) => !s.hasMetrics).length;
    const noCorrelation = this.services.filter(
      (s) => !s.hasCorrelationId,
    ).length;

    if (noLogger > 0) {
      content += `- **إضافة Logger**: ${noLogger} خدمة بدون logger\n`;
      content += '  ```typescript\n';
      content += '  import { Logger } from \'@nestjs/common\';\n\n';
      content += '  @Injectable()\n';
      content += '  export class YourService {\n';
      content += '    private readonly logger = new Logger(YourService.name);\n';
      content += '  }\n';
      content += '  ```\n\n';
    }

    if (noMetrics > 0) {
      content += `- **إضافة Metrics**: ${noMetrics} خدمة بدون metrics\n`;
      content += '  - تفعيل PrometheusModule في `metrics.module.ts`\n';
      content += '  - إضافة Counters و Histograms للعمليات الهامة\n\n';
    }

    if (noCorrelation > 0) {
      content += `- **إضافة Correlation IDs**: ${noCorrelation} خدمة بدون correlation tracking\n`;
      content += '  - إضافة middleware لتتبع Request IDs\n';
      content += '  - تمرير correlationId في جميع العمليات\n\n';
    }

    content += '### 2. أولويات التحسين\n\n';
    content += '**المودولات ذات الأولوية العالية** (أقل متوسط نقاط):\n\n';

    const priorityModules = Array.from(moduleStats.entries())
      .sort((a, b) => a[1].averageScore - b[1].averageScore)
      .slice(0, 5);

    for (const [module, stats] of priorityModules) {
      content += `1. **${module}** - متوسط النقاط: ${stats.averageScore.toFixed(1)}/100\n`;
      const improvements: string[] = [];
      if (stats.withLogs < stats.totalServices)
        improvements.push(
          `إضافة logs إلى ${stats.totalServices - stats.withLogs} خدمة`,
        );
      if (stats.withMetrics < stats.totalServices)
        improvements.push(
          `إضافة metrics إلى ${stats.totalServices - stats.withMetrics} خدمة`,
        );
      if (stats.withCorrelation < stats.totalServices)
        improvements.push(
          `إضافة correlation IDs إلى ${stats.totalServices - stats.withCorrelation} خدمة`,
        );
      content += `   - ${improvements.join('\n   - ')}\n\n`;
    }

    content += '### 3. معايير الجودة\n\n';
    content += '**الحد الأدنى المطلوب لكل خدمة**:\n';
    content += '- ✅ Logger مع 3+ log statements على الأقل\n';
    content += '- ✅ Correlation ID tracking للعمليات المترابطة\n';
    content += '- ✅ Error handling مع try-catch blocks\n';
    content += '- ✅ Metrics للعمليات الحساسة (optional لكن مهم)\n\n';

    content += '**الهدف**: 80% من الخدمات تحقق التغطية الكاملة\n\n';

    // Footer
    content += '---\n\n';
    content += '_تم إنشاء هذا التقرير تلقائياً بواسطة `tools/audit/obs-coverage.ts`_\n';

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
   * Generate ASCII progress bar
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
const auditor = new ObservabilityCoverageAuditor();
auditor.audit().catch((error) => {
  console.error('❌ Error during audit:', error);
  process.exit(1);
});

