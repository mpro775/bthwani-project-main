#!/usr/bin/env ts-node
/**
 * Extract OpenAPI Contracts
 * استخراج عقود الـ OpenAPI
 */

import * as fs from 'fs';
import * as path from 'path';

interface OpenApiEndpoint {
  method: string;
  path: string;
  summary?: string;
  operationId?: string;
  tags?: string[];
}

function findControllers(dir: string): string[] {
  const results: string[] = [];

  if (!fs.existsSync(dir)) {
    return results;
  }

  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);

    if (item === 'node_modules' || item === 'dist' || item === 'build') {
      continue;
    }

    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      results.push(...findControllers(fullPath));
    } else if (
      fullPath.endsWith('.controller.ts') &&
      !fullPath.includes('.spec.ts')
    ) {
      results.push(fullPath);
    }
  }

  return results;
}

function extractOpenApiFromController(filePath: string): OpenApiEndpoint[] {
  const endpoints: OpenApiEndpoint[] = [];
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  let controllerPrefix = '';
  let controllerTags: string[] = [];
  let version = '';

  // Extract @Controller and @ApiTags (both simple and object forms)
  const simpleControllerMatch = content.match(/@Controller\(['"]([^'"]*)['"]\)/);
  const objectControllerMatch = content.match(/@Controller\(\{\s*path:\s*['"]([^'"]+)['"](?:,\s*version:\s*['"](\d+)['"])?\s*\}\)/);
  
  if (objectControllerMatch) {
    controllerPrefix = objectControllerMatch[1] || '';
    version = objectControllerMatch[2] || '';
  } else if (simpleControllerMatch) {
    controllerPrefix = simpleControllerMatch[1] || '';
  }

  const tagsMatch = content.match(/@ApiTags\(['"]([^'"]*)['"]\)/);
  if (tagsMatch) {
    controllerTags = [tagsMatch[1]];
  }

  const httpMethods = ['Get', 'Post', 'Put', 'Patch', 'Delete'];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Look for HTTP method decorators
    for (const httpMethod of httpMethods) {
      const decoratorPattern = new RegExp(
        `@${httpMethod}\\(['"]([^'"]*)?['"]\\)`,
        'g',
      );
      const emptyDecoratorPattern = new RegExp(`@${httpMethod}\\(\\)(?!\\))`, 'g');

      const match =
        decoratorPattern.exec(line) || emptyDecoratorPattern.exec(line);

      if (match) {
        const routePath = match[1] || '';
        let summary = '';
        const operationId = '';

        // Look backwards for @ApiOperation
        for (let j = i - 1; j >= Math.max(0, i - 10); j--) {
          const apiOpMatch = lines[j].match(
            /@ApiOperation\(\{\s*summary:\s*['"]([^'"]+)['"]/,
          );
          if (apiOpMatch) {
            summary = apiOpMatch[1];
            break;
          }
        }

        // If not found backwards, look forwards (after the decorator)
        if (!summary) {
          for (let j = i + 1; j <= Math.min(i + 10, lines.length - 1); j++) {
            const apiOpMatch = lines[j].match(
              /@ApiOperation\(\{\s*summary:\s*['"]([^'"]+)['"]/,
            );
            if (apiOpMatch) {
              summary = apiOpMatch[1];
              break;
            }
          }
        }

        // Construct full path
        let fullPath = '';
        if (version) {
          fullPath = `/v${version}`;
        }
        if (controllerPrefix) {
          fullPath += `/${controllerPrefix}`;
        }
        if (routePath) {
          fullPath += `/${routePath}`;
        }
        fullPath = fullPath.replace(/\/+/g, '/').replace(/\/$/, '') || '/';

        // Normalize path params
        fullPath = fullPath.replace(/:(\w+)/g, '{$1}');

        endpoints.push({
          method: httpMethod.toUpperCase(),
          path: fullPath,
          summary,
          operationId,
          tags: controllerTags,
        });
      }
    }
  }

  return endpoints;
}

function main() {
  const srcDir = path.join(process.cwd(), 'src');
  const artifactsDir = path.join(process.cwd(), '..', 'artifacts');

  if (!fs.existsSync(artifactsDir)) {
    fs.mkdirSync(artifactsDir, { recursive: true });
  }

  const controllers = findControllers(srcDir);
  const allEndpoints: OpenApiEndpoint[] = [];

  for (const controller of controllers) {
    const endpoints = extractOpenApiFromController(controller);
    allEndpoints.push(...endpoints);
  }

  // Generate CSV
  const csvLines = ['METHOD,PATH,SUMMARY,OPERATION_ID,TAGS'];
  for (const endpoint of allEndpoints) {
    const tags = endpoint.tags?.join(';') || '';
    const summary = (endpoint.summary || '').replace(/"/g, '""');
    csvLines.push(
      `${endpoint.method},${endpoint.path},"${summary}","${endpoint.operationId || ''}","${tags}"`,
    );
  }

  const outputPath = path.join(artifactsDir, 'openapi_contracts.csv');
  fs.writeFileSync(outputPath, csvLines.join('\n'));

  console.log(
    `✅ Extracted ${allEndpoints.length} OpenAPI endpoints from ${controllers.length} controllers`,
  );
  console.log(`📄 Output: ${outputPath}`);
}

main();
