# UserApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**userControllerAddAddress**](#usercontrolleraddaddress) | **POST** /users/addresses | إضافة عنوان توصيل جديد|
|[**userControllerChangePin**](#usercontrollerchangepin) | **POST** /users/pin/change | تغيير رمز PIN|
|[**userControllerDeactivateAccount**](#usercontrollerdeactivateaccount) | **DELETE** /users/deactivate | إلغاء تفعيل الحساب|
|[**userControllerDeleteAddress**](#usercontrollerdeleteaddress) | **DELETE** /users/addresses/{addressId} | حذف عنوان|
|[**userControllerDeleteAddressAlias**](#usercontrollerdeleteaddressalias) | **DELETE** /users/address/{id} | حذف عنوان (alias)|
|[**userControllerDeleteCurrentUser**](#usercontrollerdeletecurrentuser) | **DELETE** /users/me | حذف حساب المستخدم|
|[**userControllerGetAddresses**](#usercontrollergetaddresses) | **GET** /users/addresses | جلب جميع عناوين المستخدم|
|[**userControllerGetCurrentUser**](#usercontrollergetcurrentuser) | **GET** /users/me | جلب بيانات المستخدم الحالي|
|[**userControllerGetPinStatus**](#usercontrollergetpinstatus) | **GET** /users/pin/status | حالة رمز PIN|
|[**userControllerResetPin**](#usercontrollerresetpin) | **DELETE** /users/pin/reset/{userId} | إعادة تعيين PIN (للمسؤولين)|
|[**userControllerSearchUsers**](#usercontrollersearchusers) | **GET** /users/search | البحث عن مستخدمين|
|[**userControllerSetDefaultAddress**](#usercontrollersetdefaultaddress) | **POST** /users/addresses/{addressId}/set-default | تعيين العنوان الافتراضي|
|[**userControllerSetDefaultAddressAlias**](#usercontrollersetdefaultaddressalias) | **PATCH** /users/default-address | تعيين العنوان الافتراضي (alias)|
|[**userControllerSetPin**](#usercontrollersetpin) | **POST** /users/pin/set | تعيين رمز PIN مشفر|
|[**userControllerUpdateAddress**](#usercontrollerupdateaddress) | **PATCH** /users/addresses/{addressId} | تحديث عنوان موجود|
|[**userControllerUpdateAddressAlias**](#usercontrollerupdateaddressalias) | **PATCH** /users/address/{id} | تحديث عنوان موجود (alias)|
|[**userControllerUpdateProfile**](#usercontrollerupdateprofile) | **PATCH** /users/me | تحديث الملف الشخصي|
|[**userControllerVerifyPin**](#usercontrollerverifypin) | **POST** /users/pin/verify | التحقق من رمز PIN|

# **userControllerAddAddress**
> userControllerAddAddress(addAddressDto)

إضافة عنوان توصيل مع الإحداثيات والتفاصيل

### Example

```typescript
import {
    UserApi,
    Configuration,
    AddAddressDto
} from './api';

const configuration = new Configuration();
const apiInstance = new UserApi(configuration);

let addAddressDto: AddAddressDto; //بيانات العنوان

const { status, data } = await apiInstance.userControllerAddAddress(
    addAddressDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **addAddressDto** | **AddAddressDto**| بيانات العنوان | |


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

# **userControllerChangePin**
> userControllerChangePin(userControllerChangePinRequest)

تغيير PIN الحالي (يتطلب PIN القديم)

### Example

```typescript
import {
    UserApi,
    Configuration,
    UserControllerChangePinRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new UserApi(configuration);

let userControllerChangePinRequest: UserControllerChangePinRequest; //

const { status, data } = await apiInstance.userControllerChangePin(
    userControllerChangePinRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **userControllerChangePinRequest** | **UserControllerChangePinRequest**|  | |


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
|**200** | تم تغيير PIN بنجاح |  -  |
|**201** | Created |  -  |
|**400** | Bad request |  -  |
|**401** | Unauthorized |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **userControllerDeactivateAccount**
> userControllerDeactivateAccount()

تعطيل حساب المستخدم بشكل مؤقت أو دائم

### Example

```typescript
import {
    UserApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new UserApi(configuration);

const { status, data } = await apiInstance.userControllerDeactivateAccount();
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
|**401** | Unauthorized |  -  |
|**404** | Not found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **userControllerDeleteAddress**
> userControllerDeleteAddress()

حذف عنوان توصيل من القائمة

### Example

```typescript
import {
    UserApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new UserApi(configuration);

let addressId: string; //معرّف العنوان (default to undefined)

const { status, data } = await apiInstance.userControllerDeleteAddress(
    addressId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **addressId** | [**string**] | معرّف العنوان | defaults to undefined|


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

# **userControllerDeleteAddressAlias**
> userControllerDeleteAddressAlias()


### Example

```typescript
import {
    UserApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new UserApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.userControllerDeleteAddressAlias(
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

# **userControllerDeleteCurrentUser**
> DeleteUserResponse userControllerDeleteCurrentUser()


### Example

```typescript
import {
    UserApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new UserApi(configuration);

const { status, data } = await apiInstance.userControllerDeleteCurrentUser();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**DeleteUserResponse**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | تم حذف الحساب بنجاح |  -  |
|**401** | Unauthorized |  -  |
|**404** | المستخدم غير موجود |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **userControllerGetAddresses**
> userControllerGetAddresses()

الحصول على قائمة عناوين التوصيل المحفوظة

### Example

```typescript
import {
    UserApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new UserApi(configuration);

const { status, data } = await apiInstance.userControllerGetAddresses();
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

# **userControllerGetCurrentUser**
> userControllerGetCurrentUser()

الحصول على جميع بيانات المستخدم الحالي

### Example

```typescript
import {
    UserApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new UserApi(configuration);

const { status, data } = await apiInstance.userControllerGetCurrentUser();
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
|**404** | المستخدم غير موجود |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **userControllerGetPinStatus**
> userControllerGetPinStatus()

التحقق من وجود PIN وحالة القفل

### Example

```typescript
import {
    UserApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new UserApi(configuration);

const { status, data } = await apiInstance.userControllerGetPinStatus();
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

# **userControllerResetPin**
> userControllerResetPin()

إعادة تعيين PIN لمستخدم معين (admin only)

### Example

```typescript
import {
    UserApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new UserApi(configuration);

let userId: string; //معرّف المستخدم (default to undefined)

const { status, data } = await apiInstance.userControllerResetPin(
    userId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **userId** | [**string**] | معرّف المستخدم | defaults to undefined|


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
|**403** | ليس لديك صلاحية (admin only) |  -  |
|**404** | Not found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **userControllerSearchUsers**
> userControllerSearchUsers()

البحث في قاعدة بيانات المستخدمين (admin only)

### Example

```typescript
import {
    UserApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new UserApi(configuration);

let q: string; //نص البحث (اسم، رقم، email) (default to undefined)
let cursor: string; //Cursor للصفحة التالية (optional) (default to undefined)
let limit: number; //عدد النتائج (optional) (default to 20)

const { status, data } = await apiInstance.userControllerSearchUsers(
    q,
    cursor,
    limit
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **q** | [**string**] | نص البحث (اسم، رقم، email) | defaults to undefined|
| **cursor** | [**string**] | Cursor للصفحة التالية | (optional) defaults to undefined|
| **limit** | [**number**] | عدد النتائج | (optional) defaults to 20|


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
|**403** | ليس لديك صلاحية (admin only) |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **userControllerSetDefaultAddress**
> userControllerSetDefaultAddress()

جعل عنوان معين هو العنوان الافتراضي للتوصيل

### Example

```typescript
import {
    UserApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new UserApi(configuration);

let addressId: string; //معرّف العنوان (default to undefined)

const { status, data } = await apiInstance.userControllerSetDefaultAddress(
    addressId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **addressId** | [**string**] | معرّف العنوان | defaults to undefined|


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
|**200** | تم تعيين العنوان الافتراضي بنجاح |  -  |
|**201** | Created |  -  |
|**400** | Bad request |  -  |
|**401** | Unauthorized |  -  |
|**404** | العنوان غير موجود |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **userControllerSetDefaultAddressAlias**
> userControllerSetDefaultAddressAlias(userControllerSetDefaultAddressAliasRequest)


### Example

```typescript
import {
    UserApi,
    Configuration,
    UserControllerSetDefaultAddressAliasRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new UserApi(configuration);

let userControllerSetDefaultAddressAliasRequest: UserControllerSetDefaultAddressAliasRequest; //

const { status, data } = await apiInstance.userControllerSetDefaultAddressAlias(
    userControllerSetDefaultAddressAliasRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **userControllerSetDefaultAddressAliasRequest** | **UserControllerSetDefaultAddressAliasRequest**|  | |


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
|**200** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **userControllerSetPin**
> userControllerSetPin(setPinDto)

تعيين رمز PIN من 4-6 أرقام مع تشفير bcrypt

### Example

```typescript
import {
    UserApi,
    Configuration,
    SetPinDto
} from './api';

const configuration = new Configuration();
const apiInstance = new UserApi(configuration);

let setPinDto: SetPinDto; //بيانات PIN

const { status, data } = await apiInstance.userControllerSetPin(
    setPinDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **setPinDto** | **SetPinDto**| بيانات PIN | |


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
|**200** | تم تعيين PIN بنجاح |  -  |
|**201** | Created |  -  |
|**400** | Bad request |  -  |
|**401** | Unauthorized |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **userControllerUpdateAddress**
> userControllerUpdateAddress(addAddressDto)

تعديل بيانات عنوان توصيل محفوظ

### Example

```typescript
import {
    UserApi,
    Configuration,
    AddAddressDto
} from './api';

const configuration = new Configuration();
const apiInstance = new UserApi(configuration);

let addressId: string; //معرّف العنوان (default to undefined)
let addAddressDto: AddAddressDto; //البيانات المراد تحديثها

const { status, data } = await apiInstance.userControllerUpdateAddress(
    addressId,
    addAddressDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **addAddressDto** | **AddAddressDto**| البيانات المراد تحديثها | |
| **addressId** | [**string**] | معرّف العنوان | defaults to undefined|


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

# **userControllerUpdateAddressAlias**
> userControllerUpdateAddressAlias()


### Example

```typescript
import {
    UserApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new UserApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.userControllerUpdateAddressAlias(
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

# **userControllerUpdateProfile**
> userControllerUpdateProfile(updateUserDto)

تحديث بيانات المستخدم الحالي

### Example

```typescript
import {
    UserApi,
    Configuration,
    UpdateUserDto
} from './api';

const configuration = new Configuration();
const apiInstance = new UserApi(configuration);

let updateUserDto: UpdateUserDto; //البيانات المراد تحديثها

const { status, data } = await apiInstance.userControllerUpdateProfile(
    updateUserDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **updateUserDto** | **UpdateUserDto**| البيانات المراد تحديثها | |


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

# **userControllerVerifyPin**
> userControllerVerifyPin(verifyPinDto)

التحقق من صحة رمز PIN مع حماية من Brute Force

### Example

```typescript
import {
    UserApi,
    Configuration,
    VerifyPinDto
} from './api';

const configuration = new Configuration();
const apiInstance = new UserApi(configuration);

let verifyPinDto: VerifyPinDto; //رمز PIN للتحقق

const { status, data } = await apiInstance.userControllerVerifyPin(
    verifyPinDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **verifyPinDto** | **VerifyPinDto**| رمز PIN للتحقق | |


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
|**200** | PIN صحيح |  -  |
|**201** | Created |  -  |
|**400** | Bad request |  -  |
|**401** | Unauthorized |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

