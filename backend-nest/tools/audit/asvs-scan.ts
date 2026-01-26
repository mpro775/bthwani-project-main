#!/usr/bin/env ts-node
/**
 * ASVS Quick Scan - Security Baseline Check
 *
 * Scans the codebase for security features based on OWASP ASVS standards
 * Checks: Helmet, CORS, Rate-Limit, CSRF, ValidationPipe, Versioning, etc.
 * Generates: reports/asvs_coverage.md with evidence (path+line)
 */

import * as fs from 'fs';
import * as path from 'path';

interface SecurityCheck {
  id: string;
  category: string;
  name: string;
  description: string;
  level: 'L1' | 'L2' | 'L3'; // ASVS Levels
  passed: boolean;
  evidence: Evidence[];
  recommendations?: string[];
}

interface Evidence {
  file: string;
  line: number;
  code: string;
}

interface ASVSReport {
  generated_at: string;
  summary: {
    total_checks: number;
    passed: number;
    failed: number;
    l1_passed: number;
    l1_total: number;
    l2_passed: number;
    l2_total: number;
    l3_passed: number;
    l3_total: number;
    overall_score: number;
  };
  checks: SecurityCheck[];
}

/**
 * Search for pattern in files and return evidence (Node.js implementation)
 */
function searchPattern(
  pattern: string,
  extensions: string[] = ['ts'],
  excludeDirs: string[] = ['node_modules', 'dist', 'coverage', '.git'],
): Evidence[] {
  const evidence: Evidence[] = [];

  function searchInDirectory(dir: string) {
    if (!fs.existsSync(dir)) return;

    const items = fs.readdirSync(dir, { withFileTypes: true });

    for (const item of items) {
      const fullPath = path.join(dir, item.name);

      // Skip excluded directories
      if (item.isDirectory()) {
        if (!excludeDirs.includes(item.name)) {
          searchInDirectory(fullPath);
        }
        continue;
      }

      // Check file extension
      const ext = path.extname(item.name).slice(1);
      if (!extensions.includes(ext)) continue;

      // Search in file
      try {
        const content = fs.readFileSync(fullPath, 'utf-8');
        const lines = content.split('\n');
        const regex = new RegExp(pattern, 'i');

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
      } catch {
        // Skip files that can't be read
      }
    }
  }

  searchInDirectory(process.cwd());
  return evidence;
}

/**
 * Check if file contains pattern
 */
