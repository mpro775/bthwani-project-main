#!/usr/bin/env ts-node
/**
 * BTW-FE-005: Fix Frontend Orphans
 * Analyzes and provides fixes for frontend calls without backend implementation
 * 
 * Usage: npm run fix:fe-orphans
 */

import * as fs from 'fs';
import * as path from 'path';

interface FeOrphan {
  surface: string;
  method: string;
  path: string;
  normalized_path: string;
  file: string;
}

interface FixStrategy {
  orphan: FeOrphan;
  strategy: 'IMPLEMENT' | 'REDIRECT' | 'DEPRECATE' | 'MOCK';
  suggestedBackendPath?: string;
  existingAlternative?: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  reason: string;
  implementation?: string;
}

interface AnalysisResult {
  timestamp: string;
  totalOrphans: number;
  byStrategy: {
    implement: number;
    redirect: number;
    deprecate: number;
    mock: number;
  };
  bySurface: Record<string, number>;
  fixes: FixStrategy[];
}

/**
 * Categorize orphans by surface
 */
function categorizeBySurface(orphans: FeOrphan[]): Record<string, FeOrphan[]> {
  const categories: Record<string, FeOrphan[]> = {};
  
  orphans.forEach(orphan => {
    const surface = orphan.surface || 'UNKNOWN';
    if (!categories[surface]) {
      categories[surface] = [];
    }
    categories[surface].push(orphan);
  });
  
  return categories;
}

/**
 * Determine fix strategy for an orphan endpoint
 */
function determineStrategy(orphan: FeOrphan): FixStrategy {
  const { method, normalized_path, path: originalPath } = orphan;
  
  // Admin dashboard endpoints - high priority
  if (normalized_path.startsWith('/admin/')) {
    return {
      orphan,
      strategy: 'IMPLEMENT',
      priority: 'HIGH',
      reason: 'Admin dashboard endpoint - core functionality',
      suggestedBackendPath: `src/modules/admin/${extractModule(normalized_path)}`,
      implementation: generateControllerCode(orphan)
    };
  }
  
  // Service worker / offline endpoints - can mock
  if (originalPath.includes('/api/content/latest') || orphan.file?.includes('sw.js')) {
    return {
      orphan,
      strategy: 'MOCK',
      priority: 'LOW',
      reason: 'Service worker endpoint - can use mock data'
    };
  }
  
  // Feature flags
  if (normalized_path.includes('/features')) {
    return {
      orphan,
      strategy: 'IMPLEMENT',
      priority: 'HIGH',
      reason: 'Feature flags - critical for feature toggles',
      suggestedBackendPath: 'src/modules/features/features.controller.ts',
      implementation: generateControllerCode(orphan)
    };
  }
  
  // Support/Contact endpoints
  if (normalized_path.includes('/support') || normalized_path.includes('/contact')) {
    return {
      orphan,
      strategy: 'IMPLEMENT',
      priority: 'MEDIUM',
      reason: 'Customer support endpoint',
      suggestedBackendPath: 'src/modules/support/support.controller.ts',
      implementation: generateControllerCode(orphan)
    };
  }
  
  // Lead generation endpoints
  if (normalized_path.includes('/leads/')) {
    return {
      orphan,
      strategy: 'IMPLEMENT',
      priority: 'MEDIUM',
      reason: 'Lead generation - important for business',
      suggestedBackendPath: 'src/modules/leads/leads.controller.ts',
      implementation: generateControllerCode(orphan)
    };
  }
  
  // Dashboard stats/overview
  if (normalized_path.includes('/dashboard/') || normalized_path.includes('/stats') || normalized_path.includes('/overview')) {
    return {
      orphan,
      strategy: 'IMPLEMENT',
      priority: 'HIGH',
      reason: 'Dashboard metrics - critical visibility',
      suggestedBackendPath: `src/modules/dashboard/${extractModule(normalized_path)}`,
      implementation: generateControllerCode(orphan)
    };
  }
  
  // Analytics endpoints
  if (normalized_path.includes('/analytics')) {
    return {
      orphan,
      strategy: 'IMPLEMENT',
      priority: 'MEDIUM',
      reason: 'Analytics data',
      suggestedBackendPath: 'src/modules/analytics/analytics.controller.ts',
      implementation: generateControllerCode(orphan)
    };
  }
  
  // Finance/Commission endpoints
  if (normalized_path.includes('/finance') || normalized_path.includes('/commission')) {
    return {
      orphan,
      strategy: 'IMPLEMENT',
      priority: 'HIGH',
      reason: 'Financial data - critical',
      suggestedBackendPath: 'src/modules/finance/finance.controller.ts',
      implementation: generateControllerCode(orphan)
    };
  }
  
  // Pricing endpoints
  if (normalized_path.includes('/pricing')) {
    return {
      orphan,
      strategy: 'IMPLEMENT',
      priority: 'HIGH',
      reason: 'Pricing logic - critical for business',
      suggestedBackendPath: 'src/modules/pricing/pricing.controller.ts',
      implementation: generateControllerCode(orphan)
    };
  }
  
  // Default: implement with medium priority
  return {
    orphan,
    strategy: 'IMPLEMENT',
    priority: 'MEDIUM',
    reason: 'Standard endpoint',
    suggestedBackendPath: `src/modules/${extractModule(normalized_path)}`,
    implementation: generateControllerCode(orphan)
  };
}

