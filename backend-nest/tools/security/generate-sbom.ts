#!/usr/bin/env ts-node
/**
 * BTW-SEC-003: SBOM Generation (Software Bill of Materials)
 * Generates CycloneDX SBOM for the project
 * 
 * Usage: npm run security:sbom
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

interface Component {
  type: string;
  name: string;
  version: string;
  description?: string;
  licenses?: { license: { id: string } }[];
  purl?: string;
}

interface SBOM {
  bomFormat: string;
  specVersion: string;
  serialNumber: string;
  version: number;
  metadata: {
    timestamp: string;
    tools: Array<{ vendor: string; name: string; version: string }>;
    component: {
      type: string;
      name: string;
      version: string;
      description: string;
    };
  };
  components: Component[];
}

function generateUUID(): string {
  return 'urn:uuid:' + 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function getPackageInfo(): { name: string; version: string; description: string } {
  const packageJsonPath = path.resolve(__dirname, '../../package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
  return {
    name: packageJson.name || 'bthwani-backend',
    version: packageJson.version || '0.0.1',
    description: packageJson.description || 'BThwani Backend Service'
  };
}

function getDependencies(): Component[] {
  const packageJsonPath = path.resolve(__dirname, '../../package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

  const components: Component[] = [];
  const allDeps = {
    ...packageJson.dependencies,
    ...packageJson.devDependencies
  };

  // Get installed versions from node_modules
  Object.entries(allDeps).forEach(([name, declaredVersion]) => {
    try {
      const pkgPath = path.resolve(__dirname, '../../node_modules', name, 'package.json');
      if (fs.existsSync(pkgPath)) {
        const depPkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
        
        const component: Component = {
          type: 'library',
          name: name,
          version: depPkg.version || (declaredVersion as string),
          description: depPkg.description,
          purl: `pkg:npm/${name}@${depPkg.version}`
        };

        // Add license information if available
        if (depPkg.license) {
          component.licenses = [
            {
              license: {
                id: typeof depPkg.license === 'string' ? depPkg.license : depPkg.license.type
              }
            }
          ];
        }

        components.push(component);
      }
    } catch (error) {
      // Skip packages that can't be read
    }
  });

  return components;
}

function generateSBOM(): SBOM {
  const packageInfo = getPackageInfo();
  const components = getDependencies();

  const sbom: SBOM = {
    bomFormat: 'CycloneDX',
    specVersion: '1.4',
    serialNumber: generateUUID(),
    version: 1,
    metadata: {
      timestamp: new Date().toISOString(),
      tools: [
        {
          vendor: 'BThwani',
          name: 'generate-sbom',
          version: '1.0.0'
        }
      ],
      component: {
        type: 'application',
        name: packageInfo.name,
        version: packageInfo.version,
        description: packageInfo.description
      }
    },
    components
  };

  return sbom;
}

function tryCycloneDX(): boolean {
  try {
    console.log('🔍 Attempting to generate SBOM with @cyclonedx/cyclonedx-npm...');
    execSync('npx @cyclonedx/cyclonedx-npm --output-file reports/sbom-cyclonedx.json', {
      stdio: 'inherit'
    });
    return true;
  } catch (error) {
    console.log('ℹ️  @cyclonedx/cyclonedx-npm not available, using fallback generator');
    return false;
  }
}

function main(): void {
  console.log('📦 BThwani SBOM Generator - BTW-SEC-003');
  console.log('======================================\n');

  const projectRoot = path.resolve(__dirname, '../..');
  const reportsDir = path.join(projectRoot, 'reports');

  // Ensure reports directory exists
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  // Try official CycloneDX tool first
  const cycloneDXSuccess = tryCycloneDX();

  // Generate our own SBOM
  console.log('📝 Generating SBOM...');
  const sbom = generateSBOM();

  // Save SBOM files
  const jsonPath = path.join(reportsDir, 'sbom.json');
  const xmlPath = path.join(reportsDir, 'sbom.xml');

  fs.writeFileSync(jsonPath, JSON.stringify(sbom, null, 2));
  console.log(`✅ SBOM (JSON) saved to: ${jsonPath}`);

  // Generate simple XML version
  const xml = generateXML(sbom);
  fs.writeFileSync(xmlPath, xml);
  console.log(`✅ SBOM (XML) saved to: ${xmlPath}`);

  // Print summary
  console.log('\n📊 SBOM SUMMARY');
  console.log('===============');
  console.log(`Project: ${sbom.metadata.component.name}`);
  console.log(`Version: ${sbom.metadata.component.version}`);
  console.log(`Total components: ${sbom.components.length}`);
  console.log(`Generated: ${sbom.metadata.timestamp}`);
  console.log(`Serial number: ${sbom.serialNumber}\n`);

  // License summary
  const licenses = new Map<string, number>();
  sbom.components.forEach(comp => {
    if (comp.licenses && comp.licenses.length > 0) {
      const license = comp.licenses[0].license.id;
      licenses.set(license, (licenses.get(license) || 0) + 1);
    }
  });

  console.log('📜 LICENSE SUMMARY:');
  Array.from(licenses.entries())
    .sort((a, b) => b[1] - a[1])
    .forEach(([license, count]) => {
      console.log(`   ${license}: ${count} components`);
    });

  console.log('\n✅ SBOM generation completed successfully!');
  console.log('\n💡 Next steps:');
  console.log('   1. Review SBOM for compliance with your organization policies');
  console.log('   2. Sign SBOM with cosign: cosign sign-blob --key cosign.key sbom.json');
  console.log('   3. Upload SBOM to dependency tracking system');
  console.log('   4. Set up automated SBOM generation in CI/CD');
}

function generateXML(sbom: SBOM): string {
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<bom xmlns="http://cyclonedx.org/schema/bom/1.4" serialNumber="${sbom.serialNumber}" version="${sbom.version}">
  <metadata>
    <timestamp>${sbom.metadata.timestamp}</timestamp>
    <component type="${sbom.metadata.component.type}">
      <name>${sbom.metadata.component.name}</name>
      <version>${sbom.metadata.component.version}</version>
      <description>${sbom.metadata.component.description}</description>
    </component>
  </metadata>
  <components>
`;

  sbom.components.forEach(comp => {
    xml += `    <component type="${comp.type}">
      <name>${comp.name}</name>
      <version>${comp.version}</version>
`;
    if (comp.description) {
      xml += `      <description>${escapeXml(comp.description)}</description>\n`;
    }
    if (comp.purl) {
      xml += `      <purl>${comp.purl}</purl>\n`;
    }
    if (comp.licenses && comp.licenses.length > 0) {
      xml += `      <licenses>\n`;
      comp.licenses.forEach(l => {
        xml += `        <license><id>${l.license.id}</id></license>\n`;
      });
      xml += `      </licenses>\n`;
    }
    xml += `    </component>\n`;
  });

  xml += `  </components>
</bom>`;

  return xml;
}

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

main();

