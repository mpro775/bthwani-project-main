#!/usr/bin/env ts-node
/**
 * BTW-SEC-003: Secret Scan & Revocation
 * Scans for exposed secrets in the codebase
 * 
 * Usage: npm run security:secrets
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

interface SecretFinding {
  file: string;
  line: number;
  type: string;
  match: string;
  description: string;
}

interface ScanResult {
  timestamp: string;
  totalFindings: number;
  findings: SecretFinding[];
  status: 'PASS' | 'FAIL';
  recommendations: string[];
}

// Patterns to detect common secrets
const SECRET_PATTERNS = [
  {
    name: 'AWS Access Key',
    pattern: /AKIA[0-9A-Z]{16}/g,
    description: 'AWS Access Key ID detected'
  },
  {
    name: 'Private Key',
    pattern: /-----BEGIN (RSA |EC |DSA )?PRIVATE KEY-----/g,
    description: 'Private key detected'
  },
  {
    name: 'JWT Token',
    pattern: /eyJ[A-Za-z0-9-_=]+\.eyJ[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*/g,
    description: 'JWT token detected'
  },
  {
    name: 'Generic API Key',
    pattern: /['\"]?api[_-]?key['\"]?\s*[:=]\s*['\"]([a-zA-Z0-9_\-]{20,})['\"]?/gi,
    description: 'Potential API key detected'
  },
  {
    name: 'Generic Secret',
    pattern: /['\"]?secret['\"]?\s*[:=]\s*['\"]([a-zA-Z0-9_\-]{20,})['\"]?/gi,
    description: 'Potential secret detected'
  },
  {
    name: 'Password',
    pattern: /['\"]?password['\"]?\s*[:=]\s*['\"]([^'\"]{8,})['\"]?/gi,
    description: 'Hardcoded password detected'
  },
  {
    name: 'MongoDB Connection',
    pattern: /mongodb(\+srv)?:\/\/[^:]+:[^@]+@/g,
    description: 'MongoDB connection string with credentials'
  },
  {
    name: 'Firebase Private Key',
    pattern: /firebase[_-]?private[_-]?key/gi,
    description: 'Firebase private key reference'
  }
];

// Files and directories to exclude
const EXCLUDE_PATTERNS = [
  'node_modules',
  'dist',
  'coverage',
  '.git',
  'logs',
  '*.log',
  '*.md',
  '*.json.backup',
  'package-lock.json',
  'env.example'
];

function shouldExcludeFile(filePath: string): boolean {
  return EXCLUDE_PATTERNS.some(pattern => {
    if (pattern.startsWith('*.')) {
      return filePath.endsWith(pattern.substring(1));
    }
    return filePath.includes(pattern);
  });
}

function scanFile(filePath: string, findings: SecretFinding[]): void {
  if (shouldExcludeFile(filePath)) {
    return;
  }

  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');

    lines.forEach((line, index) => {
      SECRET_PATTERNS.forEach(({ name, pattern, description }) => {
        const matches = line.match(pattern);
        if (matches) {
          matches.forEach(match => {
            // Skip if it's a comment or example
            const trimmedLine = line.trim();
            if (
              trimmedLine.startsWith('//') ||
              trimmedLine.startsWith('#') ||
              trimmedLine.startsWith('*') ||
              trimmedLine.includes('example') ||
              trimmedLine.includes('EXAMPLE') ||
              trimmedLine.includes('your-') ||
              trimmedLine.includes('YOUR_')
            ) {
              return;
            }

            findings.push({
              file: filePath,
              line: index + 1,
              type: name,
              match: match.substring(0, 50) + (match.length > 50 ? '...' : ''),
              description
            });
          });
        }
      });
    });
  } catch (error) {
    // Ignore files that can't be read
  }
}

function scanDirectory(dirPath: string, findings: SecretFinding[]): void {
  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });

    entries.forEach(entry => {
      const fullPath = path.join(dirPath, entry.name);

      if (shouldExcludeFile(fullPath)) {
        return;
      }

      if (entry.isDirectory()) {
        scanDirectory(fullPath, findings);
      } else if (entry.isFile()) {
        scanFile(fullPath, findings);
      }
    });
  } catch (error) {
    // Ignore directories that can't be accessed
  }
}

function tryGitleaks(): { success: boolean; output: string } {
  try {
    console.log('🔍 Running gitleaks scan...');
    const output = execSync('npx gitleaks detect --no-git --redact --source . --report-format sarif --report-path reports/gitleaks.sarif', {
      encoding: 'utf-8',
      stdio: 'pipe'
    });
    return { success: true, output };
  } catch (error: any) {
    return { success: false, output: error.stdout || error.message };
  }
}

