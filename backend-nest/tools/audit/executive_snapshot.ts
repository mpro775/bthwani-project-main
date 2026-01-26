#!/usr/bin/env ts-node
/**
 * Executive One-Pager - Auto-Compose
 *
 * Reads all reports/*.json|md|csv and generates executive summary
 * Output: reports/EXEC_SUMMARY.md
 * 
 * Format:
 * - N Findings
 * - P0/P1 Issues
 * - Parity Gap %
 * - ASVS Score %
 * - Observability %
 * - Go/No-Go Decision
 * - [TBD] Questions
 */

import * as fs from 'fs';
import * as path from 'path';

interface ReportData {
  [key: string]: any;
}

interface ExecutiveSummary {
  totalFindings: number;
  criticalIssues: number;
  highPriorityIssues: number;
  parityGap: number;
  asvsScore: number;
  healthCoverage: number;
  securityScore: number;
  complianceCoverage: number;
  goNoGo: 'GO' | 'NO-GO' | 'CONDITIONAL';
  reason: string;
}

/**
 * Load all JSON reports
 */
function loadReports(): Record<string, ReportData> {
  const reportsDir = path.join(process.cwd(), 'reports');
  const reports: Record<string, ReportData> = {};

  if (!fs.existsSync(reportsDir)) {
    return reports;
  }

  const files = fs.readdirSync(reportsDir);

  for (const file of files) {
    if (file.endsWith('.json') && !file.includes('openapi')) {
      const filePath = path.join(reportsDir, file);
      try {
        const content = fs.readFileSync(filePath, 'utf-8');
        const data = JSON.parse(content);
        const key = file.replace('.json', '');
        reports[key] = data;
      } catch (error) {
        console.warn(`⚠️  Could not parse ${file}`);
      }
    }
  }

  return reports;
}

/**
 * Analyze reports and generate executive summary
 */
function analyzeReports(reports: Record<string, ReportData>): ExecutiveSummary {
  let totalFindings = 0;
  let criticalIssues = 0;
  let highPriorityIssues = 0;
  let parityGap = 0;
  let asvsScore = 0;
  let healthCoverage = 0;
  let securityScore = 0;
  let complianceCoverage = 0;

  // Parity Report
  if (reports.parity_report) {
    parityGap = reports.parity_report.summary?.parity_gap_percentage || 0;
    totalFindings += reports.parity_report.summary?.undocumented || 0;
    totalFindings += reports.parity_report.summary?.mismatch || 0;
    criticalIssues += reports.parity_report.summary?.undocumented || 0;
  }

  // ASVS Coverage
  if (reports.asvs_coverage) {
    asvsScore = reports.asvs_coverage.summary?.overall_score || 0;
    totalFindings += reports.asvs_coverage.summary?.failed || 0;
  }

  // Health Gaps
  if (reports.health_gaps) {
    healthCoverage = reports.health_gaps.summary?.coverage_percentage || 0;
    highPriorityIssues += reports.health_gaps.summary?.missing || 0;
  }

  // Payment Idempotency
  if (reports.pay_idempotency) {
    securityScore = reports.pay_idempotency.summary?.coverage_percentage || 0;
    totalFindings += reports.pay_idempotency.summary?.missing || 0;
  }

  // Notification Delivery
  if (reports.notification_delivery) {
    const notifCoverage = reports.notification_delivery.summary?.coverage_percentage || 0;
    totalFindings += reports.notification_delivery.summary?.missing || 0;
    highPriorityIssues += reports.notification_delivery.summary?.missing || 0;
  }

  // Compliance Index
  if (reports.compliance_index) {
    const implemented = reports.compliance_index.filter((r: any) => 
      r.requirementId && r.status === 'Implemented'
    ).length;
    const total = reports.compliance_index.filter((r: any) => 
      r.requirementId !== ''
    ).length;
    complianceCoverage = total > 0 ? Math.round((implemented / total) * 100) : 0;
    
    const missing = reports.compliance_index.filter((r: any) => 
      r.requirementId && r.status === 'Missing'
    ).length;
    criticalIssues += missing;
  }

  // Error Taxonomy
  if (reports.error_taxonomy_diff) {
    // Error taxonomy is informational
  }

  // Jobs Inventory
  if (reports.jobs_inventory) {
    // Jobs inventory is informational
  }

  // Determine Go/No-Go
  let goNoGo: 'GO' | 'NO-GO' | 'CONDITIONAL' = 'GO';
  let reason = 'All systems operational';

  if (criticalIssues > 10) {
    goNoGo = 'NO-GO';
    reason = `${criticalIssues} critical issues found`;
  } else if (parityGap > 60) {
    goNoGo = 'NO-GO';
    reason = `API documentation parity gap too high (${parityGap}%)`;
  } else if (asvsScore < 70) {
    goNoGo = 'CONDITIONAL';
    reason = `Security score below threshold (${asvsScore}%)`;
  } else if (complianceCoverage < 80) {
    goNoGo = 'CONDITIONAL';
    reason = `Compliance coverage below threshold (${complianceCoverage}%)`;
  } else if (criticalIssues > 5 || highPriorityIssues > 15) {
    goNoGo = 'CONDITIONAL';
    reason = `${criticalIssues} critical and ${highPriorityIssues} high-priority issues require attention`;
  }

  return {
    totalFindings,
    criticalIssues,
    highPriorityIssues,
    parityGap,
    asvsScore,
    healthCoverage,
    securityScore,
    complianceCoverage,
    goNoGo,
    reason,
  };
}

