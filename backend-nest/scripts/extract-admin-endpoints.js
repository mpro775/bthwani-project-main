const fs = require('fs');
const path = require('path');

// دالة لاستخراج المعلومات من السطر
function extractEndpointInfo(lines, startIndex) {
  const endpoint = {
    method: '',
    path: '',
    summary: '',
    roles: [],
    module: '',
    handler: '',
  };

  // البحث للخلف عن الـ decorators
  for (let i = startIndex; i >= Math.max(0, startIndex - 20); i--) {
    const line = lines[i].trim();

    // استخراج HTTP Method والـ Path
    const methodMatch = line.match(/@(Get|Post|Patch|Put|Delete)\('([^']*)'\)/);
    if (methodMatch) {
      endpoint.method = methodMatch[1].toUpperCase();
      endpoint.path = methodMatch[2];
    }

    // استخراج الـ Summary
    const summaryMatch = line.match(/summary:\s*'([^']*)'/);
    if (summaryMatch) {
      endpoint.summary = summaryMatch[1];
    }

    // استخراج الـ Roles
    const rolesMatch = line.match(/@Roles\(([^)]+)\)/);
    if (rolesMatch) {
      endpoint.roles = rolesMatch[1].split(',').map(r => r.trim().replace(/'/g, ''));
    }
  }

  // البحث للأمام عن اسم الـ handler
  for (let i = startIndex; i < Math.min(lines.length, startIndex + 5); i++) {
    const line = lines[i].trim();
    const handlerMatch = line.match(/async\s+(\w+)\(|(\w+)\(/);
    if (handlerMatch && !line.includes('@')) {
      endpoint.handler = handlerMatch[1] || handlerMatch[2];
      break;
    }
  }

  return endpoint;
}

// دالة لقراءة ملف controller واستخراج admin endpoints
function extractFromController(filePath, moduleName) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const endpoints = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // البحث عن @Roles التي تحتوي على admin
    if (line.includes("@Roles") && (line.includes("'admin'") || line.includes('"admin"'))) {
      const endpoint = extractEndpointInfo(lines, i);
      if (endpoint.method && endpoint.path) {
        endpoint.module = moduleName;
        endpoint.file = path.basename(filePath);
        endpoints.push(endpoint);
      }
    }
  }

  return endpoints;
}

// دالة رئيسية
function main() {
  const modulesDir = path.join(__dirname, '../src/modules');
  const allEndpoints = [];
  const endpointsByModule = {};

  // قراءة جميع المجلدات
  const modules = fs.readdirSync(modulesDir);

  modules.forEach(module => {
    const controllerPattern = path.join(modulesDir, module, '*.controller.ts');
    const moduleDir = path.join(modulesDir, module);

    if (fs.existsSync(moduleDir) && fs.statSync(moduleDir).isDirectory()) {
      const files = fs.readdirSync(moduleDir);
      
      files.forEach(file => {
        if (file.endsWith('.controller.ts')) {
          const filePath = path.join(moduleDir, file);
          const endpoints = extractFromController(filePath, module);
          
          if (endpoints.length > 0) {
            allEndpoints.push(...endpoints);
            
            if (!endpointsByModule[module]) {
              endpointsByModule[module] = [];
            }
            endpointsByModule[module].push(...endpoints);
          }
        }
      });
    }
  });

  // إنشاء الملف JSON
  const output = {
    generatedAt: new Date().toISOString(),
    totalEndpoints: allEndpoints.length,
    modules: Object.keys(endpointsByModule).length,
    endpointsByModule,
    allEndpoints,
    summary: {
      byModule: Object.keys(endpointsByModule).map(module => ({
        module,
        count: endpointsByModule[module].length,
      })),
      byMethod: allEndpoints.reduce((acc, ep) => {
        acc[ep.method] = (acc[ep.method] || 0) + 1;
        return acc;
      }, {}),
    },
  };

  // حفظ الملف JSON
  const jsonPath = path.join(__dirname, '../docs/admin-endpoints.json');
  fs.mkdirSync(path.dirname(jsonPath), { recursive: true });
  fs.writeFileSync(jsonPath, JSON.stringify(output, null, 2), 'utf-8');
  console.log(`✅ تم إنشاء ملف: ${jsonPath}`);
  console.log(`📊 إجمالي Admin Endpoints: ${allEndpoints.length}`);
  console.log(`📦 عدد الـ Modules: ${Object.keys(endpointsByModule).length}`);

  // إنشاء ملف Markdown
  generateMarkdownFile(output);
}

// دالة لإنشاء ملف Markdown
function generateMarkdownFile(data) {
  let md = `# Admin Endpoints Documentation\n\n`;
  md += `**Generated At:** ${new Date(data.generatedAt).toLocaleString('ar-EG')}\n\n`;
  md += `**Total Endpoints:** ${data.totalEndpoints}\n\n`;
  md += `**Modules:** ${data.modules}\n\n`;
  
  md += `## 📊 Summary by Module\n\n`;
  md += `| Module | Endpoints Count |\n`;
  md += `|--------|----------------|\n`;
  data.summary.byModule.forEach(item => {
    md += `| ${item.module} | ${item.count} |\n`;
  });
  md += `\n`;

  md += `## 📊 Summary by HTTP Method\n\n`;
  md += `| Method | Count |\n`;
  md += `|--------|-------|\n`;
  Object.entries(data.summary.byMethod).forEach(([method, count]) => {
    md += `| ${method} | ${count} |\n`;
  });
  md += `\n`;

  md += `## 📋 Endpoints by Module\n\n`;
  
  Object.entries(data.endpointsByModule).forEach(([module, endpoints]) => {
    md += `### ${module.toUpperCase()}\n\n`;
    
    endpoints.forEach((ep, index) => {
      md += `#### ${index + 1}. ${ep.summary || ep.handler}\n\n`;
      md += `- **Method:** \`${ep.method}\`\n`;
      md += `- **Path:** \`${ep.path}\`\n`;
      md += `- **Handler:** \`${ep.handler}()\`\n`;
      md += `- **Roles:** ${ep.roles.join(', ')}\n`;
      md += `- **File:** \`${ep.file}\`\n\n`;
    });
    
    md += `---\n\n`;
  });

  md += `## 📝 All Endpoints (Table Format)\n\n`;
  md += `| Module | Method | Path | Summary | Handler |\n`;
  md += `|--------|--------|------|---------|--------|\n`;
  data.allEndpoints.forEach(ep => {
    md += `| ${ep.module} | ${ep.method} | ${ep.path} | ${ep.summary} | ${ep.handler} |\n`;
  });

  const mdPath = path.join(__dirname, '../docs/admin-endpoints.md');
  fs.writeFileSync(mdPath, md, 'utf-8');
  console.log(`✅ تم إنشاء ملف: ${mdPath}`);
}

// تشغيل السكريبت
main();

