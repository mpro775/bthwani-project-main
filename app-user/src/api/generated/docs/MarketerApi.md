# MarketerApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**marketerControllerGenerateReferralCode**](#marketercontrollergeneratereferralcode) | **POST** /marketer/referrals/generate-code | إنشاء كود إحالة|
|[**marketerControllerGetCommissionStatistics**](#marketercontrollergetcommissionstatistics) | **GET** /marketer/commissions/statistics | إحصائيات العمولات|
|[**marketerControllerGetEarnings**](#marketercontrollergetearnings) | **GET** /marketer/earnings | أرباحي|
|[**marketerControllerGetEarningsBreakdown**](#marketercontrollergetearningsbreakdown) | **GET** /marketer/earnings/breakdown | تفصيل الأرباح|
|[**marketerControllerGetFiles**](#marketercontrollergetfiles) | **GET** /marketer/files | ملفاتي|
|[**marketerControllerGetMonthStatistics**](#marketercontrollergetmonthstatistics) | **GET** /marketer/statistics/month | إحصائيات الشهر|
|[**marketerControllerGetMyCommissions**](#marketercontrollergetmycommissions) | **GET** /marketer/commissions/my | عمولاتي|
|[**marketerControllerGetMyReferrals**](#marketercontrollergetmyreferrals) | **GET** /marketer/referrals/my | إحالاتي|
|[**marketerControllerGetMyStores**](#marketercontrollergetmystores) | **GET** /marketer/stores/my | متاجري|
|[**marketerControllerGetMyVendors**](#marketercontrollergetmyvendors) | **GET** /marketer/vendors/my | تجاري|
|[**marketerControllerGetNotifications**](#marketercontrollergetnotifications) | **GET** /marketer/notifications | إشعاراتي|
|[**marketerControllerGetOverview**](#marketercontrollergetoverview) | **GET** /marketer/overview | نظرة عامة|
|[**marketerControllerGetPendingCommissions**](#marketercontrollergetpendingcommissions) | **GET** /marketer/commissions/pending | العمولات المعلقة|
|[**marketerControllerGetProfile**](#marketercontrollergetprofile) | **GET** /marketer/profile | ملفي الشخصي|
|[**marketerControllerGetReferralStatistics**](#marketercontrollergetreferralstatistics) | **GET** /marketer/referrals/statistics | إحصائيات الإحالات|
|[**marketerControllerGetStoreDetails**](#marketercontrollergetstoredetails) | **GET** /marketer/stores/{id} | تفاصيل متجر|
|[**marketerControllerGetStorePerformance**](#marketercontrollergetstoreperformance) | **GET** /marketer/stores/{id}/performance | أداء المتجر|
|[**marketerControllerGetTerritoryStats**](#marketercontrollergetterritorystats) | **GET** /marketer/territory/stats | إحصائيات المنطقة|
|[**marketerControllerGetTodayStatistics**](#marketercontrollergettodaystatistics) | **GET** /marketer/statistics/today | إحصائيات اليوم|
|[**marketerControllerGetVendorDetails**](#marketercontrollergetvendordetails) | **GET** /marketer/vendors/{id} | تفاصيل تاجر|
|[**marketerControllerMarkNotificationRead**](#marketercontrollermarknotificationread) | **PATCH** /marketer/notifications/{id}/read | تحديد إشعار كمقروء|
|[**marketerControllerUpdateProfile**](#marketercontrollerupdateprofile) | **PATCH** /marketer/profile | تحديث الملف الشخصي|
|[**marketerControllerUploadFile**](#marketercontrolleruploadfile) | **POST** /marketer/files/upload | رفع ملف|

# **marketerControllerGenerateReferralCode**
> marketerControllerGenerateReferralCode()


### Example

```typescript
import {
    MarketerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new MarketerApi(configuration);

const { status, data } = await apiInstance.marketerControllerGenerateReferralCode();
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
|**201** | Created |  -  |
|**400** | Bad request |  -  |
|**401** | Unauthorized |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **marketerControllerGetCommissionStatistics**
> marketerControllerGetCommissionStatistics()


### Example

```typescript
import {
    MarketerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new MarketerApi(configuration);

const { status, data } = await apiInstance.marketerControllerGetCommissionStatistics();
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

# **marketerControllerGetEarnings**
> marketerControllerGetEarnings()


### Example

```typescript
import {
    MarketerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new MarketerApi(configuration);

let startDate: string; // (default to undefined)
let endDate: string; // (default to undefined)

const { status, data } = await apiInstance.marketerControllerGetEarnings(
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

# **marketerControllerGetEarningsBreakdown**
> marketerControllerGetEarningsBreakdown()


### Example

```typescript
import {
    MarketerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new MarketerApi(configuration);

const { status, data } = await apiInstance.marketerControllerGetEarningsBreakdown();
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

# **marketerControllerGetFiles**
> marketerControllerGetFiles()


### Example

```typescript
import {
    MarketerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new MarketerApi(configuration);

const { status, data } = await apiInstance.marketerControllerGetFiles();
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

# **marketerControllerGetMonthStatistics**
> marketerControllerGetMonthStatistics()


### Example

```typescript
import {
    MarketerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new MarketerApi(configuration);

const { status, data } = await apiInstance.marketerControllerGetMonthStatistics();
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

# **marketerControllerGetMyCommissions**
> marketerControllerGetMyCommissions()


### Example

```typescript
import {
    MarketerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new MarketerApi(configuration);

let status: string; // (default to undefined)

const { status, data } = await apiInstance.marketerControllerGetMyCommissions(
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

# **marketerControllerGetMyReferrals**
> marketerControllerGetMyReferrals()


### Example

```typescript
import {
    MarketerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new MarketerApi(configuration);

const { status, data } = await apiInstance.marketerControllerGetMyReferrals();
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

# **marketerControllerGetMyStores**
> marketerControllerGetMyStores()


### Example

```typescript
import {
    MarketerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new MarketerApi(configuration);

const { status, data } = await apiInstance.marketerControllerGetMyStores();
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

# **marketerControllerGetMyVendors**
> marketerControllerGetMyVendors()


### Example

```typescript
import {
    MarketerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new MarketerApi(configuration);

const { status, data } = await apiInstance.marketerControllerGetMyVendors();
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

# **marketerControllerGetNotifications**
> marketerControllerGetNotifications()


### Example

```typescript
import {
    MarketerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new MarketerApi(configuration);

const { status, data } = await apiInstance.marketerControllerGetNotifications();
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

# **marketerControllerGetOverview**
> marketerControllerGetOverview()


### Example

```typescript
import {
    MarketerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new MarketerApi(configuration);

const { status, data } = await apiInstance.marketerControllerGetOverview();
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

# **marketerControllerGetPendingCommissions**
> marketerControllerGetPendingCommissions()


### Example

```typescript
import {
    MarketerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new MarketerApi(configuration);

const { status, data } = await apiInstance.marketerControllerGetPendingCommissions();
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

# **marketerControllerGetProfile**
> marketerControllerGetProfile()


### Example

```typescript
import {
    MarketerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new MarketerApi(configuration);

const { status, data } = await apiInstance.marketerControllerGetProfile();
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

# **marketerControllerGetReferralStatistics**
> marketerControllerGetReferralStatistics()


### Example

```typescript
import {
    MarketerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new MarketerApi(configuration);

const { status, data } = await apiInstance.marketerControllerGetReferralStatistics();
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

# **marketerControllerGetStoreDetails**
> marketerControllerGetStoreDetails()


### Example

```typescript
import {
    MarketerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new MarketerApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.marketerControllerGetStoreDetails(
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

# **marketerControllerGetStorePerformance**
> marketerControllerGetStorePerformance()


### Example

```typescript
import {
    MarketerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new MarketerApi(configuration);

let id: string; // (default to undefined)
let startDate: string; // (default to undefined)
let endDate: string; // (default to undefined)

const { status, data } = await apiInstance.marketerControllerGetStorePerformance(
    id,
    startDate,
    endDate
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|
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
|**404** | Not found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **marketerControllerGetTerritoryStats**
> marketerControllerGetTerritoryStats()


### Example

```typescript
import {
    MarketerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new MarketerApi(configuration);

const { status, data } = await apiInstance.marketerControllerGetTerritoryStats();
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

# **marketerControllerGetTodayStatistics**
> marketerControllerGetTodayStatistics()


### Example

```typescript
import {
    MarketerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new MarketerApi(configuration);

const { status, data } = await apiInstance.marketerControllerGetTodayStatistics();
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

# **marketerControllerGetVendorDetails**
> marketerControllerGetVendorDetails()


### Example

```typescript
import {
    MarketerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new MarketerApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.marketerControllerGetVendorDetails(
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

# **marketerControllerMarkNotificationRead**
> marketerControllerMarkNotificationRead()


### Example

```typescript
import {
    MarketerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new MarketerApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.marketerControllerMarkNotificationRead(
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

# **marketerControllerUpdateProfile**
> marketerControllerUpdateProfile(marketerControllerUpdateProfileRequest)


### Example

```typescript
import {
    MarketerApi,
    Configuration,
    MarketerControllerUpdateProfileRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new MarketerApi(configuration);

let marketerControllerUpdateProfileRequest: MarketerControllerUpdateProfileRequest; //

const { status, data } = await apiInstance.marketerControllerUpdateProfile(
    marketerControllerUpdateProfileRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **marketerControllerUpdateProfileRequest** | **MarketerControllerUpdateProfileRequest**|  | |


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

# **marketerControllerUploadFile**
> marketerControllerUploadFile(marketerControllerUploadFileRequest)


### Example

```typescript
import {
    MarketerApi,
    Configuration,
    MarketerControllerUploadFileRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new MarketerApi(configuration);

let marketerControllerUploadFileRequest: MarketerControllerUploadFileRequest; //

const { status, data } = await apiInstance.marketerControllerUploadFile(
    marketerControllerUploadFileRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **marketerControllerUploadFileRequest** | **MarketerControllerUploadFileRequest**|  | |


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

