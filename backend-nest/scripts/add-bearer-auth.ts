#!/usr/bin/env ts-node
/**
 * Add @ApiBearerAuth() to endpoints with @Auth()
 */

import * as fs from 'fs';
import * as path from 'path';

const CONTROLLERS_TO_FIX = [
  'src/modules/order/order.controller.ts',
  'src/modules/store/store.controller.ts',
  'src/modules/health/health.controller.ts',
  'src/modules/utility/utility.controller.ts',
  'src/modules/er/er.controller.ts',
];

function addApiBearerAuth(content: string): string {
  const lines = content.split('\n');
  const newLines: string[] = [];
  let added = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    newLines.push(line);

    // If this line has @Auth decorator
    if (/@Auth\(/.test(line)) {
      // Look ahead to see if @ApiBearerAuth exists
      let hasApiBearerAuth = false;

      for (let j = i - 5; j <= i + 5 && j < lines.length; j++) {
        if (j >= 0 && /@ApiBearerAuth/.test(lines[j])) {
          hasApiBearerAuth = true;
          break;
        }
      }

      if (!hasApiBearerAuth) {
        const indent = line.match(/^(\s*)/)?.[1] || '  ';
        newLines.push(`${indent}@ApiBearerAuth()`);
        added++;
      }
    }
  }

  if (added > 0) {
    // Ensure ApiBearerAuth is imported
    const importRegex = /import\s*{([^}]+)}\s*from\s*['"]@nestjs\/swagger['"]/;
    const match = content.match(importRegex);

    if (match && !match[1].includes('ApiBearerAuth')) {
      const imports = match[1];
      const newImports = imports.trim() + ', ApiBearerAuth';
      content = newLines.join('\n');
      return content.replace(importRegex, `import { ${newImports} } from '@nestjs/swagger'`);
    }
  }

  return newLines.join('\n');
}

console.log('🔐 Adding @ApiBearerAuth() to Protected Endpoints\n');

let totalAdded = 0;
let filesModified = 0;

for (const controllerPath of CONTROLLERS_TO_FIX) {
  const fullPath = path.join(process.cwd(), controllerPath);

  if (!fs.existsSync(fullPath)) {
    console.log(`⏭️  Skip: ${controllerPath} (not found)`);
    continue;
  }

  console.log(`📝 Processing: ${controllerPath}`);

  let content = fs.readFileSync(fullPath, 'utf-8');
  const originalContent = content;

  content = addApiBearerAuth(content);

  if (content !== originalContent) {
    const added = (content.match(/@ApiBearerAuth/g) || []).length - (originalContent.match(/@ApiBearerAuth/g) || []).length;

    fs.writeFileSync(fullPath, content, 'utf-8');
    console.log(`   ✅ Added ${added} @ApiBearerAuth decorators\n`);

    filesModified++;
    totalAdded += added;
  } else {
    console.log(`   ⏭️  No changes needed\n`);
  }
}

console.log('═══════════════════════════');
console.log(`✅ Complete!`);
console.log(`   Files modified: ${filesModified}`);
console.log(`   @ApiBearerAuth added: ${totalAdded}`);
console.log('═══════════════════════════\n');

if (totalAdded > 0) {
  console.log('💡 Next steps:');
  console.log('   npm run audit:openapi');
  console.log('   npm run audit:parity');
}

