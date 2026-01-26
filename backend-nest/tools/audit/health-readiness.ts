#!/usr/bin/env ts-node
/**
 * Health/Readiness - Gap Report
 *
 * Checks for health endpoint implementation and identifies gaps:
 * - /health endpoint existence
 * - @nestjs/terminus integration
 * - Readiness/Liveness probes
 * - Memory/Disk/MongoDB health indicators
 * 
 * Generates: reports/health_gaps.md with non-mandatory recommendations
 */

import * as fs from 'fs';
import * as path from 'path';

interface HealthCheck {
  id: string;
  name: string;
  description: string;
  category: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'implemented' | 'partial' | 'missing';
  evidence: Evidence[];
  recommendations: string[];
}

interface Evidence {
  file: string;
  line: number;
  code: string;
}

interface HealthGapReport {
  generated_at: string;
  summary: {
    total_checks: number;
    implemented: number;
    partial: number;
    missing: number;
    coverage_percentage: number;
  };
  checks: HealthCheck[];
}

/**
 * Search for pattern in files
 */
function searchInFiles(
  pattern: string | RegExp,
  extensions: string[] = ['ts', 'json'],
  excludeDirs: string[] = ['node_modules', 'dist', 'coverage', '.git', 'reports'],
): Evidence[] {
  const evidence: Evidence[] = [];

  function searchInDirectory(dir: string) {
    if (!fs.existsSync(dir)) return;

    const items = fs.readdirSync(dir, { withFileTypes: true });

    for (const item of items) {
      const fullPath = path.join(dir, item.name);

      if (item.isDirectory()) {
        if (!excludeDirs.includes(item.name)) {
          searchInDirectory(fullPath);
        }
        continue;
      }

      const ext = path.extname(item.name).slice(1);
      if (!extensions.includes(ext)) continue;

      try {
        const content = fs.readFileSync(fullPath, 'utf-8');
        const lines = content.split('\n');
        const regex = typeof pattern === 'string' ? new RegExp(pattern, 'i') : pattern;

        lines.forEach((line, index) => {
          if (regex.test(line)) {
            evidence.push({
              file: fullPath
                .replace(/\\/g, '/')
                .replace(process.cwd().replace(/\\/g, '/') + '/', ''),
              line: index + 1,
              code: line.trim(),
            });
          }
        });
      } catch (error) {
        // Skip files that can't be read
      }
    }
  }

  searchInDirectory(process.cwd());
  return evidence;
}

/**
 * Check if package.json has dependency
 */
function hasDependency(packageName: string): boolean {
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  if (!fs.existsSync(packageJsonPath)) return false;

  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
  const allDeps = {
    ...packageJson.dependencies,
    ...packageJson.devDependencies,
  };

  return packageName in allDeps;
}

/**
 * Perform health checks analysis
 */