function generateRecommendations(findings: SecretFinding[]): string[] {
  const recommendations: string[] = [];

  if (findings.length > 0) {
    recommendations.push('⚠️  IMMEDIATE ACTIONS REQUIRED:');
    recommendations.push('1. Revoke and rotate all exposed credentials immediately');
    recommendations.push('2. Move secrets to environment variables or HashiCorp Vault');
    recommendations.push('3. Update .gitignore to exclude sensitive files');
    recommendations.push('4. Add pre-commit hooks to prevent future commits with secrets');
    recommendations.push('5. Review git history and consider using BFG Repo-Cleaner if secrets were committed');
    recommendations.push('');
    recommendations.push('📚 Resources:');
    recommendations.push('   - Vault documentation: https://www.vaultproject.io/docs');
    recommendations.push('   - Git-secrets: https://github.com/awslabs/git-secrets');
    recommendations.push('   - Gitleaks: https://github.com/gitleaks/gitleaks');
  } else {
    recommendations.push('✅ No obvious secrets detected in manual scan');
    recommendations.push('💡 Best practices:');
    recommendations.push('   - Continue using environment variables for all secrets');
    recommendations.push('   - Implement Vault for production secrets management');
    recommendations.push('   - Enable gitleaks in CI/CD pipeline');
    recommendations.push('   - Regular security audits');
  }

  return recommendations;
}

function main(): void {
  console.log('🔒 BThwani Secret Scanner - BTW-SEC-003');
  console.log('=====================================\n');

  const findings: SecretFinding[] = [];
  const projectRoot = path.resolve(__dirname, '../..');

  console.log(`📂 Scanning directory: ${projectRoot}\n`);

  // Run custom scan
  scanDirectory(projectRoot, findings);

  // Try to run gitleaks if available
  const gitleaksResult = tryGitleaks();

  // Generate report
  const result: ScanResult = {
    timestamp: new Date().toISOString(),
    totalFindings: findings.length,
    findings: findings.slice(0, 50), // Limit to first 50 findings
    status: findings.length === 0 ? 'PASS' : 'FAIL',
    recommendations: generateRecommendations(findings)
  };

  // Filter out findings in reports directory (avoid recursive detection)
  const filteredFindings = findings.filter(f => !f.file.includes('reports'));
  const filteredResult = {
    ...result,
    totalFindings: filteredFindings.length,
    findings: filteredFindings.slice(0, 50),
    status: filteredFindings.length === 0 ? 'PASS' : 'FAIL',
  };

  // Print summary
  console.log('\n📊 SCAN RESULTS');
  console.log('===============');
  console.log(`Status: ${filteredResult.status}`);
  console.log(`Total findings: ${filteredResult.totalFindings}`);
  console.log(`Timestamp: ${filteredResult.timestamp}\n`);

  if (filteredFindings.length > 0) {
    console.log('⚠️  FINDINGS:');
    filteredFindings.slice(0, 10).forEach((finding, index) => {
      console.log(`\n${index + 1}. ${finding.type}`);
      console.log(`   File: ${finding.file}:${finding.line}`);
      console.log(`   Description: ${finding.description}`);
      console.log(`   Preview: ${finding.match}`);
    });

    if (filteredFindings.length > 10) {
      console.log(`\n... and ${filteredFindings.length - 10} more findings`);
    }
  }

  console.log('\n📋 RECOMMENDATIONS:');
  filteredResult.recommendations.forEach(rec => console.log(rec));

  // Save report (redacted version without actual secret values)
  const reportsDir = path.join(projectRoot, 'reports');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  // Create redacted version for safety
  const redactedReport = {
    ...filteredResult,
    findings: filteredResult.findings.map(f => ({
      ...f,
      match: f.match.substring(0, 20) + '... [REDACTED]'
    }))
  };

  const reportPath = path.join(reportsDir, 'secrets_scan.json');
  fs.writeFileSync(reportPath, JSON.stringify(redactedReport, null, 2));
  console.log(`\n💾 Report saved to: ${reportPath}`);

  if (gitleaksResult.success) {
    console.log('✅ Gitleaks scan completed - check reports/gitleaks.sarif');
  } else {
    console.log('ℹ️  Gitleaks not available - install with: npm install -g gitleaks');
  }

  // Exit with error code if secrets found
  process.exit(filteredResult.status === 'FAIL' ? 1 : 0);
}

main();

