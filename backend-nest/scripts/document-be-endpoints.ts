#!/usr/bin/env ts-node
/**
 * BTW-BE-006: Document Backend Endpoints
 * Analyzes backend-only endpoints and generates OpenAPI decorators
 * 
 * Usage: npm run fix:be-docs
 */

import * as fs from 'fs';
import * as path from 'path';

interface BeEndpoint {
  method: string;
  normalized_path: string;
  path: string;
  controller_file: string;
}

interface DocumentationFix {
  endpoint: BeEndpoint;
  controllerPath: string;
  decorators: string[];
  dtoNeeded: string[];
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  module: string;
}

interface AnalysisResult {
  timestamp: string;
  totalUndocumented: number;
  byModule: Record<string, number>;
  byMethod: Record<string, number>;
  fixes: DocumentationFix[];
}

/**
 * Extract module name from controller file path
 */
function extractModule(controllerFile: string): string {
  const match = controllerFile.match(/modules\/([^\/]+)\//);
  return match ? match[1] : 'unknown';
}

/**
 * Generate operation summary from path
 */
function generateOperationSummary(method: string, path: string): string {
  const action = method.toLowerCase();
  const resource = path.split('/').filter(p => p && !p.startsWith('{')).pop() || 'resource';
  
  const actionMap: Record<string, string> = {
    get: 'Get',
    post: 'Create',
    put: 'Update',
    patch: 'Update',
    delete: 'Delete',
  };
  
  return `${actionMap[action] || action} ${resource}`;
}

/**
 * Generate response DTO name from path
 */
function generateDtoName(path: string, method: string): string {
  const parts = path
    .split('/')
    .filter(p => p && !p.startsWith('{'))
    .map(p => p.charAt(0).toUpperCase() + p.slice(1));
  
  const resource = parts[parts.length - 1] || 'Response';
  
  if (method.toLowerCase() === 'post') {
    return `Create${resource}Dto`;
  } else if (method.toLowerCase() === 'put' || method.toLowerCase() === 'patch') {
    return `Update${resource}Dto`;
  } else {
    return `${resource}Dto`;
  }
}

/**
 * Generate OpenAPI decorators
 */
function generateDecorators(endpoint: BeEndpoint): string[] {
  const decorators: string[] = [];
  const method = endpoint.method.toLowerCase();
  const summary = generateOperationSummary(method, endpoint.normalized_path);
  const dtoName = generateDtoName(endpoint.normalized_path, method);
  
  // ApiOperation
  decorators.push(`@ApiOperation({ summary: '${summary}' })`);
  
  // ApiTags (from module)
  const module = extractModule(endpoint.controller_file);
  decorators.push(`@ApiTags('${module}')`);
  
  // ApiParam for path parameters
  const params = endpoint.normalized_path.match(/\{(\w+)\}/g);
  if (params) {
    params.forEach(param => {
      const paramName = param.replace(/[{}]/g, '');
      decorators.push(`@ApiParam({ name: '${paramName}', description: '${paramName} ID' })`);
    });
  }
  
  // ApiResponse
  if (method === 'get') {
    decorators.push(`@ApiResponse({ status: 200, description: 'Success', type: ${dtoName} })`);
    decorators.push(`@ApiResponse({ status: 404, description: 'Not found' })`);
  } else if (method === 'post') {
    decorators.push(`@ApiResponse({ status: 201, description: 'Created', type: ${dtoName} })`);
    decorators.push(`@ApiResponse({ status: 400, description: 'Bad request' })`);
  } else if (method === 'put' || method === 'patch') {
    decorators.push(`@ApiResponse({ status: 200, description: 'Updated', type: ${dtoName} })`);
    decorators.push(`@ApiResponse({ status: 404, description: 'Not found' })`);
  } else if (method === 'delete') {
    decorators.push(`@ApiResponse({ status: 200, description: 'Deleted' })`);
    decorators.push(`@ApiResponse({ status: 404, description: 'Not found' })`);
  }
  
  // Common error responses
  decorators.push(`@ApiResponse({ status: 401, description: 'Unauthorized' })`);
  
  return decorators;
}

/**
 * Determine DTOs needed
 */
function determineDtosNeeded(endpoint: BeEndpoint): string[] {
  const dtos: string[] = [];
  const method = endpoint.method.toLowerCase();
  
  if (method === 'post' || method === 'put' || method === 'patch') {
    const dtoName = generateDtoName(endpoint.normalized_path, method);
    dtos.push(dtoName);
  }
  
  // Response DTO
  const responseDtoName = generateDtoName(endpoint.normalized_path, 'get');
  dtos.push(responseDtoName);
  
  return dtos;
}

/**
 * Determine priority based on endpoint characteristics
 */
function determinePriority(endpoint: BeEndpoint): 'HIGH' | 'MEDIUM' | 'LOW' {
  const path = endpoint.normalized_path.toLowerCase();
  
  // High priority: Admin, Auth, Payments, Orders
  if (
    path.includes('/admin/') ||
    path.includes('/auth/') ||
    path.includes('/payment') ||
    path.includes('/order')
  ) {
    return 'HIGH';
  }
  
  // Medium priority: Users, Vendors, Drivers
  if (
    path.includes('/user') ||
    path.includes('/vendor') ||
    path.includes('/driver')
  ) {
    return 'MEDIUM';
  }
  
  // Low priority: everything else
  return 'LOW';
}

/**
 * Generate documentation fix
 */
function generateDocumentationFix(endpoint: BeEndpoint): DocumentationFix {
  return {
    endpoint,
    controllerPath: endpoint.controller_file,
    decorators: generateDecorators(endpoint),
    dtoNeeded: determineDtosNeeded(endpoint),
    priority: determinePriority(endpoint),
    module: extractModule(endpoint.controller_file),
  };
}

/**
 * Generate markdown report
 */
function generateMarkdownReport(analysis: AnalysisResult): string {
  let md = `# Backend Endpoints Documentation Report - BTW-BE-006\n\n`;
  md += `**Generated:** ${analysis.timestamp}\n`;
  md += `**Total Undocumented:** ${analysis.totalUndocumented}\n\n`;
  
  md += `## Summary by Module\n\n`;
  md += `| Module | Count |\n`;
  md += `|--------|-------|\n`;
  Object.entries(analysis.byModule)
    .sort((a, b) => b[1] - a[1])
    .forEach(([module, count]) => {
      md += `| ${module} | ${count} |\n`;
    });
  md += `\n`;
  
  md += `## Summary by HTTP Method\n\n`;
  md += `| Method | Count |\n`;
  md += `|--------|-------|\n`;
  Object.entries(analysis.byMethod).forEach(([method, count]) => {
    md += `| ${method} | ${count} |\n`;
  });
  md += `\n`;
  
  // Group by module
  const byModule = new Map<string, DocumentationFix[]>();
  analysis.fixes.forEach(fix => {
    if (!byModule.has(fix.module)) {
      byModule.set(fix.module, []);
    }
    byModule.get(fix.module)!.push(fix);
  });
  
  md += `## Fixes by Module\n\n`;
  
  Array.from(byModule.entries())
    .sort((a, b) => b[1].length - a[1].length)
    .forEach(([module, fixes]) => {
      md += `### Module: ${module} (${fixes.length} endpoints)\n\n`;
      
      fixes.forEach((fix, index) => {
        md += `#### ${index + 1}. ${fix.endpoint.method} ${fix.endpoint.path}\n\n`;
        md += `**File:** \`${fix.controllerPath}\`\n`;
        md += `**Priority:** ${fix.priority}\n\n`;
        
        md += `**Add these decorators:**\n\n\`\`\`typescript\n`;
        fix.decorators.forEach(dec => {
          md += `${dec}\n`;
        });
        md += `\`\`\`\n\n`;
        
        if (fix.dtoNeeded.length > 0) {
          md += `**DTOs needed:**\n`;
          fix.dtoNeeded.forEach(dto => {
            md += `- \`${dto}\`\n`;
          });
          md += `\n`;
        }
        
        md += `---\n\n`;
      });
    });
  
  md += `## Action Plan\n\n`;
  md += `1. Add OpenAPI decorators to all endpoints\n`;
  md += `2. Create missing DTO classes\n`;
  md += `3. Run \`npm run audit:openapi\` to regenerate spec\n`;
  md += `4. Verify in Swagger UI: http://localhost:3000/api/docs\n`;
  md += `5. Run contract tests: \`npm run test:contract\`\n`;
  md += `6. Regenerate typed clients\n\n`;
  
  md += `## Quick Commands\n\n`;
  md += `\`\`\`bash\n`;
  md += `# Check current status\n`;
  md += `npm run audit:parity\n\n`;
  md += `# After adding decorators, regenerate OpenAPI\n`;
  md += `npm run audit:openapi\n\n`;
  md += `# Verify with contract tests\n`;
  md += `npm run test:contract\n\n`;
  md += `# Update typed clients for frontends\n`;
  md += `./scripts/generate-typed-clients.sh\n`;
  md += `\`\`\`\n`;
  
  return md;
}

/**
 * Generate automated patch script
 */
function generatePatchScript(analysis: AnalysisResult): string {
  let script = `#!/bin/bash\n`;
  script += `# Auto-generated script to add OpenAPI decorators\n`;
  script += `# Review before executing!\n\n`;
  script += `set -e\n\n`;
  
  script += `echo "⚠️  This script will modify controller files"\n`;
  script += `echo "Make sure you have committed your changes first!"\n`;
  script += `read -p "Continue? (y/n) " -n 1 -r\n`;
  script += `echo\n`;
  script += `if [[ ! $REPLY =~ ^[Yy]$ ]]; then\n`;
  script += `    exit 1\n`;
  script += `fi\n\n`;
  
  const byFile = new Map<string, DocumentationFix[]>();
  analysis.fixes.forEach(fix => {
    if (!byFile.has(fix.controllerPath)) {
      byFile.set(fix.controllerPath, []);
    }
    byFile.get(fix.controllerPath)!.push(fix);
  });
  
  script += `echo "🔧 Adding OpenAPI decorators to ${byFile.size} files..."\n\n`;
  
  byFile.forEach((fixes, file) => {
    script += `# ${file}\n`;
    script += `echo "Processing ${file}..."\n`;
    script += `# TODO: Add decorators manually or use AST transformation\n\n`;
  });
  
  script += `echo "✅ Done! Run 'npm run audit:openapi' to regenerate spec"\n`;
  
  return script;
}

/**
 * Main execution
 */
function main(): void {
  console.log('📝 BThwani Backend Endpoints Documenter - BTW-BE-006');
  console.log('==================================================\n');

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
  
  // Get code-only endpoints (BE-006 action items)
  const action = pack.actions?.find((a: any) => a.id === 'BTW-BE-006');
  const endpoints: BeEndpoint[] = action?.items || [];

  console.log(`📊 Found ${endpoints.length} undocumented backend endpoints\n`);

  if (endpoints.length === 0) {
    console.log('✅ No undocumented endpoints found!');
    return;
  }

  // Generate fixes
  const fixes = endpoints.map(generateDocumentationFix);

  // Statistics
  const byModule: Record<string, number> = {};
  const byMethod: Record<string, number> = {};
  
  fixes.forEach(fix => {
    byModule[fix.module] = (byModule[fix.module] || 0) + 1;
    byMethod[fix.endpoint.method] = (byMethod[fix.endpoint.method] || 0) + 1;
  });

  const analysis: AnalysisResult = {
    timestamp: new Date().toISOString(),
    totalUndocumented: endpoints.length,
    byModule,
    byMethod,
    fixes,
  };

  // Print summary
  console.log('📋 SUMMARY');
  console.log('==========');
  console.log('\nBy Module:');
  Object.entries(byModule)
    .sort((a, b) => b[1] - a[1])
    .forEach(([module, count]) => {
      console.log(`  ${module}: ${count}`);
    });
  
  console.log('\nBy Method:');
  Object.entries(byMethod).forEach(([method, count]) => {
    console.log(`  ${method}: ${count}`);
  });
  console.log('');

  // Save reports
  const reportsDir = path.resolve(__dirname, '../reports');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  // JSON report
  const jsonPath = path.join(reportsDir, 'be_documentation_fixes.json');
  fs.writeFileSync(jsonPath, JSON.stringify(analysis, null, 2));
  console.log(`💾 JSON report saved: ${jsonPath}`);

  // Markdown report
  const mdReport = generateMarkdownReport(analysis);
  const mdPath = path.join(reportsDir, 'be_documentation_fixes.md');
  fs.writeFileSync(mdPath, mdReport);
  console.log(`💾 Markdown report saved: ${mdPath}`);

  // Patch script
  const patchScript = generatePatchScript(analysis);
  const scriptPath = path.join(reportsDir, 'add-openapi-decorators.sh');
  fs.writeFileSync(scriptPath, patchScript);
  fs.chmodSync(scriptPath, '755');
  console.log(`💾 Patch script saved: ${scriptPath}`);

  console.log('\n✅ Analysis complete!');
  console.log('\n📝 Next steps:');
  console.log('   1. Review reports/be_documentation_fixes.md');
  console.log('   2. Add OpenAPI decorators to controllers');
  console.log('   3. Create missing DTO classes');
  console.log('   4. Run: npm run audit:openapi');
  console.log('   5. Verify in Swagger UI');
  console.log('   6. Run: npm run test:contract\n');
}

main();

