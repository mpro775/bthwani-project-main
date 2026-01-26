# ContentApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**contentControllerCancelSubscription**](#contentcontrollercancelsubscription) | **PATCH** /content/my-subscription/cancel | إلغاء الاشتراك|
|[**contentControllerCreateBanner**](#contentcontrollercreatebanner) | **POST** /content/banners | إنشاء بانر جديد|
|[**contentControllerCreateCMSPage**](#contentcontrollercreatecmspage) | **POST** /content/admin/pages | إنشاء صفحة CMS|
|[**contentControllerCreateFAQ**](#contentcontrollercreatefaq) | **POST** /content/admin/faqs | إضافة سؤال شائع|
|[**contentControllerCreateStoreSection**](#contentcontrollercreatestoresection) | **POST** /content/sections | إنشاء قسم متجر|
|[**contentControllerCreateSubscriptionPlan**](#contentcontrollercreatesubscriptionplan) | **POST** /content/subscription-plans | إنشاء خطة اشتراك|
|[**contentControllerDeleteBanner**](#contentcontrollerdeletebanner) | **DELETE** /content/banners/{id} | حذف بانر|
|[**contentControllerDeleteFAQ**](#contentcontrollerdeletefaq) | **DELETE** /content/admin/faqs/{id} | حذف سؤال شائع|
|[**contentControllerDeleteStoreSection**](#contentcontrollerdeletestoresection) | **DELETE** /content/sections/{id} | حذف قسم|
|[**contentControllerGetActiveBanners**](#contentcontrollergetactivebanners) | **GET** /content/banners | الحصول على البانرات النشطة (public)|
|[**contentControllerGetAllBanners**](#contentcontrollergetallbanners) | **GET** /content/admin/banners | كل البانرات (admin)|
|[**contentControllerGetAppSettings**](#contentcontrollergetappsettings) | **GET** /content/app-settings | إعدادات التطبيق (public)|
|[**contentControllerGetCMSPageBySlug**](#contentcontrollergetcmspagebyslug) | **GET** /content/pages/{slug} | الحصول على صفحة CMS بالـ slug|
|[**contentControllerGetCMSPages**](#contentcontrollergetcmspages) | **GET** /content/pages | الحصول على صفحات CMS (public)|
|[**contentControllerGetFAQs**](#contentcontrollergetfaqs) | **GET** /content/faqs | الأسئلة الشائعة (public)|
|[**contentControllerGetMySubscription**](#contentcontrollergetmysubscription) | **GET** /content/my-subscription | الحصول على اشتراكي|
|[**contentControllerGetStoreSections**](#contentcontrollergetstoresections) | **GET** /content/stores/{storeId}/sections | الحصول على أقسام المتجر (public)|
|[**contentControllerGetSubscriptionPlans**](#contentcontrollergetsubscriptionplans) | **GET** /content/subscription-plans | الحصول على خطط الاشتراك (public)|
|[**contentControllerRecordBannerClick**](#contentcontrollerrecordbannerclick) | **POST** /content/banners/{id}/click | تسجيل نقرة على بانر|
|[**contentControllerSubscribe**](#contentcontrollersubscribe) | **POST** /content/subscribe | الاشتراك في خطة|
|[**contentControllerUpdateAppSettings**](#contentcontrollerupdateappsettings) | **PATCH** /content/admin/app-settings | تحديث إعدادات التطبيق|
|[**contentControllerUpdateBanner**](#contentcontrollerupdatebanner) | **PATCH** /content/banners/{id} | تحديث بانر|
|[**contentControllerUpdateCMSPage**](#contentcontrollerupdatecmspage) | **PATCH** /content/admin/pages/{id} | تحديث صفحة CMS|
|[**contentControllerUpdateFAQ**](#contentcontrollerupdatefaq) | **PATCH** /content/admin/faqs/{id} | تحديث سؤال شائع|
|[**contentControllerUpdateStoreSection**](#contentcontrollerupdatestoresection) | **PATCH** /content/sections/{id} | تحديث قسم|

# **contentControllerCancelSubscription**
> contentControllerCancelSubscription(contentControllerCancelSubscriptionRequest)


### Example

```typescript
import {
    ContentApi,
    Configuration,
    ContentControllerCancelSubscriptionRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new ContentApi(configuration);

let contentControllerCancelSubscriptionRequest: ContentControllerCancelSubscriptionRequest; //

const { status, data } = await apiInstance.contentControllerCancelSubscription(
    contentControllerCancelSubscriptionRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **contentControllerCancelSubscriptionRequest** | **ContentControllerCancelSubscriptionRequest**|  | |


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

# **contentControllerCreateBanner**
> contentControllerCreateBanner(createBannerDto)


### Example

```typescript
import {
    ContentApi,
    Configuration,
    CreateBannerDto
} from './api';

const configuration = new Configuration();
const apiInstance = new ContentApi(configuration);

let createBannerDto: CreateBannerDto; //

const { status, data } = await apiInstance.contentControllerCreateBanner(
    createBannerDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **createBannerDto** | **CreateBannerDto**|  | |


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

# **contentControllerCreateCMSPage**
> contentControllerCreateCMSPage(contentControllerCreateCMSPageRequest)


### Example

```typescript
import {
    ContentApi,
    Configuration,
    ContentControllerCreateCMSPageRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new ContentApi(configuration);

let contentControllerCreateCMSPageRequest: ContentControllerCreateCMSPageRequest; //

const { status, data } = await apiInstance.contentControllerCreateCMSPage(
    contentControllerCreateCMSPageRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **contentControllerCreateCMSPageRequest** | **ContentControllerCreateCMSPageRequest**|  | |


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

# **contentControllerCreateFAQ**
> contentControllerCreateFAQ(contentControllerCreateFAQRequest)


### Example

```typescript
import {
    ContentApi,
    Configuration,
    ContentControllerCreateFAQRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new ContentApi(configuration);

let contentControllerCreateFAQRequest: ContentControllerCreateFAQRequest; //

const { status, data } = await apiInstance.contentControllerCreateFAQ(
    contentControllerCreateFAQRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **contentControllerCreateFAQRequest** | **ContentControllerCreateFAQRequest**|  | |


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

# **contentControllerCreateStoreSection**
> contentControllerCreateStoreSection(createStoreSectionDto)


### Example

```typescript
import {
    ContentApi,
    Configuration,
    CreateStoreSectionDto
} from './api';

const configuration = new Configuration();
const apiInstance = new ContentApi(configuration);

let createStoreSectionDto: CreateStoreSectionDto; //

const { status, data } = await apiInstance.contentControllerCreateStoreSection(
    createStoreSectionDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **createStoreSectionDto** | **CreateStoreSectionDto**|  | |


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

# **contentControllerCreateSubscriptionPlan**
> contentControllerCreateSubscriptionPlan(body)


### Example

```typescript
import {
    ContentApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ContentApi(configuration);

let body: object; //

const { status, data } = await apiInstance.contentControllerCreateSubscriptionPlan(
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

# **contentControllerDeleteBanner**
> contentControllerDeleteBanner()


### Example

```typescript
import {
    ContentApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ContentApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.contentControllerDeleteBanner(
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

# **contentControllerDeleteFAQ**
> contentControllerDeleteFAQ()


### Example

```typescript
import {
    ContentApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ContentApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.contentControllerDeleteFAQ(
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

# **contentControllerDeleteStoreSection**
> contentControllerDeleteStoreSection()


### Example

```typescript
import {
    ContentApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ContentApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.contentControllerDeleteStoreSection(
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

# **contentControllerGetActiveBanners**
> contentControllerGetActiveBanners()


### Example

```typescript
import {
    ContentApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ContentApi(configuration);

let placement: string; // (default to undefined)

const { status, data } = await apiInstance.contentControllerGetActiveBanners(
    placement
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **placement** | [**string**] |  | defaults to undefined|


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

# **contentControllerGetAllBanners**
> contentControllerGetAllBanners()


### Example

```typescript
import {
    ContentApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ContentApi(configuration);

const { status, data } = await apiInstance.contentControllerGetAllBanners();
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

# **contentControllerGetAppSettings**
> contentControllerGetAppSettings()


### Example

```typescript
import {
    ContentApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ContentApi(configuration);

const { status, data } = await apiInstance.contentControllerGetAppSettings();
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

# **contentControllerGetCMSPageBySlug**
> contentControllerGetCMSPageBySlug()


### Example

```typescript
import {
    ContentApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ContentApi(configuration);

let slug: string; // (default to undefined)

const { status, data } = await apiInstance.contentControllerGetCMSPageBySlug(
    slug
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **slug** | [**string**] |  | defaults to undefined|


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

# **contentControllerGetCMSPages**
> contentControllerGetCMSPages()


### Example

```typescript
import {
    ContentApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ContentApi(configuration);

let type: string; // (default to undefined)

const { status, data } = await apiInstance.contentControllerGetCMSPages(
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

# **contentControllerGetFAQs**
> contentControllerGetFAQs()


### Example

```typescript
import {
    ContentApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ContentApi(configuration);

let category: string; // (default to undefined)

const { status, data } = await apiInstance.contentControllerGetFAQs(
    category
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **category** | [**string**] |  | defaults to undefined|


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

# **contentControllerGetMySubscription**
> contentControllerGetMySubscription()


### Example

```typescript
import {
    ContentApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ContentApi(configuration);

const { status, data } = await apiInstance.contentControllerGetMySubscription();
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

# **contentControllerGetStoreSections**
> contentControllerGetStoreSections()


### Example

```typescript
import {
    ContentApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ContentApi(configuration);

let storeId: string; // (default to undefined)

const { status, data } = await apiInstance.contentControllerGetStoreSections(
    storeId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **storeId** | [**string**] |  | defaults to undefined|


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

# **contentControllerGetSubscriptionPlans**
> contentControllerGetSubscriptionPlans()


### Example

```typescript
import {
    ContentApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ContentApi(configuration);

const { status, data } = await apiInstance.contentControllerGetSubscriptionPlans();
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

# **contentControllerRecordBannerClick**
> contentControllerRecordBannerClick()


### Example

```typescript
import {
    ContentApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ContentApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.contentControllerRecordBannerClick(
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

# **contentControllerSubscribe**
> contentControllerSubscribe(body)


### Example

```typescript
import {
    ContentApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ContentApi(configuration);

let body: object; //

const { status, data } = await apiInstance.contentControllerSubscribe(
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

# **contentControllerUpdateAppSettings**
> contentControllerUpdateAppSettings(contentControllerUpdateAppSettingsRequest)


### Example

```typescript
import {
    ContentApi,
    Configuration,
    ContentControllerUpdateAppSettingsRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new ContentApi(configuration);

let contentControllerUpdateAppSettingsRequest: ContentControllerUpdateAppSettingsRequest; //

const { status, data } = await apiInstance.contentControllerUpdateAppSettings(
    contentControllerUpdateAppSettingsRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **contentControllerUpdateAppSettingsRequest** | **ContentControllerUpdateAppSettingsRequest**|  | |


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

# **contentControllerUpdateBanner**
> contentControllerUpdateBanner(body)


### Example

```typescript
import {
    ContentApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ContentApi(configuration);

let id: string; // (default to undefined)
let body: object; //

const { status, data } = await apiInstance.contentControllerUpdateBanner(
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

# **contentControllerUpdateCMSPage**
> contentControllerUpdateCMSPage()


### Example

```typescript
import {
    ContentApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ContentApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.contentControllerUpdateCMSPage(
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

# **contentControllerUpdateFAQ**
> contentControllerUpdateFAQ()


### Example

```typescript
import {
    ContentApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ContentApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.contentControllerUpdateFAQ(
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

# **contentControllerUpdateStoreSection**
> contentControllerUpdateStoreSection(body)


### Example

```typescript
import {
    ContentApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ContentApi(configuration);

let id: string; // (default to undefined)
let body: object; //

const { status, data } = await apiInstance.contentControllerUpdateStoreSection(
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

