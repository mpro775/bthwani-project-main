# FinanceApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**financeControllerAddActualTotals**](#financecontrolleraddactualtotals) | **PATCH** /finance/reconciliations/{id}/actual-totals | إضافة الإجماليات الفعلية|
|[**financeControllerAddReconciliationIssue**](#financecontrolleraddreconciliationissue) | **POST** /finance/reconciliations/{id}/issues | إضافة مشكلة للمطابقة|
|[**financeControllerApproveCommission**](#financecontrollerapprovecommission) | **PATCH** /finance/commissions/{id}/approve | الموافقة على عمولة|
|[**financeControllerApprovePayoutBatch**](#financecontrollerapprovepayoutbatch) | **PATCH** /finance/payouts/batches/{id}/approve | الموافقة على دفعة|
|[**financeControllerApproveSettlement**](#financecontrollerapprovesettlement) | **PATCH** /finance/settlements/{id}/approve | الموافقة على تسوية|
|[**financeControllerCancelCommission**](#financecontrollercancelcommission) | **PATCH** /finance/commissions/{id}/cancel | إلغاء عمولة|
|[**financeControllerCompletePayoutBatch**](#financecontrollercompletepayoutbatch) | **PATCH** /finance/payouts/batches/{id}/complete | إكمال دفعة|
|[**financeControllerCreateCommission**](#financecontrollercreatecommission) | **POST** /finance/commissions | إنشاء عمولة جديدة|
|[**financeControllerCreateCommissionPlan**](#financecontrollercreatecommissionplan) | **POST** /finance/commission-plans | إنشاء خطة عمولة|
|[**financeControllerCreateCoupon**](#financecontrollercreatecoupon) | **POST** /finance/coupons | إنشاء كوبون|
|[**financeControllerCreatePayoutBatch**](#financecontrollercreatepayoutbatch) | **POST** /finance/payouts/batches | إنشاء دفعة من العمولات|
|[**financeControllerCreateReconciliation**](#financecontrollercreatereconciliation) | **POST** /finance/reconciliations | إنشاء مطابقة مالية|
|[**financeControllerCreateSettlement**](#financecontrollercreatesettlement) | **POST** /finance/settlements | إنشاء تسوية|
|[**financeControllerFinalizeReport**](#financecontrollerfinalizereport) | **PATCH** /finance/reports/{id}/finalize | تثبيت تقرير|
|[**financeControllerGenerateDailyReport**](#financecontrollergeneratedailyreport) | **POST** /finance/reports/daily | إنشاء تقرير يومي|
|[**financeControllerGetCommissionPlans**](#financecontrollergetcommissionplans) | **GET** /finance/commission-plans | خطط العمولات|
|[**financeControllerGetCoupons**](#financecontrollergetcoupons) | **GET** /finance/coupons | الحصول على كل الكوبونات|
|[**financeControllerGetDailyReport**](#financecontrollergetdailyreport) | **GET** /finance/reports/daily/{date} | الحصول على تقرير يومي|
|[**financeControllerGetEntitySettlements**](#financecontrollergetentitysettlements) | **GET** /finance/settlements/entity/{entityId} | الحصول على تسويات كيان|
|[**financeControllerGetMyCommissionStats**](#financecontrollergetmycommissionstats) | **GET** /finance/commissions/stats/my | إحصائيات عمولاتي|
|[**financeControllerGetMyCommissions**](#financecontrollergetmycommissions) | **GET** /finance/commissions/my | الحصول على عمولاتي|
|[**financeControllerGetPayoutBatch**](#financecontrollergetpayoutbatch) | **GET** /finance/payouts/batches/{id} | الحصول على دفعة|
|[**financeControllerGetPayoutBatchItems**](#financecontrollergetpayoutbatchitems) | **GET** /finance/payouts/batches/{id}/items | الحصول على عناصر دفعة|
|[**financeControllerGetPayoutBatches**](#financecontrollergetpayoutbatches) | **GET** /finance/payouts/batches | الحصول على كل الدفعات|
|[**financeControllerGetReconciliation**](#financecontrollergetreconciliation) | **GET** /finance/reconciliations/{id} | الحصول على مطابقة|
|[**financeControllerGetReconciliations**](#financecontrollergetreconciliations) | **GET** /finance/reconciliations | الحصول على كل المطابقات|
|[**financeControllerGetReports**](#financecontrollergetreports) | **GET** /finance/reports | الحصول على التقارير|
|[**financeControllerGetSettlement**](#financecontrollergetsettlement) | **GET** /finance/settlements/{id} | الحصول على تسوية|
|[**financeControllerResolveReconciliationIssue**](#financecontrollerresolvereconciliationissue) | **PATCH** /finance/reconciliations/{id}/issues/{issueIndex}/resolve | حل مشكلة في المطابقة|
|[**financeControllerUpdateCommissionPlan**](#financecontrollerupdatecommissionplan) | **PATCH** /finance/commission-plans/{id} | تحديث خطة عمولة|
|[**financeControllerUpdateCoupon**](#financecontrollerupdatecoupon) | **PATCH** /finance/coupons/{id} | تحديث كوبون|
|[**financeControllerValidateCoupon**](#financecontrollervalidatecoupon) | **POST** /finance/coupons/validate | التحقق من كوبون|

# **financeControllerAddActualTotals**
> financeControllerAddActualTotals()


### Example

```typescript
import {
    FinanceApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new FinanceApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.financeControllerAddActualTotals(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|


### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Updated |  -  |
|**400** | Bad request |  -  |
|**401** | Unauthorized |  -  |
|**404** | Not found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **financeControllerAddReconciliationIssue**
> financeControllerAddReconciliationIssue()


### Example

```typescript
import {
    FinanceApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new FinanceApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.financeControllerAddReconciliationIssue(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|


### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**201** | Created |  -  |
|**400** | Bad request |  -  |
|**401** | Unauthorized |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **financeControllerApproveCommission**
> financeControllerApproveCommission()


### Example

```typescript
import {
    FinanceApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new FinanceApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.financeControllerApproveCommission(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|


### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Updated |  -  |
|**400** | Bad request |  -  |
|**401** | Unauthorized |  -  |
|**404** | Not found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **financeControllerApprovePayoutBatch**
> financeControllerApprovePayoutBatch(body)


### Example

```typescript
import {
    FinanceApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new FinanceApi(configuration);

let id: string; // (default to undefined)
let body: object; //

const { status, data } = await apiInstance.financeControllerApprovePayoutBatch(
    id,
    body
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **body** | **object**|  | |
| **id** | [**string**] |  | defaults to undefined|


### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Updated |  -  |
|**400** | Bad request |  -  |
|**401** | Unauthorized |  -  |
|**404** | Not found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **financeControllerApproveSettlement**
> financeControllerApproveSettlement(body)


### Example

```typescript
import {
    FinanceApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new FinanceApi(configuration);

let id: string; // (default to undefined)
let body: object; //

const { status, data } = await apiInstance.financeControllerApproveSettlement(
    id,
    body
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **body** | **object**|  | |
| **id** | [**string**] |  | defaults to undefined|


### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Updated |  -  |
|**400** | Bad request |  -  |
|**401** | Unauthorized |  -  |
|**404** | Not found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **financeControllerCancelCommission**
> financeControllerCancelCommission()


### Example

```typescript
import {
    FinanceApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new FinanceApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.financeControllerCancelCommission(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|


### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Updated |  -  |
|**400** | Bad request |  -  |
|**401** | Unauthorized |  -  |
|**404** | Not found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **financeControllerCompletePayoutBatch**
> financeControllerCompletePayoutBatch()


### Example

```typescript
import {
    FinanceApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new FinanceApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.financeControllerCompletePayoutBatch(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|


### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Updated |  -  |
|**400** | Bad request |  -  |
|**401** | Unauthorized |  -  |
|**404** | Not found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **financeControllerCreateCommission**
> financeControllerCreateCommission(createCommissionDto)


### Example

```typescript
import {
    FinanceApi,
    Configuration,
    CreateCommissionDto
} from './api';

const configuration = new Configuration();
const apiInstance = new FinanceApi(configuration);

let createCommissionDto: CreateCommissionDto; //

const { status, data } = await apiInstance.financeControllerCreateCommission(
    createCommissionDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **createCommissionDto** | **CreateCommissionDto**|  | |


### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**201** | Created |  -  |
|**400** | Bad request |  -  |
|**401** | Unauthorized |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **financeControllerCreateCommissionPlan**
> financeControllerCreateCommissionPlan(financeControllerCreateCommissionPlanRequest)


### Example

```typescript
import {
    FinanceApi,
    Configuration,
    FinanceControllerCreateCommissionPlanRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new FinanceApi(configuration);

let financeControllerCreateCommissionPlanRequest: FinanceControllerCreateCommissionPlanRequest; //

const { status, data } = await apiInstance.financeControllerCreateCommissionPlan(
    financeControllerCreateCommissionPlanRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **financeControllerCreateCommissionPlanRequest** | **FinanceControllerCreateCommissionPlanRequest**|  | |


### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**201** | Created |  -  |
|**400** | Bad request |  -  |
|**401** | Unauthorized |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **financeControllerCreateCoupon**
> financeControllerCreateCoupon(createFinancialCouponDto)


### Example

```typescript
import {
    FinanceApi,
    Configuration,
    CreateFinancialCouponDto
} from './api';

const configuration = new Configuration();
const apiInstance = new FinanceApi(configuration);

let createFinancialCouponDto: CreateFinancialCouponDto; //

const { status, data } = await apiInstance.financeControllerCreateCoupon(
    createFinancialCouponDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **createFinancialCouponDto** | **CreateFinancialCouponDto**|  | |


### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**201** | Created |  -  |
|**400** | Bad request |  -  |
|**401** | Unauthorized |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **financeControllerCreatePayoutBatch**
> financeControllerCreatePayoutBatch(financeControllerCreatePayoutBatchRequest)


### Example

```typescript
import {
    FinanceApi,
    Configuration,
    FinanceControllerCreatePayoutBatchRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new FinanceApi(configuration);

let financeControllerCreatePayoutBatchRequest: FinanceControllerCreatePayoutBatchRequest; //

const { status, data } = await apiInstance.financeControllerCreatePayoutBatch(
    financeControllerCreatePayoutBatchRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **financeControllerCreatePayoutBatchRequest** | **FinanceControllerCreatePayoutBatchRequest**|  | |


### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**201** | Created |  -  |
|**400** | Bad request |  -  |
|**401** | Unauthorized |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **financeControllerCreateReconciliation**
> financeControllerCreateReconciliation(financeControllerCreateReconciliationRequest)


### Example

```typescript
import {
    FinanceApi,
    Configuration,
    FinanceControllerCreateReconciliationRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new FinanceApi(configuration);

let financeControllerCreateReconciliationRequest: FinanceControllerCreateReconciliationRequest; //

const { status, data } = await apiInstance.financeControllerCreateReconciliation(
    financeControllerCreateReconciliationRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **financeControllerCreateReconciliationRequest** | **FinanceControllerCreateReconciliationRequest**|  | |


### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**201** | Created |  -  |
|**400** | Bad request |  -  |
|**401** | Unauthorized |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **financeControllerCreateSettlement**
> financeControllerCreateSettlement(body)


### Example

```typescript
import {
    FinanceApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new FinanceApi(configuration);

let body: object; //

const { status, data } = await apiInstance.financeControllerCreateSettlement(
    body
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **body** | **object**|  | |


### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**201** | Created |  -  |
|**400** | Bad request |  -  |
|**401** | Unauthorized |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **financeControllerFinalizeReport**
> financeControllerFinalizeReport()


### Example

```typescript
import {
    FinanceApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new FinanceApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.financeControllerFinalizeReport(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|


### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Updated |  -  |
|**400** | Bad request |  -  |
|**401** | Unauthorized |  -  |
|**404** | Not found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **financeControllerGenerateDailyReport**
> financeControllerGenerateDailyReport(financeControllerGenerateDailyReportRequest)


### Example

```typescript
import {
    FinanceApi,
    Configuration,
    FinanceControllerGenerateDailyReportRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new FinanceApi(configuration);

let financeControllerGenerateDailyReportRequest: FinanceControllerGenerateDailyReportRequest; //

const { status, data } = await apiInstance.financeControllerGenerateDailyReport(
    financeControllerGenerateDailyReportRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **financeControllerGenerateDailyReportRequest** | **FinanceControllerGenerateDailyReportRequest**|  | |


### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**201** | Created |  -  |
|**400** | Bad request |  -  |
|**401** | Unauthorized |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **financeControllerGetCommissionPlans**
> financeControllerGetCommissionPlans()


### Example

```typescript
import {
    FinanceApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new FinanceApi(configuration);

const { status, data } = await apiInstance.financeControllerGetCommissionPlans();
```

### Parameters
This endpoint does not have any parameters.


### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Success |  -  |
|**401** | Unauthorized |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **financeControllerGetCoupons**
> financeControllerGetCoupons()


### Example

```typescript
import {
    FinanceApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new FinanceApi(configuration);

let isActive: boolean; // (default to undefined)

const { status, data } = await apiInstance.financeControllerGetCoupons(
    isActive
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **isActive** | [**boolean**] |  | defaults to undefined|


### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Success |  -  |
|**401** | Unauthorized |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **financeControllerGetDailyReport**
> financeControllerGetDailyReport()


### Example

```typescript
import {
    FinanceApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new FinanceApi(configuration);

let date: string; // (default to undefined)

const { status, data } = await apiInstance.financeControllerGetDailyReport(
    date
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **date** | [**string**] |  | defaults to undefined|


### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Success |  -  |
|**401** | Unauthorized |  -  |
|**404** | Not found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **financeControllerGetEntitySettlements**
> financeControllerGetEntitySettlements()


### Example

```typescript
import {
    FinanceApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new FinanceApi(configuration);

let entityId: string; // (default to undefined)
let entityModel: string; // (default to undefined)
let status: string; // (default to undefined)

const { status, data } = await apiInstance.financeControllerGetEntitySettlements(
    entityId,
    entityModel,
    status
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **entityId** | [**string**] |  | defaults to undefined|
| **entityModel** | [**string**] |  | defaults to undefined|
| **status** | [**string**] |  | defaults to undefined|


### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Success |  -  |
|**401** | Unauthorized |  -  |
|**404** | Not found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **financeControllerGetMyCommissionStats**
> financeControllerGetMyCommissionStats()


### Example

```typescript
import {
    FinanceApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new FinanceApi(configuration);

const { status, data } = await apiInstance.financeControllerGetMyCommissionStats();
```

### Parameters
This endpoint does not have any parameters.


### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Success |  -  |
|**401** | Unauthorized |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **financeControllerGetMyCommissions**
> financeControllerGetMyCommissions()


### Example

```typescript
import {
    FinanceApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new FinanceApi(configuration);

let status: string; // (default to undefined)

const { status, data } = await apiInstance.financeControllerGetMyCommissions(
    status
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **status** | [**string**] |  | defaults to undefined|


### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Success |  -  |
|**401** | Unauthorized |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **financeControllerGetPayoutBatch**
> financeControllerGetPayoutBatch()


### Example

```typescript
import {
    FinanceApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new FinanceApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.financeControllerGetPayoutBatch(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|


### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Success |  -  |
|**401** | Unauthorized |  -  |
|**404** | Not found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **financeControllerGetPayoutBatchItems**
> financeControllerGetPayoutBatchItems()


### Example

```typescript
import {
    FinanceApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new FinanceApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.financeControllerGetPayoutBatchItems(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|


### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Success |  -  |
|**401** | Unauthorized |  -  |
|**404** | Not found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **financeControllerGetPayoutBatches**
> financeControllerGetPayoutBatches()


### Example

```typescript
import {
    FinanceApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new FinanceApi(configuration);

let status: string; // (default to undefined)
let limit: number; // (default to undefined)
let cursor: string; // (default to undefined)

const { status, data } = await apiInstance.financeControllerGetPayoutBatches(
    status,
    limit,
    cursor
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **status** | [**string**] |  | defaults to undefined|
| **limit** | [**number**] |  | defaults to undefined|
| **cursor** | [**string**] |  | defaults to undefined|


### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Success |  -  |
|**401** | Unauthorized |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **financeControllerGetReconciliation**
> financeControllerGetReconciliation()


### Example

```typescript
import {
    FinanceApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new FinanceApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.financeControllerGetReconciliation(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|


### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Success |  -  |
|**401** | Unauthorized |  -  |
|**404** | Not found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **financeControllerGetReconciliations**
> financeControllerGetReconciliations()


### Example

```typescript
import {
    FinanceApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new FinanceApi(configuration);

let status: string; // (default to undefined)

const { status, data } = await apiInstance.financeControllerGetReconciliations(
    status
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **status** | [**string**] |  | defaults to undefined|


### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Success |  -  |
|**401** | Unauthorized |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **financeControllerGetReports**
> financeControllerGetReports()


### Example

```typescript
import {
    FinanceApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new FinanceApi(configuration);

let startDate: string; // (default to undefined)
let endDate: string; // (default to undefined)

const { status, data } = await apiInstance.financeControllerGetReports(
    startDate,
    endDate
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **startDate** | [**string**] |  | defaults to undefined|
| **endDate** | [**string**] |  | defaults to undefined|


### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Success |  -  |
|**401** | Unauthorized |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **financeControllerGetSettlement**
> financeControllerGetSettlement()


### Example

```typescript
import {
    FinanceApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new FinanceApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.financeControllerGetSettlement(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|


### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Success |  -  |
|**401** | Unauthorized |  -  |
|**404** | Not found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **financeControllerResolveReconciliationIssue**
> financeControllerResolveReconciliationIssue()


### Example

```typescript
import {
    FinanceApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new FinanceApi(configuration);

let id: string; // (default to undefined)
let issueIndex: string; // (default to undefined)

const { status, data } = await apiInstance.financeControllerResolveReconciliationIssue(
    id,
    issueIndex
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|
| **issueIndex** | [**string**] |  | defaults to undefined|


### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Updated |  -  |
|**400** | Bad request |  -  |
|**401** | Unauthorized |  -  |
|**404** | Not found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **financeControllerUpdateCommissionPlan**
> financeControllerUpdateCommissionPlan()


### Example

```typescript
import {
    FinanceApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new FinanceApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.financeControllerUpdateCommissionPlan(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|


### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Updated |  -  |
|**400** | Bad request |  -  |
|**401** | Unauthorized |  -  |
|**404** | Not found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **financeControllerUpdateCoupon**
> financeControllerUpdateCoupon(body)


### Example

```typescript
import {
    FinanceApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new FinanceApi(configuration);

let id: string; // (default to undefined)
let body: object; //

const { status, data } = await apiInstance.financeControllerUpdateCoupon(
    id,
    body
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **body** | **object**|  | |
| **id** | [**string**] |  | defaults to undefined|


### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Updated |  -  |
|**400** | Bad request |  -  |
|**401** | Unauthorized |  -  |
|**404** | Not found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **financeControllerValidateCoupon**
> financeControllerValidateCoupon(body)


### Example

```typescript
import {
    FinanceApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new FinanceApi(configuration);

let body: object; //

const { status, data } = await apiInstance.financeControllerValidateCoupon(
    body
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **body** | **object**|  | |


### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**201** | Created |  -  |
|**400** | Bad request |  -  |
|**401** | Unauthorized |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

