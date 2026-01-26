# AdminCMSApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**adminCMSControllerCreateHomeLayout**](#admincmscontrollercreatehomelayout) | **POST** /admin/home-layouts | إضافة تخطيط للصفحة الرئيسية|
|[**adminCMSControllerCreateOnboardingSlide**](#admincmscontrollercreateonboardingslide) | **POST** /admin/onboarding-slides | إضافة شريحة أونبوردينج|
|[**adminCMSControllerCreateString**](#admincmscontrollercreatestring) | **POST** /admin/strings | إضافة نص/ترجمة|
|[**adminCMSControllerDeleteCoupon**](#admincmscontrollerdeletecoupon) | **DELETE** /admin/wallet/coupons/{id} | حذف قسيمة|
|[**adminCMSControllerDeleteHomeLayout**](#admincmscontrollerdeletehomelayout) | **DELETE** /admin/home-layouts/{id} | حذف تخطيط الصفحة الرئيسية|
|[**adminCMSControllerDeleteOnboardingSlide**](#admincmscontrollerdeleteonboardingslide) | **DELETE** /admin/onboarding-slides/{id} | حذف شريحة أونبوردينج|
|[**adminCMSControllerDeletePage**](#admincmscontrollerdeletepage) | **DELETE** /admin/pages/{id} | حذف صفحة|
|[**adminCMSControllerDeleteString**](#admincmscontrollerdeletestring) | **DELETE** /admin/strings/{id} | حذف نص/ترجمة|
|[**adminCMSControllerDeleteSubscription**](#admincmscontrollerdeletesubscription) | **DELETE** /admin/wallet/subscriptions/{id} | حذف اشتراك|
|[**adminCMSControllerExportReport**](#admincmscontrollerexportreport) | **POST** /admin/reports/export/{id}/{format} | تصدير تقرير|
|[**adminCMSControllerExportSettlements**](#admincmscontrollerexportsettlements) | **GET** /admin/wallet/settlements/export | تصدير التسويات|
|[**adminCMSControllerGenerateReport**](#admincmscontrollergeneratereport) | **POST** /admin/reports/generate | إنشاء تقرير|
|[**adminCMSControllerGetRealtimeReports**](#admincmscontrollergetrealtimereports) | **GET** /admin/reports/realtime | التقارير الفورية|
|[**adminCMSControllerUpdateHomeLayout**](#admincmscontrollerupdatehomelayout) | **PUT** /admin/home-layouts/{id} | تحديث تخطيط الصفحة الرئيسية|
|[**adminCMSControllerUpdateOnboardingSlide**](#admincmscontrollerupdateonboardingslide) | **PUT** /admin/onboarding-slides/{id} | تحديث شريحة أونبوردينج|
|[**adminCMSControllerUpdatePage**](#admincmscontrollerupdatepage) | **PUT** /admin/pages/{id} | تحديث صفحة|
|[**adminCMSControllerUpdateString**](#admincmscontrollerupdatestring) | **PUT** /admin/strings/{id} | تحديث نص/ترجمة|

# **adminCMSControllerCreateHomeLayout**
> adminCMSControllerCreateHomeLayout()


### Example

```typescript
import {
    AdminCMSApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminCMSApi(configuration);

const { status, data } = await apiInstance.adminCMSControllerCreateHomeLayout();
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
|**201** | Created |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **adminCMSControllerCreateOnboardingSlide**
> adminCMSControllerCreateOnboardingSlide()


### Example

```typescript
import {
    AdminCMSApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminCMSApi(configuration);

const { status, data } = await apiInstance.adminCMSControllerCreateOnboardingSlide();
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
|**201** | Created |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **adminCMSControllerCreateString**
> adminCMSControllerCreateString()


### Example

```typescript
import {
    AdminCMSApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminCMSApi(configuration);

const { status, data } = await apiInstance.adminCMSControllerCreateString();
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
|**201** | Created |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **adminCMSControllerDeleteCoupon**
> adminCMSControllerDeleteCoupon()


### Example

```typescript
import {
    AdminCMSApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminCMSApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.adminCMSControllerDeleteCoupon(
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
|**200** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **adminCMSControllerDeleteHomeLayout**
> adminCMSControllerDeleteHomeLayout()


### Example

```typescript
import {
    AdminCMSApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminCMSApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.adminCMSControllerDeleteHomeLayout(
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

# **adminCMSControllerDeleteOnboardingSlide**
> adminCMSControllerDeleteOnboardingSlide()


### Example

```typescript
import {
    AdminCMSApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminCMSApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.adminCMSControllerDeleteOnboardingSlide(
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

# **adminCMSControllerDeletePage**
> adminCMSControllerDeletePage()


### Example

```typescript
import {
    AdminCMSApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminCMSApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.adminCMSControllerDeletePage(
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

# **adminCMSControllerDeleteString**
> adminCMSControllerDeleteString()


### Example

```typescript
import {
    AdminCMSApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminCMSApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.adminCMSControllerDeleteString(
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

# **adminCMSControllerDeleteSubscription**
> adminCMSControllerDeleteSubscription()


### Example

```typescript
import {
    AdminCMSApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminCMSApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.adminCMSControllerDeleteSubscription(
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
|**200** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **adminCMSControllerExportReport**
> adminCMSControllerExportReport()


### Example

```typescript
import {
    AdminCMSApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminCMSApi(configuration);

let id: string; // (default to undefined)
let format: string; // (default to undefined)

const { status, data } = await apiInstance.adminCMSControllerExportReport(
    id,
    format
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|
| **format** | [**string**] |  | defaults to undefined|


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
|**201** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **adminCMSControllerExportSettlements**
> adminCMSControllerExportSettlements()


### Example

```typescript
import {
    AdminCMSApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminCMSApi(configuration);

const { status, data } = await apiInstance.adminCMSControllerExportSettlements();
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
|**200** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **adminCMSControllerGenerateReport**
> adminCMSControllerGenerateReport()


### Example

```typescript
import {
    AdminCMSApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminCMSApi(configuration);

const { status, data } = await apiInstance.adminCMSControllerGenerateReport();
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
|**201** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **adminCMSControllerGetRealtimeReports**
> adminCMSControllerGetRealtimeReports()


### Example

```typescript
import {
    AdminCMSApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminCMSApi(configuration);

const { status, data } = await apiInstance.adminCMSControllerGetRealtimeReports();
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
|**200** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **adminCMSControllerUpdateHomeLayout**
> adminCMSControllerUpdateHomeLayout()


### Example

```typescript
import {
    AdminCMSApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminCMSApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.adminCMSControllerUpdateHomeLayout(
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

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **adminCMSControllerUpdateOnboardingSlide**
> adminCMSControllerUpdateOnboardingSlide()


### Example

```typescript
import {
    AdminCMSApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminCMSApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.adminCMSControllerUpdateOnboardingSlide(
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

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **adminCMSControllerUpdatePage**
> adminCMSControllerUpdatePage()


### Example

```typescript
import {
    AdminCMSApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminCMSApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.adminCMSControllerUpdatePage(
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

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **adminCMSControllerUpdateString**
> adminCMSControllerUpdateString()


### Example

```typescript
import {
    AdminCMSApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminCMSApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.adminCMSControllerUpdateString(
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

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

