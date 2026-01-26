#!/usr/bin/env ts-node
/**
 * Backend Inventory Audit Script
 * 
 * Scans src/modules/** to discover all Controllers, Routes, DTOs, Guards
 * Generates: reports/be_inventory.json and reports/be_inventory.csv
 */

import * as fs from 'fs';
import * as path from 'path';
import { Project, SyntaxKind, ClassDeclaration, MethodDeclaration, Decorator } from 'ts-morph';

interface RouteInfo {
  module: string;
  controller: string;
  method: string;
  path: string;
  auth_guard: string;
  dto_in: string;
  dto_out: string;
  statuses: string;
  file: string;
  line: number;
}

class BackendInventoryAuditor {
  private project: Project;
  private routes: RouteInfo[] = [];
  private modulesPath: string;

  constructor() {
    this.project = new Project({
      tsConfigFilePath: path.join(process.cwd(), 'tsconfig.json'),
      skipAddingFilesFromTsConfig: true,
    });
    this.modulesPath = path.join(process.cwd(), 'src', 'modules');
  }

  /**
   * Main audit method
   */
  async audit(): Promise<void> {
    console.log('🔍 Starting Backend Inventory Audit...\n');
    
    // Find all controller files
    const controllerFiles = this.findControllerFiles(this.modulesPath);
    console.log(`📁 Found ${controllerFiles.length} controller files\n`);

    // Process each controller file
    for (const filePath of controllerFiles) {
      this.processControllerFile(filePath);
    }

    console.log(`\n✅ Analyzed ${this.routes.length} routes\n`);

    // Generate reports
    this.generateJsonReport();
    this.generateCsvReport();

    console.log('✨ Audit complete!\n');
  }

