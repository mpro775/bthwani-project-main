# OrderApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**orderControllerAddNote**](#ordercontrolleraddnote) | **POST** /delivery/order/{id}/notes | إضافة ملاحظة للطلب|
|[**orderControllerAdminChangeStatus**](#ordercontrolleradminchangestatus) | **PATCH** /delivery/order/{id}/admin-status | تغيير حالة الطلب (admin)|
|[**orderControllerAssignDriver**](#ordercontrollerassigndriver) | **POST** /delivery/order/{id}/assign-driver | تعيين سائق للطلب|
|[**orderControllerCancelOrder**](#ordercontrollercancelorder) | **POST** /delivery/order/{id}/cancel | إلغاء الطلب|
|[**orderControllerCreateOrder**](#ordercontrollercreateorder) | **POST** /delivery/order | إنشاء طلب جديد|
|[**orderControllerExportOrders**](#ordercontrollerexportorders) | **GET** /delivery/order/export | تصدير الطلبات إلى Excel/CSV|
|[**orderControllerGetDeliveryTimeline**](#ordercontrollergetdeliverytimeline) | **GET** /delivery/order/{id}/delivery-timeline | خط زمني للتوصيل|
|[**orderControllerGetDriverETA**](#ordercontrollergetdrivereta) | **GET** /delivery/order/{id}/driver-eta | الوقت المتوقع للوصول|
|[**orderControllerGetLiveTracking**](#ordercontrollergetlivetracking) | **GET** /delivery/order/{id}/live-tracking | التتبع المباشر|
|[**orderControllerGetMyOrders**](#ordercontrollergetmyorders) | **GET** /delivery/order/my-orders | جلب طلبات المستخدم الحالي|
|[**orderControllerGetMyOrdersShort**](#ordercontrollergetmyordersshort) | **GET** /delivery/order | جلب طلبات المستخدم الحالي|
|[**orderControllerGetNotes**](#ordercontrollergetnotes) | **GET** /delivery/order/{id}/notes | جلب الملاحظات|
|[**orderControllerGetOrder**](#ordercontrollergetorder) | **GET** /delivery/order/{id} | تفاصيل الطلب|
|[**orderControllerGetProofOfDelivery**](#ordercontrollergetproofofdelivery) | **GET** /delivery/order/{id}/pod | جلب إثبات التسليم|
|[**orderControllerGetPublicOrderStatus**](#ordercontrollergetpublicorderstatus) | **GET** /delivery/order/public/{id}/status | حالة الطلب (عام بدون مصادقة)|
|[**orderControllerGetRouteHistory**](#ordercontrollergetroutehistory) | **GET** /delivery/order/{id}/route-history | سجل المسار|
|[**orderControllerGetUserOrders**](#ordercontrollergetuserorders) | **GET** /delivery/order/user/{userId} | جلب طلبات مستخدم محدد|
|[**orderControllerGetVendorOrders**](#ordercontrollergetvendororders) | **GET** /delivery/order/vendor/orders | جلب طلبات التاجر|
|[**orderControllerRateOrder**](#ordercontrollerrateorder) | **POST** /delivery/order/{id}/rate | تقييم الطلب|
|[**orderControllerRepeatOrder**](#ordercontrollerrepeatorder) | **POST** /delivery/order/{id}/repeat | إعادة طلب سابق|
|[**orderControllerReturnOrder**](#ordercontrollerreturnorder) | **POST** /delivery/order/{id}/return | طلب إرجاع المنتج|
|[**orderControllerScheduleOrder**](#ordercontrollerscheduleorder) | **POST** /delivery/order/{id}/schedule | جدولة طلب للتوصيل لاحقاً|
|[**orderControllerSetProofOfDelivery**](#ordercontrollersetproofofdelivery) | **POST** /delivery/order/{id}/pod | إضافة إثبات التسليم (POD)|
|[**orderControllerTrackOrder**](#ordercontrollertrackorder) | **GET** /delivery/order/{id}/tracking | تتبع الطلب|
|[**orderControllerUpdateDriverLocation**](#ordercontrollerupdatedriverlocation) | **POST** /delivery/order/{id}/update-location | تحديث موقع السائق|
|[**orderControllerVendorAcceptOrder**](#ordercontrollervendoracceptorder) | **POST** /delivery/order/{id}/vendor-accept | قبول الطلب من قبل التاجر|
|[**orderControllerVendorCancelOrder**](#ordercontrollervendorcancelorder) | **POST** /delivery/order/{id}/vendor-cancel | إلغاء الطلب من قبل التاجر|

# **orderControllerAddNote**
> orderControllerAddNote(orderControllerAddNoteRequest)

إضافة ملاحظة عامة أو خاصة للطلب

### Example

```typescript
import {
    OrderApi,
    Configuration,
    OrderControllerAddNoteRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new OrderApi(configuration);

let id: string; //معرّف الطلب (default to undefined)
let orderControllerAddNoteRequest: OrderControllerAddNoteRequest; //

const { status, data } = await apiInstance.orderControllerAddNote(
    id,
    orderControllerAddNoteRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **orderControllerAddNoteRequest** | **OrderControllerAddNoteRequest**|  | |
| **id** | [**string**] | معرّف الطلب | defaults to undefined|


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
|**200** | تمت إضافة الملاحظة بنجاح |  -  |
|**201** | Created |  -  |
|**400** | Bad request |  -  |
|**401** | Unauthorized |  -  |
|**404** | الطلب غير موجود |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **orderControllerAdminChangeStatus**
> orderControllerAdminChangeStatus()


### Example

```typescript
import {
    OrderApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new OrderApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.orderControllerAdminChangeStatus(
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

# **orderControllerAssignDriver**
> orderControllerAssignDriver(orderControllerAssignDriverRequest)

تعيين سائق متاح للطلب (Admin/Dispatcher)

### Example

```typescript
import {
    OrderApi,
    Configuration,
    OrderControllerAssignDriverRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new OrderApi(configuration);

let id: string; //معرّف الطلب (default to undefined)
let orderControllerAssignDriverRequest: OrderControllerAssignDriverRequest; //

const { status, data } = await apiInstance.orderControllerAssignDriver(
    id,
    orderControllerAssignDriverRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **orderControllerAssignDriverRequest** | **OrderControllerAssignDriverRequest**|  | |
| **id** | [**string**] | معرّف الطلب | defaults to undefined|


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
|**200** | تم تعيين السائق بنجاح |  -  |
|**201** | Created |  -  |
|**400** | Bad request |  -  |
|**401** | Unauthorized |  -  |
|**404** | الطلب أو السائق غير موجود |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **orderControllerCancelOrder**
> orderControllerCancelOrder(orderControllerVendorCancelOrderRequest)

إلغاء الطلب من قبل العميل مع ذكر السبب

### Example

```typescript
import {
    OrderApi,
    Configuration,
    OrderControllerVendorCancelOrderRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new OrderApi(configuration);

let id: string; //معرّف الطلب (default to undefined)
let orderControllerVendorCancelOrderRequest: OrderControllerVendorCancelOrderRequest; //

const { status, data } = await apiInstance.orderControllerCancelOrder(
    id,
    orderControllerVendorCancelOrderRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **orderControllerVendorCancelOrderRequest** | **OrderControllerVendorCancelOrderRequest**|  | |
| **id** | [**string**] | معرّف الطلب | defaults to undefined|


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
|**200** | تم إلغاء الطلب بنجاح |  -  |
|**201** | Created |  -  |
|**400** | Bad request |  -  |
|**401** | Unauthorized |  -  |
|**404** | الطلب غير موجود |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **orderControllerCreateOrder**
> orderControllerCreateOrder(createOrderDto)

إنشاء طلب جديد مع العناصر والعنوان

### Example

```typescript
import {
    OrderApi,
    Configuration,
    CreateOrderDto
} from './api';

const configuration = new Configuration();
const apiInstance = new OrderApi(configuration);

let createOrderDto: CreateOrderDto; //بيانات الطلب

const { status, data } = await apiInstance.orderControllerCreateOrder(
    createOrderDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **createOrderDto** | **CreateOrderDto**| بيانات الطلب | |


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

# **orderControllerExportOrders**
> orderControllerExportOrders()

تصدير قائمة الطلبات بصيغة CSV أو Excel

### Example

```typescript
import {
    OrderApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new OrderApi(configuration);

let startDate: string; //تاريخ البداية (ISO format) (optional) (default to undefined)
let endDate: string; //تاريخ النهاية (ISO format) (optional) (default to undefined)
let status: string; //حالة الطلب للتصفية (optional) (default to undefined)

const { status, data } = await apiInstance.orderControllerExportOrders(
    startDate,
    endDate,
    status
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **startDate** | [**string**] | تاريخ البداية (ISO format) | (optional) defaults to undefined|
| **endDate** | [**string**] | تاريخ النهاية (ISO format) | (optional) defaults to undefined|
| **status** | [**string**] | حالة الطلب للتصفية | (optional) defaults to undefined|


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

# **orderControllerGetDeliveryTimeline**
> orderControllerGetDeliveryTimeline()


### Example

```typescript
import {
    OrderApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new OrderApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.orderControllerGetDeliveryTimeline(
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

# **orderControllerGetDriverETA**
> orderControllerGetDriverETA()


### Example

```typescript
import {
    OrderApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new OrderApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.orderControllerGetDriverETA(
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

# **orderControllerGetLiveTracking**
> orderControllerGetLiveTracking()


### Example

```typescript
import {
    OrderApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new OrderApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.orderControllerGetLiveTracking(
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

# **orderControllerGetMyOrders**
> orderControllerGetMyOrders()

جلب جميع طلبات المستخدم الحالي مع pagination

### Example

```typescript
import {
    OrderApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new OrderApi(configuration);

let cursor: string; //Cursor للصفحة التالية (optional) (default to undefined)
let limit: number; //عدد النتائج (default: 20) (optional) (default to 20)

const { status, data } = await apiInstance.orderControllerGetMyOrders(
    cursor,
    limit
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **cursor** | [**string**] | Cursor للصفحة التالية | (optional) defaults to undefined|
| **limit** | [**number**] | عدد النتائج (default: 20) | (optional) defaults to 20|


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

# **orderControllerGetMyOrdersShort**
> orderControllerGetMyOrdersShort()

جلب جميع طلبات المستخدم الحالي

### Example

```typescript
import {
    OrderApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new OrderApi(configuration);

let cursor: string; //Cursor للصفحة التالية (optional) (default to undefined)
let limit: number; //عدد العناصر (optional) (default to 20)

const { status, data } = await apiInstance.orderControllerGetMyOrdersShort(
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

# **orderControllerGetNotes**
> orderControllerGetNotes()


### Example

```typescript
import {
    OrderApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new OrderApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.orderControllerGetNotes(
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

# **orderControllerGetOrder**
> orderControllerGetOrder()


### Example

```typescript
import {
    OrderApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new OrderApi(configuration);

let id: string; //معرّف الطلب (default to undefined)

const { status, data } = await apiInstance.orderControllerGetOrder(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] | معرّف الطلب | defaults to undefined|


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
|**200** | تفاصيل الطلب الكاملة |  -  |
|**401** | غير مصرح |  -  |
|**404** | الطلب غير موجود |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **orderControllerGetProofOfDelivery**
> orderControllerGetProofOfDelivery()


### Example

```typescript
import {
    OrderApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new OrderApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.orderControllerGetProofOfDelivery(
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

# **orderControllerGetPublicOrderStatus**
> orderControllerGetPublicOrderStatus()

الحصول على حالة الطلب للمشاركة العامة

### Example

```typescript
import {
    OrderApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new OrderApi(configuration);

let id: string; //معرّف الطلب (default to undefined)

const { status, data } = await apiInstance.orderControllerGetPublicOrderStatus(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] | معرّف الطلب | defaults to undefined|


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

# **orderControllerGetRouteHistory**
> orderControllerGetRouteHistory()


### Example

```typescript
import {
    OrderApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new OrderApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.orderControllerGetRouteHistory(
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

# **orderControllerGetUserOrders**
> orderControllerGetUserOrders()

جلب جميع طلبات مستخدم معين

### Example

```typescript
import {
    OrderApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new OrderApi(configuration);

let userId: string; //معرّف المستخدم (default to undefined)
let cursor: string; //Cursor للصفحة التالية (optional) (default to undefined)
let limit: number; //عدد العناصر (optional) (default to 20)

const { status, data } = await apiInstance.orderControllerGetUserOrders(
    userId,
    cursor,
    limit
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **userId** | [**string**] | معرّف المستخدم | defaults to undefined|
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

# **orderControllerGetVendorOrders**
> orderControllerGetVendorOrders()


### Example

```typescript
import {
    OrderApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new OrderApi(configuration);

let cursor: string; //Cursor للصفحة التالية (optional) (default to undefined)
let limit: number; //عدد العناصر (optional) (default to 20)

const { status, data } = await apiInstance.orderControllerGetVendorOrders(
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

# **orderControllerRateOrder**
> orderControllerRateOrder(orderControllerRateOrderRequest)

تقييم الطلب والخدمة بعد التسليم

### Example

```typescript
import {
    OrderApi,
    Configuration,
    OrderControllerRateOrderRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new OrderApi(configuration);

let id: string; //معرّف الطلب (default to undefined)
let orderControllerRateOrderRequest: OrderControllerRateOrderRequest; //

const { status, data } = await apiInstance.orderControllerRateOrder(
    id,
    orderControllerRateOrderRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **orderControllerRateOrderRequest** | **OrderControllerRateOrderRequest**|  | |
| **id** | [**string**] | معرّف الطلب | defaults to undefined|


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
|**200** | تم التقييم بنجاح |  -  |
|**201** | Created |  -  |
|**400** | Bad request |  -  |
|**401** | Unauthorized |  -  |
|**404** | الطلب غير موجود |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **orderControllerRepeatOrder**
> orderControllerRepeatOrder()

إعادة نفس الطلب بنفس العناصر

### Example

```typescript
import {
    OrderApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new OrderApi(configuration);

let id: string; //معرّف الطلب السابق (default to undefined)

const { status, data } = await apiInstance.orderControllerRepeatOrder(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] | معرّف الطلب السابق | defaults to undefined|


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
|**404** | الطلب السابق غير موجود |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **orderControllerReturnOrder**
> orderControllerReturnOrder(orderControllerReturnOrderRequest)

إرجاع المنتج بعد التسليم مع ذكر السبب

### Example

```typescript
import {
    OrderApi,
    Configuration,
    OrderControllerReturnOrderRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new OrderApi(configuration);

let id: string; //معرّف الطلب (default to undefined)
let orderControllerReturnOrderRequest: OrderControllerReturnOrderRequest; //

const { status, data } = await apiInstance.orderControllerReturnOrder(
    id,
    orderControllerReturnOrderRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **orderControllerReturnOrderRequest** | **OrderControllerReturnOrderRequest**|  | |
| **id** | [**string**] | معرّف الطلب | defaults to undefined|


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
|**200** | تم إنشاء طلب الإرجاع بنجاح |  -  |
|**201** | Created |  -  |
|**400** | Bad request |  -  |
|**401** | Unauthorized |  -  |
|**404** | الطلب غير موجود |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **orderControllerScheduleOrder**
> orderControllerScheduleOrder(orderControllerScheduleOrderRequest)

تحديد موعد محدد لتوصيل الطلب

### Example

```typescript
import {
    OrderApi,
    Configuration,
    OrderControllerScheduleOrderRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new OrderApi(configuration);

let id: string; //معرّف الطلب (default to undefined)
let orderControllerScheduleOrderRequest: OrderControllerScheduleOrderRequest; //

const { status, data } = await apiInstance.orderControllerScheduleOrder(
    id,
    orderControllerScheduleOrderRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **orderControllerScheduleOrderRequest** | **OrderControllerScheduleOrderRequest**|  | |
| **id** | [**string**] | معرّف الطلب | defaults to undefined|


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
|**200** | تم جدولة الطلب بنجاح |  -  |
|**201** | Created |  -  |
|**400** | Bad request |  -  |
|**401** | Unauthorized |  -  |
|**404** | الطلب غير موجود |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **orderControllerSetProofOfDelivery**
> orderControllerSetProofOfDelivery(orderControllerSetProofOfDeliveryRequest)

إضافة صورة وتوقيع كإثبات على التسليم

### Example

```typescript
import {
    OrderApi,
    Configuration,
    OrderControllerSetProofOfDeliveryRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new OrderApi(configuration);

let id: string; //معرّف الطلب (default to undefined)
let orderControllerSetProofOfDeliveryRequest: OrderControllerSetProofOfDeliveryRequest; //

const { status, data } = await apiInstance.orderControllerSetProofOfDelivery(
    id,
    orderControllerSetProofOfDeliveryRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **orderControllerSetProofOfDeliveryRequest** | **OrderControllerSetProofOfDeliveryRequest**|  | |
| **id** | [**string**] | معرّف الطلب | defaults to undefined|


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
|**200** | تم إضافة إثبات التسليم بنجاح |  -  |
|**201** | Created |  -  |
|**400** | Bad request |  -  |
|**401** | Unauthorized |  -  |
|**403** | ليس لديك صلاحية |  -  |
|**404** | الطلب غير موجود |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **orderControllerTrackOrder**
> orderControllerTrackOrder()


### Example

```typescript
import {
    OrderApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new OrderApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.orderControllerTrackOrder(
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

# **orderControllerUpdateDriverLocation**
> orderControllerUpdateDriverLocation(orderControllerUpdateDriverLocationRequest)

تحديث موقع السائق أثناء التوصيل (GPS tracking)

### Example

```typescript
import {
    OrderApi,
    Configuration,
    OrderControllerUpdateDriverLocationRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new OrderApi(configuration);

let id: string; //معرّف الطلب (default to undefined)
let orderControllerUpdateDriverLocationRequest: OrderControllerUpdateDriverLocationRequest; //

const { status, data } = await apiInstance.orderControllerUpdateDriverLocation(
    id,
    orderControllerUpdateDriverLocationRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **orderControllerUpdateDriverLocationRequest** | **OrderControllerUpdateDriverLocationRequest**|  | |
| **id** | [**string**] | معرّف الطلب | defaults to undefined|


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
|**200** | تم تحديث الموقع بنجاح |  -  |
|**201** | Created |  -  |
|**400** | Bad request |  -  |
|**401** | Unauthorized |  -  |
|**403** | ليس لديك صلاحية (driver only) |  -  |
|**404** | الطلب غير موجود |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **orderControllerVendorAcceptOrder**
> orderControllerVendorAcceptOrder()

قبول الطلب والبدء في التحضير

### Example

```typescript
import {
    OrderApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new OrderApi(configuration);

let id: string; //معرّف الطلب (default to undefined)

const { status, data } = await apiInstance.orderControllerVendorAcceptOrder(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] | معرّف الطلب | defaults to undefined|


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
|**200** | تم قبول الطلب بنجاح |  -  |
|**201** | Created |  -  |
|**400** | Bad request |  -  |
|**401** | Unauthorized |  -  |
|**403** | ليس لديك صلاحية |  -  |
|**404** | الطلب غير موجود |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **orderControllerVendorCancelOrder**
> orderControllerVendorCancelOrder(orderControllerVendorCancelOrderRequest)

إلغاء الطلب مع تحديد السبب

### Example

```typescript
import {
    OrderApi,
    Configuration,
    OrderControllerVendorCancelOrderRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new OrderApi(configuration);

let id: string; //معرّف الطلب (default to undefined)
let orderControllerVendorCancelOrderRequest: OrderControllerVendorCancelOrderRequest; //

const { status, data } = await apiInstance.orderControllerVendorCancelOrder(
    id,
    orderControllerVendorCancelOrderRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **orderControllerVendorCancelOrderRequest** | **OrderControllerVendorCancelOrderRequest**|  | |
| **id** | [**string**] | معرّف الطلب | defaults to undefined|


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
|**200** | تم إلغاء الطلب بنجاح |  -  |
|**201** | Created |  -  |
|**400** | Bad request |  -  |
|**401** | Unauthorized |  -  |
|**403** | ليس لديك صلاحية |  -  |
|**404** | الطلب غير موجود |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

