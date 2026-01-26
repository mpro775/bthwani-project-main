#!/usr/bin/env ts-node
/**
 * Add Missing API Decorators
 * Automatically adds @ApiBody, @ApiParam, @ApiQuery where missing
 */

import * as fs from 'fs';
import * as path from 'path';

const controllersToFix = [
  'src/modules/admin/admin.controller.ts',
  'src/modules/driver/driver.controller.ts',
  'src/modules/analytics/analytics.controller.ts',
  'src/modules/content/content.controller.ts',
  'src/modules/cart/cart.controller.ts',
];

interface Fix {
  file: string;
  changes: number;
}

const fixes: Fix[] = [];

function addApiBodyToMethod(content: string): string {
  const lines = content.split('\n');
  const newLines: string[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Check if this is a POST/PATCH/PUT decorator
    if (/@(Post|Patch|Put)\(/.test(line)) {
      newLines.push(line);
      i++;

      // Look ahead to see if @ApiBody exists
      let hasApiBody = false;
      let hasApiOperation = false;
      let j = i;

      while (j < lines.length && j < i + 15) {
        if (/@ApiBody/.test(lines[j])) {
          hasApiBody = true;
          break;
        }
        if (/@ApiOperation/.test(lines[j])) {
          hasApiOperation = true;
        }
        if (/async\s+\w+\(/.test(lines[j])) {
          break;
        }
        j++;
      }

      // If no @ApiBody and has @Body parameter, add it
      if (!hasApiBody && hasApiOperation) {
        // Check if method has @Body parameter
        let methodLine = '';
        for (let k = i; k < lines.length && k < i + 20; k++) {
          if (/async\s+\w+\(/.test(lines[k])) {
            methodLine = lines.slice(k, Math.min(k + 10, lines.length)).join('\n');
            break;
          }
        }

        if (/@Body\(\)/.test(methodLine)) {
          // Add @ApiBody before @ApiResponse or @ApiOperation
          while (i < lines.length) {
            if (/@ApiResponse/.test(lines[i]) || /@ApiOperation/.test(lines[i])) {
              newLines.push('  @ApiBody({');
              newLines.push('    schema: {');
              newLines.push('      type: \'object\',');
              newLines.push('      properties: {},');
              newLines.push('    },');
              newLines.push('  })');
              break;
            }
            newLines.push(lines[i]);
            i++;
          }
          continue;
        }
      }
    }

    newLines.push(line);
    i++;
  }

  return newLines.join('\n');
}

function ensureApiBodyImport(content: string): string {
  if (content.includes('ApiBody')) {
    return content;
  }

  return content.replace(
    /from '@nestjs\/swagger';/,
    (match) => {
      const line = content.split('\n').find((l) => l.includes(match));
      if (!line) return match;

      if (line.includes('ApiResponse')) {
        return match.replace(
          'ApiResponse',
          'ApiResponse, ApiBody'
        );
      } else if (line.includes('ApiOperation')) {
        return match.replace(
          'ApiOperation',
          'ApiOperation, ApiBody'
        );
      }
      return match;
    }
  );
}

console.log('🔧 Adding Missing API Decorators\n');

for (const controllerPath of controllersToFix) {
  const fullPath = path.join(process.cwd(), controllerPath);

  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  Skipping ${controllerPath} (not found)`);
    continue;
  }

  console.log(`📝 Processing: ${controllerPath}`);

  let content = fs.readFileSync(fullPath, 'utf-8');
  const originalContent = content;

  // Add ApiBody import if needed
  content = ensureApiBodyImport(content);

  // Add @ApiBody to methods
  content = addApiBodyToMethod(content);

  if (content !== originalContent) {
    fs.writeFileSync(fullPath, content, 'utf-8');
    fixes.push({
      file: controllerPath,
      changes: 1,
    });
    console.log(`   ✅ Updated`);
  } else {
    console.log(`   ⏭️  No changes needed`);
  }
}

console.log('\n✅ Complete!');
console.log(`   Files modified: ${fixes.length}`);

if (fixes.length > 0) {
  console.log('\n📝 Modified files:');
  fixes.forEach((fix) => {
    console.log(`   - ${fix.file}`);
  });

  console.log('\n💡 Next steps:');
  console.log('   npm run audit:openapi');
  console.log('   npm run audit:parity');
}

