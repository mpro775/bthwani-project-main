# MerchantApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**merchantControllerCreateAttribute**](#merchantcontrollercreateattribute) | **POST** /merchants/attributes | إنشاء خاصية منتج|
|[**merchantControllerCreateCategory**](#merchantcontrollercreatecategory) | **POST** /merchants/categories | إنشاء فئة منتجات|
|[**merchantControllerCreateMerchant**](#merchantcontrollercreatemerchant) | **POST** /merchants | إنشاء تاجر جديد|
|[**merchantControllerCreateMerchantProduct**](#merchantcontrollercreatemerchantproduct) | **POST** /merchants/products | إضافة منتج لمتجر التاجر|
|[**merchantControllerCreateProductCatalog**](#merchantcontrollercreateproductcatalog) | **POST** /merchants/catalog/products | إضافة منتج للكتالوج|
|[**merchantControllerDeleteAttribute**](#merchantcontrollerdeleteattribute) | **DELETE** /merchants/attributes/{id} | حذف خاصية|
|[**merchantControllerDeleteCategory**](#merchantcontrollerdeletecategory) | **DELETE** /merchants/categories/{id} | حذف فئة|
|[**merchantControllerDeleteMerchant**](#merchantcontrollerdeletemerchant) | **DELETE** /merchants/{id} | حذف تاجر|
|[**merchantControllerDeleteMerchantProduct**](#merchantcontrollerdeletemerchantproduct) | **DELETE** /merchants/products/{id} | حذف منتج تاجر|
|[**merchantControllerGetAllMerchantProducts**](#merchantcontrollergetallmerchantproducts) | **GET** /merchants/products | الحصول على جميع منتجات التجار|
|[**merchantControllerGetAllMerchants**](#merchantcontrollergetallmerchants) | **GET** /merchants | الحصول على كل التجار|
|[**merchantControllerGetAllProductCatalogs**](#merchantcontrollergetallproductcatalogs) | **GET** /merchants/catalog/products | الحصول على منتجات الكتالوج (public)|
|[**merchantControllerGetAttributes**](#merchantcontrollergetattributes) | **GET** /merchants/attributes | الحصول على الخصائص (public)|
|[**merchantControllerGetCategories**](#merchantcontrollergetcategories) | **GET** /merchants/categories | الحصول على الفئات (public)|
|[**merchantControllerGetMerchant**](#merchantcontrollergetmerchant) | **GET** /merchants/{id} | الحصول على تاجر محدد|
|[**merchantControllerGetMerchantProduct**](#merchantcontrollergetmerchantproduct) | **GET** /merchants/products/{id} | الحصول على منتج تاجر محدد|
|[**merchantControllerGetMerchantProducts**](#merchantcontrollergetmerchantproducts) | **GET** /merchants/{merchantId}/products | منتجات التاجر (public)|
|[**merchantControllerGetProductCatalog**](#merchantcontrollergetproductcatalog) | **GET** /merchants/catalog/products/{id} | الحصول على منتج من الكتالوج (public)|
|[**merchantControllerGetStoreProducts**](#merchantcontrollergetstoreproducts) | **GET** /merchants/stores/{storeId}/products | منتجات المتجر (public)|
|[**merchantControllerUpdateAttribute**](#merchantcontrollerupdateattribute) | **PATCH** /merchants/attributes/{id} | تحديث خاصية|
|[**merchantControllerUpdateCategory**](#merchantcontrollerupdatecategory) | **PATCH** /merchants/categories/{id} | تحديث فئة|
|[**merchantControllerUpdateMerchant**](#merchantcontrollerupdatemerchant) | **PATCH** /merchants/{id} | تحديث تاجر|
|[**merchantControllerUpdateMerchantProduct**](#merchantcontrollerupdatemerchantproduct) | **PATCH** /merchants/products/{id} | تحديث منتج التاجر|
|[**merchantControllerUpdateProductCatalog**](#merchantcontrollerupdateproductcatalog) | **PATCH** /merchants/catalog/products/{id} | تحديث منتج في الكتالوج|
|[**merchantControllerUpdateStock**](#merchantcontrollerupdatestock) | **PATCH** /merchants/products/{id}/stock | تحديث مخزون منتج|

# **merchantControllerCreateAttribute**
> merchantControllerCreateAttribute(body)


### Example

```typescript
import {
    MerchantApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new MerchantApi(configuration);

let body: object; //

const { status, data } = await apiInstance.merchantControllerCreateAttribute(
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

# **merchantControllerCreateCategory**
> merchantControllerCreateCategory(body)


### Example

```typescript
import {
    MerchantApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new MerchantApi(configuration);

let body: object; //

const { status, data } = await apiInstance.merchantControllerCreateCategory(
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

# **merchantControllerCreateMerchant**
> merchantControllerCreateMerchant(body)


### Example

```typescript
import {
    MerchantApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new MerchantApi(configuration);

let body: object; //

const { status, data } = await apiInstance.merchantControllerCreateMerchant(
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

# **merchantControllerCreateMerchantProduct**
> merchantControllerCreateMerchantProduct(body)


### Example

```typescript
import {
    MerchantApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new MerchantApi(configuration);

let body: object; //

const { status, data } = await apiInstance.merchantControllerCreateMerchantProduct(
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

# **merchantControllerCreateProductCatalog**
> merchantControllerCreateProductCatalog(body)


### Example

```typescript
import {
    MerchantApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new MerchantApi(configuration);

let body: object; //

const { status, data } = await apiInstance.merchantControllerCreateProductCatalog(
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

# **merchantControllerDeleteAttribute**
> merchantControllerDeleteAttribute()


### Example

```typescript
import {
    MerchantApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new MerchantApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.merchantControllerDeleteAttribute(
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

# **merchantControllerDeleteCategory**
> merchantControllerDeleteCategory()


### Example

```typescript
import {
    MerchantApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new MerchantApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.merchantControllerDeleteCategory(
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

# **merchantControllerDeleteMerchant**
> merchantControllerDeleteMerchant()


### Example

```typescript
import {
    MerchantApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new MerchantApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.merchantControllerDeleteMerchant(
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

# **merchantControllerDeleteMerchantProduct**
> merchantControllerDeleteMerchantProduct()


### Example

```typescript
import {
    MerchantApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new MerchantApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.merchantControllerDeleteMerchantProduct(
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

# **merchantControllerGetAllMerchantProducts**
> merchantControllerGetAllMerchantProducts()


### Example

```typescript
import {
    MerchantApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new MerchantApi(configuration);

let merchantId: string; // (default to undefined)
let storeId: string; // (default to undefined)
let isAvailable: boolean; // (default to undefined)

const { status, data } = await apiInstance.merchantControllerGetAllMerchantProducts(
    merchantId,
    storeId,
    isAvailable
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **merchantId** | [**string**] |  | defaults to undefined|
| **storeId** | [**string**] |  | defaults to undefined|
| **isAvailable** | [**boolean**] |  | defaults to undefined|


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

# **merchantControllerGetAllMerchants**
> merchantControllerGetAllMerchants()


### Example

```typescript
import {
    MerchantApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new MerchantApi(configuration);

let isActive: boolean; // (default to undefined)

const { status, data } = await apiInstance.merchantControllerGetAllMerchants(
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

# **merchantControllerGetAllProductCatalogs**
> merchantControllerGetAllProductCatalogs()


### Example

```typescript
import {
    MerchantApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new MerchantApi(configuration);

let usageType: string; // (default to undefined)

const { status, data } = await apiInstance.merchantControllerGetAllProductCatalogs(
    usageType
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **usageType** | [**string**] |  | defaults to undefined|


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

# **merchantControllerGetAttributes**
> merchantControllerGetAttributes()


### Example

```typescript
import {
    MerchantApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new MerchantApi(configuration);

const { status, data } = await apiInstance.merchantControllerGetAttributes();
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

# **merchantControllerGetCategories**
> merchantControllerGetCategories()


### Example

```typescript
import {
    MerchantApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new MerchantApi(configuration);

let parent: string; // (default to undefined)

const { status, data } = await apiInstance.merchantControllerGetCategories(
    parent
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **parent** | [**string**] |  | defaults to undefined|


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

# **merchantControllerGetMerchant**
> merchantControllerGetMerchant()


### Example

```typescript
import {
    MerchantApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new MerchantApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.merchantControllerGetMerchant(
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

# **merchantControllerGetMerchantProduct**
> merchantControllerGetMerchantProduct()


### Example

```typescript
import {
    MerchantApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new MerchantApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.merchantControllerGetMerchantProduct(
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

# **merchantControllerGetMerchantProducts**
> merchantControllerGetMerchantProducts()


### Example

```typescript
import {
    MerchantApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new MerchantApi(configuration);

let merchantId: string; // (default to undefined)
let storeId: string; // (default to undefined)
let isAvailable: boolean; // (default to undefined)

const { status, data } = await apiInstance.merchantControllerGetMerchantProducts(
    merchantId,
    storeId,
    isAvailable
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **merchantId** | [**string**] |  | defaults to undefined|
| **storeId** | [**string**] |  | defaults to undefined|
| **isAvailable** | [**boolean**] |  | defaults to undefined|


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

# **merchantControllerGetProductCatalog**
> merchantControllerGetProductCatalog()


### Example

```typescript
import {
    MerchantApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new MerchantApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.merchantControllerGetProductCatalog(
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

# **merchantControllerGetStoreProducts**
> merchantControllerGetStoreProducts()


### Example

```typescript
import {
    MerchantApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new MerchantApi(configuration);

let storeId: string; // (default to undefined)
let sectionId: string; // (default to undefined)

const { status, data } = await apiInstance.merchantControllerGetStoreProducts(
    storeId,
    sectionId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **storeId** | [**string**] |  | defaults to undefined|
| **sectionId** | [**string**] |  | defaults to undefined|


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

# **merchantControllerUpdateAttribute**
> merchantControllerUpdateAttribute(body)


### Example

```typescript
import {
    MerchantApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new MerchantApi(configuration);

let id: string; // (default to undefined)
let body: object; //

const { status, data } = await apiInstance.merchantControllerUpdateAttribute(
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

# **merchantControllerUpdateCategory**
> merchantControllerUpdateCategory(body)


### Example

```typescript
import {
    MerchantApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new MerchantApi(configuration);

let id: string; // (default to undefined)
let body: object; //

const { status, data } = await apiInstance.merchantControllerUpdateCategory(
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

# **merchantControllerUpdateMerchant**
> merchantControllerUpdateMerchant(body)


### Example

```typescript
import {
    MerchantApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new MerchantApi(configuration);

let id: string; // (default to undefined)
let body: object; //

const { status, data } = await apiInstance.merchantControllerUpdateMerchant(
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

# **merchantControllerUpdateMerchantProduct**
> merchantControllerUpdateMerchantProduct(body)


### Example

```typescript
import {
    MerchantApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new MerchantApi(configuration);

let id: string; // (default to undefined)
let body: object; //

const { status, data } = await apiInstance.merchantControllerUpdateMerchantProduct(
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

# **merchantControllerUpdateProductCatalog**
> merchantControllerUpdateProductCatalog(body)


### Example

```typescript
import {
    MerchantApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new MerchantApi(configuration);

let id: string; // (default to undefined)
let body: object; //

const { status, data } = await apiInstance.merchantControllerUpdateProductCatalog(
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

# **merchantControllerUpdateStock**
> merchantControllerUpdateStock()


### Example

```typescript
import {
    MerchantApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new MerchantApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.merchantControllerUpdateStock(
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

