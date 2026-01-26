#!/usr/bin/env ts-node
/**
 * Extract NestJS Routes Inventory
 * استخراج جرد المسارات من NestJS
 */

import * as fs from 'fs';
import * as path from 'path';

interface Route {
  method: string;
  path: string;
  controller: string;
  handler: string;
  file: string;
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
    } else if (fullPath.endsWith('.controller.ts') && !fullPath.includes('.spec.ts')) {
      results.push(fullPath);
    }
  }

  return results;
}

function extractRoutesFromController(filePath: string): Route[] {
  const routes: Route[] = [];
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  let controllerPrefix = '';
  let currentClass = '';
  let version = '';

  // Extract @Controller decorator (both simple and object forms)
  const simpleControllerMatch = content.match(/@Controller\(['"]([^'"]*)['"]\)/);
  const objectControllerMatch = content.match(/@Controller\(\{\s*path:\s*['"]([^'"]+)['"](?:,\s*version:\s*['"](\d+)['"])?\s*\}\)/);
  
  if (objectControllerMatch) {
    controllerPrefix = objectControllerMatch[1] || '';
    version = objectControllerMatch[2] || '';
  } else if (simpleControllerMatch) {
    controllerPrefix = simpleControllerMatch[1] || '';
  }

  // Extract class name
  const classMatch = content.match(/export\s+class\s+(\w+)/);
  if (classMatch) {
    currentClass = classMatch[1];
  }

  // Extract route decorators (with and without path parameter)
  const routePatterns = [
    /@Get\(['"]([^'"]*)['"]\)/g,
    /@Get\(\)/g,  // @Get() without parameter
    /@Post\(['"]([^'"]*)['"]\)/g,
    /@Post\(\)/g,
    /@Put\(['"]([^'"]*)['"]\)/g,
    /@Put\(\)/g,
    /@Patch\(['"]([^'"]*)['"]\)/g,
    /@Patch\(\)/g,
    /@Delete\(['"]([^'"]*)['"]\)/g,
    /@Delete\(\)/g,
  ];

  const methodMap: Record<string, string> = {
    'Get': 'GET',
    'Post': 'POST',
    'Put': 'PUT',
    'Patch': 'PATCH',
    'Delete': 'DELETE',
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    for (const pattern of routePatterns) {
      pattern.lastIndex = 0;
      const matches = [...line.matchAll(pattern)];

      for (const match of matches) {
        const decoratorName = match[0].match(/@(\w+)/)?.[1] || '';
        const routePath = match[1] || '';
        const method = methodMap[decoratorName] || decoratorName.toUpperCase();

        // Find handler function name
        let handler = 'unknown';
        for (let j = i + 1; j < Math.min(i + 5, lines.length); j++) {
          const funcMatch = lines[j].match(/(?:async\s+)?(\w+)\s*\(/);
          if (funcMatch) {
            handler = funcMatch[1];
            break;
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

        routes.push({
          method,
          path: fullPath,
          controller: currentClass,
          handler,
          file: filePath
        });
      }
    }
  }

  return routes;
}

function main() {
  const srcDir = path.join(process.cwd(), 'src');
  const artifactsDir = path.join(process.cwd(), '..', 'artifacts');

  if (!fs.existsSync(artifactsDir)) {
    fs.mkdirSync(artifactsDir, { recursive: true });
  }

  const controllers = findControllers(srcDir);
  const allRoutes: Route[] = [];

  for (const controller of controllers) {
    const routes = extractRoutesFromController(controller);
    allRoutes.push(...routes);
  }

  // Generate CSV
  const csvLines = ['method,path,controller,handler,file'];
  for (const route of allRoutes) {
    csvLines.push(
      `${route.method},${route.path},${route.controller},${route.handler},${route.file}`
    );
  }

  const outputPath = path.join(artifactsDir, 'route_inventory_backend.csv');
  fs.writeFileSync(outputPath, csvLines.join('\n'));

  console.log(`✅ Extracted ${allRoutes.length} routes from ${controllers.length} controllers`);
  console.log(`📄 Output: ${outputPath}`);
}

main();

