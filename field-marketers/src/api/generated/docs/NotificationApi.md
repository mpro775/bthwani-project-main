# NotificationApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**notificationControllerCreate**](#notificationcontrollercreate) | **POST** /notifications | إنشاء إشعار (للإدارة)|
|[**notificationControllerCreateSuppression**](#notificationcontrollercreatesuppression) | **POST** /notifications/suppression | حظر قنوات إشعارات محددة|
|[**notificationControllerDelete**](#notificationcontrollerdelete) | **DELETE** /notifications/{id} | حذف إشعار|
|[**notificationControllerGetMyNotifications**](#notificationcontrollergetmynotifications) | **GET** /notifications/my | جلب إشعارات المستخدم|
|[**notificationControllerGetSuppressedChannels**](#notificationcontrollergetsuppressedchannels) | **GET** /notifications/suppression/channels | جلب القنوات المحظورة|
|[**notificationControllerGetSuppressionStats**](#notificationcontrollergetsuppressionstats) | **GET** /notifications/suppression/stats | إحصائيات الحظر (للإدارة)|
|[**notificationControllerGetUnreadCount**](#notificationcontrollergetunreadcount) | **GET** /notifications/unread/count | عدد الإشعارات غير المقروءة|
|[**notificationControllerGetUserSuppressions**](#notificationcontrollergetusersuppressions) | **GET** /notifications/suppression | جلب قائمة الحظر للمستخدم|
|[**notificationControllerMarkAllAsRead**](#notificationcontrollermarkallasread) | **POST** /notifications/read-all | تحديد جميع الإشعارات كمقروءة|
|[**notificationControllerMarkAsRead**](#notificationcontrollermarkasread) | **POST** /notifications/{id}/read | تحديد الإشعار كمقروء|
|[**notificationControllerRemoveChannelSuppression**](#notificationcontrollerremovechannelsuppression) | **DELETE** /notifications/suppression/channel/{channel} | إلغاء حظر قناة محددة|
|[**notificationControllerRemoveSuppression**](#notificationcontrollerremovesuppression) | **DELETE** /notifications/suppression/{id} | إلغاء حظر|
|[**notificationControllerSendBulkNotification**](#notificationcontrollersendbulknotification) | **POST** /notifications/send-bulk | إرسال إشعار جماعي (Admin)|

# **notificationControllerCreate**
> notificationControllerCreate(createNotificationDto)


### Example

```typescript
import {
    NotificationApi,
    Configuration,
    CreateNotificationDto
} from './api';

const configuration = new Configuration();
const apiInstance = new NotificationApi(configuration);

let createNotificationDto: CreateNotificationDto; //

const { status, data } = await apiInstance.notificationControllerCreate(
    createNotificationDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **createNotificationDto** | **CreateNotificationDto**|  | |


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

# **notificationControllerCreateSuppression**
> notificationControllerCreateSuppression(createSuppressionDto)


### Example

```typescript
import {
    NotificationApi,
    Configuration,
    CreateSuppressionDto
} from './api';

const configuration = new Configuration();
const apiInstance = new NotificationApi(configuration);

let createSuppressionDto: CreateSuppressionDto; //

const { status, data } = await apiInstance.notificationControllerCreateSuppression(
    createSuppressionDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **createSuppressionDto** | **CreateSuppressionDto**|  | |


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

# **notificationControllerDelete**
> notificationControllerDelete()


### Example

```typescript
import {
    NotificationApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new NotificationApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.notificationControllerDelete(
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

# **notificationControllerGetMyNotifications**
> notificationControllerGetMyNotifications()


### Example

```typescript
import {
    NotificationApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new NotificationApi(configuration);

let cursor: string; //Cursor للصفحة التالية (optional) (default to undefined)
let limit: number; //عدد العناصر (optional) (default to 20)

const { status, data } = await apiInstance.notificationControllerGetMyNotifications(
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

# **notificationControllerGetSuppressedChannels**
> notificationControllerGetSuppressedChannels()


### Example

```typescript
import {
    NotificationApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new NotificationApi(configuration);

const { status, data } = await apiInstance.notificationControllerGetSuppressedChannels();
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

# **notificationControllerGetSuppressionStats**
> notificationControllerGetSuppressionStats()


### Example

```typescript
import {
    NotificationApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new NotificationApi(configuration);

const { status, data } = await apiInstance.notificationControllerGetSuppressionStats();
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

# **notificationControllerGetUnreadCount**
> notificationControllerGetUnreadCount()


### Example

```typescript
import {
    NotificationApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new NotificationApi(configuration);

const { status, data } = await apiInstance.notificationControllerGetUnreadCount();
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

# **notificationControllerGetUserSuppressions**
> notificationControllerGetUserSuppressions()


### Example

```typescript
import {
    NotificationApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new NotificationApi(configuration);

const { status, data } = await apiInstance.notificationControllerGetUserSuppressions();
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

# **notificationControllerMarkAllAsRead**
> notificationControllerMarkAllAsRead()


### Example

```typescript
import {
    NotificationApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new NotificationApi(configuration);

const { status, data } = await apiInstance.notificationControllerMarkAllAsRead();
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
|**400** | Bad request |  -  |
|**401** | Unauthorized |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **notificationControllerMarkAsRead**
> notificationControllerMarkAsRead()


### Example

```typescript
import {
    NotificationApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new NotificationApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.notificationControllerMarkAsRead(
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

# **notificationControllerRemoveChannelSuppression**
> notificationControllerRemoveChannelSuppression()


### Example

```typescript
import {
    NotificationApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new NotificationApi(configuration);

let channel: 'push' | 'email' | 'sms'; // (default to undefined)

const { status, data } = await apiInstance.notificationControllerRemoveChannelSuppression(
    channel
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **channel** | [**&#39;push&#39; | &#39;email&#39; | &#39;sms&#39;**]**Array<&#39;push&#39; &#124; &#39;email&#39; &#124; &#39;sms&#39;>** |  | defaults to undefined|


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

# **notificationControllerRemoveSuppression**
> notificationControllerRemoveSuppression()


### Example

```typescript
import {
    NotificationApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new NotificationApi(configuration);

let id: string; //معرف الحظر (default to undefined)

const { status, data } = await apiInstance.notificationControllerRemoveSuppression(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] | معرف الحظر | defaults to undefined|


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

# **notificationControllerSendBulkNotification**
> notificationControllerSendBulkNotification(notificationControllerSendBulkNotificationRequest)


### Example

```typescript
import {
    NotificationApi,
    Configuration,
    NotificationControllerSendBulkNotificationRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new NotificationApi(configuration);

let notificationControllerSendBulkNotificationRequest: NotificationControllerSendBulkNotificationRequest; //

const { status, data } = await apiInstance.notificationControllerSendBulkNotification(
    notificationControllerSendBulkNotificationRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **notificationControllerSendBulkNotificationRequest** | **NotificationControllerSendBulkNotificationRequest**|  | |


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

