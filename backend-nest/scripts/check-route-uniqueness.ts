#!/usr/bin/env ts-node
/**
 * BTW-AUD-002: Route Uniqueness Guard
 * Validates that all routes are unique (METHOD + normalized_path)
 * Fails CI if duplicates are found
 * 
 * Usage: npm run audit:routes
 */

import * as fs from 'fs';
import * as path from 'path';
import * as ts from 'typescript';

interface RouteInfo {
  method: string;
  path: string;
  normalizedPath: string;
  file: string;
  line: number;
  decorator: string;
}

interface DuplicateReport {
  key: string;
  method: string;
  normalizedPath: string;
  occurrences: Array<{
    file: string;
    line: number;
    originalPath: string;
  }>;
}

interface ScanResult {
  timestamp: string;
  totalRoutes: number;
  uniqueRoutes: number;
  duplicates: DuplicateReport[];
  status: 'PASS' | 'FAIL';
}

/**
 * Normalizes route path by converting all param formats to {param}
 * Examples:
 *   /users/:id -> /users/{id}
 *   /users/:userId/posts/:postId -> /users/{userId}/posts/{postId}
 */
function normalizePath(path: string): string {
  return path
    .replace(/:(\w+)/g, '{$1}')           // :id -> {id}
    .replace(/\{(\w+)\?\}/g, '{$1}')      // {id?} -> {id}
    .toLowerCase()                         // normalize case
    .replace(/\/$/, '')                    // remove trailing slash
    .replace(/^\/+/, '/');                 // normalize leading slash
}

/**
 * Generates a unique key for METHOD + normalized_path
 */
function getRouteKey(method: string, normalizedPath: string): string {
  return `${method.toUpperCase()}:${normalizedPath}`;
}

/**
 * Extracts HTTP method from decorator name
 */
function getHttpMethod(decoratorName: string): string | null {
  const methods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'];
  const upperName = decoratorName.toUpperCase();
  
  for (const method of methods) {
    if (upperName.includes(method)) {
      return method;
    }
  }
  
  return null;
}

/**
 * Scans a TypeScript file for route definitions
 */
function scanFile(filePath: string): RouteInfo[] {
  const routes: RouteInfo[] = [];
  
  if (!filePath.endsWith('.ts') || filePath.includes('.spec.') || filePath.includes('.test.')) {
    return routes;
  }

  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const sourceFile = ts.createSourceFile(
      filePath,
      content,
      ts.ScriptTarget.Latest,
      true
    );

    function visit(node: ts.Node) {
      // Look for method decorators (@Get, @Post, etc.)
      if (ts.isMethodDeclaration(node) || ts.isPropertyDeclaration(node)) {
        const decorators = ts.getDecorators(node);
        
        if (decorators) {
          decorators.forEach((decorator) => {
            if (ts.isCallExpression(decorator.expression)) {
              const expression = decorator.expression;
              const decoratorName = expression.expression.getText(sourceFile);
              const method = getHttpMethod(decoratorName);
              
              if (method && expression.arguments.length > 0) {
                const firstArg = expression.arguments[0];
                let routePath = '';
                
                if (ts.isStringLiteral(firstArg)) {
                  routePath = firstArg.text;
                } else if (ts.isTemplateExpression(firstArg) || ts.isNoSubstitutionTemplateLiteral(firstArg)) {
                  routePath = firstArg.getText(sourceFile).replace(/[`'"]/g, '');
                }
                
                if (routePath) {
                  const normalized = normalizePath(routePath);
                  const line = sourceFile.getLineAndCharacterOfPosition(decorator.getStart(sourceFile)).line + 1;
                  
                  routes.push({
                    method,
                    path: routePath,
                    normalizedPath: normalized,
                    file: filePath,
                    line,
                    decorator: decoratorName
                  });
                }
              }
            }
          });
        }
      }

      ts.forEachChild(node, visit);
    }

    visit(sourceFile);
  } catch (error) {
    console.error(`Error scanning file ${filePath}:`, error instanceof Error ? error.message : error);
  }

  return routes;
}

/**
 * Recursively scans directory for TypeScript files
 */
function scanDirectory(dirPath: string, routes: RouteInfo[] = []): RouteInfo[] {
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

/**
 * Finds duplicate routes
 */
function findDuplicates(routes: RouteInfo[]): DuplicateReport[] {
  const routeMap = new Map<string, RouteInfo[]>();
  
  // Group routes by key
  routes.forEach(route => {
    const key = getRouteKey(route.method, route.normalizedPath);
    if (!routeMap.has(key)) {
      routeMap.set(key, []);
    }
    routeMap.get(key)!.push(route);
  });
  
  // Find duplicates
  const duplicates: DuplicateReport[] = [];
  
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
          originalPath: r.path
        }))
      });
    }
  }
  
  return duplicates.sort((a, b) => a.key.localeCompare(b.key));
}

/**
 * Generates CSV report
 */
function generateCSV(duplicates: DuplicateReport[]): string {
  const lines = ['Method,NormalizedPath,File,Line,OriginalPath'];
  
  duplicates.forEach(dup => {
    dup.occurrences.forEach(occ => {
      lines.push(`${dup.method},${dup.normalizedPath},"${occ.file}",${occ.line},${occ.originalPath}`);
    });
  });
  
  return lines.join('\n');
}

/**
 * Main execution
 */
function main(): void {
  console.log('🔍 BThwani Route Uniqueness Guard - BTW-AUD-002');
  console.log('==============================================\n');

  const srcDir = path.resolve(__dirname, '../src');
  console.log(`📂 Scanning directory: ${srcDir}\n`);

  // Scan for routes
  const routes = scanDirectory(srcDir);
  console.log(`✅ Found ${routes.length} routes\n`);

  // Find duplicates
  const duplicates = findDuplicates(routes);
  
  // Create result
  const result: ScanResult = {
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
        console.log(`     ${i + 1}) ${occ.file}:${occ.line} (${occ.originalPath})`);
      });
      console.log('');
    });

    console.log('📋 ACTION REQUIRED:');
    console.log('   1. Review duplicate routes above');
    console.log('   2. Consolidate or rename conflicting routes');
    console.log('   3. Update API documentation');
    console.log('   4. Re-run this check\n');
  } else {
    console.log('✅ No duplicate routes detected!\n');
  }

  // Save reports
  const reportsDir = path.resolve(__dirname, '../reports');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  // JSON report
  const jsonPath = path.join(reportsDir, 'route_duplicates.json');
  fs.writeFileSync(jsonPath, JSON.stringify(result, null, 2));
  console.log(`💾 JSON report saved to: ${jsonPath}`);

  // CSV report
  if (duplicates.length > 0) {
    const csvPath = path.join(reportsDir, 'route_duplicates.csv');
    fs.writeFileSync(csvPath, generateCSV(duplicates));
    console.log(`💾 CSV report saved to: ${csvPath}`);
  }

  // Exit with appropriate code
  process.exit(result.status === 'FAIL' ? 1 : 0);
}

main();

