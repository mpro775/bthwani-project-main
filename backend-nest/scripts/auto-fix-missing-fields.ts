#!/usr/bin/env ts-node
/**
 * Auto-Fix Missing Fields
 * Automatically adds @ApiBody to POST/PATCH/PUT endpoints
 */

import * as fs from 'fs';
import * as path from 'path';

// Controllers to fix based on parity report
const CONTROLLERS_TO_FIX = [
  'src/modules/admin/admin.controller.ts',
  'src/modules/analytics/analytics.controller.ts',
  'src/modules/content/content.controller.ts',
  'src/modules/cart/cart.controller.ts',
  'src/modules/driver/driver.controller.ts',
  'src/modules/user/user.controller.ts',
  'src/modules/vendor/vendor.controller.ts',
  'src/modules/wallet/wallet.controller.ts',
  'src/modules/finance/finance.controller.ts',
  'src/modules/order/order.controller.ts',
];

interface Fix {
  file: string;
  endpoint: string;
  method: string;
  added: boolean;
}

const fixes: Fix[] = [];

function addApiBodyImport(content: string): string {
  if (content.includes('ApiBody')) {
    return content;
  }

  // Find the @nestjs/swagger import line
  const swaggerImportRegex = /import\s*{([^}]+)}\s*from\s*['"]@nestjs\/swagger['"]/;
  const match = content.match(swaggerImportRegex);

  if (match) {
    const imports = match[1];
    if (!imports.includes('ApiBody')) {
      const newImports = imports.trim() + ', ApiBody';
      return content.replace(swaggerImportRegex, `import { ${newImports} } from '@nestjs/swagger'`);
    }
  }

  return content;
}

function findEndpointsNeedingApiBody(content: string): Array<{ line: number; method: string; path: string }> {
  const lines = content.split('\n');
  const endpoints: Array<{ line: number; method: string; path: string }> = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check for POST/PATCH/PUT decorators
    const httpMethodMatch = line.match(/@(Post|Patch|Put)\s*\(\s*['"`]([^'"`]*)['"`]?\s*\)/);
    if (httpMethodMatch) {
      const method = httpMethodMatch[1];
      const endpointPath = httpMethodMatch[2] || '';

      // Look ahead to see if @ApiBody exists and if @Body() parameter exists
      let hasApiBody = false;
      let hasBodyParam = false;

      for (let j = i + 1; j < Math.min(i + 20, lines.length); j++) {
        if (lines[j].includes('@ApiBody')) {
          hasApiBody = true;
        }
        if (lines[j].includes('@Body()')) {
          hasBodyParam = true;
        }
        if (lines[j].includes('async ') && lines[j].includes('(')) {
          break;
        }
      }

      if (!hasApiBody && hasBodyParam) {
        endpoints.push({ line: i, method, path: endpointPath });
      }
    }
  }

  return endpoints;
}

function addApiBodyToEndpoint(content: string, lineNumber: number): string {
  const lines = content.split('\n');
  const newLines: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    newLines.push(lines[i]);

    // Add @ApiBody after the HTTP method decorator
    if (i === lineNumber) {
      const indent = lines[i].match(/^(\s*)/)?.[1] || '  ';
      newLines.push(`${indent}@ApiBody({`);
      newLines.push(`${indent}  schema: {`);
      newLines.push(`${indent}    type: 'object',`);
      newLines.push(`${indent}    properties: {`);
      newLines.push(`${indent}      // Add your properties here`);
      newLines.push(`${indent}    },`);
      newLines.push(`${indent}  },`);
      newLines.push(`${indent}}`);
    }
  }

  return newLines.join('\n');
}

console.log('🔧 Auto-Fix Missing Fields\n');

let totalFixed = 0;

for (const controllerPath of CONTROLLERS_TO_FIX) {
  const fullPath = path.join(process.cwd(), controllerPath);

  if (!fs.existsSync(fullPath)) {
    console.log(`⏭️  Skipping ${controllerPath} (not found)`);
    continue;
  }

  console.log(`📝 Processing: ${controllerPath}`);

  let content = fs.readFileSync(fullPath, 'utf-8');
  const originalContent = content;

  // Find endpoints that need @ApiBody
  const endpoints = findEndpointsNeedingApiBody(content);

  if (endpoints.length === 0) {
    console.log(`   ✅ No missing @ApiBody decorators\n`);
    continue;
  }

  console.log(`   Found ${endpoints.length} endpoints needing @ApiBody:`);

  // Add ApiBody import
  content = addApiBodyImport(content);

  // Add @ApiBody to each endpoint (in reverse order to maintain line numbers)
  for (let i = endpoints.length - 1; i >= 0; i--) {
    const endpoint = endpoints[i];
    console.log(`   - ${endpoint.method} /${endpoint.path}`);
    content = addApiBodyToEndpoint(content, endpoint.line);
    totalFixed++;

    fixes.push({
      file: controllerPath,
      endpoint: `${endpoint.method} /${endpoint.path}`,
      method: endpoint.method,
      added: true,
    });
  }

  // Write back
  fs.writeFileSync(fullPath, content, 'utf-8');
  console.log(`   ✅ Fixed ${endpoints.length} endpoints\n`);
}

console.log('\n✅ Complete!');
console.log(`   Total endpoints fixed: ${totalFixed}`);
console.log(`   Files modified: ${new Set(fixes.map(f => f.file)).size}`);

console.log('\n💡 Next steps:');
console.log('   1. Review the generated @ApiBody schemas');
console.log('   2. Add specific properties for each endpoint');
console.log('   3. Run: npm run audit:openapi');
console.log('   4. Run: npm run audit:parity');

if (totalFixed > 0) {
  console.log('\n📋 Fixed endpoints:');
  fixes.forEach((fix, i) => {
    if (i < 10) {
      console.log(`   ${i + 1}. ${fix.endpoint}`);
    }
  });
  if (fixes.length > 10) {
    console.log(`   ... and ${fixes.length - 10} more`);
  }
}