function performHealthChecks(): HealthCheck[] {
  const checks: HealthCheck[] = [];

  console.log('🏥 Analyzing health check implementation...\n');

  // 1. Basic Health Endpoint
  console.log('📋 Checking basic health endpoint...');
  const healthEndpoint = searchInFiles('health.*controller', ['ts']);
  const healthRoute = searchInFiles('/health', ['ts']);

  checks.push({
    id: 'H1',
    name: 'Health Endpoint',
    description: 'Basic /health endpoint is available',
    category: 'Basic',
    priority: 'High',
    status: healthEndpoint.length > 0 ? 'implemented' : 'missing',
    evidence: healthEndpoint.slice(0, 3),
    recommendations:
      healthEndpoint.length === 0
        ? [
            'Create a health controller with GET /health endpoint',
            'Return basic status, uptime, and environment info',
          ]
        : [],
  });

  // 2. Terminus Module
  console.log('📋 Checking @nestjs/terminus integration...');
  const hasTerminus = hasDependency('@nestjs/terminus');
  const terminusImport = searchInFiles('@nestjs/terminus', ['ts']);

  checks.push({
    id: 'H2',
    name: 'Terminus Module',
    description: '@nestjs/terminus module for professional health checks',
    category: 'Advanced',
    priority: 'Medium',
    status: hasTerminus && terminusImport.length > 0 ? 'implemented' : 'missing',
    evidence: terminusImport.slice(0, 3),
    recommendations:
      !hasTerminus
        ? [
            'Install @nestjs/terminus: npm install @nestjs/terminus',
            'Import TerminusModule in health.module.ts',
            'Use built-in health indicators for consistent checks',
          ]
        : [],
  });

  // 3. Liveness Probe
  console.log('📋 Checking liveness probe...');
  const livenessProbe = searchInFiles('/liveness|liveness.*probe', ['ts']);

  checks.push({
    id: 'H3',
    name: 'Liveness Probe',
    description: 'Kubernetes liveness probe endpoint',
    category: 'Kubernetes',
    priority: 'High',
    status: livenessProbe.length > 0 ? 'implemented' : 'missing',
    evidence: livenessProbe.slice(0, 3),
    recommendations:
      livenessProbe.length === 0
        ? [
            'Add GET /health/liveness endpoint',
            'Return 200 if app is running (even if dependencies are down)',
            'Keep it lightweight - no database checks',
          ]
        : [],
  });

  // 4. Readiness Probe
  console.log('📋 Checking readiness probe...');
  const readinessProbe = searchInFiles('/readiness|readiness.*probe', ['ts']);

  checks.push({
    id: 'H4',
    name: 'Readiness Probe',
    description: 'Kubernetes readiness probe endpoint',
    category: 'Kubernetes',
    priority: 'High',
    status: readinessProbe.length > 0 ? 'implemented' : 'missing',
    evidence: readinessProbe.slice(0, 3),
    recommendations:
      readinessProbe.length === 0
        ? [
            'Add GET /health/readiness endpoint',
            'Check if app is ready to accept traffic',
            'Verify database, cache, and critical services are available',
          ]
        : [],
  });

  // 5. Startup Probe
  console.log('📋 Checking startup probe...');
  const startupProbe = searchInFiles('/startup|startup.*probe', ['ts']);

  checks.push({
    id: 'H5',
    name: 'Startup Probe',
    description: 'Kubernetes startup probe for slow-starting containers',
    category: 'Kubernetes',
    priority: 'Low',
    status: startupProbe.length > 0 ? 'implemented' : 'missing',
    evidence: startupProbe.slice(0, 3),
    recommendations:
      startupProbe.length === 0
        ? [
            'Add GET /health/startup endpoint (optional)',
            'Useful for apps with long initialization time',
            'Prevents premature liveness/readiness checks',
          ]
        : [],
  });

  // 6. MongoDB Health Indicator
  console.log('📋 Checking MongoDB health indicator...');
  const mongoHealthCheck = searchInFiles(
    'MongooseHealthIndicator|mongodb.*health|database.*health',
    ['ts'],
  );
  const mongoConnection = searchInFiles('connection.*readyState', ['ts']);

  checks.push({
    id: 'H6',
    name: 'MongoDB Health Check',
    description: 'MongoDB/Mongoose connection health verification',
    category: 'Database',
    priority: 'High',
    status:
      mongoHealthCheck.length > 0 || mongoConnection.length > 0
        ? 'implemented'
        : 'missing',
    evidence: [...mongoHealthCheck, ...mongoConnection].slice(0, 3),
    recommendations:
      mongoHealthCheck.length === 0 && mongoConnection.length === 0
        ? [
            'Add MongoDB health check using MongooseHealthIndicator',
            'Verify database connectivity and response time',
            'Include in readiness probe',
          ]
        : [],
  });

  // 7. Memory Health Indicator
  console.log('📋 Checking memory health indicator...');
  const memoryHealthCheck = searchInFiles(
    'MemoryHealthIndicator|memory.*heap|process\\.memoryUsage',
    ['ts'],
  );

  checks.push({
    id: 'H7',
    name: 'Memory Health Check',
    description: 'Memory usage monitoring and threshold checks',
    category: 'System Resources',
    priority: 'Medium',
    status: memoryHealthCheck.length > 0 ? 'implemented' : 'missing',
    evidence: memoryHealthCheck.slice(0, 3),
    recommendations:
      memoryHealthCheck.length === 0
        ? [
            'Add MemoryHealthIndicator from @nestjs/terminus',
            'Set memory thresholds (e.g., 150MB heap)',
            'Monitor heap usage and RSS',
          ]
        : [],
  });

  // 8. Disk Health Indicator
  console.log('📋 Checking disk health indicator...');
  const diskHealthCheck = searchInFiles('DiskHealthIndicator|disk.*space', ['ts']);

  checks.push({
    id: 'H8',
    name: 'Disk Health Check',
    description: 'Disk space monitoring and threshold checks',
    category: 'System Resources',
    priority: 'Low',
    status: diskHealthCheck.length > 0 ? 'implemented' : 'missing',
    evidence: diskHealthCheck.slice(0, 3),
    recommendations:
      diskHealthCheck.length === 0
        ? [
            'Add DiskHealthIndicator from @nestjs/terminus (optional)',
            'Set disk space thresholds',
            'Monitor available disk space percentage',
          ]
        : [],
  });

  // 9. Redis/Cache Health Check
  console.log('📋 Checking Redis/Cache health...');
  const redisHealthCheck = searchInFiles(
    'redis.*ping|cache.*health|RedisHealthIndicator',
    ['ts'],
  );

  checks.push({
    id: 'H9',
    name: 'Redis/Cache Health Check',
    description: 'Redis connection and cache availability check',
    category: 'Cache',
    priority: 'Medium',
    status: redisHealthCheck.length > 0 ? 'partial' : 'missing',
    evidence: redisHealthCheck.slice(0, 3),
    recommendations:
      redisHealthCheck.length === 0
        ? [
            'Add Redis health check using custom indicator',
            'Verify Redis connectivity with PING command',
            'Include cache hit/miss metrics',
          ]
        : [],
  });

  // 10. Custom Health Indicators
  console.log('📋 Checking custom health indicators...');
  const customIndicators = searchInFiles(
    'implements.*HealthIndicator|extends.*HealthIndicator',
    ['ts'],
  );

  checks.push({
    id: 'H10',
    name: 'Custom Health Indicators',
    description: 'Custom health indicators for business-critical services',
    category: 'Custom',
    priority: 'Low',
    status: customIndicators.length > 0 ? 'implemented' : 'missing',
    evidence: customIndicators.slice(0, 3),
    recommendations:
      customIndicators.length === 0
        ? [
            'Create custom health indicators for critical services',
            'Implement HealthIndicator interface',
            'Add checks for payment gateways, SMS providers, etc.',
          ]
        : [],
  });

  // 11. Health Check Response Format
  console.log('📋 Checking health check response format...');
  const healthResponse = searchInFiles('status.*ok|health.*status', ['ts']);

  checks.push({
    id: 'H11',
    name: 'Standardized Response Format',
    description: 'Consistent health check response format',
    category: 'Format',
    priority: 'Medium',
    status: healthResponse.length > 0 ? 'implemented' : 'missing',
    evidence: healthResponse.slice(0, 3),
    recommendations:
      healthResponse.length === 0
        ? [
            'Standardize health check response format',
            'Include: status, timestamp, checks, details',
            'Follow RFC 7807 Problem Details format',
          ]
        : [],
  });

  // 12. Detailed Health Endpoint
  console.log('📋 Checking detailed health endpoint...');
  const detailedHealth = searchInFiles('/health/detailed|detailed.*health', ['ts']);

  checks.push({
    id: 'H12',
    name: 'Detailed Health Endpoint',
    description: 'Detailed health information for debugging',
    category: 'Debugging',
    priority: 'Low',
    status: detailedHealth.length > 0 ? 'implemented' : 'missing',
    evidence: detailedHealth.slice(0, 3),
    recommendations:
      detailedHealth.length === 0
        ? [
            'Add /health/detailed endpoint (optional)',
            'Include detailed metrics: CPU, memory, uptime, versions',
            'Consider authentication for sensitive info',
          ]
        : [],
  });

  console.log('✅ Health check analysis completed\n');

  return checks;
}

