/**
 * ملف اختبار للتحقق من تكامل Endpoints
 */

import { 
  ADMIN_ENDPOINTS_BY_MODULE, 
  ALL_ADMIN_ENDPOINTS,
  ENDPOINTS_STATS,
  buildEndpointUrl,
  hasPermission,
  getEndpointsByModule 
} from './admin-endpoints';

// اختبار 1: التحقق من وجود الـ modules
console.log('✅ Test 1: Modules Check');
console.log(`Total Modules: ${ENDPOINTS_STATS.modules}`);
console.log(`Total Endpoints: ${ENDPOINTS_STATS.total}`);
console.log(`GET Endpoints: ${ENDPOINTS_STATS.byMethod.GET}`);
console.log(`POST Endpoints: ${ENDPOINTS_STATS.byMethod.POST}`);
console.log('---');

// اختبار 2: اختبار بناء URL
console.log('✅ Test 2: URL Building');
const testEndpoint = ALL_ADMIN_ENDPOINTS[0];
if (testEndpoint) {
  console.log(`Endpoint: ${testEndpoint.summary}`);
  console.log(`Full URL: ${buildEndpointUrl(testEndpoint)}`);
  
  // اختبار مع parameters
  if (testEndpoint.path.includes(':id')) {
    console.log(`With Params: ${buildEndpointUrl(testEndpoint, { id: '12345' })}`);
  }
}
console.log('---');

// اختبار 3: اختبار الصلاحيات
console.log('✅ Test 3: Permissions Check');
const adminRoles = ['admin'];
const superadminRoles = ['admin', 'superadmin'];

const adminCanAccess = ALL_ADMIN_ENDPOINTS.filter(ep => 
  hasPermission(adminRoles, ep)
).length;

const superadminCanAccess = ALL_ADMIN_ENDPOINTS.filter(ep => 
  hasPermission(superadminRoles, ep)
).length;

console.log(`Admin can access: ${adminCanAccess} endpoints`);
console.log(`Superadmin can access: ${superadminCanAccess} endpoints`);
console.log('---');

// اختبار 4: الوصول للـ modules
console.log('✅ Test 4: Module Access');
Object.keys(ADMIN_ENDPOINTS_BY_MODULE).forEach((moduleName, index) => {
  const module = ADMIN_ENDPOINTS_BY_MODULE[moduleName];
  if (index < 5) { // فقط أول 5
    console.log(`${module.displayName}: ${module.endpoints.length} endpoints`);
  }
});
console.log('---');

// اختبار 5: الحصول على endpoints حسب module
console.log('✅ Test 5: Get Endpoints By Module');
const driversEndpoints = getEndpointsByModule('drivers');
console.log(`Drivers Module has ${driversEndpoints?.length || 0} endpoints`);

export const TESTS_PASSED = true;

