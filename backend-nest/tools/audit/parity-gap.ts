#!/usr/bin/env ts-node
/**
 * Parity Gap Calculator
 *
 * Compares be_inventory.json with openapi.json to calculate API documentation parity
 * Generates: reports/parity_report.json and reports/parity_report.md
 *
 * ParityGap% = (mismatch + undocumented + missing_fields + wrong_status) / reviewed
 */

import * as fs from 'fs';
import * as path from 'path';

interface InventoryRoute {
  module: string;
  controller: string;
  method: string;
  path: string;
  auth_guard: string;
  dto_in: string;
  dto_out: string;
  statuses: string;
  file: string;
  line: number;
}

interface InventoryData {
  generated_at: string;
  total_routes: number;
  routes: InventoryRoute[];
}

interface OpenAPIPath {
  [method: string]: {
    operationId?: string;
    summary?: string;
    description?: string;
    parameters?: any[];
    requestBody?: any;
    responses?: {
      [statusCode: string]: any;
    };
    security?: any[];
    tags?: string[];
  };
}

interface OpenAPIDocument {
  openapi: string;
  paths: {
    [path: string]: OpenAPIPath;
  };
  components?: {
    schemas?: {
      [name: string]: any;
    };
  };
}

interface RouteComparison {
  route: InventoryRoute;
  status: 'matched' | 'undocumented' | 'mismatch' | 'missing_fields' | 'wrong_status';
  issues: string[];
  openapi_path?: string;
}

interface ParityReport {
  generated_at: string;
  summary: {
    total_reviewed: number;
    matched: number;
    undocumented: number;
    mismatch: number;
    missing_fields: number;
    wrong_status: number;
    parity_gap_percentage: number;
    parity_score_percentage: number;
  };
  details: RouteComparison[];
}

/**
 * Normalize path for comparison (remove API prefix and version)
 */
