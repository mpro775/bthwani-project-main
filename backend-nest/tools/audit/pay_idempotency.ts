#!/usr/bin/env ts-node
/**
 * Payments/Wallet - Idempotency & Retry Audit
 *
 * Scans wallet|payment|order modules for:
 * - Idempotency keys
 * - Retry mechanisms
 * - Timeouts
 * - Webhook signature verification
 * 
 * Generates: reports/pay_idempotency.md with evidence table
 */

import * as fs from 'fs';
import * as path from 'path';

interface AuditCheck {
  id: string;
  name: string;
  description: string;
  category: string;
  status: 'implemented' | 'partial' | 'missing';
  evidence: Evidence[];
  notes?: string;
}

interface Evidence {
  file: string;
  line: number;
  code: string;
  context?: string;
}

interface PaymentAuditReport {
  generated_at: string;
  summary: {
    total_checks: number;
    implemented: number;
    partial: number;
    missing: number;
    coverage_percentage: number;
  };
  checks: AuditCheck[];
  modules_scanned: string[];
}

/**
 * Search for pattern in specific directories
 */
function searchInModules(
  pattern: string | RegExp,
  modules: string[] = ['wallet', 'payment', 'order', 'finance'],
  extensions: string[] = ['ts'],
): Evidence[] {
  const evidence: Evidence[] = [];
  const srcPath = path.join(process.cwd(), 'src');

  function searchInDirectory(dir: string, currentPath: string = '') {
    if (!fs.existsSync(dir)) return;

    const items = fs.readdirSync(dir, { withFileTypes: true });

    for (const item of items) {
      const fullPath = path.join(dir, item.name);
      const relativePath = currentPath ? `${currentPath}/${item.name}` : item.name;

      if (item.isDirectory()) {
        // Skip node_modules, dist, etc.
        if (['node_modules', 'dist', 'coverage', '.git'].includes(item.name)) {
          continue;
        }
        searchInDirectory(fullPath, relativePath);
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

  // Search in modules directory
  const modulesPath = path.join(srcPath, 'modules');
  if (fs.existsSync(modulesPath)) {
    for (const module of modules) {
      const modulePath = path.join(modulesPath, module);
      if (fs.existsSync(modulePath)) {
        searchInDirectory(modulePath, `src/modules/${module}`);
      }
    }
  }

  // Also search in common middleware
  const commonPath = path.join(srcPath, 'common');
  if (fs.existsSync(commonPath)) {
    searchInDirectory(commonPath, 'src/common');
  }

  return evidence;
}

/**
 * Perform payment security audit
 */
function performAudit(): AuditCheck[] {
  const checks: AuditCheck[] = [];

  console.log('💳 Analyzing Payment/Wallet Security...\n');

  // 1. Idempotency Middleware
  console.log('📋 Checking idempotency middleware...');
  const idempotencyMiddleware = searchInModules(
    'IdempotencyMiddleware|idempotency.*middleware',
    ['wallet', 'payment', 'order'],
  );

  checks.push({
    id: 'P1',
    name: 'Idempotency Middleware',
    description: 'Middleware to prevent duplicate payment/transaction operations',
    category: 'Idempotency',
    status: idempotencyMiddleware.length > 0 ? 'implemented' : 'missing',
    evidence: idempotencyMiddleware.slice(0, 5),
    notes:
      idempotencyMiddleware.length > 0
        ? 'Idempotency middleware is implemented'
        : 'No idempotency middleware found',
  });

  // 2. Idempotency Key Header
  console.log('📋 Checking idempotency key usage...');
  const idempotencyKey = searchInModules(
    'idempotency.*key|Idempotency-Key',
    ['wallet', 'payment', 'order', 'finance'],
  );

  checks.push({
    id: 'P2',
    name: 'Idempotency Key Header',
    description: 'Usage of Idempotency-Key header for request deduplication',
    category: 'Idempotency',
    status: idempotencyKey.length > 0 ? 'implemented' : 'missing',
    evidence: idempotencyKey.slice(0, 5),
  });

  // 3. Transaction Uniqueness (Database Constraints)
  console.log('📋 Checking transaction uniqueness constraints...');
  const uniqueConstraints = searchInModules(
    'unique.*true|@Prop.*unique|bankRef|transactionId|externalId',
    ['wallet', 'payment', 'order'],
  );

  checks.push({
    id: 'P3',
    name: 'Unique Transaction Identifiers',
    description: 'Database constraints to prevent duplicate transactions',
    category: 'Idempotency',
    status: uniqueConstraints.length > 0 ? 'implemented' : 'missing',
    evidence: uniqueConstraints.slice(0, 5),
  });

  // 4. Database Transactions (ACID)
  console.log('📋 Checking database transaction usage...');
  const dbTransactions = searchInModules(
    'startTransaction|executeInTransaction|session.*startTransaction',
    ['wallet', 'payment', 'order', 'finance'],
  );

  checks.push({
    id: 'P4',
    name: 'Database Transactions (ACID)',
    description: 'Use of database transactions for atomic operations',
    category: 'Consistency',
    status: dbTransactions.length > 0 ? 'implemented' : 'missing',
    evidence: dbTransactions.slice(0, 5),
  });

  // 5. Retry Logic
  console.log('📋 Checking retry mechanisms...');
  const retryLogic = searchInModules(
    'retry|maxRetries|attemptCount|retryCount|backoff',
    ['wallet', 'payment', 'order', 'finance'],
  );

  checks.push({
    id: 'P5',
    name: 'Retry Mechanisms',
    description: 'Retry logic for failed operations with exponential backoff',
    category: 'Resilience',
    status: retryLogic.length > 0 ? 'implemented' : 'missing',
    evidence: retryLogic.slice(0, 5),
  });

  // 6. Timeout Configuration
  console.log('📋 Checking timeout configurations...');
  const timeouts = searchInModules(
    'timeout|setTimeout|requestTimeout|connectionTimeout',
    ['wallet', 'payment', 'order'],
  );

  checks.push({
    id: 'P6',
    name: 'Request Timeouts',
    description: 'Timeout configuration for external payment APIs',
    category: 'Resilience',
    status: timeouts.length > 0 ? 'implemented' : 'missing',
    evidence: timeouts.slice(0, 5),
  });

  // 7. Webhook Signature Verification
  console.log('📋 Checking webhook signature verification...');
  const webhookSignature = searchInModules(
    'signature|verify.*webhook|hmac|crypto.*verify',
    ['wallet', 'payment', 'order', 'finance'],
  );

  checks.push({
    id: 'P7',
    name: 'Webhook Signature Verification',
    description: 'Verification of webhook signatures from payment providers',
    category: 'Security',
    status: webhookSignature.length > 0 ? 'partial' : 'missing',
    evidence: webhookSignature.slice(0, 5),
    notes:
      webhookSignature.length > 0
        ? 'Some signature verification found'
        : 'No webhook signature verification found',
  });

  // 8. Payment Status Tracking
  console.log('📋 Checking payment status tracking...');
  const statusTracking = searchInModules(
    'status.*pending|completed|failed|status.*enum',
    ['wallet', 'payment', 'order'],
  );

  checks.push({
    id: 'P8',
    name: 'Payment Status States',
    description: 'Comprehensive payment status tracking (pending, completed, failed, etc.)',
    category: 'Consistency',
    status: statusTracking.length > 0 ? 'implemented' : 'missing',
    evidence: statusTracking.slice(0, 5),
  });

  // 9. Balance Validation
  console.log('📋 Checking balance validation...');
  const balanceValidation = searchInModules(
    'validateBalance|checkBalance|insufficient.*balance',
    ['wallet', 'payment', 'order'],
  );

  checks.push({
    id: 'P9',
    name: 'Balance Validation',
    description: 'Validation of sufficient balance before debit operations',
    category: 'Validation',
    status: balanceValidation.length > 0 ? 'implemented' : 'missing',
    evidence: balanceValidation.slice(0, 5),
  });

  // 10. Atomic Balance Updates
  console.log('📋 Checking atomic balance updates...');
  const atomicUpdates = searchInModules(
    '\\$inc|\\$set.*balance|findOneAndUpdate.*balance',
    ['wallet', 'payment'],
  );

  checks.push({
    id: 'P10',
    name: 'Atomic Balance Updates',
    description: 'Atomic database operations for balance modifications',
    category: 'Consistency',
    status: atomicUpdates.length > 0 ? 'implemented' : 'missing',
    evidence: atomicUpdates.slice(0, 5),
  });

  // 11. Transaction Reversal/Rollback
  console.log('📋 Checking transaction reversal mechanisms...');
  const reversal = searchInModules(
    'reverse|rollback|refund|abortTransaction',
    ['wallet', 'payment', 'order', 'finance'],
  );

  checks.push({
    id: 'P11',
    name: 'Transaction Reversal',
    description: 'Mechanism to reverse/rollback failed transactions',
    category: 'Resilience',
    status: reversal.length > 0 ? 'implemented' : 'missing',
    evidence: reversal.slice(0, 5),
  });

  // 12. Event Sourcing
  console.log('📋 Checking event sourcing implementation...');
  const eventSourcing = searchInModules(
    'WalletEvent|wallet.*event|event.*store|appendEvent',
    ['wallet'],
  );

  checks.push({
    id: 'P12',
    name: 'Event Sourcing',
    description: 'Event sourcing for wallet transaction history and audit trail',
    category: 'Audit Trail',
    status: eventSourcing.length > 0 ? 'implemented' : 'missing',
    evidence: eventSourcing.slice(0, 5),
  });

  // 13. Double-Spending Prevention
  console.log('📋 Checking double-spending prevention...');
  const doubleSpending = searchInModules(
    'onHold|escrow|lock.*balance|reserve',
    ['wallet', 'payment', 'order'],
  );

  checks.push({
    id: 'P13',
    name: 'Double-Spending Prevention',
    description: 'Mechanisms to prevent double-spending (e.g., balance holds)',
    category: 'Security',
    status: doubleSpending.length > 0 ? 'implemented' : 'missing',
    evidence: doubleSpending.slice(0, 5),
  });

  // 14. Correlation/Causation IDs
  console.log('📋 Checking correlation IDs...');
  const correlationIds = searchInModules(
    'correlationId|causationId|traceId|requestId',
    ['wallet', 'payment', 'order', 'finance'],
  );

  checks.push({
    id: 'P14',
    name: 'Correlation/Causation IDs',
    description: 'Tracking IDs for distributed transaction tracing',
    category: 'Audit Trail',
    status: correlationIds.length > 0 ? 'implemented' : 'missing',
    evidence: correlationIds.slice(0, 5),
  });

  // 15. Rate Limiting for Payment Endpoints
  console.log('📋 Checking rate limiting...');
  const rateLimiting = searchInModules(
    '@UseGuards.*RateLimit|@Throttle|rateLimit',
    ['wallet', 'payment'],
  );

  checks.push({
    id: 'P15',
    name: 'Payment Endpoint Rate Limiting',
    description: 'Rate limiting to prevent abuse of payment endpoints',
    category: 'Security',
    status: rateLimiting.length > 0 ? 'partial' : 'missing',
    evidence: rateLimiting.slice(0, 5),
    notes: 'Global rate limiting may be configured in main.ts',
  });

  console.log('✅ Payment audit completed\n');

  return checks;
}

/**
 * Calculate summary statistics
 */
function calculateSummary(checks: AuditCheck[]): PaymentAuditReport['summary'] {
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
function generateMarkdownReport(report: PaymentAuditReport): string {
  const { summary, checks } = report;

  let md = `# Payments/Wallet - Idempotency & Retry Audit\n\n`;
  md += `**Generated:** ${new Date(report.generated_at).toLocaleString('ar-SA')}\n\n`;
  md += `**Modules Scanned:** ${report.modules_scanned.join(', ')}\n\n`;
  md += `---\n\n`;

  // Summary
  md += `## 📊 Summary\n\n`;
  md += `### ${summary.coverage_percentage}% Security Coverage\n\n`;

  const quality =
    summary.coverage_percentage >= 90
      ? '🟢 Excellent'
      : summary.coverage_percentage >= 75
        ? '🟡 Good'
        : summary.coverage_percentage >= 60
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

  // Evidence Table
  md += `## 🔍 Detailed Audit Results\n\n`;

  // Group by category
  const categories = [...new Set(checks.map((c) => c.category))];

  categories.forEach((category) => {
    const categoryChecks = checks.filter((c) => c.category === category);
    const categoryImpl = categoryChecks.filter((c) => c.status === 'implemented').length;
    const categoryScore = Math.round((categoryImpl / categoryChecks.length) * 100);

    md += `### ${category} (${categoryScore}%)\n\n`;
    md += `| ID | Check | Status | Evidence Count |\n`;
    md += `|----|-------|--------|----------------|\n`;

    categoryChecks.forEach((check) => {
      const icon =
        check.status === 'implemented'
          ? '✅'
          : check.status === 'partial'
            ? '⚠️'
            : '❌';
      md += `| **${check.id}** | ${check.name} | ${icon} ${check.status} | ${check.evidence.length} |\n`;
    });

    md += `\n`;

    // Detailed evidence
    categoryChecks.forEach((check) => {
      md += `#### ${check.id} - ${check.name}\n\n`;
      md += `**Description:** ${check.description}\n\n`;
      md += `**Status:** ${check.status === 'implemented' ? '✅ Implemented' : check.status === 'partial' ? '⚠️ Partially Implemented' : '❌ Missing'}\n\n`;

      if (check.notes) {
        md += `**Notes:** ${check.notes}\n\n`;
      }

      if (check.evidence.length > 0) {
        md += `**Evidence:**\n\n`;
        md += `| File | Line | Code |\n`;
        md += `|------|------|------|\n`;

        check.evidence.slice(0, 10).forEach((ev) => {
          const codeSnippet = ev.code.length > 80 ? ev.code.substring(0, 77) + '...' : ev.code;
          md += `| \`${ev.file}\` | ${ev.line} | \`${codeSnippet}\` |\n`;
        });

        if (check.evidence.length > 10) {
          md += `\n*... and ${check.evidence.length - 10} more occurrences*\n`;
        }
        md += `\n`;
      } else {
        md += `**Evidence:** None found\n\n`;
      }
    });

    md += `\n`;
  });

  // Recommendations
  md += `---\n\n`;
  md += `## 💡 Recommendations\n\n`;

  const missing = checks.filter((c) => c.status === 'missing');
  const partial = checks.filter((c) => c.status === 'partial');

  if (missing.length > 0) {
    md += `### ❌ Missing Features\n\n`;
    missing.forEach((check) => {
      md += `- **${check.name}**: ${check.description}\n`;
    });
    md += `\n`;
  }

  if (partial.length > 0) {
    md += `### ⚠️ Partial Implementation\n\n`;
    partial.forEach((check) => {
      md += `- **${check.name}**: ${check.description}\n`;
      if (check.notes) {
        md += `  - ${check.notes}\n`;
      }
    });
    md += `\n`;
  }

  // Best Practices
  md += `---\n\n`;
  md += `## 📚 Best Practices\n\n`;
  md += `### Idempotency\n`;
  md += `- Use unique idempotency keys for all write operations\n`;
  md += `- Cache responses for 24-48 hours\n`;
  md += `- Return same response for duplicate requests\n\n`;

  md += `### Retries\n`;
  md += `- Implement exponential backoff for failed operations\n`;
  md += `- Set maximum retry limits (e.g., 3-5 attempts)\n`;
  md += `- Use circuit breakers for external services\n\n`;

  md += `### Timeouts\n`;
  md += `- Set appropriate timeouts for payment APIs (10-30s)\n`;
  md += `- Handle timeout errors gracefully\n`;
  md += `- Implement async processing for long operations\n\n`;

  md += `### Webhook Security\n`;
  md += `- Verify webhook signatures (HMAC-SHA256)\n`;
  md += `- Use HTTPS for webhook endpoints\n`;
  md += `- Implement replay attack prevention\n\n`;

  md += `### Consistency\n`;
  md += `- Use database transactions for multi-step operations\n`;
  md += `- Implement optimistic locking for concurrent updates\n`;
  md += `- Maintain audit trail for all transactions\n\n`;

  md += `---\n\n`;
  md += `## 🔗 Resources\n\n`;
  md += `- [Stripe API Idempotency](https://stripe.com/docs/api/idempotent_requests)\n`;
  md += `- [PayPal Webhook Security](https://developer.paypal.com/docs/api-basics/notifications/webhooks/)\n`;
  md += `- [Event Sourcing Pattern](https://microservices.io/patterns/data/event-sourcing.html)\n`;
  md += `- [Two-Phase Commit](https://en.wikipedia.org/wiki/Two-phase_commit_protocol)\n\n`;

  md += `---\n\n`;
  md += `*Report generated by Payment/Wallet Idempotency Audit Tool*\n`;

  return md;
}

/**
 * Main execution
 */
async function main() {
  console.log('💳 Payments/Wallet - Idempotency & Retry Audit\n');
  console.log('Scanning wallet, payment, order, and finance modules...\n');

  const modulesScanned = ['wallet', 'payment', 'order', 'finance', 'common'];

  // Perform audit
  const checks = performAudit();

  // Calculate summary
  const summary = calculateSummary(checks);

  // Create report
  const report: PaymentAuditReport = {
    generated_at: new Date().toISOString(),
    summary,
    checks,
    modules_scanned: modulesScanned,
  };

  // Save reports
  const reportsDir = path.join(process.cwd(), 'reports');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  // Save JSON
  const jsonPath = path.join(reportsDir, 'pay_idempotency.json');
  fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2), 'utf-8');
  console.log(`✅ JSON report saved: ${jsonPath}`);

  // Save Markdown
  const markdown = generateMarkdownReport(report);
  const mdPath = path.join(reportsDir, 'pay_idempotency.md');
  fs.writeFileSync(mdPath, markdown, 'utf-8');
  console.log(`✅ Markdown report saved: ${mdPath}`);

  // Display summary
  console.log('\n📊 Payment Security Summary:');
  console.log(`   Total Checks: ${summary.total_checks}`);
  console.log(`   ✅ Implemented: ${summary.implemented}`);
  console.log(`   ⚠️ Partial: ${summary.partial}`);
  console.log(`   ❌ Missing: ${summary.missing}`);
  console.log(`   📈 Coverage: ${summary.coverage_percentage}%`);

  console.log('\n✨ Payment/Wallet audit complete!\n');
  process.exit(0);
}

// Run the script
main().catch((error) => {
  console.error('❌ Error:', error);
  process.exit(1);
});

