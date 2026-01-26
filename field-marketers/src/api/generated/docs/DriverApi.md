# DriverApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**driverControllerAcceptOrder**](#drivercontrolleracceptorder) | **POST** /drivers/orders/{id}/accept | قبول طلب|
|[**driverControllerCancelVacation**](#drivercontrollercancelvacation) | **PATCH** /drivers/vacations/{id}/cancel | إلغاء طلب إجازة|
|[**driverControllerChangePassword**](#drivercontrollerchangepassword) | **POST** /drivers/change-password | تغيير كلمة المرور|
|[**driverControllerCompleteDelivery**](#drivercontrollercompletedelivery) | **POST** /drivers/orders/{id}/complete | إتمام التوصيل|
|[**driverControllerCreate**](#drivercontrollercreate) | **POST** /drivers | إنشاء سائق جديد (للإدارة)|
|[**driverControllerFindAvailable**](#drivercontrollerfindavailable) | **GET** /drivers/available | جلب السائقين المتاحين|
|[**driverControllerFindOne**](#drivercontrollerfindone) | **GET** /drivers/{id} | جلب سائق محدد|
|[**driverControllerGetAvailableOrders**](#drivercontrollergetavailableorders) | **GET** /drivers/orders/available | الطلبات المتاحة للاستلام|
|[**driverControllerGetDailyEarnings**](#drivercontrollergetdailyearnings) | **GET** /drivers/earnings/daily | أرباح اليوم|
|[**driverControllerGetDocuments**](#drivercontrollergetdocuments) | **GET** /drivers/documents | مستنداتي|
|[**driverControllerGetDriverDocumentsAdmin**](#drivercontrollergetdriverdocumentsadmin) | **GET** /drivers/{driverId}/documents | مستندات سائق (Admin)|
|[**driverControllerGetEarnings**](#drivercontrollergetearnings) | **GET** /drivers/earnings | أرباحي|
|[**driverControllerGetMyVacations**](#drivercontrollergetmyvacations) | **GET** /drivers/vacations/my | إجازاتي|
|[**driverControllerGetOrdersHistory**](#drivercontrollergetordershistory) | **GET** /drivers/orders/history | سجل الطلبات|
|[**driverControllerGetProfile**](#drivercontrollergetprofile) | **GET** /drivers/profile | ملفي الشخصي|
|[**driverControllerGetStatistics**](#drivercontrollergetstatistics) | **GET** /drivers/statistics | إحصائياتي|
|[**driverControllerGetVacationBalance**](#drivercontrollergetvacationbalance) | **GET** /drivers/vacations/balance | رصيد الإجازات|
|[**driverControllerGetVacationPolicy**](#drivercontrollergetvacationpolicy) | **GET** /drivers/vacations/policy | سياسة الإجازات|
|[**driverControllerGetWeeklyEarnings**](#drivercontrollergetweeklyearnings) | **GET** /drivers/earnings/weekly | أرباح الأسبوع|
|[**driverControllerRejectOrder**](#drivercontrollerrejectorder) | **POST** /drivers/orders/{id}/reject | رفض طلب|
|[**driverControllerReportIssue**](#drivercontrollerreportissue) | **POST** /drivers/issues/report | الإبلاغ عن مشكلة|
|[**driverControllerRequestVacation**](#drivercontrollerrequestvacation) | **POST** /drivers/vacations/request | طلب إجازة|
|[**driverControllerStartDelivery**](#drivercontrollerstartdelivery) | **POST** /drivers/orders/{id}/start-delivery | بدء التوصيل|
|[**driverControllerUpdateAvailability**](#drivercontrollerupdateavailability) | **PATCH** /drivers/availability | تحديث حالة التوفر|
|[**driverControllerUpdateLocation**](#drivercontrollerupdatelocation) | **PATCH** /drivers/location | تحديث موقع السائق|
|[**driverControllerUpdateProfile**](#drivercontrollerupdateprofile) | **PATCH** /drivers/profile | تحديث الملف الشخصي|
|[**driverControllerUploadDocument**](#drivercontrolleruploaddocument) | **POST** /drivers/documents/upload | رفع مستند|
|[**driverControllerVerifyDocument**](#drivercontrollerverifydocument) | **POST** /drivers/{driverId}/documents/{docId}/verify | التحقق من مستند (Admin)|

# **driverControllerAcceptOrder**
> driverControllerAcceptOrder()


### Example

```typescript
import {
    DriverApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DriverApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.driverControllerAcceptOrder(
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

# **driverControllerCancelVacation**
> driverControllerCancelVacation()


### Example

```typescript
import {
    DriverApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DriverApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.driverControllerCancelVacation(
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

# **driverControllerChangePassword**
> driverControllerChangePassword(driverControllerChangePasswordRequest)


### Example

```typescript
import {
    DriverApi,
    Configuration,
    DriverControllerChangePasswordRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new DriverApi(configuration);

let driverControllerChangePasswordRequest: DriverControllerChangePasswordRequest; //

const { status, data } = await apiInstance.driverControllerChangePassword(
    driverControllerChangePasswordRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **driverControllerChangePasswordRequest** | **DriverControllerChangePasswordRequest**|  | |


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

# **driverControllerCompleteDelivery**
> driverControllerCompleteDelivery()


### Example

```typescript
import {
    DriverApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DriverApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.driverControllerCompleteDelivery(
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

# **driverControllerCreate**
> driverControllerCreate(createDriverDto)


### Example

```typescript
import {
    DriverApi,
    Configuration,
    CreateDriverDto
} from './api';

const configuration = new Configuration();
const apiInstance = new DriverApi(configuration);

let createDriverDto: CreateDriverDto; //

const { status, data } = await apiInstance.driverControllerCreate(
    createDriverDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **createDriverDto** | **CreateDriverDto**|  | |


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

# **driverControllerFindAvailable**
> driverControllerFindAvailable()


### Example

```typescript
import {
    DriverApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DriverApi(configuration);

let cursor: string; //Cursor للصفحة التالية (optional) (default to undefined)
let limit: number; //عدد العناصر (optional) (default to 20)

const { status, data } = await apiInstance.driverControllerFindAvailable(
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

# **driverControllerFindOne**
> driverControllerFindOne()


### Example

```typescript
import {
    DriverApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DriverApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.driverControllerFindOne(
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

# **driverControllerGetAvailableOrders**
> driverControllerGetAvailableOrders()


### Example

```typescript
import {
    DriverApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DriverApi(configuration);

const { status, data } = await apiInstance.driverControllerGetAvailableOrders();
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

# **driverControllerGetDailyEarnings**
> driverControllerGetDailyEarnings()


### Example

```typescript
import {
    DriverApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DriverApi(configuration);

const { status, data } = await apiInstance.driverControllerGetDailyEarnings();
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

# **driverControllerGetDocuments**
> driverControllerGetDocuments()


### Example

```typescript
import {
    DriverApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DriverApi(configuration);

const { status, data } = await apiInstance.driverControllerGetDocuments();
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

# **driverControllerGetDriverDocumentsAdmin**
> driverControllerGetDriverDocumentsAdmin()


### Example

```typescript
import {
    DriverApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DriverApi(configuration);

let driverId: string; // (default to undefined)

const { status, data } = await apiInstance.driverControllerGetDriverDocumentsAdmin(
    driverId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **driverId** | [**string**] |  | defaults to undefined|


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

# **driverControllerGetEarnings**
> driverControllerGetEarnings()


### Example

```typescript
import {
    DriverApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DriverApi(configuration);

let startDate: string; // (default to undefined)
let endDate: string; // (default to undefined)

const { status, data } = await apiInstance.driverControllerGetEarnings(
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

# **driverControllerGetMyVacations**
> driverControllerGetMyVacations()


### Example

```typescript
import {
    DriverApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DriverApi(configuration);

const { status, data } = await apiInstance.driverControllerGetMyVacations();
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

# **driverControllerGetOrdersHistory**
> driverControllerGetOrdersHistory()


### Example

```typescript
import {
    DriverApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DriverApi(configuration);

let cursor: string; //Cursor للصفحة التالية (optional) (default to undefined)
let limit: number; //عدد العناصر (optional) (default to 20)

const { status, data } = await apiInstance.driverControllerGetOrdersHistory(
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

# **driverControllerGetProfile**
> driverControllerGetProfile()


### Example

```typescript
import {
    DriverApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DriverApi(configuration);

const { status, data } = await apiInstance.driverControllerGetProfile();
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

# **driverControllerGetStatistics**
> driverControllerGetStatistics()


### Example

```typescript
import {
    DriverApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DriverApi(configuration);

const { status, data } = await apiInstance.driverControllerGetStatistics();
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

# **driverControllerGetVacationBalance**
> driverControllerGetVacationBalance()


### Example

```typescript
import {
    DriverApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DriverApi(configuration);

const { status, data } = await apiInstance.driverControllerGetVacationBalance();
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

# **driverControllerGetVacationPolicy**
> driverControllerGetVacationPolicy()


### Example

```typescript
import {
    DriverApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DriverApi(configuration);

const { status, data } = await apiInstance.driverControllerGetVacationPolicy();
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

# **driverControllerGetWeeklyEarnings**
> driverControllerGetWeeklyEarnings()


### Example

```typescript
import {
    DriverApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DriverApi(configuration);

const { status, data } = await apiInstance.driverControllerGetWeeklyEarnings();
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

# **driverControllerRejectOrder**
> driverControllerRejectOrder()


### Example

```typescript
import {
    DriverApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DriverApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.driverControllerRejectOrder(
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

# **driverControllerReportIssue**
> driverControllerReportIssue(driverControllerReportIssueRequest)


### Example

```typescript
import {
    DriverApi,
    Configuration,
    DriverControllerReportIssueRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new DriverApi(configuration);

let driverControllerReportIssueRequest: DriverControllerReportIssueRequest; //

const { status, data } = await apiInstance.driverControllerReportIssue(
    driverControllerReportIssueRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **driverControllerReportIssueRequest** | **DriverControllerReportIssueRequest**|  | |


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

# **driverControllerRequestVacation**
> driverControllerRequestVacation(driverControllerRequestVacationRequest)


### Example

```typescript
import {
    DriverApi,
    Configuration,
    DriverControllerRequestVacationRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new DriverApi(configuration);

let driverControllerRequestVacationRequest: DriverControllerRequestVacationRequest; //

const { status, data } = await apiInstance.driverControllerRequestVacation(
    driverControllerRequestVacationRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **driverControllerRequestVacationRequest** | **DriverControllerRequestVacationRequest**|  | |


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

# **driverControllerStartDelivery**
> driverControllerStartDelivery()


### Example

```typescript
import {
    DriverApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DriverApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.driverControllerStartDelivery(
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

# **driverControllerUpdateAvailability**
> driverControllerUpdateAvailability(driverControllerUpdateAvailabilityRequest)


### Example

```typescript
import {
    DriverApi,
    Configuration,
    DriverControllerUpdateAvailabilityRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new DriverApi(configuration);

let driverControllerUpdateAvailabilityRequest: DriverControllerUpdateAvailabilityRequest; //

const { status, data } = await apiInstance.driverControllerUpdateAvailability(
    driverControllerUpdateAvailabilityRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **driverControllerUpdateAvailabilityRequest** | **DriverControllerUpdateAvailabilityRequest**|  | |


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

# **driverControllerUpdateLocation**
> driverControllerUpdateLocation(updateLocationDto)


### Example

```typescript
import {
    DriverApi,
    Configuration,
    UpdateLocationDto
} from './api';

const configuration = new Configuration();
const apiInstance = new DriverApi(configuration);

let updateLocationDto: UpdateLocationDto; //

const { status, data } = await apiInstance.driverControllerUpdateLocation(
    updateLocationDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **updateLocationDto** | **UpdateLocationDto**|  | |


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

# **driverControllerUpdateProfile**
> driverControllerUpdateProfile(driverControllerUpdateProfileRequest)


### Example

```typescript
import {
    DriverApi,
    Configuration,
    DriverControllerUpdateProfileRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new DriverApi(configuration);

let driverControllerUpdateProfileRequest: DriverControllerUpdateProfileRequest; //

const { status, data } = await apiInstance.driverControllerUpdateProfile(
    driverControllerUpdateProfileRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **driverControllerUpdateProfileRequest** | **DriverControllerUpdateProfileRequest**|  | |


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

# **driverControllerUploadDocument**
> driverControllerUploadDocument(driverControllerUploadDocumentRequest)


### Example

```typescript
import {
    DriverApi,
    Configuration,
    DriverControllerUploadDocumentRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new DriverApi(configuration);

let driverControllerUploadDocumentRequest: DriverControllerUploadDocumentRequest; //

const { status, data } = await apiInstance.driverControllerUploadDocument(
    driverControllerUploadDocumentRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **driverControllerUploadDocumentRequest** | **DriverControllerUploadDocumentRequest**|  | |


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

# **driverControllerVerifyDocument**
> driverControllerVerifyDocument()


### Example

```typescript
import {
    DriverApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DriverApi(configuration);

let driverId: string; // (default to undefined)
let docId: string; // (default to undefined)

const { status, data } = await apiInstance.driverControllerVerifyDocument(
    driverId,
    docId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **driverId** | [**string**] |  | defaults to undefined|
| **docId** | [**string**] |  | defaults to undefined|


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

