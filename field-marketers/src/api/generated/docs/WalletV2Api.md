# WalletV2Api

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**v2WalletControllerApplyCoupon**](#v2walletcontrollerapplycoupon) | **POST** /v2/wallet/coupons/apply | تطبيق قسيمة|
|[**v2WalletControllerGetCouponsHistory**](#v2walletcontrollergetcouponshistory) | **GET** /v2/wallet/coupons/history | سجل القسائم|
|[**v2WalletControllerGetMyCoupons**](#v2walletcontrollergetmycoupons) | **GET** /v2/wallet/coupons/my | قسائمي|
|[**v2WalletControllerGetMySubscriptions**](#v2walletcontrollergetmysubscriptions) | **GET** /v2/wallet/subscriptions/my | اشتراكاتي|

# **v2WalletControllerApplyCoupon**
> v2WalletControllerApplyCoupon()


### Example

```typescript
import {
    WalletV2Api,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new WalletV2Api(configuration);

const { status, data } = await apiInstance.v2WalletControllerApplyCoupon();
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
|**200** | Coupon applied successfully |  -  |
|**400** | Invalid coupon |  -  |
|**401** | Unauthorized |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **v2WalletControllerGetCouponsHistory**
> v2WalletControllerGetCouponsHistory()


### Example

```typescript
import {
    WalletV2Api,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new WalletV2Api(configuration);

const { status, data } = await apiInstance.v2WalletControllerGetCouponsHistory();
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

# **v2WalletControllerGetMyCoupons**
> v2WalletControllerGetMyCoupons()


### Example

```typescript
import {
    WalletV2Api,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new WalletV2Api(configuration);

const { status, data } = await apiInstance.v2WalletControllerGetMyCoupons();
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

# **v2WalletControllerGetMySubscriptions**
> v2WalletControllerGetMySubscriptions()


### Example

```typescript
import {
    WalletV2Api,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new WalletV2Api(configuration);

const { status, data } = await apiInstance.v2WalletControllerGetMySubscriptions();
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

