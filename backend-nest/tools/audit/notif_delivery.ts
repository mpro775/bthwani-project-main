#!/usr/bin/env ts-node
/**
 * Notifications - Delivery/Retry/DLQ Audit
 *
 * Audits notification system for:
 * - Channel configurations (Push, Email, SMS, WebSocket)
 * - Retry mechanisms and backoff strategies
 * - Dead Letter Queue (DLQ) implementation
 * - Suppression lists
 * - Fallback strategies
 * - Delivery tracking
 * 
 * Generates: reports/notification_delivery.md
 */

import * as fs from 'fs';
import * as path from 'path';

interface NotificationCheck {
  id: string;
  name: string;
  description: string;
  category: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'implemented' | 'partial' | 'missing';
  evidence: Evidence[];
  notes?: string;
}

interface Evidence {
  file: string;
  line: number;
  code: string;
}

interface NotificationAuditReport {
  generated_at: string;
  summary: {
    total_checks: number;
    implemented: number;
    partial: number;
    missing: number;
    coverage_percentage: number;
  };
  channels: {
    push: boolean;
    email: boolean;
    sms: boolean;
    websocket: boolean;
  };
  checks: NotificationCheck[];
}

/**
 * Search in notification-related files
 */
function searchInNotifications(
  pattern: string | RegExp,
  paths: string[] = ['notification', 'queues'],
  extensions: string[] = ['ts'],
): Evidence[] {
  const evidence: Evidence[] = [];
  const srcPath = path.join(process.cwd(), 'src');

  function searchInDirectory(dir: string) {
    if (!fs.existsSync(dir)) return;

    const items = fs.readdirSync(dir, { withFileTypes: true });

    for (const item of items) {
      const fullPath = path.join(dir, item.name);

      if (item.isDirectory()) {
        if (['node_modules', 'dist', 'coverage', '.git'].includes(item.name)) {
          continue;
        }
        searchInDirectory(fullPath);
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

  // Search in specific paths
  for (const searchPath of paths) {
    const fullSearchPath = searchPath.includes('/')
      ? path.join(srcPath, searchPath)
      : path.join(srcPath, 'modules', searchPath);
    
    if (fs.existsSync(fullSearchPath)) {
      searchInDirectory(fullSearchPath);
    }
  }

  // Also search in queues
  const queuesPath = path.join(srcPath, 'queues');
  if (fs.existsSync(queuesPath)) {
    searchInDirectory(queuesPath);
  }

  return evidence;
}

/**
 * Detect notification channels
 */
function detectChannels(): NotificationAuditReport['channels'] {
  const pushEvidence = searchInNotifications('firebase|fcm|push.*notification|messaging');
  const emailEvidence = searchInNotifications('email|sendgrid|ses|nodemailer|smtp');
  const smsEvidence = searchInNotifications('sms|twilio|nexmo|vonage');
  const websocketEvidence = searchInNotifications('socket\\.io|websocket|gateway', ['gateways']);

  return {
    push: pushEvidence.length > 0,
    email: emailEvidence.length > 0,
    sms: smsEvidence.length > 0,
    websocket: websocketEvidence.length > 0,
  };
}

/**
 * Perform notification audit
 */
function performAudit(): NotificationCheck[] {
  const checks: NotificationCheck[] = [];

  console.log('🔔 Analyzing Notification System...\n');

  // 1. Notification Queue Setup
  console.log('📋 Checking notification queue...');
  const queueSetup = searchInNotifications('@Processor.*notification|notifications.*queue');

  checks.push({
    id: 'N1',
    name: 'Notification Queue',
    description: 'Bull/Redis queue for async notification processing',
    category: 'Infrastructure',
    priority: 'High',
    status: queueSetup.length > 0 ? 'implemented' : 'missing',
    evidence: queueSetup.slice(0, 5),
  });

  // 2. Notification Processor
  console.log('📋 Checking notification processor...');
  const processor = searchInNotifications('NotificationProcessor|@Process.*notification');

  checks.push({
    id: 'N2',
    name: 'Notification Processor',
    description: 'Worker to process notification jobs from queue',
    category: 'Infrastructure',
    priority: 'High',
    status: processor.length > 0 ? 'implemented' : 'missing',
    evidence: processor.slice(0, 5),
  });

  // 3. Retry Configuration
  console.log('📋 Checking retry mechanisms...');
  const retryConfig = searchInNotifications(
    'attempts|maxRetries|backoff|exponential|retry',
  );

  checks.push({
    id: 'N3',
    name: 'Retry Mechanism',
    description: 'Retry failed notifications with exponential backoff',
    category: 'Resilience',
    priority: 'High',
    status: retryConfig.length > 0 ? 'partial' : 'missing',
    evidence: retryConfig.slice(0, 5),
    notes:
      retryConfig.length > 0
        ? 'Some retry logic found, verify configuration'
        : 'No retry configuration found',
  });

  // 4. Dead Letter Queue (DLQ)
  console.log('📋 Checking Dead Letter Queue...');
  const dlq = searchInNotifications('deadLetter|dead.*letter|failed.*queue|dlq');

  checks.push({
    id: 'N4',
    name: 'Dead Letter Queue (DLQ)',
    description: 'Queue for permanently failed notifications',
    category: 'Resilience',
    priority: 'Medium',
    status: dlq.length > 0 ? 'implemented' : 'missing',
    evidence: dlq.slice(0, 5),
  });

  // 5. Notification Status Tracking
  console.log('📋 Checking notification status tracking...');
  const statusTracking = searchInNotifications(
    'status.*queued|sent|delivered|failed|status.*enum',
  );

  checks.push({
    id: 'N5',
    name: 'Status Tracking',
    description: 'Track notification lifecycle (queued, sent, delivered, failed)',
    category: 'Tracking',
    priority: 'High',
    status: statusTracking.length > 0 ? 'implemented' : 'missing',
    evidence: statusTracking.slice(0, 5),
  });

  // 6. Delivery Receipts
  console.log('📋 Checking delivery receipts...');
  const receipts = searchInNotifications('receipt|delivery.*receipt|acknowledgment');

  checks.push({
    id: 'N6',
    name: 'Delivery Receipts',
    description: 'Track delivery confirmations from notification services',
    category: 'Tracking',
    priority: 'Medium',
    status: receipts.length > 0 ? 'implemented' : 'missing',
    evidence: receipts.slice(0, 5),
  });

  // 7. Suppression Lists
  console.log('📋 Checking suppression lists...');
  const suppression = searchInNotifications(
    'suppress|unsubscribe|optOut|blacklist|blocked.*users',
  );

  checks.push({
    id: 'N7',
    name: 'Suppression Lists',
    description: 'Prevent sending notifications to opted-out users',
    category: 'Compliance',
    priority: 'Medium',
    status: suppression.length > 0 ? 'implemented' : 'missing',
    evidence: suppression.slice(0, 5),
  });

  // 8. Notification Preferences
  console.log('📋 Checking user notification preferences...');
  const preferences = searchInNotifications(
    'preference|notification.*setting|enable.*notification',
  );

  checks.push({
    id: 'N8',
    name: 'User Preferences',
    description: 'Respect user notification preferences and settings',
    category: 'Compliance',
    priority: 'Medium',
    status: preferences.length > 0 ? 'partial' : 'missing',
    evidence: preferences.slice(0, 5),
  });

  // 9. Fallback Strategy
  console.log('📋 Checking fallback strategies...');
  const fallback = searchInNotifications('fallback|alternative|backup.*channel');

  checks.push({
    id: 'N9',
    name: 'Fallback Strategy',
    description: 'Use alternative channels if primary fails',
    category: 'Resilience',
    priority: 'Low',
    status: fallback.length > 0 ? 'implemented' : 'missing',
    evidence: fallback.slice(0, 5),
  });

  // 10. Bulk Notification Support
  console.log('📋 Checking bulk notification support...');
  const bulk = searchInNotifications('bulk|batch.*notification|send.*many');

  checks.push({
    id: 'N10',
    name: 'Bulk Notifications',
    description: 'Efficiently send notifications to multiple users',
    category: 'Performance',
    priority: 'Medium',
    status: bulk.length > 0 ? 'implemented' : 'missing',
    evidence: bulk.slice(0, 5),
  });

  // 11. Rate Limiting
  console.log('📋 Checking notification rate limiting...');
  const rateLimit = searchInNotifications('rateLimit|throttle|rate.*limit');

  checks.push({
    id: 'N11',
    name: 'Rate Limiting',
    description: 'Limit notification frequency to prevent spam',
    category: 'Performance',
    priority: 'Medium',
    status: rateLimit.length > 0 ? 'partial' : 'missing',
    evidence: rateLimit.slice(0, 5),
    notes: 'Global rate limiting may be configured',
  });

  // 12. Notification Templates
  console.log('📋 Checking notification templates...');
  const templates = searchInNotifications('template|notification.*template');

  checks.push({
    id: 'N12',
    name: 'Notification Templates',
    description: 'Reusable templates for consistent messaging',
    category: 'Content',
    priority: 'Low',
    status: templates.length > 0 ? 'implemented' : 'missing',
    evidence: templates.slice(0, 5),
  });

  // 13. Error Handling
  console.log('📋 Checking error handling...');
  const errorHandling = searchInNotifications('OnQueueFailed|catch.*error|try.*catch');

  checks.push({
    id: 'N13',
    name: 'Error Handling',
    description: 'Proper error handling and logging for failures',
    category: 'Reliability',
    priority: 'High',
    status: errorHandling.length > 0 ? 'implemented' : 'missing',
    evidence: errorHandling.slice(0, 5),
  });

  // 14. Job Lifecycle Hooks
  console.log('📋 Checking queue lifecycle hooks...');
  const lifecycleHooks = searchInNotifications(
    'OnQueueActive|OnQueueCompleted|OnQueueFailed',
  );

  checks.push({
    id: 'N14',
    name: 'Queue Lifecycle Hooks',
    description: 'Monitor job lifecycle (active, completed, failed)',
    category: 'Monitoring',
    priority: 'Medium',
    status: lifecycleHooks.length > 0 ? 'implemented' : 'missing',
    evidence: lifecycleHooks.slice(0, 5),
  });

  // 15. Push Notification Integration
  console.log('📋 Checking push notification integration...');
  const pushIntegration = searchInNotifications('firebase|fcm|messaging|push');

  checks.push({
    id: 'N15',
    name: 'Push Notification Channel',
    description: 'Firebase Cloud Messaging or similar push service',
    category: 'Channels',
    priority: 'High',
    status: pushIntegration.length > 0 ? 'partial' : 'missing',
    evidence: pushIntegration.slice(0, 5),
    notes:
      pushIntegration.length > 0
        ? 'Push notification code found, verify integration'
        : 'No push notification integration found',
  });

  // 16. WebSocket Real-time Notifications
  console.log('📋 Checking WebSocket notifications...');
  const websocket = searchInNotifications('websocket|socket\\.io|gateway', ['gateways']);

  checks.push({
    id: 'N16',
    name: 'WebSocket Notifications',
    description: 'Real-time notifications via WebSocket',
    category: 'Channels',
    priority: 'Medium',
    status: websocket.length > 0 ? 'implemented' : 'missing',
    evidence: websocket.slice(0, 5),
  });

  console.log('✅ Notification audit completed\n');

  return checks;
}

/**
 * Calculate summary
 */
function calculateSummary(checks: NotificationCheck[]): NotificationAuditReport['summary'] {
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
function generateMarkdownReport(report: NotificationAuditReport): string {
  const { summary, channels, checks } = report;

  let md = `# Notifications - Delivery/Retry/DLQ Audit\n\n`;
  md += `**Generated:** ${new Date(report.generated_at).toLocaleString('ar-SA')}\n\n`;
  md += `---\n\n`;

  // Summary
  md += `## 📊 Summary\n\n`;
  md += `### ${summary.coverage_percentage}% Implementation Coverage\n\n`;

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

  // Channel Configuration
  md += `---\n\n`;
  md += `## 📡 Notification Channels\n\n`;
  md += `| Channel | Status | Description |\n`;
  md += `|---------|--------|-------------|\n`;
  md += `| **Push Notifications** | ${channels.push ? '✅ Detected' : '❌ Not Found'} | Firebase Cloud Messaging / APNs |\n`;
  md += `| **Email** | ${channels.email ? '✅ Detected' : '❌ Not Found'} | SMTP / SendGrid / SES |\n`;
  md += `| **SMS** | ${channels.sms ? '✅ Detected' : '❌ Not Found'} | Twilio / Vonage / Nexmo |\n`;
  md += `| **WebSocket** | ${channels.websocket ? '✅ Detected' : '❌ Not Found'} | Real-time Socket.io / WebSocket |\n\n`;

  const activeChannels = Object.entries(channels)
    .filter(([, active]) => active)
    .map(([channel]) => channel);
  
  md += `**Active Channels:** ${activeChannels.length > 0 ? activeChannels.join(', ') : 'None detected'}\n\n`;

  md += `---\n\n`;

  // Detailed Checks
  md += `## 🔍 Detailed Audit Results\n\n`;

  const categories = [...new Set(checks.map((c) => c.category))];

  categories.forEach((category) => {
    const categoryChecks = checks.filter((c) => c.category === category);
    const categoryImpl = categoryChecks.filter((c) => c.status === 'implemented').length;
    const categoryScore = Math.round((categoryImpl / categoryChecks.length) * 100);

    md += `### ${category} (${categoryScore}%)\n\n`;
    md += `| ID | Check | Priority | Status | Evidence |\n`;
    md += `|----|-------|----------|--------|----------|\n`;

    categoryChecks.forEach((check) => {
      const icon =
        check.status === 'implemented'
          ? '✅'
          : check.status === 'partial'
            ? '⚠️'
            : '❌';
      md += `| **${check.id}** | ${check.name} | ${check.priority} | ${icon} ${check.status} | ${check.evidence.length} |\n`;
    });

    md += `\n`;

    // Details
    categoryChecks.forEach((check) => {
      md += `#### ${check.id} - ${check.name}\n\n`;
      md += `**Description:** ${check.description}\n\n`;
      md += `**Priority:** ${check.priority}\n\n`;
      md += `**Status:** ${check.status === 'implemented' ? '✅ Implemented' : check.status === 'partial' ? '⚠️ Partially Implemented' : '❌ Missing'}\n\n`;

      if (check.notes) {
        md += `**Notes:** ${check.notes}\n\n`;
      }

      if (check.evidence.length > 0) {
        md += `**Evidence:**\n\n`;
        check.evidence.slice(0, 5).forEach((ev) => {
          md += `- \`${ev.file}:${ev.line}\`\n`;
          md += `  \`\`\`typescript\n`;
          md += `  ${ev.code}\n`;
          md += `  \`\`\`\n\n`;
        });
        if (check.evidence.length > 5) {
          md += `*... and ${check.evidence.length - 5} more occurrences*\n\n`;
        }
      } else {
        md += `**Evidence:** None found\n\n`;
      }
    });

    md += `\n`;
  });

  // Recommendations
  md += `---\n\n`;
  md += `## 💡 Recommendations\n\n`;

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
      md += `- **${check.name}**: ${check.description}\n`;
    });
    md += `\n`;
  }

  if (mediumPriority.length > 0) {
    md += `### 🟡 Medium Priority\n\n`;
    mediumPriority.forEach((check) => {
      md += `- **${check.name}**: ${check.description}\n`;
    });
    md += `\n`;
  }

  if (lowPriority.length > 0) {
    md += `### 🟢 Low Priority (Nice to Have)\n\n`;
    lowPriority.forEach((check) => {
      md += `- **${check.name}**: ${check.description}\n`;
    });
    md += `\n`;
  }

  // Best Practices
  md += `---\n\n`;
  md += `## 📚 Best Practices\n\n`;
  
  md += `### Queue Configuration\n`;
  md += `- Set appropriate retry attempts (3-5 for critical notifications)\n`;
  md += `- Use exponential backoff (1s, 2s, 4s, 8s, 16s)\n`;
  md += `- Configure Dead Letter Queue for permanently failed jobs\n`;
  md += `- Set job timeouts to prevent hanging workers\n\n`;

  md += `### Delivery Optimization\n`;
  md += `- Batch notifications for better performance\n`;
  md += `- Use priority queues for urgent notifications\n`;
  md += `- Implement rate limiting to respect service limits\n`;
  md += `- Track delivery metrics (sent, delivered, failed)\n\n`;

  md += `### Compliance & User Experience\n`;
  md += `- Respect user notification preferences\n`;
  md += `- Implement opt-out/unsubscribe mechanisms\n`;
  md += `- Provide notification history and management\n`;
  md += `- Follow platform guidelines (APNs, FCM)\n\n`;

  md += `### Monitoring & Debugging\n`;
  md += `- Log all notification attempts with job IDs\n`;
  md += `- Monitor queue metrics (processing time, failure rate)\n`;
  md += `- Set up alerts for high failure rates\n`;
  md += `- Store delivery receipts for audit trail\n\n`;

  md += `---\n\n`;
  md += `## 🔗 Resources\n\n`;
  md += `- [Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging)\n`;
  md += `- [Bull Queue Documentation](https://github.com/OptimalBits/bull)\n`;
  md += `- [Socket.io Documentation](https://socket.io/docs/v4/)\n`;
  md += `- [NestJS Bull Module](https://docs.nestjs.com/techniques/queues)\n\n`;

  md += `---\n\n`;
  md += `*Report generated by Notification Delivery Audit Tool*\n`;

  return md;
}

/**
 * Main execution
 */
async function main() {
  console.log('🔔 Notifications - Delivery/Retry/DLQ Audit\n');
  console.log('Analyzing notification system...\n');

  // Detect channels
  const channels = detectChannels();

  // Perform audit
  const checks = performAudit();

  // Calculate summary
  const summary = calculateSummary(checks);

  // Create report
  const report: NotificationAuditReport = {
    generated_at: new Date().toISOString(),
    summary,
    channels,
    checks,
  };

  // Save reports
  const reportsDir = path.join(process.cwd(), 'reports');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  // Save JSON
  const jsonPath = path.join(reportsDir, 'notification_delivery.json');
  fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2), 'utf-8');
  console.log(`✅ JSON report saved: ${jsonPath}`);

  // Save Markdown
  const markdown = generateMarkdownReport(report);
  const mdPath = path.join(reportsDir, 'notification_delivery.md');
  fs.writeFileSync(mdPath, markdown, 'utf-8');
  console.log(`✅ Markdown report saved: ${mdPath}`);

  // Display summary
  console.log('\n📊 Notification System Summary:');
  console.log(`   Total Checks: ${summary.total_checks}`);
  console.log(`   ✅ Implemented: ${summary.implemented}`);
  console.log(`   ⚠️ Partial: ${summary.partial}`);
  console.log(`   ❌ Missing: ${summary.missing}`);
  console.log(`   📈 Coverage: ${summary.coverage_percentage}%`);
  
  console.log('\n📡 Active Channels:');
  console.log(`   Push: ${channels.push ? '✅' : '❌'}`);
  console.log(`   Email: ${channels.email ? '✅' : '❌'}`);
  console.log(`   SMS: ${channels.sms ? '✅' : '❌'}`);
  console.log(`   WebSocket: ${channels.websocket ? '✅' : '❌'}`);

  console.log('\n✨ Notification audit complete!\n');
  process.exit(0);
}

// Run the script
main().catch((error) => {
  console.error('❌ Error:', error);
  process.exit(1);
});