/**
 * Calculate summary statistics
 */
function calculateSummary(checks: HealthCheck[]): HealthGapReport['summary'] {
  const total = checks.length;
  const implemented = checks.filter((c) => c.status === 'implemented').length;
  const partial = checks.filter((c) => c.status === 'partial').length;
  const missing = checks.filter((c) => c.status === 'missing').length;
  const coverage = Math.round(((implemented + partial * 0.5) / total) * 100);

  return {
    total_checks: total,
    implemented,
    partial,
    missing,
    coverage_percentage: coverage,
  };
}

/**
 * Generate Markdown Report
 */
function generateMarkdownReport(report: HealthGapReport): string {
  const { summary, checks } = report;

  let md = `# Health & Readiness - Gap Report\n\n`;
  md += `**Generated:** ${new Date(report.generated_at).toLocaleString('ar-SA')}\n\n`;
  md += `This report analyzes the health check implementation and identifies gaps based on best practices.\n\n`;
  md += `---\n\n`;

  // Summary
  md += `## 📊 Summary\n\n`;
  md += `### ${summary.coverage_percentage}% Health Check Coverage\n\n`;

  const quality =
    summary.coverage_percentage >= 80
      ? '🟢 Excellent'
      : summary.coverage_percentage >= 60
        ? '🟡 Good'
        : summary.coverage_percentage >= 40
          ? '🟠 Fair'
          : '🔴 Needs Improvement';

  md += `**Quality Rating:** ${quality}\n\n`;

  md += `| Metric | Count | Percentage |\n`;
  md += `|--------|-------|------------|\n`;
  md += `| **Total Checks** | ${summary.total_checks} | 100% |\n`;
  md += `| ✅ **Implemented** | ${summary.implemented} | ${Math.round((summary.implemented / summary.total_checks) * 100)}% |\n`;
  md += `| ⚠️ **Partial** | ${summary.partial} | ${Math.round((summary.partial / summary.total_checks) * 100)}% |\n`;
  md += `| ❌ **Missing** | ${summary.missing} | ${Math.round((summary.missing / summary.total_checks) * 100)}% |\n\n`;

  md += `---\n\n`;

  // Group by category
  const categories = [...new Set(checks.map((c) => c.category))];

  md += `## 🔍 Detailed Analysis\n\n`;

  categories.forEach((category) => {
    const categoryChecks = checks.filter((c) => c.category === category);
    const categoryImpl = categoryChecks.filter((c) => c.status === 'implemented').length;
    const categoryScore = Math.round((categoryImpl / categoryChecks.length) * 100);

    md += `### ${category} (${categoryScore}%)\n\n`;

    categoryChecks.forEach((check) => {
      const icon =
        check.status === 'implemented'
          ? '✅'
          : check.status === 'partial'
            ? '⚠️'
            : '❌';
      const statusText =
        check.status === 'implemented'
          ? 'Implemented'
          : check.status === 'partial'
            ? 'Partially Implemented'
            : 'Missing';

      md += `#### ${icon} ${check.id} - ${check.name} [${check.priority}]\n\n`;
      md += `**Status:** ${statusText}\n\n`;
      md += `**Description:** ${check.description}\n\n`;

      if (check.evidence.length > 0) {
        md += `**Evidence:**\n\n`;
        check.evidence.forEach((ev) => {
          md += `- \`${ev.file}:${ev.line}\`\n`;
          if (ev.code) {
            md += `  \`\`\`typescript\n`;
            md += `  ${ev.code}\n`;
            md += `  \`\`\`\n\n`;
          }
        });
      }

      if (check.recommendations.length > 0) {
        md += `**Recommendations:** *(Non-mandatory)*\n\n`;
        check.recommendations.forEach((rec) => {
          md += `- ${rec}\n`;
        });
        md += `\n`;
      }
    });

    md += `\n`;
  });

  // Priority Recommendations
  md += `---\n\n`;
  md += `## 💡 Priority Recommendations\n\n`;
  md += `*These are non-mandatory suggestions to improve health check implementation*\n\n`;

  const highPriority = checks.filter(
    (c) => c.priority === 'High' && c.status !== 'implemented',
  );
  const mediumPriority = checks.filter(
    (c) => c.priority === 'Medium' && c.status !== 'implemented',
  );
  const lowPriority = checks.filter(
    (c) => c.priority === 'Low' && c.status !== 'implemented',
  );

  if (highPriority.length > 0) {
    md += `### 🔴 High Priority\n\n`;
    highPriority.forEach((check) => {
      md += `#### ${check.name}\n`;
      md += `${check.description}\n\n`;
      if (check.recommendations.length > 0) {
        check.recommendations.forEach((rec) => {
          md += `- ${rec}\n`;
        });
        md += `\n`;
      }
    });
  }

  if (mediumPriority.length > 0) {
    md += `### 🟡 Medium Priority\n\n`;
    mediumPriority.forEach((check) => {
      md += `#### ${check.name}\n`;
      md += `${check.description}\n\n`;
      if (check.recommendations.length > 0) {
        check.recommendations.forEach((rec) => {
          md += `- ${rec}\n`;
        });
        md += `\n`;
      }
    });
  }

  if (lowPriority.length > 0) {
    md += `### 🟢 Low Priority (Optional Enhancements)\n\n`;
    lowPriority.forEach((check) => {
      md += `#### ${check.name}\n`;
      md += `${check.description}\n\n`;
      if (check.recommendations.length > 0) {
        check.recommendations.forEach((rec) => {
          md += `- ${rec}\n`;
        });
        md += `\n`;
      }
    });
  }

  // Best Practices
  md += `---\n\n`;
  md += `## 📚 Best Practices\n\n`;
  md += `1. **Liveness vs Readiness**\n`;
  md += `   - Liveness: Check if app is alive (no external dependencies)\n`;
  md += `   - Readiness: Check if app can handle traffic (includes dependencies)\n\n`;
  md += `2. **Kubernetes Probes**\n`;
  md += `   - Configure appropriate timeouts and periods\n`;
  md += `   - Use startup probe for slow-starting apps\n`;
  md += `   - Keep probes lightweight (< 1s response time)\n\n`;
  md += `3. **Health Indicators**\n`;
  md += `   - Use @nestjs/terminus for consistent checks\n`;
  md += `   - Implement custom indicators for critical services\n`;
  md += `   - Include timeouts to prevent hanging checks\n\n`;
  md += `4. **Response Format**\n`;
  md += `   - Return 200 for healthy, 503 for unhealthy\n`;
  md += `   - Include meaningful error messages\n`;
  md += `   - Consider security (don't expose sensitive info)\n\n`;
  md += `5. **Monitoring Integration**\n`;
  md += `   - Integrate with Prometheus/Grafana\n`;
  md += `   - Set up alerts for critical health failures\n`;
  md += `   - Track health check metrics over time\n\n`;

  md += `---\n\n`;
  md += `## 🔗 Resources\n\n`;
  md += `- [NestJS Terminus Documentation](https://docs.nestjs.com/recipes/terminus)\n`;
  md += `- [Kubernetes Health Checks](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/)\n`;
  md += `- [Health Check RFC 7807](https://datatracker.ietf.org/doc/html/rfc7807)\n\n`;

  md += `---\n\n`;
  md += `*Report generated by Health/Readiness Gap Analyzer*\n`;

  return md;
}