/**
 * Generate Executive Summary Markdown
 */
function generateExecutiveSummary(
  summary: ExecutiveSummary,
  reports: Record<string, ReportData>
): string {
  const now = new Date();
  
  let md = `# 📊 Executive Summary - System Audit\n\n`;
  md += `**Generated:** ${now.toLocaleString('ar-SA')}\n`;
  md += `**Project:** Bthwani Backend NestJS\n`;
  md += `**Version:** v2.0\n\n`;

  // Status Badge
  const statusEmoji = summary.goNoGo === 'GO' ? '🟢' : summary.goNoGo === 'NO-GO' ? '🔴' : '🟡';
  md += `## ${statusEmoji} Overall Status: **${summary.goNoGo}**\n\n`;
  md += `**Reason:** ${summary.reason}\n\n`;

  md += `---\n\n`;

  // Key Metrics
  md += `## 🎯 Key Metrics\n\n`;
  md += `| Metric | Value | Status |\n`;
  md += `|--------|-------|--------|\n`;
  md += `| **Total Findings** | ${summary.totalFindings} | ${summary.totalFindings < 50 ? '✅' : summary.totalFindings < 100 ? '⚠️' : '❌'} |\n`;
  md += `| **Critical Issues (P0)** | ${summary.criticalIssues} | ${summary.criticalIssues === 0 ? '✅' : summary.criticalIssues < 5 ? '⚠️' : '❌'} |\n`;
  md += `| **High Priority (P1)** | ${summary.highPriorityIssues} | ${summary.highPriorityIssues < 10 ? '✅' : summary.highPriorityIssues < 20 ? '⚠️' : '❌'} |\n`;
  md += `| **API Parity Gap** | ${summary.parityGap}% | ${summary.parityGap < 30 ? '✅' : summary.parityGap < 60 ? '⚠️' : '❌'} |\n`;
  md += `| **ASVS Security Score** | ${summary.asvsScore}% | ${summary.asvsScore >= 90 ? '✅' : summary.asvsScore >= 70 ? '⚠️' : '❌'} |\n`;
  md += `| **Health Coverage** | ${summary.healthCoverage}% | ${summary.healthCoverage >= 80 ? '✅' : summary.healthCoverage >= 60 ? '⚠️' : '❌'} |\n`;
  md += `| **Payment Security** | ${summary.securityScore}% | ${summary.securityScore >= 85 ? '✅' : summary.securityScore >= 70 ? '⚠️' : '❌'} |\n`;
  md += `| **Compliance (GDPR/PDPL)** | ${summary.complianceCoverage}% | ${summary.complianceCoverage >= 90 ? '✅' : summary.complianceCoverage >= 80 ? '⚠️' : '❌'} |\n\n`;

  md += `---\n\n`;

  // Detailed Reports Summary
  md += `## 📑 Audit Reports Summary\n\n`;

  // API Parity
  if (reports.parity_report) {
    const r = reports.parity_report;
    md += `### 1️⃣ API Documentation Parity\n\n`;
    md += `- **Total Routes:** ${r.summary?.total_reviewed || 0}\n`;
    md += `- **Matched:** ${r.summary?.matched || 0} (${Math.round((r.summary?.matched / r.summary?.total_reviewed) * 100) || 0}%)\n`;
    md += `- **Undocumented:** ${r.summary?.undocumented || 0} ❌\n`;
    md += `- **Mismatch:** ${r.summary?.mismatch || 0} ⚠️\n`;
    md += `- **Parity Gap:** ${summary.parityGap}%\n`;
    md += `- **Report:** \`parity_report.md\`\n\n`;
  }

  // ASVS Security
  if (reports.asvs_coverage) {
    const r = reports.asvs_coverage;
    md += `### 2️⃣ OWASP ASVS Security Baseline\n\n`;
    md += `- **Total Checks:** ${r.summary?.total_checks || 0}\n`;
    md += `- **Passed:** ${r.summary?.passed || 0}\n`;
    md += `- **Failed:** ${r.summary?.failed || 0}\n`;
    md += `- **L1 (Basic):** ${r.summary?.l1_passed || 0}/${r.summary?.l1_total || 0}\n`;
    md += `- **L2 (Standard):** ${r.summary?.l2_passed || 0}/${r.summary?.l2_total || 0}\n`;
    md += `- **Overall Score:** ${summary.asvsScore}%\n`;
    md += `- **Report:** \`asvs_coverage.md\`\n\n`;
  }

  // Health & Readiness
  if (reports.health_gaps) {
    const r = reports.health_gaps;
    md += `### 3️⃣ Health & Readiness Checks\n\n`;
    md += `- **Total Checks:** ${r.summary?.total_checks || 0}\n`;
    md += `- **Implemented:** ${r.summary?.implemented || 0}\n`;
    md += `- **Missing:** ${r.summary?.missing || 0}\n`;
    md += `- **Coverage:** ${summary.healthCoverage}%\n`;
    md += `- **Report:** \`health_gaps.md\`\n\n`;
  }

  // Payment Security
  if (reports.pay_idempotency) {
    const r = reports.pay_idempotency;
    md += `### 4️⃣ Payment/Wallet Security\n\n`;
    md += `- **Total Checks:** ${r.summary?.total_checks || 0}\n`;
    md += `- **Implemented:** ${r.summary?.implemented || 0}\n`;
    md += `- **Partial:** ${r.summary?.partial || 0}\n`;
    md += `- **Missing:** ${r.summary?.missing || 0}\n`;
    md += `- **Coverage:** ${summary.securityScore}%\n`;
    md += `- **Report:** \`pay_idempotency.md\`\n\n`;
  }

  // Notifications
  if (reports.notification_delivery) {
    const r = reports.notification_delivery;
    md += `### 5️⃣ Notification System\n\n`;
    md += `- **Total Checks:** ${r.summary?.total_checks || 0}\n`;
    md += `- **Implemented:** ${r.summary?.implemented || 0}\n`;
    md += `- **Missing:** ${r.summary?.missing || 0}\n`;
    md += `- **Channels:** ${r.channels ? Object.entries(r.channels).filter(([,v]) => v).map(([k]) => k).join(', ') : 'N/A'}\n`;
    md += `- **Report:** \`notification_delivery.md\`\n\n`;
  }

  // Compliance
  if (reports.compliance_index && Array.isArray(reports.compliance_index)) {
    const implemented = reports.compliance_index.filter((r: any) => 
      r.requirementId && r.status === 'Implemented'
    ).length;
    const missing = reports.compliance_index.filter((r: any) => 
      r.requirementId && r.status === 'Missing'
    ).length;
    const total = reports.compliance_index.filter((r: any) => 
      r.requirementId !== ''
    ).length;

    md += `### 6️⃣ GDPR/PDPL Compliance\n\n`;
    md += `- **Total Requirements:** ${total}\n`;
    md += `- **Implemented:** ${implemented}\n`;
    md += `- **Missing:** ${missing}\n`;
    md += `- **Coverage:** ${summary.complianceCoverage}%\n`;
    md += `- **Report:** \`compliance_index.csv\`\n\n`;
  }

  // Error Taxonomy
  if (reports.error_taxonomy_diff) {
    md += `### 7️⃣ Error Handling\n\n`;
    md += `- **Standard Codes:** 20\n`;
    md += `- **Implemented:** ${reports.error_taxonomy_diff.summary?.implemented || 0}\n`;
    md += `- **Missing:** ${reports.error_taxonomy_diff.summary?.missing || 0}\n`;
    md += `- **Report:** \`error_taxonomy_diff.md\`\n\n`;
  }

  // Jobs Inventory
  if (reports.jobs_inventory) {
    md += `### 8️⃣ Background Jobs\n\n`;
    md += `- **Queues:** ${reports.jobs_inventory.queues?.length || 0}\n`;
    md += `- **Jobs:** ${reports.jobs_inventory.jobs?.length || 0}\n`;
    md += `- **Processors:** ${new Set(reports.jobs_inventory.jobs?.map((j: any) => j.processor) || []).size}\n`;
    md += `- **Report:** \`jobs_inventory.csv\`\n\n`;
  }

  md += `---\n\n`;

  // Critical Issues
  md += `## 🚨 Critical Issues (P0)\n\n`;
  
  if (summary.criticalIssues === 0) {
    md += `✅ No critical issues found!\n\n`;
  } else {
    if (reports.parity_report && reports.parity_report.summary?.undocumented > 0) {
      md += `- **${reports.parity_report.summary.undocumented} Undocumented API Routes**\n`;
      md += `  - Action: Add Swagger decorators\n`;
      md += `  - Impact: API consumers cannot discover endpoints\n\n`;
    }

    if (reports.compliance_index) {
      const missing = reports.compliance_index.filter((r: any) => 
        r.requirementId && r.status === 'Missing'
      );
      if (missing.length > 0) {
        md += `- **${missing.length} Missing Compliance Requirements**\n`;
        missing.forEach((req: any) => {
          if (req.requirement) {
            md += `  - ${req.requirement}\n`;
          }
        });
        md += `\n`;
      }
    }
  }

  // High Priority Issues
  md += `## ⚠️ High Priority Issues (P1)\n\n`;
  
  if (summary.highPriorityIssues === 0) {
    md += `✅ No high priority issues!\n\n`;
  } else {
    if (reports.health_gaps && reports.health_gaps.summary?.missing > 0) {
      md += `- **${reports.health_gaps.summary.missing} Missing Health Checks**\n`;
      md += `  - Recommendation: Implement @nestjs/terminus\n\n`;
    }

    if (reports.notification_delivery && reports.notification_delivery.summary?.missing > 0) {
      md += `- **${reports.notification_delivery.summary.missing} Missing Notification Features**\n`;
      md += `  - Recommendation: Add DLQ, retry mechanisms\n\n`;
    }
  }

  md += `---\n\n`;

  // Recommendations
  md += `## 💡 Recommendations\n\n`;
  
  if (summary.goNoGo === 'GO') {
    md += `### ✅ Ready for Production\n\n`;
    md += `The system meets all critical requirements and is ready for production deployment.\n\n`;
    md += `**Post-Deployment:**\n`;
    md += `- Monitor error rates and performance\n`;
    md += `- Address remaining medium/low priority issues\n`;
    md += `- Implement continuous compliance monitoring\n\n`;
  } else if (summary.goNoGo === 'CONDITIONAL') {
    md += `### ⚠️ Conditional Go\n\n`;
    md += `The system can proceed with the following conditions:\n\n`;
    md += `1. Address all critical (P0) issues before launch\n`;
    md += `2. Create mitigation plan for high priority (P1) issues\n`;
    md += `3. Set up monitoring and alerting\n`;
    md += `4. Schedule follow-up audit in 2 weeks\n\n`;
  } else {
    md += `### ❌ Not Ready for Production\n\n`;
    md += `**Blocking Issues:**\n\n`;
    md += `${summary.reason}\n\n`;
    md += `**Required Actions:**\n`;
    md += `1. Address all critical issues immediately\n`;
    md += `2. Improve API documentation parity\n`;
    md += `3. Enhance security measures\n`;
    md += `4. Complete compliance requirements\n`;
    md += `5. Re-run full audit before deployment\n\n`;
  }

  md += `---\n\n`;

  // Questions [TBD]
  md += `## ❓ Questions & Follow-up Items [TBD]\n\n`;
  md += `1. **User Consent Tracking**: How will user consent be collected and stored?\n`;
  md += `2. **Privacy Policy**: When will the privacy policy be published?\n`;
  md += `3. **Dead Letter Queue**: Should we implement DLQ for failed notifications?\n`;
  md += `4. **Third Party Audits**: Do we need external security audit?\n`;
  md += `5. **Disaster Recovery**: What is the backup and recovery strategy?\n`;
  md += `6. **Load Testing**: Have performance/load tests been conducted?\n`;
  md += `7. **Monitoring**: Are Prometheus/Grafana dashboards configured?\n`;
  md += `8. **Incident Response**: Is the incident response plan documented?\n\n`;

  md += `---\n\n`;

  // Footer
  md += `## 📝 Notes\n\n`;
  md += `- This report is auto-generated from ${Object.keys(reports).length} audit reports\n`;
  md += `- For detailed findings, refer to individual reports in \`reports/\` directory\n`;
  md += `- Run \`npm run audit:*\` commands to regenerate specific reports\n`;
  md += `- Last updated: ${now.toISOString()}\n\n`;

  md += `---\n\n`;
  md += `*Generated by Executive Snapshot Tool*\n`;

  return md;
}

