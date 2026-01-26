# LegalApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**legalControllerActivatePrivacyPolicy**](#legalcontrolleractivateprivacypolicy) | **PATCH** /legal/admin/privacy-policy/{id}/activate | تفعيل سياسة خصوصية معينة (للإدارة)|
|[**legalControllerActivateTermsOfService**](#legalcontrolleractivatetermsofservice) | **PATCH** /legal/admin/terms-of-service/{id}/activate | تفعيل شروط خدمة معينة (للإدارة)|
|[**legalControllerCheckConsent**](#legalcontrollercheckconsent) | **GET** /legal/consent/check/{type} | التحقق من موافقة المستخدم على الإصدار الحالي|
|[**legalControllerCreatePrivacyPolicy**](#legalcontrollercreateprivacypolicy) | **POST** /legal/admin/privacy-policy | إنشاء سياسة خصوصية جديدة (للإدارة)|
|[**legalControllerCreateTermsOfService**](#legalcontrollercreatetermsofservice) | **POST** /legal/admin/terms-of-service | إنشاء شروط خدمة جديدة (للإدارة)|
|[**legalControllerGetAllPrivacyPolicies**](#legalcontrollergetallprivacypolicies) | **GET** /legal/admin/privacy-policies | الحصول على جميع سياسات الخصوصية (للإدارة)|
|[**legalControllerGetAllTermsOfService**](#legalcontrollergetalltermsofservice) | **GET** /legal/admin/terms-of-service | الحصول على جميع شروط الخدمة (للإدارة)|
|[**legalControllerGetConsentStatistics**](#legalcontrollergetconsentstatistics) | **GET** /legal/admin/consent/statistics | الحصول على إحصائيات الموافقات (للإدارة)|
|[**legalControllerGetMyConsents**](#legalcontrollergetmyconsents) | **GET** /legal/consent/my | الحصول على موافقات المستخدم الحالي|
|[**legalControllerGetPrivacyPolicy**](#legalcontrollergetprivacypolicy) | **GET** /legal/privacy-policy | الحصول على سياسة الخصوصية النشطة|
|[**legalControllerGetTermsOfService**](#legalcontrollergettermsofservice) | **GET** /legal/terms-of-service | الحصول على شروط الخدمة النشطة|
|[**legalControllerRecordConsent**](#legalcontrollerrecordconsent) | **POST** /legal/consent | تسجيل موافقة المستخدم|

# **legalControllerActivatePrivacyPolicy**
> legalControllerActivatePrivacyPolicy()


### Example

```typescript
import {
    LegalApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new LegalApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.legalControllerActivatePrivacyPolicy(
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
|**403** | ممنوع - يتطلب صلاحيات إدارية |  -  |
|**404** | Not found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **legalControllerActivateTermsOfService**
> legalControllerActivateTermsOfService()


### Example

```typescript
import {
    LegalApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new LegalApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.legalControllerActivateTermsOfService(
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
|**403** | ممنوع - يتطلب صلاحيات إدارية |  -  |
|**404** | Not found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **legalControllerCheckConsent**
> legalControllerCheckConsent()


### Example

```typescript
import {
    LegalApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new LegalApi(configuration);

let type: string; // (default to undefined)

const { status, data } = await apiInstance.legalControllerCheckConsent(
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
|**200** | تم التحقق بنجاح |  -  |
|**401** | غير مصرح |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **legalControllerCreatePrivacyPolicy**
> legalControllerCreatePrivacyPolicy(createPrivacyPolicyDto)


### Example

```typescript
import {
    LegalApi,
    Configuration,
    CreatePrivacyPolicyDto
} from './api';

const configuration = new Configuration();
const apiInstance = new LegalApi(configuration);

let createPrivacyPolicyDto: CreatePrivacyPolicyDto; //

const { status, data } = await apiInstance.legalControllerCreatePrivacyPolicy(
    createPrivacyPolicyDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **createPrivacyPolicyDto** | **CreatePrivacyPolicyDto**|  | |


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
|**403** | ممنوع - يتطلب صلاحيات إدارية |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **legalControllerCreateTermsOfService**
> legalControllerCreateTermsOfService(createTermsOfServiceDto)


### Example

```typescript
import {
    LegalApi,
    Configuration,
    CreateTermsOfServiceDto
} from './api';

const configuration = new Configuration();
const apiInstance = new LegalApi(configuration);

let createTermsOfServiceDto: CreateTermsOfServiceDto; //

const { status, data } = await apiInstance.legalControllerCreateTermsOfService(
    createTermsOfServiceDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **createTermsOfServiceDto** | **CreateTermsOfServiceDto**|  | |


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
|**403** | ممنوع - يتطلب صلاحيات إدارية |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **legalControllerGetAllPrivacyPolicies**
> legalControllerGetAllPrivacyPolicies()


### Example

```typescript
import {
    LegalApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new LegalApi(configuration);

const { status, data } = await apiInstance.legalControllerGetAllPrivacyPolicies();
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
|**403** | ممنوع - يتطلب صلاحيات إدارية |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **legalControllerGetAllTermsOfService**
> legalControllerGetAllTermsOfService()


### Example

```typescript
import {
    LegalApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new LegalApi(configuration);

const { status, data } = await apiInstance.legalControllerGetAllTermsOfService();
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
|**403** | ممنوع - يتطلب صلاحيات إدارية |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **legalControllerGetConsentStatistics**
> legalControllerGetConsentStatistics()


### Example

```typescript
import {
    LegalApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new LegalApi(configuration);

const { status, data } = await apiInstance.legalControllerGetConsentStatistics();
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
|**403** | ممنوع - يتطلب صلاحيات إدارية |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **legalControllerGetMyConsents**
> legalControllerGetMyConsents()


### Example

```typescript
import {
    LegalApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new LegalApi(configuration);

const { status, data } = await apiInstance.legalControllerGetMyConsents();
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
|**200** | تم الحصول على الموافقات بنجاح |  -  |
|**401** | غير مصرح |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **legalControllerGetPrivacyPolicy**
> legalControllerGetPrivacyPolicy()


### Example

```typescript
import {
    LegalApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new LegalApi(configuration);

let lang: 'ar' | 'en'; //اللغة (ar أو en) (optional) (default to undefined)

const { status, data } = await apiInstance.legalControllerGetPrivacyPolicy(
    lang
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **lang** | [**&#39;ar&#39; | &#39;en&#39;**]**Array<&#39;ar&#39; &#124; &#39;en&#39;>** | اللغة (ar أو en) | (optional) defaults to undefined|


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
|**404** | لا توجد سياسة خصوصية نشطة |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **legalControllerGetTermsOfService**
> legalControllerGetTermsOfService()


### Example

```typescript
import {
    LegalApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new LegalApi(configuration);

let lang: 'ar' | 'en'; //اللغة (ar أو en) (optional) (default to undefined)

const { status, data } = await apiInstance.legalControllerGetTermsOfService(
    lang
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **lang** | [**&#39;ar&#39; | &#39;en&#39;**]**Array<&#39;ar&#39; &#124; &#39;en&#39;>** | اللغة (ar أو en) | (optional) defaults to undefined|


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
|**404** | لا توجد شروط خدمة نشطة |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **legalControllerRecordConsent**
> legalControllerRecordConsent(recordConsentDto)


### Example

```typescript
import {
    LegalApi,
    Configuration,
    RecordConsentDto
} from './api';

const configuration = new Configuration();
const apiInstance = new LegalApi(configuration);

let recordConsentDto: RecordConsentDto; //

const { status, data } = await apiInstance.legalControllerRecordConsent(
    recordConsentDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **recordConsentDto** | **RecordConsentDto**|  | |


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
|**201** | تم تسجيل الموافقة بنجاح |  -  |
|**400** | بيانات غير صحيحة |  -  |
|**401** | غير مصرح |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

