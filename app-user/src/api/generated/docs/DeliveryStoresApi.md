# DeliveryStoresApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**deliveryStoreControllerFindStore**](#deliverystorecontrollerfindstore) | **GET** /delivery/stores/{id} | جلب متجر محدد|
|[**deliveryStoreControllerFindStores**](#deliverystorecontrollerfindstores) | **GET** /delivery/stores | جلب المتاجر - عام|
|[**deliveryStoreControllerGetProducts**](#deliverystorecontrollergetproducts) | **GET** /delivery/stores/{id}/products | جلب منتجات المتجر|
|[**deliveryStoreControllerGetStoreReviews**](#deliverystorecontrollergetstorereviews) | **GET** /delivery/stores/{id}/reviews | مراجعات المتجر|
|[**deliveryStoreControllerGetStoreStatistics**](#deliverystorecontrollergetstorestatistics) | **GET** /delivery/stores/{id}/statistics | إحصائيات المتجر - عامة|
|[**deliveryStoreControllerSearchStores**](#deliverystorecontrollersearchstores) | **GET** /delivery/stores/search | البحث عن متاجر|
|[**deliveryStoreControllerUpdateStore**](#deliverystorecontrollerupdatestore) | **PUT** /delivery/stores/{id} | تحديث متجر|

# **deliveryStoreControllerFindStore**
> deliveryStoreControllerFindStore()


### Example

```typescript
import {
    DeliveryStoresApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DeliveryStoresApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.deliveryStoreControllerFindStore(
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

# **deliveryStoreControllerFindStores**
> deliveryStoreControllerFindStores()


### Example

```typescript
import {
    DeliveryStoresApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DeliveryStoresApi(configuration);

let categoryId: string; // (default to undefined)
let isTrending: boolean; // (default to undefined)
let isFeatured: boolean; // (default to undefined)
let usageType: string; // (default to undefined)
let cursor: string; //Cursor للصفحة التالية (optional) (default to undefined)
let limit: number; //عدد العناصر (optional) (default to 20)

const { status, data } = await apiInstance.deliveryStoreControllerFindStores(
    categoryId,
    isTrending,
    isFeatured,
    usageType,
    cursor,
    limit
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **categoryId** | [**string**] |  | defaults to undefined|
| **isTrending** | [**boolean**] |  | defaults to undefined|
| **isFeatured** | [**boolean**] |  | defaults to undefined|
| **usageType** | [**string**] |  | defaults to undefined|
| **cursor** | [**string**] | Cursor للصفحة التالية | (optional) defaults to undefined|
| **limit** | [**number**] | عدد العناصر | (optional) defaults to 20|


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

# **deliveryStoreControllerGetProducts**
> deliveryStoreControllerGetProducts()


### Example

```typescript
import {
    DeliveryStoresApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DeliveryStoresApi(configuration);

let id: string; // (default to undefined)
let cursor: string; //Cursor للصفحة التالية (optional) (default to undefined)
let limit: number; //عدد العناصر (optional) (default to 20)

const { status, data } = await apiInstance.deliveryStoreControllerGetProducts(
    id,
    cursor,
    limit
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|
| **cursor** | [**string**] | Cursor للصفحة التالية | (optional) defaults to undefined|
| **limit** | [**number**] | عدد العناصر | (optional) defaults to 20|


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

# **deliveryStoreControllerGetStoreReviews**
> deliveryStoreControllerGetStoreReviews()


### Example

```typescript
import {
    DeliveryStoresApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DeliveryStoresApi(configuration);

let id: string; // (default to undefined)
let cursor: string; //Cursor للصفحة التالية (optional) (default to undefined)
let limit: number; //عدد العناصر (optional) (default to 20)

const { status, data } = await apiInstance.deliveryStoreControllerGetStoreReviews(
    id,
    cursor,
    limit
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|
| **cursor** | [**string**] | Cursor للصفحة التالية | (optional) defaults to undefined|
| **limit** | [**number**] | عدد العناصر | (optional) defaults to 20|


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

# **deliveryStoreControllerGetStoreStatistics**
> deliveryStoreControllerGetStoreStatistics()


### Example

```typescript
import {
    DeliveryStoresApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DeliveryStoresApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.deliveryStoreControllerGetStoreStatistics(
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

# **deliveryStoreControllerSearchStores**
> deliveryStoreControllerSearchStores()


### Example

```typescript
import {
    DeliveryStoresApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DeliveryStoresApi(configuration);

let q: string; // (default to undefined)
let cursor: string; //Cursor للصفحة التالية (optional) (default to undefined)
let limit: number; //عدد العناصر (optional) (default to 20)

const { status, data } = await apiInstance.deliveryStoreControllerSearchStores(
    q,
    cursor,
    limit
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **q** | [**string**] |  | defaults to undefined|
| **cursor** | [**string**] | Cursor للصفحة التالية | (optional) defaults to undefined|
| **limit** | [**number**] | عدد العناصر | (optional) defaults to 20|


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

# **deliveryStoreControllerUpdateStore**
> deliveryStoreControllerUpdateStore()


### Example

```typescript
import {
    DeliveryStoresApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DeliveryStoresApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.deliveryStoreControllerUpdateStore(
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

