# ERSystemApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**eRControllerApproveLeaveRequest**](#ercontrollerapproveleaverequest) | **PATCH** /er/leave-requests/{id}/approve | الموافقة على طلب إجازة|
|[**eRControllerApprovePayroll**](#ercontrollerapprovepayroll) | **PATCH** /er/payroll/{id}/approve | الموافقة على كشف راتب|
|[**eRControllerCheckIn**](#ercontrollercheckin) | **POST** /er/attendance/check-in | تسجيل حضور|
|[**eRControllerCheckOut**](#ercontrollercheckout) | **POST** /er/attendance/check-out | تسجيل انصراف|
|[**eRControllerCreateAccount**](#ercontrollercreateaccount) | **POST** /er/accounts | إنشاء حساب|
|[**eRControllerCreateEmployee**](#ercontrollercreateemployee) | **POST** /er/employees | إضافة موظف جديد|
|[**eRControllerCreateJournalEntry**](#ercontrollercreatejournalentry) | **POST** /er/journal-entries | إنشاء قيد يومية|
|[**eRControllerCreateLeaveRequest**](#ercontrollercreateleaverequest) | **POST** /er/leave-requests | تقديم طلب إجازة|
|[**eRControllerDeleteAsset**](#ercontrollerdeleteasset) | **DELETE** /er/assets/{id} | حذف أصل|
|[**eRControllerDeleteBulkDocuments**](#ercontrollerdeletebulkdocuments) | **DELETE** /er/documents/bulk | حذف مستندات متعددة|
|[**eRControllerDeleteChartAccount**](#ercontrollerdeletechartaccount) | **DELETE** /er/accounts/chart/{id} | حذف حساب من دليل الحسابات|
|[**eRControllerDeleteDocument**](#ercontrollerdeletedocument) | **DELETE** /er/documents/{id} | حذف مستند|
|[**eRControllerDeleteEmployee**](#ercontrollerdeleteemployee) | **DELETE** /er/employees/{id} | حذف موظف|
|[**eRControllerDeletePayroll**](#ercontrollerdeletepayroll) | **DELETE** /er/payroll/{id} | حذف كشف راتب|
|[**eRControllerDownloadDocument**](#ercontrollerdownloaddocument) | **GET** /er/documents/{id}/download | تنزيل مستند|
|[**eRControllerExportDocuments**](#ercontrollerexportdocuments) | **GET** /er/documents/export | تصدير مستندات|
|[**eRControllerGeneratePayroll**](#ercontrollergeneratepayroll) | **POST** /er/payroll/generate | إنشاء كشف راتب|
|[**eRControllerGetAccount**](#ercontrollergetaccount) | **GET** /er/accounts/{id} | الحصول على حساب|
|[**eRControllerGetAccounts**](#ercontrollergetaccounts) | **GET** /er/accounts | دليل الحسابات|
|[**eRControllerGetAllEmployees**](#ercontrollergetallemployees) | **GET** /er/employees | الحصول على كل الموظفين|
|[**eRControllerGetEmployee**](#ercontrollergetemployee) | **GET** /er/employees/{id} | الحصول على موظف محدد|
|[**eRControllerGetEmployeeAttendance**](#ercontrollergetemployeeattendance) | **GET** /er/attendance/{employeeId} | سجل حضور موظف|
|[**eRControllerGetJournalEntries**](#ercontrollergetjournalentries) | **GET** /er/journal-entries | الحصول على قيود اليومية|
|[**eRControllerGetTrialBalance**](#ercontrollergettrialbalance) | **GET** /er/reports/trial-balance | ميزان المراجعة|
|[**eRControllerMarkAsPaid**](#ercontrollermarkaspaid) | **PATCH** /er/payroll/{id}/mark-paid | تحديد كدفع|
|[**eRControllerPostJournalEntry**](#ercontrollerpostjournalentry) | **PATCH** /er/journal-entries/{id}/post | ترحيل قيد|
|[**eRControllerRejectLeaveRequest**](#ercontrollerrejectleaverequest) | **PATCH** /er/leave-requests/{id}/reject | رفض طلب إجازة|
|[**eRControllerUpdateEmployee**](#ercontrollerupdateemployee) | **PATCH** /er/employees/{id} | تحديث موظف|

# **eRControllerApproveLeaveRequest**
> eRControllerApproveLeaveRequest()


### Example

```typescript
import {
    ERSystemApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ERSystemApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.eRControllerApproveLeaveRequest(
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

# **eRControllerApprovePayroll**
> eRControllerApprovePayroll()


### Example

```typescript
import {
    ERSystemApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ERSystemApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.eRControllerApprovePayroll(
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

# **eRControllerCheckIn**
> eRControllerCheckIn(eRControllerCheckInRequest)


### Example

```typescript
import {
    ERSystemApi,
    Configuration,
    ERControllerCheckInRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new ERSystemApi(configuration);

let eRControllerCheckInRequest: ERControllerCheckInRequest; //

const { status, data } = await apiInstance.eRControllerCheckIn(
    eRControllerCheckInRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **eRControllerCheckInRequest** | **ERControllerCheckInRequest**|  | |


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

# **eRControllerCheckOut**
> eRControllerCheckOut(eRControllerCheckInRequest)


### Example

```typescript
import {
    ERSystemApi,
    Configuration,
    ERControllerCheckInRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new ERSystemApi(configuration);

let eRControllerCheckInRequest: ERControllerCheckInRequest; //

const { status, data } = await apiInstance.eRControllerCheckOut(
    eRControllerCheckInRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **eRControllerCheckInRequest** | **ERControllerCheckInRequest**|  | |


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

# **eRControllerCreateAccount**
> eRControllerCreateAccount(createChartAccountDto)


### Example

```typescript
import {
    ERSystemApi,
    Configuration,
    CreateChartAccountDto
} from './api';

const configuration = new Configuration();
const apiInstance = new ERSystemApi(configuration);

let createChartAccountDto: CreateChartAccountDto; //

const { status, data } = await apiInstance.eRControllerCreateAccount(
    createChartAccountDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **createChartAccountDto** | **CreateChartAccountDto**|  | |


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

# **eRControllerCreateEmployee**
> eRControllerCreateEmployee(createEmployeeDto)


### Example

```typescript
import {
    ERSystemApi,
    Configuration,
    CreateEmployeeDto
} from './api';

const configuration = new Configuration();
const apiInstance = new ERSystemApi(configuration);

let createEmployeeDto: CreateEmployeeDto; //

const { status, data } = await apiInstance.eRControllerCreateEmployee(
    createEmployeeDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **createEmployeeDto** | **CreateEmployeeDto**|  | |


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

# **eRControllerCreateJournalEntry**
> eRControllerCreateJournalEntry(createJournalEntryDto)


### Example

```typescript
import {
    ERSystemApi,
    Configuration,
    CreateJournalEntryDto
} from './api';

const configuration = new Configuration();
const apiInstance = new ERSystemApi(configuration);

let createJournalEntryDto: CreateJournalEntryDto; //

const { status, data } = await apiInstance.eRControllerCreateJournalEntry(
    createJournalEntryDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **createJournalEntryDto** | **CreateJournalEntryDto**|  | |


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

# **eRControllerCreateLeaveRequest**
> eRControllerCreateLeaveRequest(createLeaveRequestDto)


### Example

```typescript
import {
    ERSystemApi,
    Configuration,
    CreateLeaveRequestDto
} from './api';

const configuration = new Configuration();
const apiInstance = new ERSystemApi(configuration);

let createLeaveRequestDto: CreateLeaveRequestDto; //

const { status, data } = await apiInstance.eRControllerCreateLeaveRequest(
    createLeaveRequestDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **createLeaveRequestDto** | **CreateLeaveRequestDto**|  | |


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

# **eRControllerDeleteAsset**
> eRControllerDeleteAsset()


### Example

```typescript
import {
    ERSystemApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ERSystemApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.eRControllerDeleteAsset(
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

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **eRControllerDeleteBulkDocuments**
> eRControllerDeleteBulkDocuments()


### Example

```typescript
import {
    ERSystemApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ERSystemApi(configuration);

const { status, data } = await apiInstance.eRControllerDeleteBulkDocuments();
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
|**200** | Deleted |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **eRControllerDeleteChartAccount**
> eRControllerDeleteChartAccount()


### Example

```typescript
import {
    ERSystemApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ERSystemApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.eRControllerDeleteChartAccount(
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

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **eRControllerDeleteDocument**
> eRControllerDeleteDocument()


### Example

```typescript
import {
    ERSystemApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ERSystemApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.eRControllerDeleteDocument(
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

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **eRControllerDeleteEmployee**
> eRControllerDeleteEmployee()


### Example

```typescript
import {
    ERSystemApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ERSystemApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.eRControllerDeleteEmployee(
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

# **eRControllerDeletePayroll**
> eRControllerDeletePayroll()


### Example

```typescript
import {
    ERSystemApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ERSystemApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.eRControllerDeletePayroll(
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

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **eRControllerDownloadDocument**
> eRControllerDownloadDocument()


### Example

```typescript
import {
    ERSystemApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ERSystemApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.eRControllerDownloadDocument(
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

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **eRControllerExportDocuments**
> eRControllerExportDocuments()


### Example

```typescript
import {
    ERSystemApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ERSystemApi(configuration);

const { status, data } = await apiInstance.eRControllerExportDocuments();
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

# **eRControllerGeneratePayroll**
> eRControllerGeneratePayroll(eRControllerGeneratePayrollRequest)


### Example

```typescript
import {
    ERSystemApi,
    Configuration,
    ERControllerGeneratePayrollRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new ERSystemApi(configuration);

let eRControllerGeneratePayrollRequest: ERControllerGeneratePayrollRequest; //

const { status, data } = await apiInstance.eRControllerGeneratePayroll(
    eRControllerGeneratePayrollRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **eRControllerGeneratePayrollRequest** | **ERControllerGeneratePayrollRequest**|  | |


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

# **eRControllerGetAccount**
> eRControllerGetAccount()


### Example

```typescript
import {
    ERSystemApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ERSystemApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.eRControllerGetAccount(
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

# **eRControllerGetAccounts**
> eRControllerGetAccounts()


### Example

```typescript
import {
    ERSystemApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ERSystemApi(configuration);

let type: string; // (default to undefined)

const { status, data } = await apiInstance.eRControllerGetAccounts(
    type
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **type** | [**string**] |  | defaults to undefined|


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

# **eRControllerGetAllEmployees**
> eRControllerGetAllEmployees()


### Example

```typescript
import {
    ERSystemApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ERSystemApi(configuration);

let status: string; // (default to undefined)

const { status, data } = await apiInstance.eRControllerGetAllEmployees(
    status
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
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

# **eRControllerGetEmployee**
> eRControllerGetEmployee()


### Example

```typescript
import {
    ERSystemApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ERSystemApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.eRControllerGetEmployee(
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

# **eRControllerGetEmployeeAttendance**
> eRControllerGetEmployeeAttendance()


### Example

```typescript
import {
    ERSystemApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ERSystemApi(configuration);

let employeeId: string; // (default to undefined)
let month: number; // (default to undefined)
let year: number; // (default to undefined)

const { status, data } = await apiInstance.eRControllerGetEmployeeAttendance(
    employeeId,
    month,
    year
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **employeeId** | [**string**] |  | defaults to undefined|
| **month** | [**number**] |  | defaults to undefined|
| **year** | [**number**] |  | defaults to undefined|


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

# **eRControllerGetJournalEntries**
> eRControllerGetJournalEntries()


### Example

```typescript
import {
    ERSystemApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ERSystemApi(configuration);

let type: string; // (default to undefined)
let status: string; // (default to undefined)
let startDate: string; // (default to undefined)
let endDate: string; // (default to undefined)

const { status, data } = await apiInstance.eRControllerGetJournalEntries(
    type,
    status,
    startDate,
    endDate
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **type** | [**string**] |  | defaults to undefined|
| **status** | [**string**] |  | defaults to undefined|
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

# **eRControllerGetTrialBalance**
> eRControllerGetTrialBalance()


### Example

```typescript
import {
    ERSystemApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ERSystemApi(configuration);

let date: string; // (default to undefined)

const { status, data } = await apiInstance.eRControllerGetTrialBalance(
    date
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **date** | [**string**] |  | defaults to undefined|


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

# **eRControllerMarkAsPaid**
> eRControllerMarkAsPaid()


### Example

```typescript
import {
    ERSystemApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ERSystemApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.eRControllerMarkAsPaid(
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

# **eRControllerPostJournalEntry**
> eRControllerPostJournalEntry()


### Example

```typescript
import {
    ERSystemApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ERSystemApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.eRControllerPostJournalEntry(
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

# **eRControllerRejectLeaveRequest**
> eRControllerRejectLeaveRequest()


### Example

```typescript
import {
    ERSystemApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ERSystemApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.eRControllerRejectLeaveRequest(
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

# **eRControllerUpdateEmployee**
> eRControllerUpdateEmployee(updateEmployeeDto)


### Example

```typescript
import {
    ERSystemApi,
    Configuration,
    UpdateEmployeeDto
} from './api';

const configuration = new Configuration();
const apiInstance = new ERSystemApi(configuration);

let id: string; // (default to undefined)
let updateEmployeeDto: UpdateEmployeeDto; //

const { status, data } = await apiInstance.eRControllerUpdateEmployee(
    id,
    updateEmployeeDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **updateEmployeeDto** | **UpdateEmployeeDto**|  | |
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

