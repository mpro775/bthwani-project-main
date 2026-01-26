#!/usr/bin/env ts-node
/**
 * Compliance Map - GDPR/PDPL Evidence Index
 *
 * Builds compliance evidence table:
 * Requirement | Artifact | Evidence (Path) | Owner | Status
 *
 * Generates: reports/compliance_index.csv
 */

import * as fs from 'fs';
import * as path from 'path';

interface ComplianceEvidence {
  requirement: string;
  requirementId: string;
  artifact: string;
  evidencePath: string;
  evidenceLine?: number;
  owner: string;
  status: 'Implemented' | 'Partial' | 'Missing' | 'Not Applicable';
  notes?: string;
}

interface ComplianceRequirement {
  id: string;
  title: string;
  description: string;
  category: 'GDPR' | 'PDPL' | 'Both';
  searchPatterns: (string | RegExp)[];
  owner: string;
}

/**
 * GDPR/PDPL Requirements
 */
const COMPLIANCE_REQUIREMENTS: ComplianceRequirement[] = [
  // Data Protection & Privacy
  {
    id: 'DP-01',
    title: 'Personal Data Encryption',
    description: 'Personal data must be encrypted at rest and in transit',
    category: 'Both',
    searchPatterns: [
      'encrypt|bcrypt|crypto|hash',
      'password.*hash',
      'pin.*encrypt',
    ],
    owner: 'Security Team',
  },
  {
    id: 'DP-02',
    title: 'Data Minimization',
    description: 'Collect only necessary personal data',
    category: 'Both',
    searchPatterns: ['@IsOptional', 'whitelist.*true', 'forbidNonWhitelisted'],
    owner: 'Development Team',
  },
  {
    id: 'DP-03',
    title: 'Data Retention Policy',
    description: 'Define and implement data retention periods',
    category: 'Both',
    searchPatterns: ['retention|ttl|expire|delete.*after', 'removeOn'],
    owner: 'Data Team',
  },

  // Consent Management
  {
    id: 'CM-01',
    title: 'User Consent Tracking',
    description: 'Track and store user consent for data processing',
    category: 'Both',
    searchPatterns: [
      'consent|agree|accept.*terms',
      'privacy.*policy',
      'terms.*condition',
    ],
    owner: 'Legal Team',
  },
  {
    id: 'CM-02',
    title: 'Opt-out Mechanisms',
    description: 'Provide mechanisms for users to withdraw consent',
    category: 'Both',
    searchPatterns: ['unsubscribe|opt.*out|withdraw', 'disable.*notification'],
    owner: 'Product Team',
  },

  // Data Subject Rights
  {
    id: 'DSR-01',
    title: 'Right to Access',
    description: 'Users can access their personal data',
    category: 'Both',
    searchPatterns: ['/me|/profile|getUserData', 'export.*data'],
    owner: 'Development Team',
  },
  {
    id: 'DSR-02',
    title: 'Right to Erasure',
    description: 'Users can request deletion of their data',
    category: 'Both',
    searchPatterns: ['delete.*user|remove.*account', 'anonymize|pseudonymize'],
    owner: 'Development Team',
  },
  {
    id: 'DSR-03',
    title: 'Right to Rectification',
    description: 'Users can correct their personal data',
    category: 'Both',
    searchPatterns: ['update.*profile|edit.*user', 'PATCH.*user'],
    owner: 'Development Team',
  },
  {
    id: 'DSR-04',
    title: 'Right to Data Portability',
    description: 'Users can export their data in machine-readable format',
    category: 'GDPR',
    searchPatterns: ['export|download.*data', 'json|csv.*export'],
    owner: 'Development Team',
  },

  // Security Measures
  {
    id: 'SEC-01',
    title: 'Access Control',
    description: 'Implement role-based access control',
    category: 'Both',
    searchPatterns: ['@Roles|RolesGuard', 'auth.*guard', '@UseGuards'],
    owner: 'Security Team',
  },
  {
    id: 'SEC-02',
    title: 'Authentication',
    description: 'Secure authentication mechanisms',
    category: 'Both',
    searchPatterns: ['jwt|firebase.*auth', 'passport', 'authentication'],
    owner: 'Security Team',
  },
  {
    id: 'SEC-03',
    title: 'Session Management',
    description: 'Secure session handling and timeout',
    category: 'Both',
    searchPatterns: ['session|redis', 'timeout|expire'],
    owner: 'Security Team',
  },
  {
    id: 'SEC-04',
    title: 'Input Validation',
    description: 'Validate all user inputs to prevent injection',
    category: 'Both',
    searchPatterns: [
      'ValidationPipe|class-validator',
      '@IsString|@IsEmail',
      'sanitize',
    ],
    owner: 'Security Team',
  },

  // Audit & Logging
  {
    id: 'AUD-01',
    title: 'Audit Trail',
    description: 'Log all access and modifications to personal data',
    category: 'Both',
    searchPatterns: ['logger|winston', 'audit.*log', 'event.*sourcing'],
    owner: 'Compliance Team',
  },
  {
    id: 'AUD-02',
    title: 'Transaction History',
    description: 'Maintain complete transaction history',
    category: 'PDPL',
    searchPatterns: [
      'transaction.*history|wallet.*event',
      'createdAt|updatedAt',
    ],
    owner: 'Finance Team',
  },

  // Data Processing
  {
    id: 'DP-04',
    title: 'Purpose Limitation',
    description: 'Process data only for specified purposes',
    category: 'Both',
    searchPatterns: ['purpose|type.*enum', 'notification.*type'],
    owner: 'Legal Team',
  },
  {
    id: 'DP-05',
    title: 'Data Accuracy',
    description: 'Ensure personal data is accurate and up-to-date',
    category: 'Both',
    searchPatterns: ['validate|verification', 'update.*user'],
    owner: 'Data Team',
  },

  // Third Party
  {
    id: 'TP-01',
    title: 'Third Party Data Sharing',
    description: 'Document and control third party data sharing',
    category: 'Both',
    searchPatterns: ['api.*key|external.*service', 'firebase|sendgrid|twilio'],
    owner: 'Legal Team',
  },
  {
    id: 'TP-02',
    title: 'Data Processing Agreements',
    description: 'Agreements with third party processors',
    category: 'Both',
    searchPatterns: ['vendor|merchant|partner', 'integration'],
    owner: 'Legal Team',
  },

  // Breach Management
  {
    id: 'BR-01',
    title: 'Data Breach Detection',
    description: 'Mechanisms to detect data breaches',
    category: 'Both',
    searchPatterns: ['monitor|alert', 'error.*log|exception'],
    owner: 'Security Team',
  },
  {
    id: 'BR-02',
    title: 'Incident Response',
    description: 'Incident response procedures',
    category: 'Both',
    searchPatterns: ['error.*handler|global.*exception', 'OnQueueFailed'],
    owner: 'Security Team',
  },

  // Documentation
  {
    id: 'DOC-01',
    title: 'Privacy Policy',
    description: 'Published privacy policy',
    category: 'Both',
    searchPatterns: ['privacy|terms.*service', 'legal.*doc'],
    owner: 'Legal Team',
  },
  {
    id: 'DOC-02',
    title: 'API Documentation',
    description: 'Document personal data processing in APIs',
    category: 'Both',
    searchPatterns: ['swagger|openapi', '@ApiProperty'],
    owner: 'Development Team',
  },

  // Saudi PDPL Specific
  {
    id: 'PDPL-01',
    title: 'Arabic Language Support',
    description: 'Privacy notices available in Arabic',
    category: 'PDPL',
    searchPatterns: ['userMessage|ar-SA', 'عربي|arabic'],
    owner: 'Localization Team',
  },
  {
    id: 'PDPL-02',
    title: 'Local Data Storage',
    description: 'Personal data stored in Saudi Arabia (if required)',
    category: 'PDPL',
    searchPatterns: ['database|mongodb', 'MONGODB_URI'],
    owner: 'Infrastructure Team',
  },
];

