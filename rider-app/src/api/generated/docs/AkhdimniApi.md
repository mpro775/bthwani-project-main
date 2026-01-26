# AkhdimniApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**akhdimniControllerAssignDriver**](#akhdimnicontrollerassigndriver) | **POST** /akhdimni/admin/errands/{id}/assign-driver | تعيين سائق لمهمة|
|[**akhdimniControllerCalculateFee**](#akhdimnicontrollercalculatefee) | **POST** /akhdimni/errands/calculate-fee | حساب رسوم المهمة قبل إنشائها|
|[**akhdimniControllerCancelErrand**](#akhdimnicontrollercancelerrand) | **PATCH** /akhdimni/errands/{id}/cancel | إلغاء طلب|
|[**akhdimniControllerCreateErrand**](#akhdimnicontrollercreateerrand) | **POST** /akhdimni/errands | إنشاء طلب مهمة (أخدمني)|
|[**akhdimniControllerGetAllErrands**](#akhdimnicontrollergetallerrands) | **GET** /akhdimni/admin/errands | كل طلبات أخدمني (إدارة)|
|[**akhdimniControllerGetErrand**](#akhdimnicontrollergeterrand) | **GET** /akhdimni/errands/{id} | الحصول على طلب محدد|
|[**akhdimniControllerGetMyDriverErrands**](#akhdimnicontrollergetmydrivererrands) | **GET** /akhdimni/driver/my-errands | مهماتي كسائق|
|[**akhdimniControllerGetMyErrands**](#akhdimnicontrollergetmyerrands) | **GET** /akhdimni/my-errands | طلباتي من أخدمني|
|[**akhdimniControllerRateErrand**](#akhdimnicontrollerrateerrand) | **POST** /akhdimni/errands/{id}/rate | تقييم المهمة|
|[**akhdimniControllerUpdateErrandStatus**](#akhdimnicontrollerupdateerrandstatus) | **PATCH** /akhdimni/errands/{id}/status | تحديث حالة المهمة (سائق)|

# **akhdimniControllerAssignDriver**
> akhdimniControllerAssignDriver(body)


### Example

```typescript
import {
    AkhdimniApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AkhdimniApi(configuration);

let id: string; // (default to undefined)
let body: object; //

const { status, data } = await apiInstance.akhdimniControllerAssignDriver(
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
|**201** | Created |  -  |
|**400** | Bad request |  -  |
|**401** | Unauthorized |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **akhdimniControllerCalculateFee**
> akhdimniControllerCalculateFee(calculateFeeDto)


### Example

```typescript
import {
    AkhdimniApi,
    Configuration,
    CalculateFeeDto
} from './api';

const configuration = new Configuration();
const apiInstance = new AkhdimniApi(configuration);

let calculateFeeDto: CalculateFeeDto; //

const { status, data } = await apiInstance.akhdimniControllerCalculateFee(
    calculateFeeDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **calculateFeeDto** | **CalculateFeeDto**|  | |


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

# **akhdimniControllerCancelErrand**
> akhdimniControllerCancelErrand()


### Example

```typescript
import {
    AkhdimniApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AkhdimniApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.akhdimniControllerCancelErrand(
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

# **akhdimniControllerCreateErrand**
> akhdimniControllerCreateErrand(body)


### Example

```typescript
import {
    AkhdimniApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AkhdimniApi(configuration);

let body: object; //

const { status, data } = await apiInstance.akhdimniControllerCreateErrand(
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

# **akhdimniControllerGetAllErrands**
> akhdimniControllerGetAllErrands()


### Example

```typescript
import {
    AkhdimniApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AkhdimniApi(configuration);

let status: string; // (default to undefined)
let limit: number; // (default to undefined)
let cursor: string; // (default to undefined)

const { status, data } = await apiInstance.akhdimniControllerGetAllErrands(
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

# **akhdimniControllerGetErrand**
> akhdimniControllerGetErrand()


### Example

```typescript
import {
    AkhdimniApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AkhdimniApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.akhdimniControllerGetErrand(
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

# **akhdimniControllerGetMyDriverErrands**
> akhdimniControllerGetMyDriverErrands()


### Example

```typescript
import {
    AkhdimniApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AkhdimniApi(configuration);

let status: string; // (default to undefined)

const { status, data } = await apiInstance.akhdimniControllerGetMyDriverErrands(
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

# **akhdimniControllerGetMyErrands**
> akhdimniControllerGetMyErrands()


### Example

```typescript
import {
    AkhdimniApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AkhdimniApi(configuration);

let status: string; // (default to undefined)

const { status, data } = await apiInstance.akhdimniControllerGetMyErrands(
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

# **akhdimniControllerRateErrand**
> akhdimniControllerRateErrand(body)


### Example

```typescript
import {
    AkhdimniApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AkhdimniApi(configuration);

let id: string; // (default to undefined)
let body: object; //

const { status, data } = await apiInstance.akhdimniControllerRateErrand(
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
|**201** | Created |  -  |
|**400** | Bad request |  -  |
|**401** | Unauthorized |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **akhdimniControllerUpdateErrandStatus**
> akhdimniControllerUpdateErrandStatus(body)


### Example

```typescript
import {
    AkhdimniApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AkhdimniApi(configuration);

let id: string; // (default to undefined)
let body: object; //

const { status, data } = await apiInstance.akhdimniControllerUpdateErrandStatus(
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