/**
 * Main execution
 */
async function main() {
  console.log('📊 Executive One-Pager - Auto-Compose\n');
  console.log('Reading all audit reports...\n');

  // Load all reports
  const reports = loadReports();
  const reportCount = Object.keys(reports).length;

  if (reportCount === 0) {
    console.error('❌ No reports found in reports/ directory');
    console.error('   Run audit scripts first: npm run audit:*');
    process.exit(1);
  }

  console.log(`✅ Loaded ${reportCount} reports:`);
  Object.keys(reports).forEach((key) => {
    console.log(`   - ${key}.json`);
  });

  // Analyze reports
  console.log('\n🔍 Analyzing reports...');
  const summary = analyzeReports(reports);

  console.log('\n📊 Executive Summary:');
  console.log(`   Status: ${summary.goNoGo}`);
  console.log(`   Total Findings: ${summary.totalFindings}`);
  console.log(`   Critical Issues: ${summary.criticalIssues}`);
  console.log(`   Parity Gap: ${summary.parityGap}%`);
  console.log(`   ASVS Score: ${summary.asvsScore}%`);
  console.log(`   Compliance: ${summary.complianceCoverage}%`);

  // Generate markdown
  console.log('\n📝 Generating executive summary...');
  const markdown = generateExecutiveSummary(summary, reports);

  // Save report
  const reportsDir = path.join(process.cwd(), 'reports');
  const outputPath = path.join(reportsDir, 'EXEC_SUMMARY.md');
  fs.writeFileSync(outputPath, markdown, 'utf-8');

  console.log(`\n✅ Executive summary saved: ${outputPath}`);
  console.log(`\n${summary.goNoGo === 'GO' ? '🟢' : summary.goNoGo === 'NO-GO' ? '🔴' : '🟡'} Final Decision: ${summary.goNoGo}`);
  console.log(`   ${summary.reason}`);

  console.log('\n✨ Executive snapshot complete!\n');
  process.exit(0);
}

// Run the script
main().catch((error) => {
  console.error('❌ Error:', error);
  process.exit(1);
});

