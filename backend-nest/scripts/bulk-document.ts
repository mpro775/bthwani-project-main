#!/usr/bin/env ts-node
/**
 * Bulk Documentation Script
 * يضيف OpenAPI decorators بشكل سريع لعدة endpoints
 */

import * as fs from 'fs';
import * as path from 'path';

const controllersToDocument = [
  // Already documented: admin.controller.ts, auth.controller.ts
  'src/modules/order/order.controller.ts',
  'src/modules/order/order-cqrs.controller.ts',
  'src/modules/finance/finance.controller.ts',
  'src/modules/vendor/vendor.controller.ts',
  'src/modules/driver/driver.controller.ts',
  'src/modules/store/store.controller.ts',
  'src/modules/store/delivery-store.controller.ts',
  'src/modules/user/user.controller.ts',
  'src/modules/marketer/marketer.controller.ts',
  'src/modules/wallet/wallet.controller.ts',
  'src/modules/promotion/promotion.controller.ts',
  'src/modules/merchant/merchant.controller.ts',
  'src/modules/cart/cart.controller.ts',
  'src/modules/notification/notification.controller.ts',
  'src/modules/support/support.controller.ts',
  'src/modules/onboarding/onboarding.controller.ts',
  'src/modules/legal/legal.controller.ts',
  'src/modules/shift/shift.controller.ts',
  'src/modules/content/content.controller.ts',
  'src/modules/analytics/analytics.controller.ts',
  'src/modules/er/er.controller.ts',
  'src/modules/health/health.controller.ts',
  'src/modules/metrics/metrics.controller.ts',
  'src/modules/utility/utility.controller.ts',
  'src/modules/akhdimni/akhdimni.controller.ts',
];

interface EndpointInfo {
  decorator: string;
  method: string;
  path: string;
  hasApiParam: boolean;
  hasApiQuery: boolean;
  hasApiResponse: boolean;
}

function addMinimalDocumentation(filePath: string): number {
  const fullPath = path.resolve(__dirname, '..', filePath);
  let content = fs.readFileSync(fullPath, 'utf-8');
  let count = 0;

  // Check if ApiResponse is imported
  if (!content.includes('ApiResponse')) {
    content = content.replace(
      /} from '@nestjs\/swagger';/,
      ', ApiResponse, ApiParam, ApiQuery } from \'@nestjs/swagger\';'
    );
  }

  // Find all endpoints without @ApiResponse
  const lines = content.split('\n');
  const newLines: string[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    newLines.push(line);

    // Check if this is a route decorator
    if (line.match(/@(Get|Post|Put|Patch|Delete)\(/)) {
      // Check next few lines for @ApiOperation
      let hasApiOperation = false;
      let hasApiResponse = false;
      
      for (let j = i + 1; j < Math.min(i + 5, lines.length); j++) {
        if (lines[j].includes('@ApiOperation')) hasApiOperation = true;
        if (lines[j].includes('@ApiResponse')) hasApiResponse = true;
      }

      // If has operation but no response, add minimal responses
      if (hasApiOperation && !hasApiResponse) {
        // Extract method
        const methodMatch = line.match(/@(Get|Post|Put|Patch|Delete)/);
        const method = methodMatch ? methodMatch[1].toUpperCase() : 'GET';
        
        // Extract path and check for params
        const pathMatch = line.match(/\(['\"`]([^'"`]+)['\"`]\)/);
        const hasParams = pathMatch && pathMatch[1].includes(':');

        // Add param decorator if needed
        if (hasParams) {
          const params = pathMatch[1].match(/:(\w+)/g) || [];
          params.forEach(param => {
            const paramName = param.substring(1);
            newLines.push(`  @ApiParam({ name: '${paramName}', type: String })`);
            count++;
          });
        }

        // Add standard responses based on method
        if (method === 'GET') {
          newLines.push(`  @ApiResponse({ status: 200, description: 'Success' })`);
          if (hasParams) {
            newLines.push(`  @ApiResponse({ status: 404, description: 'Not found' })`);
          }
        } else if (method === 'POST') {
          newLines.push(`  @ApiResponse({ status: 201, description: 'Created' })`);
          newLines.push(`  @ApiResponse({ status: 400, description: 'Bad request' })`);
        } else if (method === 'PUT' || method === 'PATCH') {
          newLines.push(`  @ApiResponse({ status: 200, description: 'Updated' })`);
          newLines.push(`  @ApiResponse({ status: 404, description: 'Not found' })`);
          newLines.push(`  @ApiResponse({ status: 400, description: 'Bad request' })`);
        } else if (method === 'DELETE') {
          newLines.push(`  @ApiResponse({ status: 200, description: 'Deleted' })`);
          newLines.push(`  @ApiResponse({ status: 404, description: 'Not found' })`);
        }

        // Add auth responses
        newLines.push(`  @ApiResponse({ status: 401, description: 'Unauthorized' })`);
        count++;
      }
    }
  }

  // Write back
  fs.writeFileSync(fullPath, newLines.join('\n'));
  return count;
}

function main() {
  console.log('🚀 Bulk Documentation Tool\n');
  
  let totalAdded = 0;
  
  controllersToDocument.forEach(file => {
    console.log(`📝 Processing: ${file}`);
    const added = addMinimalDocumentation(file);
    console.log(`   ✅ Added documentation to ${added} endpoints\n`);
    totalAdded += added;
  });

  console.log(`\n✅ Total: Added documentation to ${totalAdded} endpoints`);
  console.log('\n📝 Next steps:');
  console.log('   npm run audit:openapi');
  console.log('   npm run audit:parity');
}

main();

