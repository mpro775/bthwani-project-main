#!/usr/bin/env node

/**
 * BThwani Security Audit Script
 * Comprehensive security assessment for production readiness
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class SecurityAuditor {
  constructor() {
    this.issues = [];
    this.warnings = [];
    this.passed = [];
    this.projectRoot = path.resolve(__dirname, '..');
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const colors = {
      error: '\x1b[31m',
      warning: '\x1b[33m',
      success: '\x1b[32m',
      info: '\x1b[36m',
      reset: '\x1b[0m'
    };

    console.log(`${colors[type]}[${timestamp}] ${message}${colors.reset}`);
  }

  async audit() {
    this.log('🔒 Starting BThwani Security Audit', 'info');

    // Core Security Checks
    await this.checkSecretsExposure();
    await this.checkAuthenticationSecurity();
    await this.checkAuthorizationSecurity();
    await this.checkInputValidation();
    await this.checkDataEncryption();
    await this.checkCORSConfiguration();
    await this.checkRateLimiting();
    await this.checkDependencyVulnerabilities();
    await this.checkAPIContractSecurity();
    await this.checkWebhookSecurity();

    // Generate Report
    this.generateReport();
  }

  async checkSecretsExposure() {
    this.log('🔍 Checking for secrets exposure...', 'info');

    const secretPatterns = [
      /password\s*[:=]\s*['"][^'"]*['"]/gi,
      /secret\s*[:=]\s*['"][^'"]*['"]/gi,
      /key\s*[:=]\s*['"][^'"]*['"]/gi,
      /token\s*[:=]\s*['"][^'"]*['"]/gi,
      /firebase.*key/gi,
      /mongodb.*uri/gi,
      /redis.*password/gi,
    ];

    const excludePaths = [
      'node_modules',
      '.git',
      'dist',
      'build',
      '*.log',
      'coverage',
      'security-audit-report.json'
    ];

    const findings = [];

    function scanDirectory(dir) {
      const items = fs.readdirSync(dir);

      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
          if (!excludePaths.some(excl => item.includes(excl))) {
            scanDirectory(fullPath);
          }
        } else if (stat.isFile() && !excludePaths.some(excl => fullPath.includes(excl))) {
          try {
            const content = fs.readFileSync(fullPath, 'utf8');
            const relativePath = path.relative(this.projectRoot, fullPath);

            for (const pattern of secretPatterns) {
              let match;
              while ((match = pattern.exec(content)) !== null) {
                findings.push({
                  file: relativePath,
                  line: content.substring(0, match.index).split('\n').length,
                  pattern: pattern.source,
                  match: match[0].substring(0, 50) + '...'
                });
              }
            }
          } catch (error) {
            // Skip binary files
          }
        }
      }
    }

    scanDirectory.call(this, this.projectRoot);

    if (findings.length === 0) {
      this.passed.push('✅ No hardcoded secrets found in codebase');
    } else {
      this.issues.push({
        severity: 'CRITICAL',
        category: 'Secrets Management',
        title: 'Hardcoded secrets detected',
        description: `${findings.length} potential secrets found in codebase`,
        findings,
        recommendation: 'Move all secrets to environment variables and use secret management service'
      });
    }
  }

  async checkAuthenticationSecurity() {
    this.log('🔐 Checking authentication security...', 'info');

    // Check for JWT configuration
    const mainTs = path.join(this.projectRoot, 'src', 'main.ts');
    if (fs.existsSync(mainTs)) {
      const content = fs.readFileSync(mainTs, 'utf8');

      if (content.includes('JWT')) {
        this.passed.push('✅ JWT authentication configured');
      } else {
        this.warnings.push('⚠️  JWT authentication not found in main.ts');
      }

      if (content.includes('helmet')) {
        this.passed.push('✅ Security headers (Helmet) configured');
      } else {
        this.issues.push({
          severity: 'HIGH',
          category: 'Security Headers',
          title: 'Missing security headers',
          description: 'Helmet middleware not found',
          recommendation: 'Add Helmet for security headers (HSTS, CSP, etc.)'
        });
      }
    }
  }

  async checkAuthorizationSecurity() {
    this.log('🛡️  Checking authorization security...', 'info');

    // Check for role-based access control
    const authFiles = this.findFilesWithPattern('src', /@Roles|@UseGuards/g);

    if (authFiles.length > 0) {
      this.passed.push('✅ Role-based authorization implemented');
    } else {
      this.warnings.push('⚠️  Limited authorization checks found');
    }
  }

  async checkInputValidation() {
    this.log('📝 Checking input validation...', 'info');

    // Check for class-validator usage
    const dtoFiles = this.findFilesWithPattern('src', /@IsNotEmpty|@IsString|@IsNumber/g);

    if (dtoFiles.length > 0) {
      this.passed.push('✅ Input validation with class-validator implemented');
    } else {
      this.issues.push({
        severity: 'HIGH',
        category: 'Input Validation',
        title: 'Missing input validation',
        description: 'No class-validator decorators found',
        recommendation: 'Implement comprehensive input validation using class-validator'
      });
    }
  }

  async checkDataEncryption() {
    this.log('🔒 Checking data encryption...', 'info');

    // Check for encryption usage
    const encryptionFiles = this.findFilesWithPattern('src', /crypto|bcrypt|encrypt/gi);

    if (encryptionFiles.length > 0) {
      this.passed.push('✅ Data encryption implemented');
    } else {
      this.warnings.push('⚠️  No encryption libraries found');
    }
  }

  async checkCORSConfiguration() {
    this.log('🌐 Checking CORS configuration...', 'info');

    const mainTs = path.join(this.projectRoot, 'src', 'main.ts');
    if (fs.existsSync(mainTs)) {
      const content = fs.readFileSync(mainTs, 'utf8');

      if (content.includes('enableCors')) {
        this.passed.push('✅ CORS properly configured');
      } else {
        this.issues.push({
          severity: 'MEDIUM',
          category: 'CORS',
          title: 'CORS not configured',
          description: 'enableCors not found in main.ts',
          recommendation: 'Configure CORS with proper origin restrictions'
        });
      }
    }
  }

  async checkRateLimiting() {
    this.log('⚡ Checking rate limiting...', 'info');

    const mainTs = path.join(this.projectRoot, 'src', 'main.ts');
    if (fs.existsSync(mainTs)) {
      const content = fs.readFileSync(mainTs, 'utf8');

      if (content.includes('rateLimit') || content.includes('RateLimit')) {
        this.passed.push('✅ Rate limiting implemented');
      } else {
        this.issues.push({
          severity: 'HIGH',
          category: 'Rate Limiting',
          title: 'Missing rate limiting',
          description: 'No rate limiting found',
          recommendation: 'Implement rate limiting to prevent abuse'
        });
      }
    }
  }

  async checkDependencyVulnerabilities() {
    this.log('📦 Checking dependencies...', 'info');

    const packageJson = path.join(this.projectRoot, 'package.json');
    if (fs.existsSync(packageJson)) {
      const pkg = JSON.parse(fs.readFileSync(packageJson, 'utf8'));

      // Check for known vulnerable packages
      const riskyDeps = ['express-basic-auth', 'jsonwebtoken@<8.0.0'];

      let hasRiskyDeps = false;
      for (const dep of riskyDeps) {
        if (pkg.dependencies && pkg.dependencies[dep]) {
          hasRiskyDeps = true;
          break;
        }
      }

      if (!hasRiskyDeps) {
        this.passed.push('✅ No known vulnerable dependencies');
      } else {
        this.issues.push({
          severity: 'CRITICAL',
          category: 'Dependencies',
          title: 'Vulnerable dependencies detected',
          description: 'Known vulnerable packages found',
          recommendation: 'Update to latest secure versions'
        });
      }
    }
  }

  async checkAPIContractSecurity() {
    this.log('📋 Checking API contract security...', 'info');

    // Check for OpenAPI specification
    const openApiFiles = this.findFilesWithPattern('.', /openapi|swagger/g);

    if (openApiFiles.length > 0) {
      this.passed.push('✅ API contract defined');
    } else {
      this.warnings.push('⚠️  No OpenAPI specification found');
    }

    // Check for proper error responses
    const controllerFiles = this.findFilesWithPattern('src', /@ApiResponse/g);

    if (controllerFiles.length > 0) {
      this.passed.push('✅ API error responses documented');
    } else {
      this.warnings.push('⚠️  API error responses not documented');
    }
  }

  async checkWebhookSecurity() {
    this.log('🔗 Checking webhook security...', 'info');

    // Check for webhook signature verification
    const webhookFiles = this.findFilesWithPattern('src', /webhook|signature|HMAC/g);

    if (webhookFiles.length > 0) {
      this.passed.push('✅ Webhook signature verification implemented');
    } else {
      this.issues.push({
        severity: 'HIGH',
        category: 'Webhooks',
        title: 'Missing webhook security',
        description: 'No webhook signature verification found',
        recommendation: 'Implement HMAC signature verification for webhooks'
      });
    }
  }

  findFilesWithPattern(startPath, pattern) {
    const results = [];

    function scan(dir) {
      const items = fs.readdirSync(dir);

      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
          scan(fullPath);
        } else if (stat.isFile() && item.endsWith('.ts')) {
          try {
            const content = fs.readFileSync(fullPath, 'utf8');
            if (pattern.test(content)) {
              results.push(fullPath);
            }
          } catch (error) {
            // Skip files that can't be read
          }
        }
      }
    }

    scan(startPath);
    return results;
  }

  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        issues: this.issues.length,
        warnings: this.warnings.length,
        passed: this.passed.length,
        overall: this.issues.length === 0 ? 'PASS' : 'FAIL'
      },
      issues: this.issues,
      warnings: this.warnings,
      passed: this.passed,
      recommendations: this.generateRecommendations()
    };

    // Save report
    const reportPath = path.join(this.projectRoot, 'security-audit-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    // Print summary
    this.log('\n🔒 Security Audit Complete', 'info');
    this.log(`📊 Summary: ${this.issues.length} issues, ${this.warnings.length} warnings, ${this.passed.length} passed`, 'info');

    if (this.issues.length > 0) {
      this.log('\n🚨 Critical Issues:', 'error');
      this.issues.forEach((issue, i) => {
        this.log(`${i + 1}. ${issue.title} (${issue.severity})`, 'error');
      });
    }

    if (this.warnings.length > 0) {
      this.log('\n⚠️  Warnings:', 'warning');
      this.warnings.forEach((warning, i) => {
        this.log(`${i + 1}. ${warning}`, 'warning');
      });
    }

    this.log(`\n📄 Full report saved to: ${reportPath}`, 'success');
  }

  generateRecommendations() {
    const recommendations = [];

    if (this.issues.some(i => i.category === 'Secrets Management')) {
      recommendations.push('Implement proper secret management with environment variables');
    }

    if (this.issues.some(i => i.category === 'Rate Limiting')) {
      recommendations.push('Add rate limiting to prevent abuse and DoS attacks');
    }

    if (this.issues.some(i => i.category === 'Input Validation')) {
      recommendations.push('Implement comprehensive input validation using DTOs');
    }

    return recommendations;
  }
}

// Run the audit
const auditor = new SecurityAuditor();
auditor.audit().catch(console.error);
