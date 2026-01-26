# VendorApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**vendorControllerCreate**](#vendorcontrollercreate) | **POST** /vendors | إنشاء تاجر جديد|
|[**vendorControllerCreateSettlement**](#vendorcontrollercreatesettlement) | **POST** /vendors/settlements | طلب تسوية مالية|
|[**vendorControllerFindAll**](#vendorcontrollerfindall) | **GET** /vendors | جلب كل التجار|
|[**vendorControllerFindOne**](#vendorcontrollerfindone) | **GET** /vendors/{id} | جلب تاجر محدد|
|[**vendorControllerGetAccountStatement**](#vendorcontrollergetaccountstatement) | **GET** /vendors/account/statement | كشف حساب التاجر|
|[**vendorControllerGetDashboard**](#vendorcontrollergetdashboard) | **GET** /vendors/dashboard/overview | لوحة معلومات التاجر|
|[**vendorControllerGetProfile**](#vendorcontrollergetprofile) | **GET** /vendors/me | جلب بيانات التاجر الحالي|
|[**vendorControllerGetSales**](#vendorcontrollergetsales) | **GET** /vendors/sales | سجل المبيعات|
|[**vendorControllerGetSettlements**](#vendorcontrollergetsettlements) | **GET** /vendors/settlements | طلبات التسوية المالية|
|[**vendorControllerRequestAccountDeletion**](#vendorcontrollerrequestaccountdeletion) | **POST** /vendors/account/delete-request | طلب حذف الحساب|
|[**vendorControllerResetPassword**](#vendorcontrollerresetpassword) | **POST** /vendors/{id}/reset-password | إعادة تعيين كلمة مرور التاجر|
|[**vendorControllerUpdate**](#vendorcontrollerupdate) | **PATCH** /vendors/me | تحديث بيانات التاجر|
|[**vendorControllerUpdateStatus**](#vendorcontrollerupdatestatus) | **PATCH** /vendors/{id}/status | تحديث حالة التاجر|
|[**vendorControllerUpdateVendor**](#vendorcontrollerupdatevendor) | **PATCH** /vendors/{id} | تحديث تاجر (للإدارة)|

# **vendorControllerCreate**
> vendorControllerCreate(createVendorDto)


### Example

```typescript
import {
    VendorApi,
    Configuration,
    CreateVendorDto
} from './api';

const configuration = new Configuration();
const apiInstance = new VendorApi(configuration);

let createVendorDto: CreateVendorDto; //

const { status, data } = await apiInstance.vendorControllerCreate(
    createVendorDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **createVendorDto** | **CreateVendorDto**|  | |


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

# **vendorControllerCreateSettlement**
> vendorControllerCreateSettlement(vendorControllerCreateSettlementRequest)


### Example

```typescript
import {
    VendorApi,
    Configuration,
    VendorControllerCreateSettlementRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new VendorApi(configuration);

let vendorControllerCreateSettlementRequest: VendorControllerCreateSettlementRequest; //

const { status, data } = await apiInstance.vendorControllerCreateSettlement(
    vendorControllerCreateSettlementRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **vendorControllerCreateSettlementRequest** | **VendorControllerCreateSettlementRequest**|  | |


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

# **vendorControllerFindAll**
> vendorControllerFindAll()


### Example

```typescript
import {
    VendorApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new VendorApi(configuration);

let cursor: string; //Cursor للصفحة التالية (optional) (default to undefined)
let limit: number; //عدد العناصر (optional) (default to 20)

const { status, data } = await apiInstance.vendorControllerFindAll(
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

# **vendorControllerFindOne**
> vendorControllerFindOne()


### Example

```typescript
import {
    VendorApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new VendorApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.vendorControllerFindOne(
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

# **vendorControllerGetAccountStatement**
> vendorControllerGetAccountStatement()


### Example

```typescript
import {
    VendorApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new VendorApi(configuration);

const { status, data } = await apiInstance.vendorControllerGetAccountStatement();
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

# **vendorControllerGetDashboard**
> vendorControllerGetDashboard()


### Example

```typescript
import {
    VendorApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new VendorApi(configuration);

const { status, data } = await apiInstance.vendorControllerGetDashboard();
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

# **vendorControllerGetProfile**
> vendorControllerGetProfile()


### Example

```typescript
import {
    VendorApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new VendorApi(configuration);

const { status, data } = await apiInstance.vendorControllerGetProfile();
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

# **vendorControllerGetSales**
> vendorControllerGetSales()


### Example

```typescript
import {
    VendorApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new VendorApi(configuration);

let limit: number; // (default to undefined)

const { status, data } = await apiInstance.vendorControllerGetSales(
    limit
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **limit** | [**number**] |  | defaults to undefined|


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

# **vendorControllerGetSettlements**
> vendorControllerGetSettlements()


### Example

```typescript
import {
    VendorApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new VendorApi(configuration);

const { status, data } = await apiInstance.vendorControllerGetSettlements();
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

# **vendorControllerRequestAccountDeletion**
> vendorControllerRequestAccountDeletion(vendorControllerRequestAccountDeletionRequest)


### Example

```typescript
import {
    VendorApi,
    Configuration,
    VendorControllerRequestAccountDeletionRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new VendorApi(configuration);

let vendorControllerRequestAccountDeletionRequest: VendorControllerRequestAccountDeletionRequest; //

const { status, data } = await apiInstance.vendorControllerRequestAccountDeletion(
    vendorControllerRequestAccountDeletionRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **vendorControllerRequestAccountDeletionRequest** | **VendorControllerRequestAccountDeletionRequest**|  | |


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

# **vendorControllerResetPassword**
> vendorControllerResetPassword()


### Example

```typescript
import {
    VendorApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new VendorApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.vendorControllerResetPassword(
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

# **vendorControllerUpdate**
> vendorControllerUpdate(updateVendorDto)


### Example

```typescript
import {
    VendorApi,
    Configuration,
    UpdateVendorDto
} from './api';

const configuration = new Configuration();
const apiInstance = new VendorApi(configuration);

let updateVendorDto: UpdateVendorDto; //

const { status, data } = await apiInstance.vendorControllerUpdate(
    updateVendorDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **updateVendorDto** | **UpdateVendorDto**|  | |


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

# **vendorControllerUpdateStatus**
> vendorControllerUpdateStatus()


### Example

```typescript
import {
    VendorApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new VendorApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.vendorControllerUpdateStatus(
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

# **vendorControllerUpdateVendor**
> vendorControllerUpdateVendor(updateVendorDto)


### Example

```typescript
import {
    VendorApi,
    Configuration,
    UpdateVendorDto
} from './api';

const configuration = new Configuration();
const apiInstance = new VendorApi(configuration);

let id: string; // (default to undefined)
let updateVendorDto: UpdateVendorDto; //

const { status, data } = await apiInstance.vendorControllerUpdateVendor(
    id,
    updateVendorDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **updateVendorDto** | **UpdateVendorDto**|  | |
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