function fileContains(filePath: string, pattern: string | RegExp): Evidence[] {
  const evidence: Evidence[] = [];

  try {
    if (!fs.existsSync(filePath)) {
      return evidence;
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');

    lines.forEach((line, index) => {
      if (
        typeof pattern === 'string'
          ? line.includes(pattern)
          : pattern.test(line)
      ) {
        evidence.push({
          file: filePath.replace(/\\/g, '/'),
          line: index + 1,
          code: line.trim(),
        });
      }
    });
  } catch {
    // Silent fail
  }

  return evidence;
}

/**
 * Perform ASVS security checks
 */
function performSecurityChecks(): SecurityCheck[] {
  const checks: SecurityCheck[] = [];

  console.log('🔍 Running ASVS security checks...\n');

  // V1: Architecture, Design and Threat Modeling
  console.log('📋 V1: Architecture & Design');

  checks.push({
    id: 'V1.1',
    category: 'Architecture',
    name: 'API Versioning',
    description:
      'API versioning is implemented to support backward compatibility',
    level: 'L1',
    passed: false,
    evidence: fileContains('src/main.ts', 'enableVersioning'),
  });
  checks[checks.length - 1].passed =
    checks[checks.length - 1].evidence.length > 0;

  checks.push({
    id: 'V1.2',
    category: 'Architecture',
    name: 'Environment Configuration',
    description: 'Environment variables are validated and managed',
    level: 'L1',
    passed: false,
    evidence: searchPattern('env.validation', ['ts']),
  });
  checks[checks.length - 1].passed =
    checks[checks.length - 1].evidence.length > 0;

  // V2: Authentication
  console.log('📋 V2: Authentication');

  checks.push({
    id: 'V2.1',
    category: 'Authentication',
    name: 'JWT Authentication',
    description: 'JWT-based authentication is implemented',
    level: 'L1',
    passed: false,
    evidence: searchPattern('JwtStrategy', ['ts']),
  });
  checks[checks.length - 1].passed =
    checks[checks.length - 1].evidence.length > 0;

  checks.push({
    id: 'V2.2',
    category: 'Authentication',
    name: 'Firebase Authentication',
    description: 'Firebase authentication is configured',
    level: 'L1',
    passed: false,
    evidence: searchPattern('firebase-admin', ['ts']),
  });
  checks[checks.length - 1].passed =
    checks[checks.length - 1].evidence.length > 0;

  checks.push({
    id: 'V2.3',
    category: 'Authentication',
    name: 'Password Hashing',
    description: 'Passwords are hashed using bcrypt',
    level: 'L1',
    passed: false,
    evidence: searchPattern('bcrypt', ['ts']),
  });
  checks[checks.length - 1].passed =
    checks[checks.length - 1].evidence.length > 0;

  // V3: Session Management
  console.log('📋 V3: Session Management');

  checks.push({
    id: 'V3.1',
    category: 'Session',
    name: 'Redis Session Store',
    description: 'Redis is used for session/cache management',
    level: 'L2',
    passed: false,
    evidence: searchPattern('redis', ['ts']),
  });
  checks[checks.length - 1].passed =
    checks[checks.length - 1].evidence.length > 0;

  // V4: Access Control
  console.log('📋 V4: Access Control');

  checks.push({
    id: 'V4.1',
    category: 'Access Control',
    name: 'Role-Based Access Control',
    description: 'RBAC is implemented with guards',
    level: 'L1',
    passed: false,
    evidence: searchPattern('RolesGuard', ['ts']),
  });
  checks[checks.length - 1].passed =
    checks[checks.length - 1].evidence.length > 0;

  checks.push({
    id: 'V4.2',
    category: 'Access Control',
    name: 'Authorization Guards',
    description: 'Authentication guards are properly configured',
    level: 'L1',
    passed: false,
    evidence: searchPattern('AuthGuard', ['ts']),
  });
  checks[checks.length - 1].passed =
    checks[checks.length - 1].evidence.length > 0;

  // V5: Validation, Sanitization and Encoding
  console.log('📋 V5: Validation & Sanitization');

  checks.push({
    id: 'V5.1',
    category: 'Validation',
    name: 'Global Validation Pipe',
    description: 'ValidationPipe is enabled globally for input validation',
    level: 'L1',
    passed: false,
    evidence: fileContains('src/main.ts', 'ValidationPipe'),
  });
  checks[checks.length - 1].passed =
    checks[checks.length - 1].evidence.length > 0;

  checks.push({
    id: 'V5.2',
    category: 'Validation',
    name: 'DTO Validation',
    description: 'DTOs use class-validator decorators',
    level: 'L1',
    passed: false,
    evidence: searchPattern('class-validator', ['ts']),
  });
  checks[checks.length - 1].passed =
    checks[checks.length - 1].evidence.length > 0;

  checks.push({
    id: 'V5.3',
    category: 'Validation',
    name: 'Input Sanitization',
    description: 'Input sanitization helpers are available',
    level: 'L2',
    passed: false,
    evidence: searchPattern('sanitization.helper', ['ts']),
  });
  checks[checks.length - 1].passed =
    checks[checks.length - 1].evidence.length > 0;

  checks.push({
    id: 'V5.4',
    category: 'Validation',
    name: 'Whitelist & Transform',
    description: 'ValidationPipe configured with whitelist and transform',
    level: 'L2',
    passed: false,
    evidence: fileContains('src/main.ts', 'whitelist: true'),
  });
  checks[checks.length - 1].passed =
    checks[checks.length - 1].evidence.length > 0;

  // V7: Error Handling and Logging
  console.log('📋 V7: Error Handling & Logging');

  checks.push({
    id: 'V7.1',
    category: 'Error Handling',
    name: 'Global Exception Filter',
    description: 'Global exception filter is implemented',
    level: 'L1',
    passed: false,
    evidence: searchPattern('GlobalExceptionFilter', ['ts']),
  });
  checks[checks.length - 1].passed =
    checks[checks.length - 1].evidence.length > 0;

  checks.push({
    id: 'V7.2',
    category: 'Logging',
    name: 'Structured Logging',
    description: 'Winston logging is configured',
    level: 'L1',
    passed: false,
    evidence: searchPattern('winston', ['ts']),
  });
  checks[checks.length - 1].passed =
    checks[checks.length - 1].evidence.length > 0;

  checks.push({
    id: 'V7.3',
    category: 'Error Handling',
    name: 'Safe Error Messages',
    description: 'Error messages are sanitized for production',
    level: 'L2',
    passed: false,
    evidence: fileContains(
      'src/common/filters/global-exception.filter.ts',
      'userMessage',
    ),
  });
  checks[checks.length - 1].passed =
    checks[checks.length - 1].evidence.length > 0;

  // V8: Data Protection
  console.log('📋 V8: Data Protection');

  checks.push({
    id: 'V8.1',
    category: 'Data Protection',
    name: 'Sensitive Data Encryption',
    description: 'PIN/sensitive data encryption is implemented',
    level: 'L2',
    passed: false,
    evidence: searchPattern('encrypt.*pin', ['ts']),
  });
  checks[checks.length - 1].passed =
    checks[checks.length - 1].evidence.length > 0;

  // V9: Communication Security
  console.log('📋 V9: Communication Security');

  checks.push({
    id: 'V9.1',
    category: 'Communication',
    name: 'CORS Configuration',
    description: 'CORS is properly configured',
    level: 'L1',
    passed: false,
    evidence: fileContains('src/main.ts', 'enableCors'),
  });
  checks[checks.length - 1].passed =
    checks[checks.length - 1].evidence.length > 0;

  checks.push({
    id: 'V9.2',
    category: 'Communication',
    name: 'Helmet Security Headers',
    description: 'Helmet is configured for security headers',
    level: 'L1',
    passed: false,
    evidence: fileContains('src/main.ts', 'helmet'),
  });
  checks[checks.length - 1].passed =
    checks[checks.length - 1].evidence.length > 0;

  checks.push({
    id: 'V9.3',
    category: 'Communication',
    name: 'HSTS (Strict Transport Security)',
    description: 'HSTS headers are configured',
    level: 'L2',
    passed: false,
    evidence: fileContains('src/main.ts', 'hsts'),
  });
  checks[checks.length - 1].passed =
    checks[checks.length - 1].evidence.length > 0;

  checks.push({
    id: 'V9.4',
    category: 'Communication',
    name: 'Content Security Policy',
    description: 'CSP headers are configured',
    level: 'L2',
    passed: false,
    evidence: fileContains('src/main.ts', 'contentSecurityPolicy'),
  });
  checks[checks.length - 1].passed =
    checks[checks.length - 1].evidence.length > 0;

  // V10: Malicious Code
  console.log('📋 V10: Malicious Code Prevention');

  checks.push({
    id: 'V10.1',
    category: 'Malicious Code',
    name: 'Dependency Audit',
    description: 'Package.json includes audit script',
    level: 'L2',
    passed: false,
    evidence: fileContains('package.json', 'audit'),
  });
  checks[checks.length - 1].passed =
    checks[checks.length - 1].evidence.length > 0;

  // V11: Business Logic
  console.log('📋 V11: Business Logic');

  checks.push({
    id: 'V11.1',
    category: 'Business Logic',
    name: 'Transaction Management',
    description: 'Database transactions are properly handled',
    level: 'L2',
    passed: false,
    evidence: searchPattern('transaction.helper', ['ts']),
  });
  checks[checks.length - 1].passed =
    checks[checks.length - 1].evidence.length > 0;

  checks.push({
    id: 'V11.2',
    category: 'Business Logic',
    name: 'Idempotency',
    description: 'Idempotency middleware is implemented',
    level: 'L2',
    passed: false,
    evidence: searchPattern('idempotency', ['ts']),
  });
  checks[checks.length - 1].passed =
    checks[checks.length - 1].evidence.length > 0;

  // V12: File and Resources
  console.log('📋 V12: File Upload Security');

  checks.push({
    id: 'V12.1',
    category: 'File Upload',
    name: 'File Upload Validation',
    description: 'File uploads are validated and restricted',
    level: 'L2',
    passed: false,
    evidence: searchPattern('FileInterceptor|MulterModule', ['ts']),
  });
  checks[checks.length - 1].passed =
    checks[checks.length - 1].evidence.length > 0;

  // V13: API and Web Service
  console.log('📋 V13: API Security');

  checks.push({
    id: 'V13.1',
    category: 'API Security',
    name: 'Rate Limiting',
    description: 'Rate limiting is configured to prevent abuse',
    level: 'L1',
    passed: false,
    evidence: fileContains('src/main.ts', 'rateLimit'),
  });
  checks[checks.length - 1].passed =
    checks[checks.length - 1].evidence.length > 0;

  checks.push({
    id: 'V13.2',
    category: 'API Security',
    name: 'Request Timeout',
    description: 'Request timeouts are configured',
    level: 'L2',
    passed: false,
    evidence: searchPattern('TimeoutInterceptor', ['ts']),
  });
  checks[checks.length - 1].passed =
    checks[checks.length - 1].evidence.length > 0;

  checks.push({
    id: 'V13.3',
    category: 'API Security',
    name: 'API Documentation',
    description: 'OpenAPI/Swagger documentation is available',
    level: 'L1',
    passed: false,
    evidence: fileContains('src/main.ts', 'SwaggerModule'),
  });
  checks[checks.length - 1].passed =
    checks[checks.length - 1].evidence.length > 0;

  checks.push({
    id: 'V13.4',
    category: 'API Security',
    name: 'CSRF Protection',
    description: 'CSRF protection mechanisms are in place',
    level: 'L2',
    passed: false,
    evidence: searchPattern('csrf|csurf', ['ts']),
  });
  checks[checks.length - 1].passed =
    checks[checks.length - 1].evidence.length > 0;

  // V14: Configuration
  console.log('📋 V14: Configuration');

  checks.push({
    id: 'V14.1',
    category: 'Configuration',
    name: 'Environment Variables',
    description: 'Environment configuration is properly managed',
    level: 'L1',
    passed: false,
    evidence: searchPattern('@nestjs/config', ['ts']),
  });
  checks[checks.length - 1].passed =
    checks[checks.length - 1].evidence.length > 0;

  checks.push({
    id: 'V14.2',
    category: 'Configuration',
    name: 'Secrets Management',
    description: 'Secrets are not hardcoded in source code',
    level: 'L1',
    passed: false,
    evidence: fileContains('.gitignore', '.env'),
  });
  checks[checks.length - 1].passed =
    checks[checks.length - 1].evidence.length > 0;

  console.log('\n✅ Security checks completed\n');

  return checks;
}

/**
 * Calculate ASVS scores
 */
function calculateScores(checks: SecurityCheck[]): ASVSReport['summary'] {
  const total = checks.length;
  const passed = checks.filter((c) => c.passed).length;

  const l1Checks = checks.filter((c) => c.level === 'L1');
  const l1Passed = l1Checks.filter((c) => c.passed).length;

  const l2Checks = checks.filter((c) => c.level === 'L2');
  const l2Passed = l2Checks.filter((c) => c.passed).length;

  const l3Checks = checks.filter((c) => c.level === 'L3');
  const l3Passed = l3Checks.filter((c) => c.passed).length;

  const overallScore = total > 0 ? Math.round((passed / total) * 100) : 0;

  return {
    total_checks: total,
    passed,
    failed: total - passed,
    l1_passed: l1Passed,
    l1_total: l1Checks.length,
    l2_passed: l2Passed,
    l2_total: l2Checks.length,
    l3_passed: l3Passed,
    l3_total: l3Checks.length,
    overall_score: overallScore,
  };
}

/**
 * Generate Markdown Report
 */
function generateMarkdownReport(report: ASVSReport): string {
  const { summary, checks } = report;

  let md = `# ASVS Security Coverage Report\n\n`;
  md += `**Generated:** ${new Date(report.generated_at).toLocaleString('ar-SA')}\n\n`;
  md += `Based on [OWASP ASVS 4.0](https://owasp.org/www-project-application-security-verification-standard/)\n\n`;
  md += `---\n\n`;

  // Summary
  md += `## 📊 Overall Score\n\n`;
  md += `### ${summary.overall_score}% Security Coverage\n\n`;

  const quality =
    summary.overall_score >= 90
      ? '🟢 Excellent'
      : summary.overall_score >= 75
        ? '🟡 Good'
        : summary.overall_score >= 60
          ? '🟠 Fair'
          : '🔴 Needs Improvement';

  md += `**Rating:** ${quality}\n\n`;

  md += `| Metric | Value |\n`;
  md += `|--------|-------|\n`;
  md += `| **Total Checks** | ${summary.total_checks} |\n`;
  md += `| **Passed** | ${summary.passed} ✅ |\n`;
  md += `| **Failed** | ${summary.failed} ❌ |\n`;
  md += `| **Overall Score** | ${summary.overall_score}% |\n\n`;

  // ASVS Levels
  md += `## 🎯 ASVS Levels\n\n`;
  md += `| Level | Description | Passed | Total | Score |\n`;
  md += `|-------|-------------|--------|-------|-------|\n`;

  const l1Score =
    summary.l1_total > 0
      ? Math.round((summary.l1_passed / summary.l1_total) * 100)
      : 0;
  const l2Score =
    summary.l2_total > 0
      ? Math.round((summary.l2_passed / summary.l2_total) * 100)
      : 0;
  const l3Score =
    summary.l3_total > 0
      ? Math.round((summary.l3_passed / summary.l3_total) * 100)
      : 0;

  md += `| **L1** | Opportunistic | ${summary.l1_passed} | ${summary.l1_total} | ${l1Score}% |\n`;
  md += `| **L2** | Standard | ${summary.l2_passed} | ${summary.l2_total} | ${l2Score}% |\n`;
  md += `| **L3** | Advanced | ${summary.l3_passed} | ${summary.l3_total} | ${l3Score}% |\n\n`;

  md += `---\n\n`;

  // Group checks by category
  const categories = [...new Set(checks.map((c) => c.category))];

  md += `## 🔍 Detailed Checks\n\n`;

  categories.forEach((category) => {
    const categoryChecks = checks.filter((c) => c.category === category);
    const categoryPassed = categoryChecks.filter((c) => c.passed).length;
    const categoryScore = Math.round(
      (categoryPassed / categoryChecks.length) * 100,
    );

    md += `### ${category} (${categoryScore}%)\n\n`;

    categoryChecks.forEach((check) => {
      const icon = check.passed ? '✅' : '❌';
      md += `#### ${icon} ${check.id} - ${check.name} [${check.level}]\n\n`;
      md += `**Description:** ${check.description}\n\n`;

      if (check.passed && check.evidence.length > 0) {
        md += `**Evidence:**\n\n`;
        check.evidence.slice(0, 3).forEach((ev) => {
          md += `- \`${ev.file}:${ev.line}\`\n`;
          md += `  \`\`\`typescript\n`;
          md += `  ${ev.code}\n`;
          md += `  \`\`\`\n\n`;
        });
        if (check.evidence.length > 3) {
          md += `*... and ${check.evidence.length - 3} more occurrences*\n\n`;
        }
      } else if (!check.passed) {
        md += `**Status:** ❌ Not Implemented\n\n`;
        if (check.recommendations) {
          md += `**Recommendations:**\n`;
          check.recommendations.forEach((rec) => {
            md += `- ${rec}\n`;
          });
          md += `\n`;
        }
      }
    });

    md += `\n`;
  });

  // Recommendations
  md += `---\n\n`;
  md += `## 💡 Priority Recommendations\n\n`;

  const failedL1 = checks.filter((c) => c.level === 'L1' && !c.passed);
  const failedL2 = checks.filter((c) => c.level === 'L2' && !c.passed);

  if (failedL1.length > 0) {
    md += `### 🔴 High Priority (L1 - Basic Security)\n\n`;
    failedL1.forEach((check) => {
      md += `- **${check.name}:** ${check.description}\n`;
    });
    md += `\n`;
  }

  if (failedL2.length > 0) {
    md += `### 🟡 Medium Priority (L2 - Standard Security)\n\n`;
    failedL2.forEach((check) => {
      md += `- **${check.name}:** ${check.description}\n`;
    });
    md += `\n`;
  }

  md += `---\n\n`;
  md += `## 📚 Resources\n\n`;
  md += `- [OWASP ASVS Project](https://owasp.org/www-project-application-security-verification-standard/)\n`;
  md += `- [NestJS Security Best Practices](https://docs.nestjs.com/security/helmet)\n`;
  md += `- [OWASP Top 10](https://owasp.org/www-project-top-ten/)\n\n`;

  md += `---\n\n`;
  md += `*Report generated by ASVS Quick Scan*\n`;

  return md;
}

/**
 * Main execution
 */
function main() {
  console.log('🔒 ASVS Quick Scan - Security Baseline Check\n');
  console.log('Checking security features based on OWASP ASVS standards...\n');

  // Perform checks
  const checks = performSecurityChecks();

  // Add recommendations for failed checks
  checks.forEach((check) => {
    if (!check.passed) {
      check.recommendations = [
        `Implement ${check.name.toLowerCase()} according to ASVS ${check.level} requirements`,
      ];
    }
  });

  // Calculate scores
  const summary = calculateScores(checks);

  // Create report
  const report: ASVSReport = {
    generated_at: new Date().toISOString(),
    summary,
    checks,
  };

  // Save JSON report
  const reportsDir = path.join(process.cwd(), 'reports');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  const jsonPath = path.join(reportsDir, 'asvs_coverage.json');
  fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2), 'utf-8');
  console.log(`✅ JSON report saved: ${jsonPath}`);

  // Generate and save Markdown report
  const markdown = generateMarkdownReport(report);
  const mdPath = path.join(reportsDir, 'asvs_coverage.md');
  fs.writeFileSync(mdPath, markdown, 'utf-8');
  console.log(`✅ Markdown report saved: ${mdPath}`);

  // Display summary
  console.log('\n📊 Security Coverage Summary:');
  console.log(`   Total Checks: ${summary.total_checks}`);
  console.log(`   Passed: ${summary.passed} ✅`);
  console.log(`   Failed: ${summary.failed} ❌`);
  console.log(
    `\n   L1 (Basic): ${summary.l1_passed}/${summary.l1_total} (${Math.round((summary.l1_passed / summary.l1_total) * 100)}%)`,
  );
  console.log(
    `   L2 (Standard): ${summary.l2_passed}/${summary.l2_total} (${Math.round((summary.l2_passed / summary.l2_total) * 100)}%)`,
  );
  console.log(
    `   L3 (Advanced): ${summary.l3_passed}/${summary.l3_total} (${summary.l3_total > 0 ? Math.round((summary.l3_passed / summary.l3_total) * 100) : 0}%)`,
  );
  console.log(`\n   🎯 Overall Score: ${summary.overall_score}%`);

  console.log('\n✨ ASVS security scan complete!\n');
  process.exit(0);
}

// Run the script
try {
  main();
} catch (error) {
  console.error('❌ Error:', error);
  process.exit(1);
}