/**
 * Extract module name from path
 */
function extractModule(path: string): string {
  const parts = path.split('/').filter(p => p && p !== 'api' && p !== 'admin');
  return parts[0] || 'misc';
}

/**
 * Generate controller code template
 */
function generateControllerCode(orphan: FeOrphan): string {
  const module = extractModule(orphan.normalized_path);
  const method = orphan.method.toLowerCase();
  const decoratorMethod = orphan.method.charAt(0) + orphan.method.slice(1).toLowerCase();
  const pathParam = orphan.normalized_path.replace(/^\/admin\//, '').replace(/^\/api\//, '');
  const functionName = pathParam
    .split('/')
    .map((part, i) => 
      i === 0 ? part : part.charAt(0).toUpperCase() + part.slice(1)
    )
    .join('')
    .replace(/[^a-zA-Z0-9]/g, '');

  return `
@${decoratorMethod}('${pathParam}')
@ApiOperation({ summary: 'TODO: Add description' })
@ApiResponse({ status: 200, description: 'Success' })
async ${functionName}() {
  // TODO: Implement logic
  return {
    success: true,
    message: 'Implementation needed'
  };
}`.trim();
}

/**
 * Generate markdown report
 */
function generateMarkdownReport(analysis: AnalysisResult): string {
  let md = `# Frontend Orphans Fix Report - BTW-FE-005\n\n`;
  md += `**Generated:** ${analysis.timestamp}\n`;
  md += `**Total Orphans:** ${analysis.totalOrphans}\n\n`;
  
  md += `## Summary by Strategy\n\n`;
  md += `| Strategy | Count | Description |\n`;
  md += `|----------|-------|-------------|\n`;
  md += `| Implement | ${analysis.byStrategy.implement} | Create new backend endpoint |\n`;
  md += `| Redirect | ${analysis.byStrategy.redirect} | Point to existing endpoint |\n`;
  md += `| Deprecate | ${analysis.byStrategy.deprecate} | Remove from frontend |\n`;
  md += `| Mock | ${analysis.byStrategy.mock} | Use mock data |\n\n`;
  
  md += `## Summary by Surface\n\n`;
  md += `| Surface | Count |\n`;
  md += `|---------|-------|\n`;
  Object.entries(analysis.bySurface).forEach(([surface, count]) => {
    md += `| ${surface} | ${count} |\n`;
  });
  md += `\n`;
  
  // Group by priority
  const highPriority = analysis.fixes.filter(f => f.priority === 'HIGH');
  const medPriority = analysis.fixes.filter(f => f.priority === 'MEDIUM');
  const lowPriority = analysis.fixes.filter(f => f.priority === 'LOW');
  
  if (highPriority.length > 0) {
    md += `## 🔴 High Priority (${highPriority.length})\n\n`;
    highPriority.forEach((fix, i) => {
      md += generateFixSection(fix, i + 1);
    });
  }
  
  if (medPriority.length > 0) {
    md += `## 🟡 Medium Priority (${medPriority.length})\n\n`;
    medPriority.forEach((fix, i) => {
      md += generateFixSection(fix, i + 1);
    });
  }
  
  if (lowPriority.length > 0) {
    md += `## 🟢 Low Priority (${lowPriority.length})\n\n`;
    lowPriority.forEach((fix, i) => {
      md += generateFixSection(fix, i + 1);
    });
  }
  
  md += `\n## Action Plan\n\n`;
  md += `1. **High Priority** (${highPriority.length} items) - Implement first\n`;
  md += `2. **Medium Priority** (${medPriority.length} items) - Implement after high\n`;
  md += `3. **Low Priority** (${lowPriority.length} items) - Mock or defer\n\n`;
  md += `Total implementation needed: ${analysis.byStrategy.implement}\n`;
  
  return md;
}

function generateFixSection(fix: FixStrategy, index: number): string {
  let section = `### ${index}. ${fix.orphan.method} ${fix.orphan.normalized_path}\n\n`;
  section += `**Strategy:** ${fix.strategy}\n`;
  section += `**Reason:** ${fix.reason}\n`;
  section += `**File:** \`${fix.orphan.file}\`\n\n`;
  
  if (fix.suggestedBackendPath) {
    section += `**Suggested Implementation:** \`${fix.suggestedBackendPath}\`\n\n`;
  }
  
  if (fix.implementation) {
    section += `**Code Template:**\n\n\`\`\`typescript\n${fix.implementation}\n\`\`\`\n\n`;
  }
  
  if (fix.existingAlternative) {
    section += `**Alternative:** Use existing endpoint \`${fix.existingAlternative}\`\n\n`;
  }
  
  section += `---\n\n`;
  return section;
}

/**
 * Main execution
 */
function main(): void {
  console.log('🔧 BThwani Frontend Orphans Fixer - BTW-FE-005');
  console.log('============================================\n');

  // Load execution pack
  const packPath = path.resolve(__dirname, '../../BTW_Cursor_Execution_Pack_20251016.json');
  
  if (!fs.existsSync(packPath)) {
    console.error('❌ Execution pack not found:', packPath);
    process.exit(1);
  }

  // Read and parse JSON, replacing NaN with null
  const packContent = fs.readFileSync(packPath, 'utf-8')
    .replace(/:\s*NaN/g, ': null')
    .replace(/NaN/g, 'null');
  const pack = JSON.parse(packContent);
  const orphans: FeOrphan[] = pack.parity?.fe_orphans || [];

  console.log(`📊 Found ${orphans.length} frontend orphans\n`);

  // Categorize
  const bySurface = categorizeBySurface(orphans);
  console.log('📦 By Surface:');
  Object.entries(bySurface).forEach(([surface, items]) => {
    console.log(`   ${surface}: ${items.length}`);
  });
  console.log('');

  // Analyze and determine strategies
  const fixes: FixStrategy[] = orphans.map(determineStrategy);

  // Count by strategy
  const byStrategy = {
    implement: fixes.filter(f => f.strategy === 'IMPLEMENT').length,
    redirect: fixes.filter(f => f.strategy === 'REDIRECT').length,
    deprecate: fixes.filter(f => f.strategy === 'DEPRECATE').length,
    mock: fixes.filter(f => f.strategy === 'MOCK').length,
  };

  // Create analysis result
  const analysis: AnalysisResult = {
    timestamp: new Date().toISOString(),
    totalOrphans: orphans.length,
    byStrategy,
    bySurface: Object.fromEntries(
      Object.entries(bySurface).map(([k, v]) => [k, v.length])
    ),
    fixes,
  };

  // Print summary
  console.log('📋 STRATEGY SUMMARY');
  console.log('===================');
  console.log(`Implement: ${byStrategy.implement}`);
  console.log(`Redirect: ${byStrategy.redirect}`);
  console.log(`Deprecate: ${byStrategy.deprecate}`);
  console.log(`Mock: ${byStrategy.mock}\n`);

  // Save reports
  const reportsDir = path.resolve(__dirname, '../reports');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  // JSON report
  const jsonPath = path.join(reportsDir, 'fe_orphans_fixes.json');
  fs.writeFileSync(jsonPath, JSON.stringify(analysis, null, 2));
  console.log(`💾 JSON report saved: ${jsonPath}`);

  // Markdown report
  const mdReport = generateMarkdownReport(analysis);
  const mdPath = path.join(reportsDir, 'fe_orphans_fixes.md');
  fs.writeFileSync(mdPath, mdReport);
  console.log(`💾 Markdown report saved: ${mdPath}`);

  console.log('\n✅ Analysis complete!');
  console.log('\n📝 Next steps:');
  console.log('   1. Review reports/fe_orphans_fixes.md');
  console.log('   2. Implement high priority endpoints first');
  console.log('   3. Use code templates in the report');
  console.log('   4. Update OpenAPI spec after implementation');
  console.log('   5. Re-run parity check: npm run audit:parity\n');
}

main();

