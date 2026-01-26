# UtilityApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**utilityControllerAssignDriver**](#utilitycontrollerassigndriver) | **POST** /utility/order/{id}/assign-driver | تعيين سائق للطلب|
|[**utilityControllerCalculatePrice**](#utilitycontrollercalculateprice) | **POST** /utility/calculate-price | حساب سعر خدمة الغاز أو الماء|
|[**utilityControllerCancelOrder**](#utilitycontrollercancelorder) | **PATCH** /utility/order/{id}/cancel | إلغاء الطلب|
|[**utilityControllerCreateOrder**](#utilitycontrollercreateorder) | **POST** /utility/order | إنشاء طلب غاز أو ماء|
|[**utilityControllerCreatePricing**](#utilitycontrollercreatepricing) | **POST** /utility/pricing | إنشاء تسعير لمدينة|
|[**utilityControllerDeleteDaily**](#utilitycontrollerdeletedaily) | **DELETE** /utility/daily/{id} | حذف سعر يومي حسب ID|
|[**utilityControllerDeleteDailyByKey**](#utilitycontrollerdeletedailybykey) | **DELETE** /utility/daily | حذف سعر يومي حسب المفتاح المركب|
|[**utilityControllerDeletePricing**](#utilitycontrollerdeletepricing) | **DELETE** /utility/pricing/{city} | حذف تسعير مدينة|
|[**utilityControllerGetAllOrders**](#utilitycontrollergetallorders) | **GET** /utility/admin/orders | جلب جميع الطلبات (admin)|
|[**utilityControllerGetAllPricing**](#utilitycontrollergetallpricing) | **GET** /utility/pricing | الحصول على كل التسعيرات|
|[**utilityControllerGetOrder**](#utilitycontrollergetorder) | **GET** /utility/order/{id} | جلب تفاصيل طلب|
|[**utilityControllerGetPricingByCity**](#utilitycontrollergetpricingbycity) | **GET** /utility/pricing/{city} | الحصول على تسعير مدينة|
|[**utilityControllerGetUserOrders**](#utilitycontrollergetuserorders) | **GET** /utility/orders | جلب طلبات المستخدم|
|[**utilityControllerGetUtilityOptions**](#utilitycontrollergetutilityoptions) | **GET** /utility/options | الحصول على خيارات الغاز والماء (public)|
|[**utilityControllerListDaily**](#utilitycontrollerlistdaily) | **GET** /utility/daily | الحصول على قائمة الأسعار اليومية|
|[**utilityControllerRateOrder**](#utilitycontrollerrateorder) | **POST** /utility/order/{id}/rate | تقييم الطلب|
|[**utilityControllerUpdateOrderStatus**](#utilitycontrollerupdateorderstatus) | **PATCH** /utility/order/{id}/status | تحديث حالة الطلب|
|[**utilityControllerUpdatePricing**](#utilitycontrollerupdatepricing) | **PATCH** /utility/pricing/{city} | تحديث تسعير مدينة|
|[**utilityControllerUpsertDaily**](#utilitycontrollerupsertdaily) | **POST** /utility/daily | إضافة/تحديث سعر يومي|
|[**utilityControllerUpsertGas**](#utilitycontrollerupsertgas) | **PATCH** /utility/options/gas | تحديث/إنشاء إعدادات الغاز|
|[**utilityControllerUpsertWater**](#utilitycontrollerupsertwater) | **PATCH** /utility/options/water | تحديث/إنشاء إعدادات الماء|

# **utilityControllerAssignDriver**
> utilityControllerAssignDriver()


### Example

```typescript
import {
    UtilityApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new UtilityApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.utilityControllerAssignDriver(
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

# **utilityControllerCalculatePrice**
> utilityControllerCalculatePrice(body)


### Example

```typescript
import {
    UtilityApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new UtilityApi(configuration);

let body: object; //

const { status, data } = await apiInstance.utilityControllerCalculatePrice(
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

# **utilityControllerCancelOrder**
> utilityControllerCancelOrder()


### Example

```typescript
import {
    UtilityApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new UtilityApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.utilityControllerCancelOrder(
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

# **utilityControllerCreateOrder**
> utilityControllerCreateOrder(body)


### Example

```typescript
import {
    UtilityApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new UtilityApi(configuration);

let body: object; //

const { status, data } = await apiInstance.utilityControllerCreateOrder(
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

# **utilityControllerCreatePricing**
> utilityControllerCreatePricing(body)


### Example

```typescript
import {
    UtilityApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new UtilityApi(configuration);

let body: object; //

const { status, data } = await apiInstance.utilityControllerCreatePricing(
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

# **utilityControllerDeleteDaily**
> utilityControllerDeleteDaily()


### Example

```typescript
import {
    UtilityApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new UtilityApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.utilityControllerDeleteDaily(
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

# **utilityControllerDeleteDailyByKey**
> utilityControllerDeleteDailyByKey()


### Example

```typescript
import {
    UtilityApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new UtilityApi(configuration);

let kind: string; // (default to undefined)
let city: string; // (default to undefined)
let date: string; // (default to undefined)
let variant: string; // (default to undefined)

const { status, data } = await apiInstance.utilityControllerDeleteDailyByKey(
    kind,
    city,
    date,
    variant
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **kind** | [**string**] |  | defaults to undefined|
| **city** | [**string**] |  | defaults to undefined|
| **date** | [**string**] |  | defaults to undefined|
| **variant** | [**string**] |  | defaults to undefined|


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

# **utilityControllerDeletePricing**
> utilityControllerDeletePricing()


### Example

```typescript
import {
    UtilityApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new UtilityApi(configuration);

let city: string; // (default to undefined)

const { status, data } = await apiInstance.utilityControllerDeletePricing(
    city
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **city** | [**string**] |  | defaults to undefined|


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

# **utilityControllerGetAllOrders**
> utilityControllerGetAllOrders()


### Example

```typescript
import {
    UtilityApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new UtilityApi(configuration);

let limit: number; // (optional) (default to undefined)
let cursor: string; // (optional) (default to undefined)

const { status, data } = await apiInstance.utilityControllerGetAllOrders(
    limit,
    cursor
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **limit** | [**number**] |  | (optional) defaults to undefined|
| **cursor** | [**string**] |  | (optional) defaults to undefined|


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

# **utilityControllerGetAllPricing**
> utilityControllerGetAllPricing()


### Example

```typescript
import {
    UtilityApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new UtilityApi(configuration);

const { status, data } = await apiInstance.utilityControllerGetAllPricing();
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

# **utilityControllerGetOrder**
> utilityControllerGetOrder()


### Example

```typescript
import {
    UtilityApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new UtilityApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.utilityControllerGetOrder(
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

# **utilityControllerGetPricingByCity**
> utilityControllerGetPricingByCity()


### Example

```typescript
import {
    UtilityApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new UtilityApi(configuration);

let city: string; // (default to undefined)

const { status, data } = await apiInstance.utilityControllerGetPricingByCity(
    city
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **city** | [**string**] |  | defaults to undefined|


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

# **utilityControllerGetUserOrders**
> utilityControllerGetUserOrders()


### Example

```typescript
import {
    UtilityApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new UtilityApi(configuration);

const { status, data } = await apiInstance.utilityControllerGetUserOrders();
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

# **utilityControllerGetUtilityOptions**
> utilityControllerGetUtilityOptions()


### Example

```typescript
import {
    UtilityApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new UtilityApi(configuration);

let city: string; // (default to undefined)

const { status, data } = await apiInstance.utilityControllerGetUtilityOptions(
    city
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **city** | [**string**] |  | defaults to undefined|


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

# **utilityControllerListDaily**
> utilityControllerListDaily()


### Example

```typescript
import {
    UtilityApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new UtilityApi(configuration);

let kind: string; // (default to undefined)
let city: string; // (default to undefined)

const { status, data } = await apiInstance.utilityControllerListDaily(
    kind,
    city
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **kind** | [**string**] |  | defaults to undefined|
| **city** | [**string**] |  | defaults to undefined|


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

# **utilityControllerRateOrder**
> utilityControllerRateOrder()


### Example

```typescript
import {
    UtilityApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new UtilityApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.utilityControllerRateOrder(
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

# **utilityControllerUpdateOrderStatus**
> utilityControllerUpdateOrderStatus()


### Example

```typescript
import {
    UtilityApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new UtilityApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.utilityControllerUpdateOrderStatus(
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

# **utilityControllerUpdatePricing**
> utilityControllerUpdatePricing(body)


### Example

```typescript
import {
    UtilityApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new UtilityApi(configuration);

let city: string; // (default to undefined)
let body: object; //

const { status, data } = await apiInstance.utilityControllerUpdatePricing(
    city,
    body
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **body** | **object**|  | |
| **city** | [**string**] |  | defaults to undefined|


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

# **utilityControllerUpsertDaily**
> utilityControllerUpsertDaily(body)


### Example

```typescript
import {
    UtilityApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new UtilityApi(configuration);

let body: object; //

const { status, data } = await apiInstance.utilityControllerUpsertDaily(
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

# **utilityControllerUpsertGas**
> utilityControllerUpsertGas(utilityControllerUpsertGasRequest)


### Example

```typescript
import {
    UtilityApi,
    Configuration,
    UtilityControllerUpsertGasRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new UtilityApi(configuration);

let utilityControllerUpsertGasRequest: UtilityControllerUpsertGasRequest; //

const { status, data } = await apiInstance.utilityControllerUpsertGas(
    utilityControllerUpsertGasRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **utilityControllerUpsertGasRequest** | **UtilityControllerUpsertGasRequest**|  | |


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

# **utilityControllerUpsertWater**
> utilityControllerUpsertWater(utilityControllerUpsertGasRequest)


### Example

```typescript
import {
    UtilityApi,
    Configuration,
    UtilityControllerUpsertGasRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new UtilityApi(configuration);

let utilityControllerUpsertGasRequest: UtilityControllerUpsertGasRequest; //

const { status, data } = await apiInstance.utilityControllerUpsertWater(
    utilityControllerUpsertGasRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **utilityControllerUpsertGasRequest** | **UtilityControllerUpsertGasRequest**|  | |


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