/**
 * Search for evidence in codebase
 */
function searchForEvidence(
  pattern: string | RegExp,
): Array<{ file: string; line: number; code: string }> {
  const evidence: Array<{ file: string; line: number; code: string }> = [];
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

      if (!item.name.endsWith('.ts')) continue;

      try {
        const content = fs.readFileSync(fullPath, 'utf-8');
        const lines = content.split('\n');
        const regex =
          typeof pattern === 'string' ? new RegExp(pattern, 'i') : pattern;

        lines.forEach((line, index) => {
          if (regex.test(line)) {
            evidence.push({
              file: fullPath
                .replace(/\\/g, '/')
                .replace(process.cwd().replace(/\\/g, '/') + '/', ''),
              line: index + 1,
              code: line.trim().substring(0, 100),
            });
          }
        });
      } catch {
        // Skip files that can't be read
      }
    }
  }

  searchInDirectory(srcPath);

  // Also check config files
  const configFiles = ['package.json', 'env.example', '.gitignore'];
  for (const file of configFiles) {
    const filePath = path.join(process.cwd(), file);
    if (fs.existsSync(filePath)) {
      try {
        const content = fs.readFileSync(filePath, 'utf-8');
        const lines = content.split('\n');
        const regex =
          typeof pattern === 'string' ? new RegExp(pattern, 'i') : pattern;

        lines.forEach((line, index) => {
          if (regex.test(line)) {
            evidence.push({
              file: file,
              line: index + 1,
              code: line.trim().substring(0, 100),
            });
          }
        });
      } catch {
        // Skip
      }
    }
  }

  return evidence;
}

