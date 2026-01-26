# ErrandsApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**errandsControllerCreateErrandOrder**](#errandscontrollercreateerrandorder) | **POST** /errands/order | إنشاء طلب مهمة|
|[**errandsControllerGetAvailableDrivers**](#errandscontrollergetavailabledrivers) | **GET** /errands/drivers/available | السائقون المتاحون|
|[**errandsControllerGetErrand**](#errandscontrollergeterrand) | **GET** /errands/{id} | الحصول على مهمة محددة|
|[**errandsControllerGetErrandCategories**](#errandscontrollergeterrandcategories) | **GET** /errands/categories | فئات المهام|
|[**errandsControllerGetUserErrands**](#errandscontrollergetusererrands) | **GET** /errands/user/{id} | طلبات المستخدم|

# **errandsControllerCreateErrandOrder**
> errandsControllerCreateErrandOrder(body)


### Example

```typescript
import {
    ErrandsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ErrandsApi(configuration);

let body: object; //

const { status, data } = await apiInstance.errandsControllerCreateErrandOrder(
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

# **errandsControllerGetAvailableDrivers**
> errandsControllerGetAvailableDrivers()


### Example

```typescript
import {
    ErrandsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ErrandsApi(configuration);

let lat: number; // (optional) (default to undefined)
let lng: number; // (optional) (default to undefined)

const { status, data } = await apiInstance.errandsControllerGetAvailableDrivers(
    lat,
    lng
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **lat** | [**number**] |  | (optional) defaults to undefined|
| **lng** | [**number**] |  | (optional) defaults to undefined|


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

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **errandsControllerGetErrand**
> errandsControllerGetErrand()


### Example

```typescript
import {
    ErrandsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ErrandsApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.errandsControllerGetErrand(
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

# **errandsControllerGetErrandCategories**
> errandsControllerGetErrandCategories()


### Example

```typescript
import {
    ErrandsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ErrandsApi(configuration);

const { status, data } = await apiInstance.errandsControllerGetErrandCategories();
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

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **errandsControllerGetUserErrands**
> errandsControllerGetUserErrands()


### Example

```typescript
import {
    ErrandsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ErrandsApi(configuration);

let id: string; // (default to undefined)
let status: string; // (default to undefined)

const { status, data } = await apiInstance.errandsControllerGetUserErrands(
    id,
    status
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|
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

