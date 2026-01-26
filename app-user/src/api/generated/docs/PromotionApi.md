# PromotionApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**promotionControllerCreatePromotion**](#promotioncontrollercreatepromotion) | **POST** /promotions | إنشاء عرض ترويجي|
|[**promotionControllerDeletePromotion**](#promotioncontrollerdeletepromotion) | **DELETE** /promotions/{id} | حذف عرض|
|[**promotionControllerGetAllPromotions**](#promotioncontrollergetallpromotions) | **GET** /promotions | الحصول على كل العروض|
|[**promotionControllerGetPromotion**](#promotioncontrollergetpromotion) | **GET** /promotions/{id} | الحصول على عرض محدد|
|[**promotionControllerGetPromotionsByPlacement**](#promotioncontrollergetpromotionsbyplacement) | **GET** /promotions/by-placement | الحصول على عروض حسب الموضع (public)|
|[**promotionControllerGetStatistics**](#promotioncontrollergetstatistics) | **GET** /promotions/stats/overview | إحصائيات العروض|
|[**promotionControllerRecordClick**](#promotioncontrollerrecordclick) | **POST** /promotions/{id}/click | تسجيل نقرة على عرض|
|[**promotionControllerRecordConversion**](#promotioncontrollerrecordconversion) | **POST** /promotions/{id}/conversion | تسجيل تحويل (طلب من العرض)|
|[**promotionControllerUpdatePromotion**](#promotioncontrollerupdatepromotion) | **PATCH** /promotions/{id} | تحديث عرض|

# **promotionControllerCreatePromotion**
> promotionControllerCreatePromotion(createPromotionDto)


### Example

```typescript
import {
    PromotionApi,
    Configuration,
    CreatePromotionDto
} from './api';

const configuration = new Configuration();
const apiInstance = new PromotionApi(configuration);

let createPromotionDto: CreatePromotionDto; //

const { status, data } = await apiInstance.promotionControllerCreatePromotion(
    createPromotionDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **createPromotionDto** | **CreatePromotionDto**|  | |


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

# **promotionControllerDeletePromotion**
> promotionControllerDeletePromotion()


### Example

```typescript
import {
    PromotionApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new PromotionApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.promotionControllerDeletePromotion(
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

# **promotionControllerGetAllPromotions**
> promotionControllerGetAllPromotions()


### Example

```typescript
import {
    PromotionApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new PromotionApi(configuration);

let isActive: boolean; // (default to undefined)

const { status, data } = await apiInstance.promotionControllerGetAllPromotions(
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

# **promotionControllerGetPromotion**
> promotionControllerGetPromotion()


### Example

```typescript
import {
    PromotionApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new PromotionApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.promotionControllerGetPromotion(
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

# **promotionControllerGetPromotionsByPlacement**
> promotionControllerGetPromotionsByPlacement()


### Example

```typescript
import {
    PromotionApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new PromotionApi(configuration);

let placement: 'home_hero' | 'home_strip' | 'category_header' | 'category_feed' | 'store_header' | 'search_banner' | 'cart' | 'checkout'; // (default to undefined)
let channel: 'app' | 'web'; // (optional) (default to undefined)
let city: string; // (optional) (default to undefined)

const { status, data } = await apiInstance.promotionControllerGetPromotionsByPlacement(
    placement,
    channel,
    city
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **placement** | [**&#39;home_hero&#39; | &#39;home_strip&#39; | &#39;category_header&#39; | &#39;category_feed&#39; | &#39;store_header&#39; | &#39;search_banner&#39; | &#39;cart&#39; | &#39;checkout&#39;**]**Array<&#39;home_hero&#39; &#124; &#39;home_strip&#39; &#124; &#39;category_header&#39; &#124; &#39;category_feed&#39; &#124; &#39;store_header&#39; &#124; &#39;search_banner&#39; &#124; &#39;cart&#39; &#124; &#39;checkout&#39;>** |  | defaults to undefined|
| **channel** | [**&#39;app&#39; | &#39;web&#39;**]**Array<&#39;app&#39; &#124; &#39;web&#39;>** |  | (optional) defaults to undefined|
| **city** | [**string**] |  | (optional) defaults to undefined|


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

# **promotionControllerGetStatistics**
> promotionControllerGetStatistics()


### Example

```typescript
import {
    PromotionApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new PromotionApi(configuration);

const { status, data } = await apiInstance.promotionControllerGetStatistics();
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

# **promotionControllerRecordClick**
> promotionControllerRecordClick()


### Example

```typescript
import {
    PromotionApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new PromotionApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.promotionControllerRecordClick(
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

# **promotionControllerRecordConversion**
> promotionControllerRecordConversion()


### Example

```typescript
import {
    PromotionApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new PromotionApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.promotionControllerRecordConversion(
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

# **promotionControllerUpdatePromotion**
> promotionControllerUpdatePromotion(body)


### Example

```typescript
import {
    PromotionApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new PromotionApi(configuration);

let id: string; // (default to undefined)
let body: object; //

const { status, data } = await apiInstance.promotionControllerUpdatePromotion(
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

