#!/usr/bin/env ts-node
/**
 * Auto-add @ApiOperation decorators to endpoints missing them
 */

import * as fs from 'fs';
import * as path from 'path';

interface Endpoint {
  method: string;
  path: string;
  controller?: string;
  handler?: string;
  file?: string;
}

// Load orphans that we want to add decorators for
function loadOrphans(): Endpoint[] {
  const csvPath = path.join(process.cwd(), '..', 'artifacts', 'fe_orphans.csv');
  if (!fs.existsSync(csvPath)) {
    console.error('❌ fe_orphans.csv not found');
    return [];
  }

  const content = fs.readFileSync(csvPath, 'utf-8');
  const lines = content.trim().split('\n').slice(1); // skip header

  return lines.map((line) => {
    const [method, pathStr] = line.split(',');
    return { method: method.trim(), path: pathStr.trim() };
  });
}

// Load backend route inventory
function loadBackendRoutes(): Map<string, Endpoint> {
  const csvPath = path.join(
    process.cwd(),
    '..',
    'artifacts',
    'route_inventory_backend.csv',
  );
  if (!fs.existsSync(csvPath)) {
    console.error('❌ route_inventory_backend.csv not found');
    return new Map();
  }

  const content = fs.readFileSync(csvPath, 'utf-8');
  const lines = content.trim().split('\n');
  const headers = lines.shift()!.split(',');

  const routes = new Map<string, Endpoint>();

  for (const line of lines) {
    const values = line.split(',');
    const route: any = {};
    headers.forEach((key, i) => {
      (route as any)[key.trim()] = (values[i] || '').trim();
    });

    const method = (route.method as string) || (route.METHOD as string);
    const pathStr = (route.path as string) || (route.PATH as string);
    const key = `${method} ${pathStr}`.toLowerCase();

    routes.set(key, {
      method,
      path: pathStr,
      controller: route.controller,
      handler: route.handler,
      file: route.file,
    });
  }

  return routes;
}

function findControllerFile(controllerName: string): string | null {
  const srcDir = path.join(process.cwd(), 'src');

  // Search for controller file
  function search(dir: string): string | null {
    if (!fs.existsSync(dir)) return null;

    const items = fs.readdirSync(dir);
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory() && item !== 'node_modules') {
        const result = search(fullPath);
        if (result) return result;
      } else if (
        item
          .toLowerCase()
          .includes(controllerName.toLowerCase().replace('controller', ''))
      ) {
        if (item.endsWith('.controller.ts')) {
          return fullPath;
        }
      }
    }
    return null;
  }

  return search(srcDir);
}

function generateSummary(methodPath: string): string {
  const [method, pathStr] = methodPath.split(' ');

  // Generate a reasonable summary based on method and path
  const parts = pathStr.split('/').filter(Boolean);
  const resource = parts[parts.length - 1] || 'resource';

  const actionMap: Record<string, string> = {
    GET: 'Get',
    POST: 'Create',
    PUT: 'Update',
    PATCH: 'Update',
    DELETE: 'Delete',
  };

  const verb = actionMap[method] || method.toLowerCase();

  // Handle special cases
  if (pathStr.includes('/me')) return 'Get current user profile';
  if (pathStr.includes('/addresses') && method === 'GET')
    return 'Get user addresses';
  if (pathStr.includes('/addresses') && method === 'POST')
    return 'Add new address';
  if (pathStr.includes('/balance')) return 'Get wallet balance';
  if (pathStr.includes('/transactions')) return 'Get wallet transactions';

  return `${verb} ${resource}`;
}

function addDecorator(
  filePath: string,
  handler: string,
  summary: string,
): boolean {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  // Find the handler method
  let handlerLineIndex = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(`${handler}(`)) {
      handlerLineIndex = i;
      break;
    }
  }

  if (handlerLineIndex === -1) {
    console.warn(`  ⚠️  Handler ${handler} not found in ${filePath}`);
    return false;
  }

  // Check if @ApiOperation already exists nearby
  for (let i = Math.max(0, handlerLineIndex - 10); i < handlerLineIndex; i++) {
    if (lines[i].includes('@ApiOperation')) {
      console.log(`  ⏭️  ${handler} already has @ApiOperation`);
      return false;
    }
  }

  // Find the right place to insert (after other decorators, before async keyword)
  let insertIndex = handlerLineIndex;
  for (
    let i = handlerLineIndex - 1;
    i >= Math.max(0, handlerLineIndex - 10);
    i--
  ) {
    const line = lines[i].trim();
    if (line.startsWith('@') || line.startsWith('//')) {
      insertIndex = i + 1;
    } else {
      break;
    }
  }

  // Insert @ApiOperation
  const indent = lines[handlerLineIndex].match(/^(\s*)/)?.[1] || '  ';
  const decorator = `${indent}@ApiOperation({ summary: '${summary}' })`;
  lines.splice(insertIndex, 0, decorator);

  // Write back
  fs.writeFileSync(filePath, lines.join('\n'));
  console.log(`  ✅ Added @ApiOperation to ${handler}()`);
  return true;
}

function main() {
  console.log('🔧 Auto-adding @ApiOperation decorators...\n');

  const orphans = loadOrphans();
  const backendRoutes = loadBackendRoutes();

  console.log(`📊 Found ${orphans.length} orphans`);
  console.log(`📊 Found ${backendRoutes.size} backend routes\n`);

  let added = 0;
  let notFound = 0;
  let skipped = 0;

  for (const orphan of orphans) {
    const key = `${orphan.method} ${orphan.path}`.toLowerCase();
    const backendRoute = backendRoutes.get(key);

    if (!backendRoute || !backendRoute.controller || !backendRoute.handler) {
      notFound++;
      continue;
    }

    const controllerFile = findControllerFile(backendRoute.controller);
    if (!controllerFile) {
      console.warn(
        `⚠️  Controller file not found for ${backendRoute.controller}`,
      );
      notFound++;
      continue;
    }

    const summary = generateSummary(`${orphan.method} ${orphan.path}`);

    if (addDecorator(controllerFile, backendRoute.handler, summary)) {
      added++;
    } else {
      skipped++;
    }
  }

  console.log('\n' + '═'.repeat(70));
  console.log(`\n✅ Added decorators: ${added}`);
  console.log(`⏭️  Skipped (already have): ${skipped}`);
  console.log(`❌ Not found in backend: ${notFound}`);
  console.log(`📊 Total orphans processed: ${orphans.length}\n`);
}

main();