  /**
   * Recursively find all controller files
   */
  private findControllerFiles(dir: string): string[] {
    const files: string[] = [];

    if (!fs.existsSync(dir)) {
      return files;
    }

    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        files.push(...this.findControllerFiles(fullPath));
      } else if (entry.isFile() && entry.name.endsWith('.controller.ts')) {
        files.push(fullPath);
      }
    }

    return files;
  }

  /**
   * Process a single controller file
   */
  private processControllerFile(filePath: string): void {
    const sourceFile = this.project.addSourceFileAtPath(filePath);
    const relativePath = path.relative(process.cwd(), filePath);
    const moduleName = this.extractModuleName(filePath);

    console.log(`  📄 Processing: ${relativePath}`);

    // Find all classes with @Controller decorator
    const classes = sourceFile.getClasses();

    for (const classDecl of classes) {
      const controllerDecorator = this.findDecorator(classDecl, 'Controller');
      
      if (!controllerDecorator) {
        continue;
      }

      const controllerName = classDecl.getName() || 'UnnamedController';
      const controllerPath = this.extractDecoratorPath(controllerDecorator);

      // Process all methods in the controller
      const methods = classDecl.getMethods();

      for (const method of methods) {
        const routeInfo = this.processRouteMethod(
          method,
          moduleName,
          controllerName,
          controllerPath,
          relativePath
        );

        if (routeInfo) {
          this.routes.push(routeInfo);
        }
      }
    }

    // Remove the source file to free memory
    this.project.removeSourceFile(sourceFile);
  }

  /**
   * Process a single route method
   */
  private processRouteMethod(
    method: MethodDeclaration,
    moduleName: string,
    controllerName: string,
    controllerPath: string,
    filePath: string
  ): RouteInfo | null {
    const httpMethods = ['Get', 'Post', 'Put', 'Patch', 'Delete', 'Options', 'Head'];
    let httpMethod = '';
    let routePath = '';

    // Find HTTP method decorator
    for (const methodName of httpMethods) {
      const decorator = this.findDecorator(method, methodName);
      if (decorator) {
        httpMethod = methodName.toUpperCase();
        routePath = this.extractDecoratorPath(decorator);
        break;
      }
    }

    // If no HTTP method decorator found, skip
    if (!httpMethod) {
      return null;
    }

    // Construct full path
    const fullPath = this.constructFullPath(controllerPath, routePath);

    // Get the class declaration for checking class-level decorators
    const classDecl = method.getParent() as ClassDeclaration;

    // Extract auth guards (both method-level and class-level)
    const authGuard = this.extractAuthGuards(method, classDecl);

    // Extract DTOs
    const dtoIn = this.extractInputDto(method);
    const dtoOut = this.extractOutputDto(method);

    // Extract HTTP status codes
    const statuses = this.extractHttpStatuses(method);

    // Get line number
    const line = method.getStartLineNumber();

    return {
      module: moduleName,
      controller: controllerName,
      method: httpMethod,
      path: fullPath,
      auth_guard: authGuard,
      dto_in: dtoIn,
      dto_out: dtoOut,
      statuses: statuses,
      file: filePath,
      line: line,
    };
  }

  /**
   * Extract module name from file path
   */
  private extractModuleName(filePath: string): string {
    const relativePath = path.relative(this.modulesPath, filePath);
    const parts = relativePath.split(path.sep);
    return parts[0] || 'unknown';
  }

  /**
   * Find a decorator by name
   */
  private findDecorator(
    node: ClassDeclaration | MethodDeclaration,
    name: string
  ): Decorator | undefined {
    const decorators = node.getDecorators();
    return decorators.find(dec => {
      const decoratorName = dec.getName();
      return decoratorName === name;
    });
  }

  /**
   * Extract path from decorator arguments
   */
  private extractDecoratorPath(decorator: Decorator): string {
    const args = decorator.getArguments();
    
    if (args.length === 0) {
      return '';
    }

    const firstArg = args[0];
    
    // Handle string literal
    if (firstArg.getKind() === SyntaxKind.StringLiteral) {
      return firstArg.getText().replace(/['"]/g, '');
    }

    // Handle template string
    if (firstArg.getKind() === SyntaxKind.TemplateExpression || 
        firstArg.getKind() === SyntaxKind.NoSubstitutionTemplateLiteral) {
      return firstArg.getText().replace(/`/g, '');
    }

    // Handle object literal: @Controller({ path: 'akhdimni', version: ['1', '2'] })
    if (firstArg.getKind() === SyntaxKind.ObjectLiteralExpression) {
      const objLiteral = firstArg.asKindOrThrow(SyntaxKind.ObjectLiteralExpression);
      const pathProperty = objLiteral.getProperty('path');
      
      if (pathProperty && pathProperty.getKind() === SyntaxKind.PropertyAssignment) {
        const propAssignment = pathProperty.asKindOrThrow(SyntaxKind.PropertyAssignment);
        const initializer = propAssignment.getInitializer();
        
        if (initializer && initializer.getKind() === SyntaxKind.StringLiteral) {
          return initializer.getText().replace(/['"]/g, '');
        }
      }
    }

    return '';
  }

  /**
   * Construct full route path
   */
  private constructFullPath(controllerPath: string, routePath: string): string {
    const parts: string[] = [];

    if (controllerPath) {
      parts.push(controllerPath.startsWith('/') ? controllerPath.substring(1) : controllerPath);
    }

    if (routePath) {
      parts.push(routePath.startsWith('/') ? routePath.substring(1) : routePath);
    }

    return '/' + parts.join('/');
  }

  /**
   * Extract auth guards from method and class
   */
  private extractAuthGuards(method: MethodDeclaration, classDecl?: ClassDeclaration): string {
    const guards: string[] = [];

    // First, check class-level decorators (controller-wide auth)
    if (classDecl) {
      // Check for @UseGuards at class level
      const classUseGuards = this.findDecorator(classDecl, 'UseGuards');
      if (classUseGuards) {
        const args = classUseGuards.getArguments();
        for (const arg of args) {
          const text = arg.getText();
          guards.push(`[Class] ${text}`);
        }
      }

      // Check for @Auth at class level
      const classAuth = this.findDecorator(classDecl, 'Auth');
      if (classAuth) {
        const args = classAuth.getArguments();
        if (args.length > 0) {
          guards.push(`[Class] @Auth(${args.map(a => a.getText()).join(', ')})`);
        } else {
          guards.push('[Class] @Auth');
        }
      }

      // Check for @Roles at class level
      const classRoles = this.findDecorator(classDecl, 'Roles');
      if (classRoles) {
        const args = classRoles.getArguments();
        if (args.length > 0) {
          guards.push(`[Class] @Roles(${args.map(a => a.getText()).join(', ')})`);
        }
      }

      // Check for @ApiBearerAuth at class level (indicates protected)
      const classBearerAuth = this.findDecorator(classDecl, 'ApiBearerAuth');
      if (classBearerAuth) {
        guards.push('[Class] @ApiBearerAuth');
      }
    }

    // Then, check method-level decorators (can override class)
    // Check for @UseGuards decorator
    const useGuardsDecorator = this.findDecorator(method, 'UseGuards');
    if (useGuardsDecorator) {
      const args = useGuardsDecorator.getArguments();
      for (const arg of args) {
        const text = arg.getText();
        guards.push(text);
      }
    }

    // Check for custom auth decorators
    const authDecorators = ['Auth', 'Roles', 'Public'];
    for (const decName of authDecorators) {
      const decorator = this.findDecorator(method, decName);
      if (decorator) {
        const args = decorator.getArguments();
        if (args.length > 0) {
          guards.push(`@${decName}(${args.map(a => a.getText()).join(', ')})`);
        } else {
          guards.push(`@${decName}`);
        }
      }
    }

    return guards.join(', ');
  }

  /**
   * Extract input DTO from method parameters
   */
  private extractInputDto(method: MethodDeclaration): string {
    const params = method.getParameters();
    const dtos: string[] = [];

    for (const param of params) {
      const decorators = param.getDecorators();
      
      for (const decorator of decorators) {
        const name = decorator.getName();
        
        // Check for @Body, @Query, @Param decorators
        if (name === 'Body' || name === 'Query' || name === 'Param') {
          const typeNode = param.getTypeNode();
          if (typeNode) {
            const typeName = typeNode.getText();
            dtos.push(`@${name}: ${typeName}`);
          }
        }
      }
    }

    return dtos.join(', ');
  }

  /**
   * Extract output DTO from method return type or @ApiResponse
   */
  private extractOutputDto(method: MethodDeclaration): string {
    const outputs: string[] = [];

    // Check for @ApiResponse decorator
    const decorators = method.getDecorators();
    for (const decorator of decorators) {
      const name = decorator.getName();
      
      if (name === 'ApiResponse' || name === 'ApiOkResponse' || name === 'ApiCreatedResponse') {
        const args = decorator.getArguments();
        const argText = args.map(a => a.getText()).join(', ');
        
        // Try to extract type from the decorator
        const typeMatch = argText.match(/type:\s*([A-Za-z0-9_]+)/);
        if (typeMatch) {
          outputs.push(typeMatch[1]);
        }
      }
    }

    // Check return type
    const returnType = method.getReturnType();
    const returnTypeText = returnType.getText();
    
    // Extract generic type from Promise<Type>
    const promiseMatch = returnTypeText.match(/Promise<(.+)>/);
    if (promiseMatch) {
      const innerType = promiseMatch[1];
      // Skip primitive types
      if (!['void', 'any', 'string', 'number', 'boolean'].includes(innerType)) {
        outputs.push(innerType);
      }
    }

    return outputs.join(', ');
  }

  /**
   * Extract HTTP status codes from decorators
   */
  private extractHttpStatuses(method: MethodDeclaration): string {
    const statuses: string[] = [];
    const decorators = method.getDecorators();

    for (const decorator of decorators) {
      const name = decorator.getName();
      
      // Check for @HttpCode decorator
      if (name === 'HttpCode') {
        const args = decorator.getArguments();
        if (args.length > 0) {
          statuses.push(args[0].getText());
        }
      }

      // Check for @ApiResponse with status
      if (name === 'ApiResponse' || name.startsWith('Api') && name.includes('Response')) {
        const args = decorator.getArguments();
        const argText = args.map(a => a.getText()).join(', ');
        
        const statusMatch = argText.match(/status:\s*(\d+)/);
        if (statusMatch) {
          statuses.push(statusMatch[1]);
        } else {
          // Infer from decorator name
          if (name === 'ApiOkResponse') statuses.push('200');
          if (name === 'ApiCreatedResponse') statuses.push('201');
          if (name === 'ApiNoContentResponse') statuses.push('204');
          if (name === 'ApiBadRequestResponse') statuses.push('400');
          if (name === 'ApiUnauthorizedResponse') statuses.push('401');
          if (name === 'ApiForbiddenResponse') statuses.push('403');
          if (name === 'ApiNotFoundResponse') statuses.push('404');
        }
      }
    }

    // Remove duplicates
    return [...new Set(statuses)].join(', ');
  }

  /**
   * Generate JSON report
   */
  private generateJsonReport(): void {
    const reportPath = path.join(process.cwd(), 'reports', 'be_inventory.json');
    
    // Ensure reports directory exists
    const reportsDir = path.dirname(reportPath);
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    const report = {
      generated_at: new Date().toISOString(),
      total_routes: this.routes.length,
      routes: this.routes,
    };

    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf-8');
    console.log(`📊 JSON report generated: ${reportPath}`);
  }

  /**
   * Generate CSV report
   */
  private generateCsvReport(): void {
    const reportPath = path.join(process.cwd(), 'reports', 'be_inventory.csv');
    
    // CSV header
    const headers = [
      'module',
      'controller',
      'method',
      'path',
      'auth_guard',
      'dto_in',
      'dto_out',
      'statuses',
      'file',
      'line',
    ];

    const rows: string[] = [headers.join(',')];

    // Add data rows
    for (const route of this.routes) {
      const row = [
        this.escapeCsv(route.module),
        this.escapeCsv(route.controller),
        this.escapeCsv(route.method),
        this.escapeCsv(route.path),
        this.escapeCsv(route.auth_guard),
        this.escapeCsv(route.dto_in),
        this.escapeCsv(route.dto_out),
        this.escapeCsv(route.statuses),
        this.escapeCsv(route.file),
        route.line.toString(),
      ];
      rows.push(row.join(','));
    }

    fs.writeFileSync(reportPath, rows.join('\n'), 'utf-8');
    console.log(`📊 CSV report generated: ${reportPath}`);
  }

  /**
   * Escape CSV field
   */
  private escapeCsv(value: string): string {
    if (!value) {
      return '';
    }

    // If contains comma, quote, or newline, wrap in quotes and escape quotes
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`;
    }

    return value;
  }
}

// Run the audit
const auditor = new BackendInventoryAuditor();
auditor.audit().catch(error => {
  console.error('❌ Error during audit:', error);
  process.exit(1);
});