/**
 * Main execution
 */
async function main() {
  console.log('🏥 Health/Readiness - Gap Report\n');
  console.log('Analyzing health check implementation...\n');

  // Perform checks
  const checks = performHealthChecks();

  // Calculate summary
  const summary = calculateSummary(checks);

  // Create report
  const report: HealthGapReport = {
    generated_at: new Date().toISOString(),
    summary,
    checks,
  };

  // Save reports
  const reportsDir = path.join(process.cwd(), 'reports');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  // Save JSON
  const jsonPath = path.join(reportsDir, 'health_gaps.json');
  fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2), 'utf-8');
  console.log(`✅ JSON report saved: ${jsonPath}`);

  // Save Markdown
  const markdown = generateMarkdownReport(report);
  const mdPath = path.join(reportsDir, 'health_gaps.md');
  fs.writeFileSync(mdPath, markdown, 'utf-8');
  console.log(`✅ Markdown report saved: ${mdPath}`);

  // Display summary
  console.log('\n📊 Health Check Summary:');
  console.log(`   Total Checks: ${summary.total_checks}`);
  console.log(`   ✅ Implemented: ${summary.implemented}`);
  console.log(`   ⚠️ Partial: ${summary.partial}`);
  console.log(`   ❌ Missing: ${summary.missing}`);
  console.log(`   📈 Coverage: ${summary.coverage_percentage}%`);

  console.log('\n✨ Health/Readiness gap analysis complete!\n');
  process.exit(0);
}

// Run the script
main().catch((error) => {
  console.error('❌ Error:', error);
  process.exit(1);
});