/**
 * Assess compliance for each requirement
 */
function assessCompliance(): ComplianceEvidence[] {
  const results: ComplianceEvidence[] = [];

  console.log('🔍 Assessing GDPR/PDPL Compliance...\n');

  for (const req of COMPLIANCE_REQUIREMENTS) {
    console.log(`📋 Checking ${req.id}: ${req.title}`);

    let allEvidence: Array<{ file: string; line: number; code: string }> = [];

    // Search for all patterns
    for (const pattern of req.searchPatterns) {
      const evidence = searchForEvidence(pattern);
      allEvidence = [...allEvidence, ...evidence];
    }

    // Remove duplicates
    allEvidence = Array.from(
      new Map(allEvidence.map((e) => [`${e.file}:${e.line}`, e])).values(),
    );

    if (allEvidence.length === 0) {
      // No evidence found
      results.push({
        requirement: req.title,
        requirementId: req.id,
        artifact: 'N/A',
        evidencePath: 'No evidence found',
        owner: req.owner,
        status: 'Missing',
        notes: req.description,
      });
    } else {
      // Evidence found - create entries for top evidences
      const topEvidence = allEvidence.slice(0, 5);

      topEvidence.forEach((ev, index) => {
        results.push({
          requirement: index === 0 ? req.title : '',
          requirementId: index === 0 ? req.id : '',
          artifact: path.basename(ev.file),
          evidencePath: `${ev.file}:${ev.line}`,
          evidenceLine: ev.line,
          owner: index === 0 ? req.owner : '',
          status: allEvidence.length >= 3 ? 'Implemented' : 'Partial',
          notes: ev.code,
        });
      });

      // Add summary row if more evidence exists
      if (allEvidence.length > 5) {
        results.push({
          requirement: '',
          requirementId: '',
          artifact: `... and ${allEvidence.length - 5} more`,
          evidencePath: '',
          owner: '',
          status: 'Implemented',
        });
      }
    }
  }

  console.log('\n✅ Compliance assessment completed\n');

  return results;
}

/**
 * Generate CSV report
 */
