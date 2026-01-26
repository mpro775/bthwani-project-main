#!/usr/bin/env ts-node
/**
 * Error Taxonomy - Unified Map Check
 *
 * Reads src/common/filters/global-exception.filter.ts and extracts error code maps
 * Compares them with a standard dictionary and generates a diff report
 * Generates: reports/error_taxonomy_diff.md
 */

import * as fs from 'fs';
import * as path from 'path';
import * as ts from 'typescript';

interface ErrorCodeMap {
  [status: number]: string;
}

interface ExtractedMaps {
  errorCodes: ErrorCodeMap;
  userMessages: ErrorCodeMap;
  suggestedActions: ErrorCodeMap;
}

interface StandardTaxonomy {
  status: number;
  code: string;
  description: string;
  userMessage: string;
  suggestedAction: string;
  category: string;
}

// Standard Error Taxonomy - القاموس المعياري
const STANDARD_TAXONOMY: StandardTaxonomy[] = [
  // 4xx Client Errors
  {
    status: 400,
    code: 'BAD_REQUEST',
    description: 'Invalid request format or syntax',
    userMessage: 'البيانات المدخلة غير صحيحة',
    suggestedAction: 'يرجى التحقق من البيانات المدخلة',
    category: 'Client Error',
  },
  {
    status: 401,
    code: 'UNAUTHORIZED',
    description: 'Authentication required or failed',
    userMessage: 'يجب تسجيل الدخول أولاً',
    suggestedAction: 'يرجى تسجيل الدخول مرة أخرى',
    category: 'Client Error',
  },
  {
    status: 402,
    code: 'PAYMENT_REQUIRED',
    description: 'Payment is required to complete the action',
    userMessage: 'يتطلب الدفع لإتمام العملية',
    suggestedAction: 'يرجى إضافة رصيد إلى المحفظة',
    category: 'Client Error',
  },
  {
    status: 403,
    code: 'FORBIDDEN',
    description: 'Insufficient permissions',
    userMessage: 'ليس لديك صلاحية للوصول',
    suggestedAction: 'يرجى التواصل مع الإدارة للحصول على الصلاحيات',
    category: 'Client Error',
  },
  {
    status: 404,
    code: 'NOT_FOUND',
    description: 'Resource not found',
    userMessage: 'البيانات المطلوبة غير موجودة',
    suggestedAction: 'يرجى التحقق من المعلومات والمحاولة مرة أخرى',
    category: 'Client Error',
  },
  {
    status: 405,
    code: 'METHOD_NOT_ALLOWED',
    description: 'HTTP method not allowed for this endpoint',
    userMessage: 'الطريقة المستخدمة غير مسموحة',
    suggestedAction: 'يرجى استخدام طريقة طلب مختلفة',
    category: 'Client Error',
  },
  {
    status: 406,
    code: 'NOT_ACCEPTABLE',
    description: 'Requested format not supported',
    userMessage: 'الصيغة المطلوبة غير مدعومة',
    suggestedAction: 'يرجى تغيير نوع المحتوى المطلوب',
    category: 'Client Error',
  },
  {
    status: 408,
    code: 'REQUEST_TIMEOUT',
    description: 'Request took too long',
    userMessage: 'انتهت مهلة الطلب',
    suggestedAction: 'يرجى المحاولة مرة أخرى',
    category: 'Client Error',
  },
  {
    status: 409,
    code: 'CONFLICT',
    description: 'Resource already exists or conflicts',
    userMessage: 'البيانات موجودة مسبقاً',
    suggestedAction: 'يرجى استخدام بيانات مختلفة',
    category: 'Client Error',
  },
  {
    status: 410,
    code: 'GONE',
    description: 'Resource permanently removed',
    userMessage: 'البيانات تم حذفها نهائياً',
    suggestedAction: 'لم تعد البيانات متاحة',
    category: 'Client Error',
  },
  {
    status: 413,
    code: 'PAYLOAD_TOO_LARGE',
    description: 'Request body exceeds size limit',
    userMessage: 'حجم البيانات كبير جداً',
    suggestedAction: 'يرجى تقليل حجم البيانات المرسلة',
    category: 'Client Error',
  },
  {
    status: 415,
    code: 'UNSUPPORTED_MEDIA_TYPE',
    description: 'Media type not supported',
    userMessage: 'نوع الملف غير مدعوم',
    suggestedAction: 'يرجى استخدام نوع ملف مدعوم',
    category: 'Client Error',
  },
  {
    status: 422,
    code: 'VALIDATION_ERROR',
    description: 'Validation failed on input data',
    userMessage: 'البيانات غير صالحة',
    suggestedAction: 'يرجى مراجعة جميع الحقول المطلوبة',
    category: 'Client Error',
  },
  {
    status: 423,
    code: 'LOCKED',
    description: 'Resource is locked',
    userMessage: 'البيانات مقفلة حالياً',
    suggestedAction: 'يرجى الانتظار حتى يتم إلغاء القفل',
    category: 'Client Error',
  },
  {
    status: 429,
    code: 'TOO_MANY_REQUESTS',
    description: 'Rate limit exceeded',
    userMessage: 'تجاوزت الحد المسموح من الطلبات',
    suggestedAction: 'يرجى الانتظار قليلاً قبل المحاولة مرة أخرى',
    category: 'Client Error',
  },

  // 5xx Server Errors
  {
    status: 500,
    code: 'INTERNAL_ERROR',
    description: 'Unexpected server error',
    userMessage: 'حدث خطأ في النظام',
    suggestedAction: 'يرجى المحاولة لاحقاً أو التواصل مع الدعم الفني',
    category: 'Server Error',
  },
  {
    status: 501,
    code: 'NOT_IMPLEMENTED',
    description: 'Feature not implemented yet',
    userMessage: 'الميزة غير متوفرة حالياً',
    suggestedAction: 'هذه الميزة قيد التطوير',
    category: 'Server Error',
  },
  {
    status: 502,
    code: 'BAD_GATEWAY',
    description: 'Invalid response from upstream server',
    userMessage: 'خطأ في الاتصال مع الخدمة',
    suggestedAction: 'يرجى المحاولة مرة أخرى لاحقاً',
    category: 'Server Error',
  },
  {
    status: 503,
    code: 'SERVICE_UNAVAILABLE',
    description: 'Service temporarily unavailable',
    userMessage: 'الخدمة غير متاحة حالياً',
    suggestedAction: 'يرجى المحاولة بعد قليل',
    category: 'Server Error',
  },
  {
    status: 504,
    code: 'GATEWAY_TIMEOUT',
    description: 'Upstream server timeout',
    userMessage: 'انتهت مهلة الاتصال',
    suggestedAction: 'يرجى المحاولة مرة أخرى',
    category: 'Server Error',
  },
];

