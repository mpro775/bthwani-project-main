#!/usr/bin/env node
/**
 * BTW-AUD-002: Route Uniqueness Guard v2
 * Validates routes INCLUDING controller prefix
 */

const fs = require('fs');
const path = require('path');

function normalizePath(routePath) {
  return routePath
    .replace(/:(\w+)/g, '{$1}')
    .replace(/\{(\w+)\?\}/g, '{$1}')
    .toLowerCase()
    .replace(/\/$/, '')
    .replace(/^\/+/, '/');
}

function getRouteKey(method, normalizedPath) {
  return `${method.toUpperCase()}:${normalizedPath}`;
}

function extractControllerPrefix(content) {
  // Match @Controller('prefix') or @Controller({ path: 'prefix' })
  const match1 = content.match(/@Controller\(['\"]([^'\"]+)['\"]\)/);
  if (match1) return match1[1];
  
  const match2 = content.match(/@Controller\(\s*{\s*path:\s*['\"]([^'\"]+)['\"]/);
  if (match2) return match2[1];
  
  return '';
}

function scanFile(filePath) {
  const routes = [];
  
  if (!filePath.endsWith('.ts') || filePath.includes('.spec.') || filePath.includes('.test.')) {
    return routes;
  }

  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    
    // Extract controller prefix
    const prefix = extractControllerPrefix(content);
    
    // Regex patterns for route decorators
    const decoratorPattern = /@(Get|Post|Put|Patch|Delete)\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/gi;
    
    lines.forEach((line, index) => {
      let match;
      while ((match = decoratorPattern.exec(line)) !== null) {
        const method = match[1].toUpperCase();
        const routePath = match[2];
        
        // Combine prefix with route path
        const fullPath = prefix ? `/${prefix}/${routePath}`.replace(/\/+/g, '/') : `/${routePath}`;
        const normalized = normalizePath(fullPath);
        
        routes.push({
          method,
          path: routePath,
          fullPath,
          normalizedPath: normalized,
          file: filePath,
          line: index + 1,
          prefix
        });
      }
    });
  } catch (error) {
    console.error(`Error scanning file ${filePath}:`, error.message);
  }

  return routes;
}

function scanDirectory(dirPath, routes = []) {
  const excludeDirs = ['node_modules', 'dist', 'coverage', '.git', 'test', '__tests__'];
  
  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    
    entries.forEach(entry => {
      const fullPath = path.join(dirPath, entry.name);
      
      if (entry.isDirectory()) {
        if (!excludeDirs.includes(entry.name)) {
          scanDirectory(fullPath, routes);
        }
      } else if (entry.isFile()) {
        const fileRoutes = scanFile(fullPath);
        routes.push(...fileRoutes);
      }
    });
  } catch (error) {
    // Ignore
  }
  
  return routes;
}

function findDuplicates(routes) {
  const routeMap = new Map();
  
  // Group routes by key
  routes.forEach(route => {
    const key = getRouteKey(route.method, route.normalizedPath);
    if (!routeMap.has(key)) {
      routeMap.set(key, []);
    }
    routeMap.get(key).push(route);
  });
  
  // Find duplicates
  const duplicates = [];
  
  for (const [key, routeList] of routeMap.entries()) {
    if (routeList.length > 1) {
      const first = routeList[0];
      duplicates.push({
        key,
        method: first.method,
        normalizedPath: first.normalizedPath,
        occurrences: routeList.map(r => ({
          file: r.file.replace(process.cwd(), '.'),
          line: r.line,
          originalPath: r.path,
          fullPath: r.fullPath,
          prefix: r.prefix
        }))
      });
    }
  }
  
  return duplicates.sort((a, b) => a.key.localeCompare(b.key));
}

function main() {
  console.log('🔍 BThwani Route Uniqueness Guard v2 - BTW-AUD-002');
  console.log('================================================\n');

  const srcDir = path.resolve(__dirname, '../src');
  console.log(`📂 Scanning directory: ${srcDir}\n`);

  // Scan for routes
  const routes = scanDirectory(srcDir);
  console.log(`✅ Found ${routes.length} routes\n`);

  // Find duplicates
  const duplicates = findDuplicates(routes);
  
  // Create result
  const result = {
    timestamp: new Date().toISOString(),
    totalRoutes: routes.length,
    uniqueRoutes: routes.length - duplicates.reduce((sum, d) => sum + d.occurrences.length - 1, 0),
    duplicates,
    status: duplicates.length === 0 ? 'PASS' : 'FAIL'
  };

  // Print results
  console.log('📊 SCAN RESULTS');
  console.log('===============');
  console.log(`Status: ${result.status === 'PASS' ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Total routes: ${result.totalRoutes}`);
  console.log(`Unique routes: ${result.uniqueRoutes}`);
  console.log(`Duplicate keys: ${duplicates.length}\n`);

  if (duplicates.length > 0) {
    console.log('⚠️  DUPLICATE ROUTES FOUND:\n');
    
    duplicates.forEach((dup, index) => {
      console.log(`${index + 1}. ${dup.method} ${dup.normalizedPath}`);
      console.log(`   Key: ${dup.key}`);
      console.log(`   Occurrences: ${dup.occurrences.length}`);
      dup.occurrences.forEach((occ, i) => {
        console.log(`     ${i + 1}) ${occ.file}:${occ.line}`);
        console.log(`        Prefix: '${occ.prefix}' → Full: ${occ.fullPath}`);
      });
      console.log('');
    });
  } else {
    console.log('✅ No duplicate routes detected!\n');
  }

  // Save reports
  const reportsDir = path.resolve(__dirname, '../reports');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  const jsonPath = path.join(reportsDir, 'route_duplicates_v2.json');
  fs.writeFileSync(jsonPath, JSON.stringify(result, null, 2));
  console.log(`💾 Report saved to: ${jsonPath}\n`);

  // Exit with appropriate code
  process.exit(result.status === 'FAIL' ? 1 : 0);
}

main();

