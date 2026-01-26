# AdminStoresApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**storeControllerActivateStore**](#storecontrolleractivatestore) | **POST** /admin/stores/{id}/activate | تفعيل متجر|
|[**storeControllerAddProductVariant**](#storecontrolleraddproductvariant) | **POST** /admin/stores/products/{id}/variants | إضافة متغير|
|[**storeControllerApproveStore**](#storecontrollerapprovestore) | **POST** /admin/stores/{id}/approve | الموافقة على متجر|
|[**storeControllerCreateProduct**](#storecontrollercreateproduct) | **POST** /admin/stores/products | إنشاء منتج|
|[**storeControllerCreateStore**](#storecontrollercreatestore) | **POST** /admin/stores | إنشاء متجر|
|[**storeControllerDeactivateStore**](#storecontrollerdeactivatestore) | **POST** /admin/stores/{id}/deactivate | تعطيل متجر|
|[**storeControllerDeleteStore**](#storecontrollerdeletestore) | **DELETE** /admin/stores/{id} | حذف متجر|
|[**storeControllerFindStore**](#storecontrollerfindstore) | **GET** /admin/stores/{id} | جلب متجر محدد - الإدارة|
|[**storeControllerFindStores**](#storecontrollerfindstores) | **GET** /admin/stores | جلب المتاجر - الإدارة|
|[**storeControllerForceCloseStore**](#storecontrollerforceclosestore) | **POST** /admin/stores/{id}/force-close | إغلاق قسري للمتجر|
|[**storeControllerForceOpenStore**](#storecontrollerforceopenstore) | **POST** /admin/stores/{id}/force-open | فتح قسري للمتجر|
|[**storeControllerGetPendingStores**](#storecontrollergetpendingstores) | **GET** /admin/stores/pending | المتاجر المعلقة - تحتاج موافقة|
|[**storeControllerGetProductVariants**](#storecontrollergetproductvariants) | **GET** /admin/stores/products/{id}/variants | متغيرات المنتج|
|[**storeControllerGetProducts**](#storecontrollergetproducts) | **GET** /admin/stores/{id}/products | جلب منتجات المتجر - الإدارة|
|[**storeControllerGetStoreAnalytics**](#storecontrollergetstoreanalytics) | **GET** /admin/stores/{id}/analytics | تحليلات المتجر - الإدارة|
|[**storeControllerGetStoreInventory**](#storecontrollergetstoreinventory) | **GET** /admin/stores/{id}/inventory | جرد المتجر - الإدارة|
|[**storeControllerRejectStore**](#storecontrollerrejectstore) | **POST** /admin/stores/{id}/reject | رفض متجر|
|[**storeControllerSuspendStore**](#storecontrollersuspendstore) | **POST** /admin/stores/{id}/suspend | تعليق متجر|
|[**storeControllerUpdateProduct**](#storecontrollerupdateproduct) | **PATCH** /admin/stores/products/{id} | تحديث منتج|
|[**storeControllerUpdateStore**](#storecontrollerupdatestore) | **PATCH** /admin/stores/{id} | تحديث متجر|

# **storeControllerActivateStore**
> storeControllerActivateStore()


### Example

```typescript
import {
    AdminStoresApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminStoresApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.storeControllerActivateStore(
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

# **storeControllerAddProductVariant**
> storeControllerAddProductVariant()


### Example

```typescript
import {
    AdminStoresApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminStoresApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.storeControllerAddProductVariant(
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

# **storeControllerApproveStore**
> storeControllerApproveStore()


### Example

```typescript
import {
    AdminStoresApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminStoresApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.storeControllerApproveStore(
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

# **storeControllerCreateProduct**
> storeControllerCreateProduct(createProductDto)


### Example

```typescript
import {
    AdminStoresApi,
    Configuration,
    CreateProductDto
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminStoresApi(configuration);

let createProductDto: CreateProductDto; //

const { status, data } = await apiInstance.storeControllerCreateProduct(
    createProductDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **createProductDto** | **CreateProductDto**|  | |


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

# **storeControllerCreateStore**
> storeControllerCreateStore(createStoreDto)


### Example

```typescript
import {
    AdminStoresApi,
    Configuration,
    CreateStoreDto
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminStoresApi(configuration);

let createStoreDto: CreateStoreDto; //

const { status, data } = await apiInstance.storeControllerCreateStore(
    createStoreDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **createStoreDto** | **CreateStoreDto**|  | |


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

# **storeControllerDeactivateStore**
> storeControllerDeactivateStore()


### Example

```typescript
import {
    AdminStoresApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminStoresApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.storeControllerDeactivateStore(
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

# **storeControllerDeleteStore**
> storeControllerDeleteStore()


### Example

```typescript
import {
    AdminStoresApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminStoresApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.storeControllerDeleteStore(
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
|**200** | Deleted |  -  |
|**401** | Unauthorized |  -  |
|**404** | Not found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **storeControllerFindStore**
> storeControllerFindStore()


### Example

```typescript
import {
    AdminStoresApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminStoresApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.storeControllerFindStore(
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

# **storeControllerFindStores**
> storeControllerFindStores()


### Example

```typescript
import {
    AdminStoresApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminStoresApi(configuration);

let isActive: string; // (default to undefined)
let usageType: string; // (default to undefined)
let q: string; // (default to undefined)
let cursor: string; //Cursor للصفحة التالية (optional) (default to undefined)
let limit: number; //عدد العناصر (optional) (default to 20)

const { status, data } = await apiInstance.storeControllerFindStores(
    isActive,
    usageType,
    q,
    cursor,
    limit
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **isActive** | [**string**] |  | defaults to undefined|
| **usageType** | [**string**] |  | defaults to undefined|
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

# **storeControllerForceCloseStore**
> storeControllerForceCloseStore()


### Example

```typescript
import {
    AdminStoresApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminStoresApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.storeControllerForceCloseStore(
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

# **storeControllerForceOpenStore**
> storeControllerForceOpenStore()


### Example

```typescript
import {
    AdminStoresApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminStoresApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.storeControllerForceOpenStore(
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

# **storeControllerGetPendingStores**
> storeControllerGetPendingStores()


### Example

```typescript
import {
    AdminStoresApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminStoresApi(configuration);

const { status, data } = await apiInstance.storeControllerGetPendingStores();
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

# **storeControllerGetProductVariants**
> storeControllerGetProductVariants()


### Example

```typescript
import {
    AdminStoresApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminStoresApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.storeControllerGetProductVariants(
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

# **storeControllerGetProducts**
> storeControllerGetProducts()


### Example

```typescript
import {
    AdminStoresApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminStoresApi(configuration);

let id: string; // (default to undefined)
let cursor: string; //Cursor للصفحة التالية (optional) (default to undefined)
let limit: number; //عدد العناصر (optional) (default to 20)

const { status, data } = await apiInstance.storeControllerGetProducts(
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

# **storeControllerGetStoreAnalytics**
> storeControllerGetStoreAnalytics()


### Example

```typescript
import {
    AdminStoresApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminStoresApi(configuration);

let id: string; // (default to undefined)
let startDate: string; // (default to undefined)
let endDate: string; // (default to undefined)

const { status, data } = await apiInstance.storeControllerGetStoreAnalytics(
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

# **storeControllerGetStoreInventory**
> storeControllerGetStoreInventory()


### Example

```typescript
import {
    AdminStoresApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminStoresApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.storeControllerGetStoreInventory(
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

# **storeControllerRejectStore**
> storeControllerRejectStore()


### Example

```typescript
import {
    AdminStoresApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminStoresApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.storeControllerRejectStore(
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

# **storeControllerSuspendStore**
> storeControllerSuspendStore()


### Example

```typescript
import {
    AdminStoresApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminStoresApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.storeControllerSuspendStore(
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

# **storeControllerUpdateProduct**
> storeControllerUpdateProduct()


### Example

```typescript
import {
    AdminStoresApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminStoresApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.storeControllerUpdateProduct(
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

# **storeControllerUpdateStore**
> storeControllerUpdateStore()


### Example

```typescript
import {
    AdminStoresApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminStoresApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.storeControllerUpdateStore(
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