/**
 * Extract object literal from AST node
 */
function extractObjectLiteral(node: ts.Node): ErrorCodeMap {
  const result: ErrorCodeMap = {};

  if (ts.isObjectLiteralExpression(node)) {
    node.properties.forEach((prop) => {
      if (
        ts.isPropertyAssignment(prop) &&
        ts.isNumericLiteral(prop.name) &&
        ts.isStringLiteral(prop.initializer)
      ) {
        const status = parseInt(prop.name.text, 10);
        const value = prop.initializer.text;
        result[status] = value;
      }
    });
  }

  return result;
}

/**
 * Parse TypeScript file and extract error maps
 */
function extractErrorMaps(filePath: string): ExtractedMaps {
  const sourceCode = fs.readFileSync(filePath, 'utf-8');
  const sourceFile = ts.createSourceFile(
    filePath,
    sourceCode,
    ts.ScriptTarget.Latest,
    true,
  );

  const maps: ExtractedMaps = {
    errorCodes: {},
    userMessages: {},
    suggestedActions: {},
  };

  function visit(node: ts.Node) {
    // Look for variable declarations with specific names
    if (ts.isVariableDeclaration(node)) {
      const varName = node.name.getText(sourceFile);
      
      if (varName === 'codes' && node.initializer) {
        maps.errorCodes = extractObjectLiteral(node.initializer);
      } else if (varName === 'arabicMessages' && node.initializer) {
        maps.userMessages = extractObjectLiteral(node.initializer);
      } else if (varName === 'actions' && node.initializer) {
        maps.suggestedActions = extractObjectLiteral(node.initializer);
      }
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return maps;
}

/**
 * Compare extracted maps with standard taxonomy
 */
function generateDiffReport(extracted: ExtractedMaps): string {
  console.log('🔍 Analyzing error taxonomy...\n');

  let report = `# Error Taxonomy Diff Report\n\n`;
  report += `**Generated:** ${new Date().toLocaleString('ar-SA')}\n\n`;
  report += `---\n\n`;

  // Summary
  const standardStatuses = new Set(STANDARD_TAXONOMY.map((t) => t.status));
  const extractedStatuses = new Set([
    ...Object.keys(extracted.errorCodes).map(Number),
    ...Object.keys(extracted.userMessages).map(Number),
    ...Object.keys(extracted.suggestedActions).map(Number),
  ]);

  const missingStatuses = [...standardStatuses].filter(
    (s) => !extractedStatuses.has(s),
  );
  const extraStatuses = [...extractedStatuses].filter(
    (s) => !standardStatuses.has(s),
  );

  report += `## 📊 Summary\n\n`;
  report += `| Metric | Count |\n`;
  report += `|--------|-------|\n`;
  report += `| **Standard Error Codes** | ${STANDARD_TAXONOMY.length} |\n`;
  report += `| **Implemented Error Codes** | ${Object.keys(extracted.errorCodes).length} |\n`;
  report += `| **Implemented User Messages** | ${Object.keys(extracted.userMessages).length} |\n`;
  report += `| **Implemented Suggested Actions** | ${Object.keys(extracted.suggestedActions).length} |\n`;
  report += `| **Missing from Implementation** | ${missingStatuses.length} |\n`;
  report += `| **Extra in Implementation** | ${extraStatuses.length} |\n\n`;

  const coverage =
    standardStatuses.size > 0
      ? ((extractedStatuses.size / standardStatuses.size) * 100).toFixed(2)
      : '0.00';
  report += `**Coverage:** ${coverage}%\n\n`;

  const quality =
    parseFloat(coverage) >= 90
      ? '🟢 Excellent'
      : parseFloat(coverage) >= 70
        ? '🟡 Good'
        : parseFloat(coverage) >= 50
          ? '🟠 Fair'
          : '🔴 Poor';
  report += `**Quality Rating:** ${quality}\n\n`;

  report += `---\n\n`;

  // Missing Status Codes
  if (missingStatuses.length > 0) {
    report += `## ❌ Missing Status Codes (${missingStatuses.length})\n\n`;
    report += `These standard HTTP status codes are not implemented:\n\n`;
    report += `| Status | Code | Description | Category |\n`;
    report += `|--------|------|-------------|----------|\n`;

    missingStatuses.forEach((status) => {
      const std = STANDARD_TAXONOMY.find((t) => t.status === status);
      if (std) {
        report += `| ${std.status} | \`${std.code}\` | ${std.description} | ${std.category} |\n`;
      }
    });
    report += `\n`;
  }

  // Extra Status Codes
  if (extraStatuses.length > 0) {
    report += `## ➕ Extra Status Codes (${extraStatuses.length})\n\n`;
    report += `These status codes are implemented but not in the standard taxonomy:\n\n`;
    report += `| Status | Error Code | User Message | Suggested Action |\n`;
    report += `|--------|------------|--------------|------------------|\n`;

    extraStatuses.forEach((status) => {
      const code = extracted.errorCodes[status] || 'N/A';
      const message = extracted.userMessages[status] || 'N/A';
      const action = extracted.suggestedActions[status] || 'N/A';
      report += `| ${status} | \`${code}\` | ${message} | ${action} |\n`;
    });
    report += `\n`;
  }

  // Detailed Comparison
  report += `---\n\n`;
  report += `## 🔍 Detailed Comparison\n\n`;
  report += `Comparing implemented error maps with standard taxonomy:\n\n`;

  // Group by category
  const categories = [...new Set(STANDARD_TAXONOMY.map((t) => t.category))];

  categories.forEach((category) => {
    const taxonomies = STANDARD_TAXONOMY.filter((t) => t.category === category);
    report += `### ${category}\n\n`;
    report += `| Status | Standard | Implemented | Match |\n`;
    report += `|--------|----------|-------------|-------|\n`;

    taxonomies.forEach((std) => {
      const hasCode = extracted.errorCodes[std.status] === std.code;
      const hasMessage = extracted.userMessages[std.status] === std.userMessage;
      const hasAction =
        extracted.suggestedActions[std.status] === std.suggestedAction;

      const implemented = hasCode && hasMessage && hasAction;
      const partial =
        (hasCode || hasMessage || hasAction) && !implemented;
      const status = implemented ? '✅' : partial ? '⚠️' : '❌';

      report += `| **${std.status}** | ${std.code} | `;
      
      if (extracted.errorCodes[std.status]) {
        report += `${extracted.errorCodes[std.status]}`;
        if (!hasCode) report += ` ⚠️`;
      } else {
        report += `❌ Missing`;
      }
      
      report += ` | ${status} |\n`;

      // Add details if there are mismatches
      if (!implemented && (hasCode || hasMessage || hasAction)) {
        if (!hasMessage && extracted.userMessages[std.status]) {
          report += `| | *User Message:* | "${extracted.userMessages[std.status]}" (expected: "${std.userMessage}") | ⚠️ |\n`;
        }
        if (!hasAction && extracted.suggestedActions[std.status]) {
          report += `| | *Suggested Action:* | "${extracted.suggestedActions[std.status]}" | ⚠️ |\n`;
        }
      }
    });

    report += `\n`;
  });

  // Recommendations
  report += `---\n\n`;
  report += `## 💡 Recommendations\n\n`;

  if (missingStatuses.length > 0) {
    report += `1. **Add ${missingStatuses.length} missing error codes** to improve API coverage\n`;
    report += `   - Status codes: ${missingStatuses.join(', ')}\n\n`;
  }

  if (extraStatuses.length > 0) {
    report += `2. **Review ${extraStatuses.length} non-standard status codes**\n`;
    report += `   - Ensure they are intentional and documented\n\n`;
  }

  const inconsistencies = STANDARD_TAXONOMY.filter((std) => {
    const hasCode = extracted.errorCodes[std.status] === std.code;
    const hasMessage = extracted.userMessages[std.status] === std.userMessage;
    const hasAction =
      extracted.suggestedActions[std.status] === std.suggestedAction;
    return (hasCode || hasMessage || hasAction) && !(hasCode && hasMessage && hasAction);
  });

  if (inconsistencies.length > 0) {
    report += `3. **Fix ${inconsistencies.length} inconsistent error definitions**\n`;
    report += `   - Ensure error codes, messages, and actions are all present and correct\n\n`;
  }

  report += `4. **Maintain consistency** with standard HTTP status code meanings\n\n`;
  report += `5. **Document custom error codes** that deviate from standards\n\n`;

  report += `---\n\n`;
  report += `*Report generated by Error Taxonomy Checker*\n`;

  return report;
}

/**
 * Main execution
 */
async function main() {
  console.log('🔍 Error Taxonomy - Unified Map Check\n');

  const filterPath = path.join(
    process.cwd(),
    'src/common/filters/global-exception.filter.ts',
  );

  if (!fs.existsSync(filterPath)) {
    console.error(`❌ Error: ${filterPath} not found`);
    process.exit(1);
  }

  console.log('📖 Reading global exception filter...');
  const extracted = extractErrorMaps(filterPath);
  console.log(`   Found ${Object.keys(extracted.errorCodes).length} error codes`);
  console.log(`   Found ${Object.keys(extracted.userMessages).length} user messages`);
  console.log(`   Found ${Object.keys(extracted.suggestedActions).length} suggested actions\n`);

  console.log('📚 Comparing with standard taxonomy...');
  console.log(`   Standard taxonomy has ${STANDARD_TAXONOMY.length} entries\n`);

  // Generate report
  const report = generateDiffReport(extracted);

  // Save report
  const reportsDir = path.join(process.cwd(), 'reports');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  const reportPath = path.join(reportsDir, 'error_taxonomy_diff.md');
  fs.writeFileSync(reportPath, report, 'utf-8');
  console.log(`✅ Report saved: ${reportPath}`);

  // Display summary
  const standardStatuses = new Set(STANDARD_TAXONOMY.map((t) => t.status));
  const extractedStatuses = new Set([
    ...Object.keys(extracted.errorCodes).map(Number),
    ...Object.keys(extracted.userMessages).map(Number),
    ...Object.keys(extracted.suggestedActions).map(Number),
  ]);

  const missingStatuses = [...standardStatuses].filter(
    (s) => !extractedStatuses.has(s),
  );

  console.log('\n📊 Summary:');
  console.log(`   Standard: ${STANDARD_TAXONOMY.length} error codes`);
  console.log(`   Implemented: ${extractedStatuses.size} error codes`);
  console.log(`   Missing: ${missingStatuses.length} error codes`);
  console.log(
    `   Coverage: ${((extractedStatuses.size / standardStatuses.size) * 100).toFixed(2)}%`,
  );

  console.log('\n✨ Error taxonomy analysis complete!\n');
  process.exit(0);
}

// Run the script
main().catch((error) => {
  console.error('❌ Error:', error);
  process.exit(1);
});

