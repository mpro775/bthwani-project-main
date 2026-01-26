#!/usr/bin/env ts-node
/**
 * Queues - Jobs Inventory
 *
 * Inventories all queue processors, jobs, and events
 * Generates: reports/jobs_inventory.csv
 */

import * as fs from 'fs';
import * as path from 'path';
import * as ts from 'typescript';

interface JobInfo {
  processor: string;
  queueName: string;
  jobName: string;
  jobType: string;
  dataInterface?: string;
  file: string;
  line: number;
  hasOnActive: boolean;
  hasOnCompleted: boolean;
  hasOnFailed: boolean;
}

interface QueueInfo {
  name: string;
  registeredIn: string;
  line: number;
}

interface JobsInventoryReport {
  queues: QueueInfo[];
  jobs: JobInfo[];
}

/**
 * Parse TypeScript file to extract job information
 */
function parseProcessorFile(filePath: string): JobInfo[] {
  const jobs: JobInfo[] = [];
  const sourceCode = fs.readFileSync(filePath, 'utf-8');
  const sourceFile = ts.createSourceFile(
    filePath,
    sourceCode,
    ts.ScriptTarget.Latest,
    true,
  );

  let processorName = '';
  let queueName = '';
  let hasOnActive = false;
  let hasOnCompleted = false;
  let hasOnFailed = false;

  function visit(node: ts.Node) {
    // Find @Processor decorator to get queue name
    if (ts.isDecorator(node)) {
      const decorator = node;
      if (
        ts.isCallExpression(decorator.expression) &&
        ts.isIdentifier(decorator.expression.expression)
      ) {
        const decoratorName = decorator.expression.expression.text;
        if (decoratorName === 'Processor') {
          const args = decorator.expression.arguments;
          if (args.length > 0 && ts.isStringLiteral(args[0])) {
            queueName = args[0].text;
          }
        }
      }
    }

    // Find class declaration to get processor name
    if (ts.isClassDeclaration(node) && node.name) {
      processorName = node.name.text;
    }

    // Find @Process decorators to get job names
    if (ts.isMethodDeclaration(node)) {
      const methodName = node.name.getText(sourceFile);
      
      // Check for lifecycle hooks
      if (methodName === 'onActive') hasOnActive = true;
      if (methodName === 'onCompleted') hasOnCompleted = true;
      if (methodName === 'onFailed') hasOnFailed = true;

      // Find @Process decorator
      const decorators = ts.getDecorators?.(node) || (node as any).decorators || [];
      if (decorators && decorators.length > 0) {
        for (const decorator of decorators) {
          if (
            ts.isCallExpression(decorator.expression) &&
            ts.isIdentifier(decorator.expression.expression) &&
            decorator.expression.expression.text === 'Process'
          ) {
            const args = decorator.expression.arguments;
            if (args.length > 0 && ts.isStringLiteral(args[0])) {
              const jobName = args[0].text;
              
              // Try to extract data interface from Job<T>
              let dataInterface: string | undefined;
              if (node.parameters.length > 0) {
                const param = node.parameters[0];
                if (param.type && ts.isTypeReferenceNode(param.type)) {
                  const typeName = param.type.typeName.getText(sourceFile);
                  if (typeName === 'Job' && param.type.typeArguments && param.type.typeArguments.length > 0) {
                    dataInterface = param.type.typeArguments[0].getText(sourceFile);
                  }
                }
              }

              jobs.push({
                processor: processorName,
                queueName: queueName,
                jobName: jobName,
                jobType: methodName,
                dataInterface,
                file: filePath.replace(/\\/g, '/').replace(process.cwd().replace(/\\/g, '/') + '/', ''),
                line: sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1,
                hasOnActive,
                hasOnCompleted,
                hasOnFailed,
              });
            }
          }
        }
      }
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return jobs;
}

/**
 * Parse queues.module.ts to extract registered queues
 */
function parseQueuesModule(filePath: string): QueueInfo[] {
  const queues: QueueInfo[] = [];
  
  if (!fs.existsSync(filePath)) {
    return queues;
  }

  const sourceCode = fs.readFileSync(filePath, 'utf-8');
  const sourceFile = ts.createSourceFile(
    filePath,
    sourceCode,
    ts.ScriptTarget.Latest,
    true,
  );

  function visit(node: ts.Node) {
    // Look for BullModule.registerQueue calls
    if (
      ts.isCallExpression(node) &&
      ts.isPropertyAccessExpression(node.expression) &&
      node.expression.name.text === 'registerQueue'
    ) {
      // Extract queue names from arguments
      node.arguments.forEach((arg) => {
        if (ts.isObjectLiteralExpression(arg)) {
          arg.properties.forEach((prop) => {
            if (
              ts.isPropertyAssignment(prop) &&
              ts.isIdentifier(prop.name) &&
              prop.name.text === 'name' &&
              ts.isStringLiteral(prop.initializer)
            ) {
              queues.push({
                name: prop.initializer.text,
                registeredIn: filePath.replace(/\\/g, '/').replace(process.cwd().replace(/\\/g, '/') + '/', ''),
                line: sourceFile.getLineAndCharacterOfPosition(prop.getStart()).line + 1,
              });
            }
          });
        }
      });
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return queues;
}

/**
 * Scan all processor files
 */
function scanProcessors(): JobInfo[] {
  const allJobs: JobInfo[] = [];
  const processorsPath = path.join(process.cwd(), 'src/queues/processors');

  if (!fs.existsSync(processorsPath)) {
    return allJobs;
  }

  const files = fs.readdirSync(processorsPath);
  
  for (const file of files) {
    if (file.endsWith('.processor.ts')) {
      const filePath = path.join(processorsPath, file);
      const jobs = parseProcessorFile(filePath);
      allJobs.push(...jobs);
    }
  }

  return allJobs;
}

/**
 * Generate CSV report
 */
function generateCSV(report: JobsInventoryReport): string {
  let csv = '';

  // Queues section
  csv += 'REGISTERED QUEUES\n';
  csv += 'Queue Name,Registered In,Line\n';
  
  report.queues.forEach((queue) => {
    csv += `"${queue.name}","${queue.registeredIn}",${queue.line}\n`;
  });

  csv += '\n';

  // Jobs section
  csv += 'QUEUE JOBS\n';
  csv += 'Processor,Queue Name,Job Name,Job Type,Data Interface,File,Line,OnActive,OnCompleted,OnFailed\n';
  
  report.jobs.forEach((job) => {
    csv += `"${job.processor}","${job.queueName}","${job.jobName}","${job.jobType}","${job.dataInterface || 'N/A'}","${job.file}",${job.line},${job.hasOnActive ? 'Yes' : 'No'},${job.hasOnCompleted ? 'Yes' : 'No'},${job.hasOnFailed ? 'Yes' : 'No'}\n`;
  });

  csv += '\n';

  // Summary section
  csv += 'SUMMARY\n';
  csv += 'Metric,Count\n';
  csv += `"Total Queues",${report.queues.length}\n`;
  csv += `"Total Jobs",${report.jobs.length}\n`;
  csv += `"Total Processors",${new Set(report.jobs.map(j => j.processor)).size}\n`;
  csv += `"Jobs with OnActive Hook",${report.jobs.filter(j => j.hasOnActive).length}\n`;
  csv += `"Jobs with OnCompleted Hook",${report.jobs.filter(j => j.hasOnCompleted).length}\n`;
  csv += `"Jobs with OnFailed Hook",${report.jobs.filter(j => j.hasOnFailed).length}\n`;

  return csv;
}

/**
 * Generate Markdown summary
 */
function generateMarkdownSummary(report: JobsInventoryReport): string {
  let md = `# Queue Jobs Inventory\n\n`;
  md += `**Generated:** ${new Date().toLocaleString('ar-SA')}\n\n`;
  md += `---\n\n`;

  // Summary
  md += `## 📊 Summary\n\n`;
  md += `| Metric | Count |\n`;
  md += `|--------|-------|\n`;
  md += `| **Total Queues** | ${report.queues.length} |\n`;
  md += `| **Total Jobs** | ${report.jobs.length} |\n`;
  md += `| **Total Processors** | ${new Set(report.jobs.map(j => j.processor)).size} |\n`;
  md += `| **Jobs with Lifecycle Hooks** | ${report.jobs.filter(j => j.hasOnActive || j.hasOnCompleted || j.hasOnFailed).length} |\n\n`;

  // Queues
  md += `## 📋 Registered Queues\n\n`;
  md += `| Queue Name | Registered In | Line |\n`;
  md += `|------------|---------------|------|\n`;
  report.queues.forEach((queue) => {
    md += `| \`${queue.name}\` | \`${queue.registeredIn}\` | ${queue.line} |\n`;
  });
  md += `\n`;

  // Jobs by Queue
  md += `## 🔧 Jobs by Queue\n\n`;
  const jobsByQueue = report.jobs.reduce((acc, job) => {
    if (!acc[job.queueName]) {
      acc[job.queueName] = [];
    }
    acc[job.queueName].push(job);
    return acc;
  }, {} as Record<string, JobInfo[]>);

  Object.entries(jobsByQueue).forEach(([queueName, jobs]) => {
    md += `### Queue: \`${queueName}\` (${jobs.length} jobs)\n\n`;
    md += `| Job Name | Processor | Data Interface | Hooks | File |\n`;
    md += `|----------|-----------|----------------|-------|------|\n`;
    
    jobs.forEach((job) => {
      const hooks: string[] = [];
      if (job.hasOnActive) hooks.push('Active');
      if (job.hasOnCompleted) hooks.push('Completed');
      if (job.hasOnFailed) hooks.push('Failed');
      const hooksStr = hooks.length > 0 ? hooks.join(', ') : 'None';
      
      md += `| \`${job.jobName}\` | ${job.processor} | \`${job.dataInterface || 'N/A'}\` | ${hooksStr} | \`${job.file}:${job.line}\` |\n`;
    });
    md += `\n`;
  });

  // Processors
  md += `## 🏭 Processors\n\n`;
  const processorGroups = report.jobs.reduce((acc, job) => {
    if (!acc[job.processor]) {
      acc[job.processor] = {
        queueName: job.queueName,
        jobs: [],
        hasOnActive: job.hasOnActive,
        hasOnCompleted: job.hasOnCompleted,
        hasOnFailed: job.hasOnFailed,
        file: job.file,
      };
    }
    acc[job.processor].jobs.push(job.jobName);
    return acc;
  }, {} as Record<string, any>);

  md += `| Processor | Queue | Jobs Count | Lifecycle Hooks | File |\n`;
  md += `|-----------|-------|------------|-----------------|------|\n`;
  
  Object.entries(processorGroups).forEach(([processor, info]) => {
    const hooks: string[] = [];
    if (info.hasOnActive) hooks.push('✅ Active');
    if (info.hasOnCompleted) hooks.push('✅ Completed');
    if (info.hasOnFailed) hooks.push('✅ Failed');
    const hooksStr = hooks.length > 0 ? hooks.join('<br>') : '❌ None';
    
    md += `| **${processor}** | \`${info.queueName}\` | ${info.jobs.length} | ${hooksStr} | \`${info.file}\` |\n`;
  });
  md += `\n`;

  md += `---\n\n`;
  md += `*Full details available in \`jobs_inventory.csv\`*\n`;

  return md;
}

/**
 * Main execution
 */
async function main() {
  console.log('🔧 Queues - Jobs Inventory\n');
  console.log('Scanning queue processors and jobs...\n');

  // Parse queues module
  const queuesModulePath = path.join(process.cwd(), 'src/queues/queues.module.ts');
  const queues = parseQueuesModule(queuesModulePath);
  console.log(`✅ Found ${queues.length} registered queues`);

  // Scan all processors
  const jobs = scanProcessors();
  console.log(`✅ Found ${jobs.length} jobs across ${new Set(jobs.map(j => j.processor)).size} processors`);

  // Create report
  const report: JobsInventoryReport = {
    queues,
    jobs,
  };

  // Save reports
  const reportsDir = path.join(process.cwd(), 'reports');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  // Save CSV
  const csv = generateCSV(report);
  const csvPath = path.join(reportsDir, 'jobs_inventory.csv');
  fs.writeFileSync(csvPath, csv, 'utf-8');
  console.log(`\n✅ CSV report saved: ${csvPath}`);

  // Save JSON (for reference)
  const jsonPath = path.join(reportsDir, 'jobs_inventory.json');
  fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2), 'utf-8');
  console.log(`✅ JSON report saved: ${jsonPath}`);

  // Save Markdown summary
  const markdown = generateMarkdownSummary(report);
  const mdPath = path.join(reportsDir, 'jobs_inventory.md');
  fs.writeFileSync(mdPath, markdown, 'utf-8');
  console.log(`✅ Markdown summary saved: ${mdPath}`);

  // Display summary
  console.log('\n📊 Jobs Inventory Summary:');
  console.log(`   Queues: ${queues.length}`);
  console.log(`   Jobs: ${jobs.length}`);
  console.log(`   Processors: ${new Set(jobs.map(j => j.processor)).size}`);
  
  // Group jobs by queue
  const jobsByQueue = jobs.reduce((acc, job) => {
    acc[job.queueName] = (acc[job.queueName] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  console.log('\n📋 Jobs per Queue:');
  Object.entries(jobsByQueue).forEach(([queue, count]) => {
    console.log(`   ${queue}: ${count} jobs`);
  });

  console.log('\n✨ Jobs inventory complete!\n');
  process.exit(0);
}

// Run the script
main().catch((error) => {
  console.error('❌ Error:', error);
  process.exit(1);
});