function generateCSV(evidence: ComplianceEvidence[]): string {
  let csv =
    'Requirement ID,Requirement,Artifact,Evidence Path,Owner,Status,Notes\n';

  evidence.forEach((e) => {
    const req = e.requirementId ? `"${e.requirementId}"` : '""';
    const title = e.requirement
      ? `"${e.requirement.replace(/"/g, '""')}"`
      : '""';
    const artifact = `"${e.artifact.replace(/"/g, '""')}"`;
    const path = `"${e.evidencePath.replace(/"/g, '""')}"`;
    const owner = e.owner ? `"${e.owner}"` : '""';
    const status = `"${e.status}"`;
    const notes = e.notes ? `"${e.notes.replace(/"/g, '""')}"` : '""';

    csv += `${req},${title},${artifact},${path},${owner},${status},${notes}\n`;
  });

  return csv;
}

/**
 * Generate summary statistics
 */
function generateSummary(evidence: ComplianceEvidence[]): string {
  // Get unique requirements (skip empty rows)
  const requirements = evidence.filter((e) => e.requirementId !== '');

  const total = requirements.length;
  const implemented = requirements.filter(
    (e) => e.status === 'Implemented',
  ).length;
  const partial = requirements.filter((e) => e.status === 'Partial').length;
  const missing = requirements.filter((e) => e.status === 'Missing').length;
  const notApplicable = requirements.filter(
    (e) => e.status === 'Not Applicable',
  ).length;

  const coverage =
    total > 0 ? Math.round(((implemented + partial * 0.5) / total) * 100) : 0;

  let summary = '\n=== COMPLIANCE SUMMARY ===\n\n';
  summary += `Total Requirements: ${total}\n`;
  summary += `✅ Implemented: ${implemented} (${Math.round((implemented / total) * 100)}%)\n`;
  summary += `⚠️  Partial: ${partial} (${Math.round((partial / total) * 100)}%)\n`;
  summary += `❌ Missing: ${missing} (${Math.round((missing / total) * 100)}%)\n`;
  summary += `ℹ️  Not Applicable: ${notApplicable}\n`;
  summary += `\n📊 Overall Coverage: ${coverage}%\n`;

  // By category
  const gdprReqs = COMPLIANCE_REQUIREMENTS.filter(
    (r) => r.category === 'GDPR' || r.category === 'Both',
  );
  const pdplReqs = COMPLIANCE_REQUIREMENTS.filter(
    (r) => r.category === 'PDPL' || r.category === 'Both',
  );

  summary += `\nGDPR Requirements: ${gdprReqs.length}\n`;
  summary += `PDPL Requirements: ${pdplReqs.length}\n`;

  // By owner
  const owners = [...new Set(requirements.map((r) => r.owner))];
  summary += `\nResponsible Teams: ${owners.length}\n`;
  owners.forEach((owner) => {
    const count = requirements.filter((r) => r.owner === owner).length;
    summary += `  - ${owner}: ${count} requirements\n`;
  });

  return summary;
}

/**
 * Main execution
 */
function main() {
  console.log('📋 Compliance Map - GDPR/PDPL Evidence Index\n');
  console.log(
    `Checking ${COMPLIANCE_REQUIREMENTS.length} compliance requirements...\n`,
  );

  // Assess compliance
  const evidence = assessCompliance();

  // Generate CSV
  const csv = generateCSV(evidence);

  // Save CSV
  const reportsDir = path.join(process.cwd(), 'reports');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  const csvPath = path.join(reportsDir, 'compliance_index.csv');
  fs.writeFileSync(csvPath, csv, 'utf-8');
  console.log(`✅ CSV report saved: ${csvPath}`);

  // Save JSON (for reference)
  const jsonPath = path.join(reportsDir, 'compliance_index.json');
  fs.writeFileSync(jsonPath, JSON.stringify(evidence, null, 2), 'utf-8');
  console.log(`✅ JSON report saved: ${jsonPath}`);

  // Display summary
  const summary = generateSummary(evidence);
  console.log(summary);

  // Save summary
  const summaryPath = path.join(reportsDir, 'compliance_summary.txt');
  fs.writeFileSync(summaryPath, summary, 'utf-8');
  console.log(`\n✅ Summary saved: ${summaryPath}`);

  console.log('\n✨ Compliance index complete!\n');
  process.exit(0);
}

// Run the script
try {
  main();
} catch (error) {
  console.error('❌ Error:', error);
  process.exit(1);
}
