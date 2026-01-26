# AuthApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**authControllerCheckConsent**](#authcontrollercheckconsent) | **GET** /auth/consent/check/{type} | التحقق من موافقة محددة|
|[**authControllerForgotPassword**](#authcontrollerforgotpassword) | **POST** /auth/forgot | طلب إعادة تعيين كلمة المرور|
|[**authControllerGetConsentHistory**](#authcontrollergetconsenthistory) | **GET** /auth/consent/history | سجل موافقات المستخدم|
|[**authControllerGetConsentSummary**](#authcontrollergetconsentsummary) | **GET** /auth/consent/summary | ملخص موافقات المستخدم|
|[**authControllerGrantBulkConsents**](#authcontrollergrantbulkconsents) | **POST** /auth/consent/bulk | تسجيل موافقات متعددة دفعة واحدة|
|[**authControllerGrantConsent**](#authcontrollergrantconsent) | **POST** /auth/consent | تسجيل موافقة المستخدم|
|[**authControllerLoginWithFirebase**](#authcontrollerloginwithfirebase) | **POST** /auth/firebase/login | تسجيل الدخول عبر Firebase|
|[**authControllerResetPassword**](#authcontrollerresetpassword) | **POST** /auth/reset | إعادة تعيين كلمة المرور|
|[**authControllerVerifyOtp**](#authcontrollerverifyotp) | **POST** /auth/verify-otp | التحقق من رمز OTP|
|[**authControllerVerifyResetCode**](#authcontrollerverifyresetcode) | **POST** /auth/reset/verify | التحقق من رمز إعادة التعيين|
|[**authControllerWithdrawConsent**](#authcontrollerwithdrawconsent) | **DELETE** /auth/consent/{type} | سحب الموافقة|

# **authControllerCheckConsent**
> authControllerCheckConsent()


### Example

```typescript
import {
    AuthApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AuthApi(configuration);

let type: 'privacy_policy' | 'terms_of_service' | 'marketing' | 'data_processing'; //نوع الموافقة (default to undefined)

const { status, data } = await apiInstance.authControllerCheckConsent(
    type
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **type** | [**&#39;privacy_policy&#39; | &#39;terms_of_service&#39; | &#39;marketing&#39; | &#39;data_processing&#39;**]**Array<&#39;privacy_policy&#39; &#124; &#39;terms_of_service&#39; &#124; &#39;marketing&#39; &#124; &#39;data_processing&#39;>** | نوع الموافقة | defaults to undefined|


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

# **authControllerForgotPassword**
> authControllerForgotPassword(forgotPasswordDto)


### Example

```typescript
import {
    AuthApi,
    Configuration,
    ForgotPasswordDto
} from './api';

const configuration = new Configuration();
const apiInstance = new AuthApi(configuration);

let forgotPasswordDto: ForgotPasswordDto; //

const { status, data } = await apiInstance.authControllerForgotPassword(
    forgotPasswordDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **forgotPasswordDto** | **ForgotPasswordDto**|  | |


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
|**201** | Reset code sent |  -  |
|**400** | Bad request |  -  |
|**404** | User not found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **authControllerGetConsentHistory**
> authControllerGetConsentHistory()


### Example

```typescript
import {
    AuthApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AuthApi(configuration);

let type: 'privacy_policy' | 'terms_of_service' | 'marketing' | 'data_processing'; // (optional) (default to undefined)

const { status, data } = await apiInstance.authControllerGetConsentHistory(
    type
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **type** | [**&#39;privacy_policy&#39; | &#39;terms_of_service&#39; | &#39;marketing&#39; | &#39;data_processing&#39;**]**Array<&#39;privacy_policy&#39; &#124; &#39;terms_of_service&#39; &#124; &#39;marketing&#39; &#124; &#39;data_processing&#39;>** |  | (optional) defaults to undefined|


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

# **authControllerGetConsentSummary**
> authControllerGetConsentSummary()


### Example

```typescript
import {
    AuthApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AuthApi(configuration);

const { status, data } = await apiInstance.authControllerGetConsentSummary();
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

# **authControllerGrantBulkConsents**
> authControllerGrantBulkConsents(bulkConsentDto)


### Example

```typescript
import {
    AuthApi,
    Configuration,
    BulkConsentDto
} from './api';

const configuration = new Configuration();
const apiInstance = new AuthApi(configuration);

let bulkConsentDto: BulkConsentDto; //

const { status, data } = await apiInstance.authControllerGrantBulkConsents(
    bulkConsentDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **bulkConsentDto** | **BulkConsentDto**|  | |


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

# **authControllerGrantConsent**
> authControllerGrantConsent(consentDto)


### Example

```typescript
import {
    AuthApi,
    Configuration,
    ConsentDto
} from './api';

const configuration = new Configuration();
const apiInstance = new AuthApi(configuration);

let consentDto: ConsentDto; //

const { status, data } = await apiInstance.authControllerGrantConsent(
    consentDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **consentDto** | **ConsentDto**|  | |


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

# **authControllerLoginWithFirebase**
> authControllerLoginWithFirebase(firebaseAuthDto)


### Example

```typescript
import {
    AuthApi,
    Configuration,
    FirebaseAuthDto
} from './api';

const configuration = new Configuration();
const apiInstance = new AuthApi(configuration);

let firebaseAuthDto: FirebaseAuthDto; //

const { status, data } = await apiInstance.authControllerLoginWithFirebase(
    firebaseAuthDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **firebaseAuthDto** | **FirebaseAuthDto**|  | |


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

# **authControllerResetPassword**
> authControllerResetPassword(resetPasswordDto)


### Example

```typescript
import {
    AuthApi,
    Configuration,
    ResetPasswordDto
} from './api';

const configuration = new Configuration();
const apiInstance = new AuthApi(configuration);

let resetPasswordDto: ResetPasswordDto; //

const { status, data } = await apiInstance.authControllerResetPassword(
    resetPasswordDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **resetPasswordDto** | **ResetPasswordDto**|  | |


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
|**200** | Password reset successfully |  -  |
|**400** | Invalid code or password |  -  |
|**404** | User not found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **authControllerVerifyOtp**
> authControllerVerifyOtp(verifyOtpDto)


### Example

```typescript
import {
    AuthApi,
    Configuration,
    VerifyOtpDto
} from './api';

const configuration = new Configuration();
const apiInstance = new AuthApi(configuration);

let verifyOtpDto: VerifyOtpDto; //

const { status, data } = await apiInstance.authControllerVerifyOtp(
    verifyOtpDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **verifyOtpDto** | **VerifyOtpDto**|  | |


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
|**200** | OTP verified |  -  |
|**400** | Invalid OTP |  -  |
|**404** | User not found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **authControllerVerifyResetCode**
> authControllerVerifyResetCode(verifyResetCodeDto)


### Example

```typescript
import {
    AuthApi,
    Configuration,
    VerifyResetCodeDto
} from './api';

const configuration = new Configuration();
const apiInstance = new AuthApi(configuration);

let verifyResetCodeDto: VerifyResetCodeDto; //

const { status, data } = await apiInstance.authControllerVerifyResetCode(
    verifyResetCodeDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **verifyResetCodeDto** | **VerifyResetCodeDto**|  | |


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
|**200** | Code verified |  -  |
|**400** | Invalid code |  -  |
|**404** | User not found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **authControllerWithdrawConsent**
> authControllerWithdrawConsent()


### Example

```typescript
import {
    AuthApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AuthApi(configuration);

let type: 'privacy_policy' | 'terms_of_service' | 'marketing' | 'data_processing'; //نوع الموافقة (default to undefined)

const { status, data } = await apiInstance.authControllerWithdrawConsent(
    type
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **type** | [**&#39;privacy_policy&#39; | &#39;terms_of_service&#39; | &#39;marketing&#39; | &#39;data_processing&#39;**]**Array<&#39;privacy_policy&#39; &#124; &#39;terms_of_service&#39; &#124; &#39;marketing&#39; &#124; &#39;data_processing&#39;>** | نوع الموافقة | defaults to undefined|


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