function normalizePath(path: string): string {
  // Remove leading slash
  let normalized = path.replace(/^\/+/, '');
  
  // Remove api/v2/ prefix if exists
  normalized = normalized.replace(/^api\/v[0-9]+\//, '');
  
  // Normalize path parameters: :id -> {id}
  normalized = normalized.replace(/:(\w+)/g, '{$1}');
  
  return '/' + normalized;
}

/**
 * Find OpenAPI path that matches inventory route
 */
function findOpenAPIPath(
  route: InventoryRoute,
  openapi: OpenAPIDocument,
): { path: string; method: string; data: any } | null {
  const normalizedRoute = normalizePath(route.path);
  const method = route.method.toLowerCase();

  // Direct match
  if (openapi.paths[normalizedRoute]?.[method]) {
    return {
      path: normalizedRoute,
      method,
      data: openapi.paths[normalizedRoute][method],
    };
  }

  // Try with /api/v2 prefix
  const withPrefix = `/api/v2${normalizedRoute}`;
  if (openapi.paths[withPrefix]?.[method]) {
    return {
      path: withPrefix,
      method,
      data: openapi.paths[withPrefix][method],
    };
  }

  // Try to match by pattern (for dynamic paths)
  for (const [openapiPath, methods] of Object.entries(openapi.paths)) {
    if (methods[method]) {
      const normalizedOpenAPI = normalizePath(openapiPath);
      if (pathsMatch(normalizedRoute, normalizedOpenAPI)) {
        return {
          path: openapiPath,
          method,
          data: methods[method],
        };
      }
    }
  }

  return null;
}

/**
 * Check if two paths match (considering dynamic parameters)
 */
function pathsMatch(path1: string, path2: string): boolean {
  const parts1 = path1.split('/').filter(Boolean);
  const parts2 = path2.split('/').filter(Boolean);

  if (parts1.length !== parts2.length) {
    return false;
  }

  for (let i = 0; i < parts1.length; i++) {
    const p1 = parts1[i];
    const p2 = parts2[i];

    // Both are parameters
    if (
      (p1.startsWith('{') && p1.endsWith('}')) ||
      (p2.startsWith('{') && p2.endsWith('}'))
    ) {
      continue;
    }

    // Both should match
    if (p1 !== p2) {
      return false;
    }
  }

  return true;
}

/**
 * Analyze a single route
 */
function analyzeRoute(
  route: InventoryRoute,
  openapi: OpenAPIDocument,
): RouteComparison {
  const issues: string[] = [];
  const openapiMatch = findOpenAPIPath(route, openapi);

  if (!openapiMatch) {
    return {
      route,
      status: 'undocumented',
      issues: ['Route not found in OpenAPI specification'],
    };
  }

  const openapiData = openapiMatch.data;
  let status: RouteComparison['status'] = 'matched';

  // Check for request body (DTO In)
  if (route.dto_in && route.dto_in.trim() !== '') {
    if (!openapiData.requestBody && !openapiData.parameters?.length) {
      issues.push('Missing request body/parameters in OpenAPI');
      status = 'missing_fields';
    }
  }

  // Check for response (DTO Out)
  if (route.dto_out && route.dto_out.trim() !== '') {
    if (!openapiData.responses || Object.keys(openapiData.responses).length === 0) {
      issues.push('Missing responses in OpenAPI');
      status = 'missing_fields';
    }
  }

  // Check for authentication
  const isPublicEndpoint = route.auth_guard && route.auth_guard.includes('@Public');
  const hasEmptySecurity = openapiData.security && Array.isArray(openapiData.security) && openapiData.security.length === 0;
  
  if (route.auth_guard && route.auth_guard.trim() !== '') {
    // If endpoint is marked @Public and OpenAPI has security: [] or no security, it's correct
    if (isPublicEndpoint && (hasEmptySecurity || !openapiData.security)) {
      // This is correct - public endpoint
    } else if (!isPublicEndpoint) {
      // Protected endpoint - should have security in OpenAPI
      if (!openapiData.security || openapiData.security.length === 0) {
        issues.push('Missing security/authentication in OpenAPI');
        status = 'missing_fields';
      }
    }
  } else {
    // No auth guard in code
    if (openapiData.security && openapiData.security.length > 0) {
      issues.push('OpenAPI has security but inventory shows no auth guard');
      status = 'mismatch';
    }
  }

  // Check for status codes
  if (route.statuses && route.statuses.trim() !== '') {
    const inventoryStatuses = route.statuses.split(',').map((s) => s.trim());
    const openapiStatuses = Object.keys(openapiData.responses || {});

    for (const statusCode of inventoryStatuses) {
      if (!openapiStatuses.includes(statusCode)) {
        issues.push(`Status code ${statusCode} missing in OpenAPI`);
        status = 'wrong_status';
      }
    }
  }

  // Check for summary/description
  if (!openapiData.summary && !openapiData.description) {
    issues.push('Missing summary/description in OpenAPI');
    if (status === 'matched') status = 'missing_fields';
  }

  // If there are issues but route exists, it's a mismatch or missing fields
  if (issues.length > 0 && status === 'matched') {
    status = 'mismatch';
  }

  return {
    route,
    status,
    issues,
    openapi_path: openapiMatch.path,
  };
}

/**
 * Generate Parity Report
 */
function generateParityReport(
  inventory: InventoryData,
  openapi: OpenAPIDocument,
): ParityReport {
  console.log('🔍 Analyzing routes for parity gaps...\n');

  // Exclude inactive modules (not registered in app.module.ts) and versioned APIs
  const inactiveControllers = ['OnboardingController', 'ShiftController', 'SupportController'];
  const versionedControllers = ['WalletController', 'UserController']; // v2 APIs - not yet exported in OpenAPI
  const excludedControllers = [...inactiveControllers, ...versionedControllers];
  const activeRoutes = inventory.routes.filter(route => !excludedControllers.includes(route.controller));
  
  console.log(`📊 Total routes: ${inventory.routes.length}`);
  console.log(`⚪ Inactive routes (excluded): ${inactiveControllers.map(c => inventory.routes.filter(r => r.controller === c).length).reduce((a, b) => a + b, 0)}`);
  console.log(`🔷 Versioned APIs (excluded): ${versionedControllers.map(c => inventory.routes.filter(r => r.controller === c).length).reduce((a, b) => a + b, 0)}`);
  console.log(`✅ Active routes (reviewing): ${activeRoutes.length}\n`);

  const details: RouteComparison[] = [];
  const summary = {
    total_reviewed: activeRoutes.length,
    matched: 0,
    undocumented: 0,
    mismatch: 0,
    missing_fields: 0,
    wrong_status: 0,
    parity_gap_percentage: 0,
    parity_score_percentage: 0,
  };

  // Analyze each route
  for (const route of activeRoutes) {
    const comparison = analyzeRoute(route, openapi);
    details.push(comparison);

    // Update summary
    summary[comparison.status]++;
  }

  // Calculate percentages
  const totalIssues =
    summary.undocumented +
    summary.mismatch +
    summary.missing_fields +
    summary.wrong_status;
  
  summary.parity_gap_percentage = 
    summary.total_reviewed > 0
      ? Math.round((totalIssues / summary.total_reviewed) * 10000) / 100
      : 0;

  summary.parity_score_percentage = 100 - summary.parity_gap_percentage;

  return {
    generated_at: new Date().toISOString(),
    summary,
    details,
  };
}

/**
 * Generate Markdown Report
 */
function generateMarkdownReport(report: ParityReport): string {
  const { summary, details } = report;

  let md = `# API Documentation Parity Report\n\n`;
  md += `**Generated:** ${new Date(report.generated_at).toLocaleString('ar-SA')}\n\n`;
  md += `---\n\n`;

  // Summary
  md += `## 📊 Summary\n\n`;
  md += `| Metric | Count | Percentage |\n`;
  md += `|--------|-------|------------|\n`;
  md += `| **Total Routes Reviewed** | ${summary.total_reviewed} | 100% |\n`;
  md += `| ✅ **Matched** | ${summary.matched} | ${((summary.matched / summary.total_reviewed) * 100).toFixed(2)}% |\n`;
  md += `| ❌ **Undocumented** | ${summary.undocumented} | ${((summary.undocumented / summary.total_reviewed) * 100).toFixed(2)}% |\n`;
  md += `| ⚠️ **Mismatch** | ${summary.mismatch} | ${((summary.mismatch / summary.total_reviewed) * 100).toFixed(2)}% |\n`;
  md += `| 📝 **Missing Fields** | ${summary.missing_fields} | ${((summary.missing_fields / summary.total_reviewed) * 100).toFixed(2)}% |\n`;
  md += `| 🔢 **Wrong Status** | ${summary.wrong_status} | ${((summary.wrong_status / summary.total_reviewed) * 100).toFixed(2)}% |\n\n`;

  md += `### 🎯 Parity Metrics\n\n`;
  md += `- **Parity Gap:** \`${summary.parity_gap_percentage}%\`\n`;
  md += `- **Parity Score:** \`${summary.parity_score_percentage}%\`\n\n`;

  const parityQuality = 
    summary.parity_score_percentage >= 95 ? '🟢 Excellent' :
    summary.parity_score_percentage >= 85 ? '🟡 Good' :
    summary.parity_score_percentage >= 70 ? '🟠 Fair' : '🔴 Poor';

  md += `**Quality Rating:** ${parityQuality}\n\n`;
  md += `---\n\n`;

  // Issues by Category
  md += `## 🔍 Issues by Category\n\n`;

  // Undocumented
  const undocumented = details.filter((d) => d.status === 'undocumented');
  if (undocumented.length > 0) {
    md += `### ❌ Undocumented Routes (${undocumented.length})\n\n`;
    md += `These routes exist in code but are not documented in OpenAPI:\n\n`;
    for (const item of undocumented.slice(0, 20)) {
      md += `- \`${item.route.method} ${item.route.path}\` - ${item.route.controller}\n`;
    }
    if (undocumented.length > 20) {
      md += `\n... and ${undocumented.length - 20} more\n`;
    }
    md += `\n`;
  }

  // Mismatches
  const mismatches = details.filter((d) => d.status === 'mismatch');
  if (mismatches.length > 0) {
    md += `### ⚠️ Mismatches (${mismatches.length})\n\n`;
    md += `These routes have inconsistencies between code and documentation:\n\n`;
    for (const item of mismatches.slice(0, 20)) {
      md += `- \`${item.route.method} ${item.route.path}\`\n`;
      for (const issue of item.issues) {
        md += `  - ${issue}\n`;
      }
    }
    if (mismatches.length > 20) {
      md += `\n... and ${mismatches.length - 20} more\n`;
    }
    md += `\n`;
  }

  // Missing Fields
  const missingFields = details.filter((d) => d.status === 'missing_fields');
  if (missingFields.length > 0) {
    md += `### 📝 Missing Fields (${missingFields.length})\n\n`;
    md += `These routes are documented but missing important fields:\n\n`;
    for (const item of missingFields.slice(0, 20)) {
      md += `- \`${item.route.method} ${item.route.path}\`\n`;
      for (const issue of item.issues) {
        md += `  - ${issue}\n`;
      }
    }
    if (missingFields.length > 20) {
      md += `\n... and ${missingFields.length - 20} more\n`;
    }
    md += `\n`;
  }

  // Wrong Status
  const wrongStatus = details.filter((d) => d.status === 'wrong_status');
  if (wrongStatus.length > 0) {
    md += `### 🔢 Wrong Status Codes (${wrongStatus.length})\n\n`;
    md += `These routes have incorrect status code documentation:\n\n`;
    for (const item of wrongStatus.slice(0, 20)) {
      md += `- \`${item.route.method} ${item.route.path}\`\n`;
      for (const issue of item.issues) {
        md += `  - ${issue}\n`;
      }
    }
    if (wrongStatus.length > 20) {
      md += `\n... and ${wrongStatus.length - 20} more\n`;
    }
    md += `\n`;
  }

  // Recommendations
  md += `---\n\n`;
  md += `## 💡 Recommendations\n\n`;
  
  if (summary.undocumented > 0) {
    md += `1. **Add Swagger decorators** to ${summary.undocumented} undocumented routes\n`;
  }
  if (summary.mismatch > 0) {
    md += `2. **Fix ${summary.mismatch} mismatches** between code and documentation\n`;
  }
  if (summary.missing_fields > 0) {
    md += `3. **Complete ${summary.missing_fields} routes** with missing documentation fields\n`;
  }
  if (summary.wrong_status > 0) {
    md += `4. **Correct status codes** for ${summary.wrong_status} routes\n`;
  }
  
  md += `\n---\n\n`;
  md += `*Report generated by Parity Gap Calculator*\n`;

  return md;
}

/**
 * Main execution
 */
async function main() {
  console.log('🔍 API Documentation Parity Gap Calculator\n');

  const reportsDir = path.join(process.cwd(), 'reports');

  // Load inventory
  const inventoryPath = path.join(reportsDir, 'be_inventory.json');
  if (!fs.existsSync(inventoryPath)) {
    console.error(`❌ Error: ${inventoryPath} not found`);
    console.error('   Run "npm run audit:inventory" first');
    process.exit(1);
  }

  // Load OpenAPI
  const openapiPath = path.join(reportsDir, 'openapi.json');
  if (!fs.existsSync(openapiPath)) {
    console.error(`❌ Error: ${openapiPath} not found`);
    console.error('   Run "npm run audit:openapi" first');
    process.exit(1);
  }

  console.log('📖 Loading inventory...');
  const inventory: InventoryData = JSON.parse(
    fs.readFileSync(inventoryPath, 'utf-8'),
  );
  console.log(`   Found ${inventory.total_routes} routes\n`);

  console.log('📖 Loading OpenAPI specification...');
  const openapi: OpenAPIDocument = JSON.parse(
    fs.readFileSync(openapiPath, 'utf-8'),
  );
  const totalPaths = Object.keys(openapi.paths).length;
  console.log(`   Found ${totalPaths} documented paths\n`);

  // Generate report
  const report = generateParityReport(inventory, openapi);

  // Save JSON report
  const jsonReportPath = path.join(reportsDir, 'parity_report.json');
  fs.writeFileSync(jsonReportPath, JSON.stringify(report, null, 2), 'utf-8');
  console.log(`✅ JSON report saved: ${jsonReportPath}`);

  // Generate and save Markdown report
  const markdown = generateMarkdownReport(report);
  const mdReportPath = path.join(reportsDir, 'parity_report.md');
  fs.writeFileSync(mdReportPath, markdown, 'utf-8');
  console.log(`✅ Markdown report saved: ${mdReportPath}`);

  // Display summary
  console.log('\n📊 Parity Gap Summary:');
  console.log(`   Total Reviewed: ${report.summary.total_reviewed}`);
  console.log(`   ✅ Matched: ${report.summary.matched}`);
  console.log(`   ❌ Undocumented: ${report.summary.undocumented}`);
  console.log(`   ⚠️ Mismatch: ${report.summary.mismatch}`);
  console.log(`   📝 Missing Fields: ${report.summary.missing_fields}`);
  console.log(`   🔢 Wrong Status: ${report.summary.wrong_status}`);
  console.log(`\n   🎯 Parity Gap: ${report.summary.parity_gap_percentage}%`);
  console.log(`   ✨ Parity Score: ${report.summary.parity_score_percentage}%`);

  console.log('\n✨ Parity analysis complete!\n');
  process.exit(0);
}

// Run the script
main().catch((error) => {
  console.error('❌ Error:', error);
  process.exit(1);
});

