# OrdersCQRSApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**orderCqrsControllerAssignDriver**](#ordercqrscontrollerassigndriver) | **POST** /orders-cqrs/{id}/assign-driver | تعيين سائق للطلب (CQRS)|
|[**orderCqrsControllerCancel**](#ordercqrscontrollercancel) | **POST** /orders-cqrs/{id}/cancel | إلغاء طلب (CQRS)|
|[**orderCqrsControllerCreate**](#ordercqrscontrollercreate) | **POST** /orders-cqrs | إنشاء طلب جديد (CQRS)|
|[**orderCqrsControllerFindOne**](#ordercqrscontrollerfindone) | **GET** /orders-cqrs/{id} | جلب طلب محدد (CQRS)|
|[**orderCqrsControllerFindUserOrders**](#ordercqrscontrollerfinduserorders) | **GET** /orders-cqrs | جلب طلبات المستخدم (CQRS)|
|[**orderCqrsControllerUpdateStatus**](#ordercqrscontrollerupdatestatus) | **PATCH** /orders-cqrs/{id}/status | تحديث حالة طلب (CQRS)|

# **orderCqrsControllerAssignDriver**
> orderCqrsControllerAssignDriver()


### Example

```typescript
import {
    OrdersCQRSApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new OrdersCQRSApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.orderCqrsControllerAssignDriver(
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

# **orderCqrsControllerCancel**
> orderCqrsControllerCancel()


### Example

```typescript
import {
    OrdersCQRSApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new OrdersCQRSApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.orderCqrsControllerCancel(
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

# **orderCqrsControllerCreate**
> orderCqrsControllerCreate(createOrderDto)

ينشئ طلب جديد باستخدام CQRS Pattern

### Example

```typescript
import {
    OrdersCQRSApi,
    Configuration,
    CreateOrderDto
} from './api';

const configuration = new Configuration();
const apiInstance = new OrdersCQRSApi(configuration);

let createOrderDto: CreateOrderDto; //

const { status, data } = await apiInstance.orderCqrsControllerCreate(
    createOrderDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **createOrderDto** | **CreateOrderDto**|  | |


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

# **orderCqrsControllerFindOne**
> orderCqrsControllerFindOne()


### Example

```typescript
import {
    OrdersCQRSApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new OrdersCQRSApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.orderCqrsControllerFindOne(
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

# **orderCqrsControllerFindUserOrders**
> orderCqrsControllerFindUserOrders()


### Example

```typescript
import {
    OrdersCQRSApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new OrdersCQRSApi(configuration);

let cursor: string; //Cursor للصفحة التالية (optional) (default to undefined)
let limit: number; //عدد العناصر (optional) (default to 20)

const { status, data } = await apiInstance.orderCqrsControllerFindUserOrders(
    cursor,
    limit
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
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

# **orderCqrsControllerUpdateStatus**
> orderCqrsControllerUpdateStatus(updateOrderStatusDto)


### Example

```typescript
import {
    OrdersCQRSApi,
    Configuration,
    UpdateOrderStatusDto
} from './api';

const configuration = new Configuration();
const apiInstance = new OrdersCQRSApi(configuration);

let id: string; // (default to undefined)
let updateOrderStatusDto: UpdateOrderStatusDto; //

const { status, data } = await apiInstance.orderCqrsControllerUpdateStatus(
    id,
    updateOrderStatusDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **updateOrderStatusDto** | **UpdateOrderStatusDto**|  | |
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

