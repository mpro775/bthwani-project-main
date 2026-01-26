# 🔒 Security Tools - BTW-SEC-003

This directory contains security scanning and compliance tools for the BThwani project.

## 📋 Overview

As part of BTW-SEC-003, we implement:
- ✅ Secret detection and prevention
- ✅ SBOM (Software Bill of Materials) generation
- ✅ Artifact signing with Cosign
- ✅ Automated security scans in CI/CD

## 🛠️ Tools

### 1. Secret Scanner (`secrets-scan.ts`)

Scans the codebase for exposed secrets and credentials.

**Usage:**
```bash
npm run security:secrets
```

**What it detects:**
- AWS Access Keys
- Private Keys (RSA, EC, DSA)
- JWT Tokens
- API Keys
- Hardcoded passwords
- MongoDB connection strings
- Firebase private keys

**Output:**
- Console report with findings
- JSON report at `reports/secrets_scan.json`
- SARIF report at `reports/gitleaks.sarif` (if gitleaks available)

**Exit codes:**
- `0`: No secrets found
- `1`: Secrets detected

### 2. SBOM Generator (`generate-sbom.ts`)

Generates Software Bill of Materials in CycloneDX format.

**Usage:**
```bash
npm run security:sbom
```

**Output:**
- `reports/sbom.json` - JSON format
- `reports/sbom.xml` - XML format
- `reports/sbom-cyclonedx.json` - Official CycloneDX format (if tool available)

**Includes:**
- All dependencies (runtime + dev)
- License information
- Package URLs (purl)
- Version information

### 3. Cosign Setup (`cosign-setup.sh`)

Sets up Cosign for signing artifacts.

**Usage:**
```bash
cd tools/security
chmod +x cosign-setup.sh
./cosign-setup.sh
```

**What it does:**
- Installs Cosign (if not present)
- Generates key pair (if not exists)
- Signs SBOM files
- Adds cosign.key to .gitignore

**⚠️ Important:**
- Keep `cosign.key` SECRET - store in Vault
- Commit `cosign.pub` to repository
- Use in CI/CD for signing builds

## 🔄 CI/CD Integration

### GitHub Actions Workflow

The security guard workflow (`.github/workflows/security-guard.yml`) runs on:
- Every PR to main/develop
- Every push to main/develop
- Daily schedule (2 AM UTC)

**Jobs:**
1. **secrets-scan**: Runs Gitleaks
2. **sbom-generation**: Generates and signs SBOM
3. **dependency-review**: Reviews dependency changes
4. **npm-audit**: Runs security audit
5. **security-summary**: Creates summary report

### Required Secrets

Add these to GitHub repository secrets:

```
COSIGN_PRIVATE_KEY - Private key for signing
COSIGN_PUBLIC_KEY  - Public key for verification
COSIGN_PASSWORD    - Password for private key
GITLEAKS_LICENSE   - Gitleaks license (optional)
```

## 📊 Acceptance Criteria (BTW-SEC-003)

- [x] SecretsFound=0
- [x] SBOMGenerated=true
- [x] AllArtifactsSigned=true

## 🚀 Quick Start

Run all security checks:
```bash
npm run security:all
```

View reports:
```bash
cat reports/secrets_scan.json
cat reports/sbom.json
```

Sign a Docker image:
```bash
cosign sign --key tools/security/cosign.key bthwani/backend:latest
```

Verify signature:
```bash
cosign verify --key tools/security/cosign.pub bthwani/backend:latest
```

## 📚 Best Practices

### Secret Management

1. **Never commit secrets** - Use environment variables
2. **Use Vault** - HashiCorp Vault or AWS Secrets Manager
3. **Rotate regularly** - Change secrets every 90 days
4. **Pre-commit hooks** - Install git-secrets or gitleaks
5. **Audit git history** - If secrets found, use BFG Repo-Cleaner

### SBOM Management

1. **Generate on every release** - Include in release artifacts
2. **Sign all SBOMs** - Use Cosign for verification
3. **Track dependencies** - Monitor for vulnerabilities
4. **License compliance** - Review licenses regularly

### Signing Best Practices

1. **Protect private keys** - Never commit, use Vault
2. **Automate in CI/CD** - Sign all artifacts automatically
3. **Verify on deployment** - Check signatures before deploying
4. **Key rotation** - Plan for key rotation strategy

## 🔗 Resources

- [Gitleaks](https://github.com/gitleaks/gitleaks)
- [Cosign](https://github.com/sigstore/cosign)
- [CycloneDX](https://cyclonedx.org/)
- [HashiCorp Vault](https://www.vaultproject.io/)
- [OWASP ASVS](https://owasp.org/www-project-application-security-verification-standard/)

## 📝 Report Issues

If you find security issues:
1. **DO NOT** create public GitHub issue
2. Email security team directly
3. Follow responsible disclosure policy

## 🎯 Next Steps

After completing BTW-SEC-003:

1. Set up HashiCorp Vault for production
2. Configure automated key rotation
3. Enable security scanning in all repositories
4. Create security runbooks
5. Train team on security best practices

---

**Status:** ✅ Implemented
**Owner:** @Sec, @DevOps
**Due:** +3d from 2025-10-16

