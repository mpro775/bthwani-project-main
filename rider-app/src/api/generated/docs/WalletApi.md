# WalletApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**walletControllerCancelWithdrawal**](#walletcontrollercancelwithdrawal) | **PATCH** /wallet/withdraw/{id}/cancel | إلغاء طلب سحب|
|[**walletControllerCreateTransaction**](#walletcontrollercreatetransaction) | **POST** /wallet/transaction | إنشاء معاملة جديدة (للإدارة)|
|[**walletControllerGetBalance**](#walletcontrollergetbalance) | **GET** /wallet/balance | جلب رصيد المحفظة|
|[**walletControllerGetBills**](#walletcontrollergetbills) | **GET** /wallet/bills | سجل الفواتير المدفوعة|
|[**walletControllerGetMyWithdrawals**](#walletcontrollergetmywithdrawals) | **GET** /wallet/withdraw/my | طلبات السحب الخاصة بي|
|[**walletControllerGetTopupHistory**](#walletcontrollergettopuphistory) | **GET** /wallet/topup/history | سجل عمليات الشحن|
|[**walletControllerGetTopupMethods**](#walletcontrollergettopupmethods) | **GET** /wallet/topup/methods | طرق الشحن المتاحة|
|[**walletControllerGetTransactionDetails**](#walletcontrollergettransactiondetails) | **GET** /wallet/transaction/{id} | تفاصيل معاملة|
|[**walletControllerGetTransactions**](#walletcontrollergettransactions) | **GET** /wallet/transactions | جلب سجل المعاملات|
|[**walletControllerGetTransfers**](#walletcontrollergettransfers) | **GET** /wallet/transfers | سجل التحويلات|
|[**walletControllerGetWithdrawMethods**](#walletcontrollergetwithdrawmethods) | **GET** /wallet/withdraw/methods | طرق السحب المتاحة|
|[**walletControllerHoldFunds**](#walletcontrollerholdfunds) | **POST** /wallet/hold | حجز مبلغ (Escrow)|
|[**walletControllerPayBill**](#walletcontrollerpaybill) | **POST** /wallet/pay-bill | دفع فاتورة (كهرباء، ماء، إنترنت)|
|[**walletControllerRefundFunds**](#walletcontrollerrefundfunds) | **POST** /wallet/refund | إرجاع المبلغ المحجوز|
|[**walletControllerReleaseFunds**](#walletcontrollerreleasefunds) | **POST** /wallet/release | إطلاق المبلغ المحجوز|
|[**walletControllerRequestRefund**](#walletcontrollerrequestrefund) | **POST** /wallet/refund/request | طلب استرجاع|
|[**walletControllerRequestWithdrawal**](#walletcontrollerrequestwithdrawal) | **POST** /wallet/withdraw/request | طلب سحب من المحفظة|
|[**walletControllerTopupViaKuraimi**](#walletcontrollertopupviakuraimi) | **POST** /wallet/topup/kuraimi | شحن المحفظة عبر كريمي|
|[**walletControllerTransferFunds**](#walletcontrollertransferfunds) | **POST** /wallet/transfer | تحويل رصيد|
|[**walletControllerVerifyTopup**](#walletcontrollerverifytopup) | **POST** /wallet/topup/verify | التحقق من عملية الشحن|

# **walletControllerCancelWithdrawal**
> walletControllerCancelWithdrawal()

إلغاء طلب سحب قيد المعالجة

### Example

```typescript
import {
    WalletApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new WalletApi(configuration);

let id: string; //معرّف طلب السحب (default to undefined)

const { status, data } = await apiInstance.walletControllerCancelWithdrawal(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] | معرّف طلب السحب | defaults to undefined|


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

# **walletControllerCreateTransaction**
> walletControllerCreateTransaction(createTransactionDto)

إنشاء معاملة credit/debit يدوياً (admin only)

### Example

```typescript
import {
    WalletApi,
    Configuration,
    CreateTransactionDto
} from './api';

const configuration = new Configuration();
const apiInstance = new WalletApi(configuration);

let createTransactionDto: CreateTransactionDto; //

const { status, data } = await apiInstance.walletControllerCreateTransaction(
    createTransactionDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **createTransactionDto** | **CreateTransactionDto**|  | |


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
|**403** | ليس لديك صلاحية |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **walletControllerGetBalance**
> walletControllerGetBalance()

الحصول على الرصيد الحالي والرصيد المحجوز

### Example

```typescript
import {
    WalletApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new WalletApi(configuration);

const { status, data } = await apiInstance.walletControllerGetBalance();
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

# **walletControllerGetBills**
> walletControllerGetBills()

الحصول على سجل جميع الفواتير المدفوعة

### Example

```typescript
import {
    WalletApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new WalletApi(configuration);

let cursor: string; //Cursor للصفحة التالية (optional) (default to undefined)
let limit: number; //عدد العناصر (optional) (default to 20)

const { status, data } = await apiInstance.walletControllerGetBills(
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

# **walletControllerGetMyWithdrawals**
> walletControllerGetMyWithdrawals()

الحصول على قائمة طلبات السحب مع حالاتها

### Example

```typescript
import {
    WalletApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new WalletApi(configuration);

let cursor: string; //Cursor للصفحة التالية (optional) (default to undefined)
let limit: number; //عدد العناصر (optional) (default to 20)

const { status, data } = await apiInstance.walletControllerGetMyWithdrawals(
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

# **walletControllerGetTopupHistory**
> walletControllerGetTopupHistory()

الحصول على سجل جميع عمليات الشحن السابقة

### Example

```typescript
import {
    WalletApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new WalletApi(configuration);

let cursor: string; //Cursor للصفحة التالية (optional) (default to undefined)
let limit: number; //عدد العناصر (optional) (default to 20)

const { status, data } = await apiInstance.walletControllerGetTopupHistory(
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

# **walletControllerGetTopupMethods**
> walletControllerGetTopupMethods()

الحصول على قائمة طرق الشحن المدعومة (كريمي، بطاقة، وكيل)

### Example

```typescript
import {
    WalletApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new WalletApi(configuration);

const { status, data } = await apiInstance.walletControllerGetTopupMethods();
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

# **walletControllerGetTransactionDetails**
> walletControllerGetTransactionDetails()


### Example

```typescript
import {
    WalletApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new WalletApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.walletControllerGetTransactionDetails(
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

# **walletControllerGetTransactions**
> walletControllerGetTransactions()

الحصول على جميع معاملات المحفظة مع pagination

### Example

```typescript
import {
    WalletApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new WalletApi(configuration);

let cursor: string; //Cursor للصفحة التالية (optional) (default to undefined)
let limit: number; //عدد العناصر (optional) (default to 20)

const { status, data } = await apiInstance.walletControllerGetTransactions(
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

# **walletControllerGetTransfers**
> walletControllerGetTransfers()


### Example

```typescript
import {
    WalletApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new WalletApi(configuration);

let cursor: string; //Cursor للصفحة التالية (optional) (default to undefined)
let limit: number; //عدد العناصر (optional) (default to 20)

const { status, data } = await apiInstance.walletControllerGetTransfers(
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

# **walletControllerGetWithdrawMethods**
> walletControllerGetWithdrawMethods()

الحصول على قائمة طرق السحب المدعومة

### Example

```typescript
import {
    WalletApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new WalletApi(configuration);

const { status, data } = await apiInstance.walletControllerGetWithdrawMethods();
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

# **walletControllerHoldFunds**
> walletControllerHoldFunds(walletControllerHoldFundsRequest)

حجز مبلغ من المحفظة لضمان الدفع

### Example

```typescript
import {
    WalletApi,
    Configuration,
    WalletControllerHoldFundsRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new WalletApi(configuration);

let walletControllerHoldFundsRequest: WalletControllerHoldFundsRequest; //

const { status, data } = await apiInstance.walletControllerHoldFunds(
    walletControllerHoldFundsRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **walletControllerHoldFundsRequest** | **WalletControllerHoldFundsRequest**|  | |


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
|**200** | تم حجز المبلغ بنجاح |  -  |
|**201** | Created |  -  |
|**400** | Bad request |  -  |
|**401** | Unauthorized |  -  |
|**403** | ليس لديك صلاحية |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **walletControllerPayBill**
> walletControllerPayBill(walletControllerPayBillRequest)

دفع الفواتير من المحفظة

### Example

```typescript
import {
    WalletApi,
    Configuration,
    WalletControllerPayBillRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new WalletApi(configuration);

let walletControllerPayBillRequest: WalletControllerPayBillRequest; //

const { status, data } = await apiInstance.walletControllerPayBill(
    walletControllerPayBillRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **walletControllerPayBillRequest** | **WalletControllerPayBillRequest**|  | |


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
|**200** | تم دفع الفاتورة بنجاح |  -  |
|**201** | Created |  -  |
|**400** | Bad request |  -  |
|**401** | Unauthorized |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **walletControllerRefundFunds**
> walletControllerRefundFunds(walletControllerRefundFundsRequest)

إرجاع المبلغ إلى المحفظة عند إلغاء الطلب

### Example

```typescript
import {
    WalletApi,
    Configuration,
    WalletControllerRefundFundsRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new WalletApi(configuration);

let walletControllerRefundFundsRequest: WalletControllerRefundFundsRequest; //

const { status, data } = await apiInstance.walletControllerRefundFunds(
    walletControllerRefundFundsRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **walletControllerRefundFundsRequest** | **WalletControllerRefundFundsRequest**|  | |


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
|**200** | تم الإرجاع بنجاح |  -  |
|**201** | Created |  -  |
|**400** | Bad request |  -  |
|**401** | Unauthorized |  -  |
|**403** | ليس لديك صلاحية |  -  |
|**404** | المعاملة غير موجودة |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **walletControllerReleaseFunds**
> walletControllerReleaseFunds(walletControllerHoldFundsRequest)

إطلاق المبلغ المحجوز بعد تأكيد الطلب

### Example

```typescript
import {
    WalletApi,
    Configuration,
    WalletControllerHoldFundsRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new WalletApi(configuration);

let walletControllerHoldFundsRequest: WalletControllerHoldFundsRequest; //

const { status, data } = await apiInstance.walletControllerReleaseFunds(
    walletControllerHoldFundsRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **walletControllerHoldFundsRequest** | **WalletControllerHoldFundsRequest**|  | |


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
|**200** | تم إطلاق المبلغ بنجاح |  -  |
|**201** | Created |  -  |
|**400** | Bad request |  -  |
|**401** | Unauthorized |  -  |
|**403** | ليس لديك صلاحية |  -  |
|**404** | المبلغ المحجوز غير موجود |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **walletControllerRequestRefund**
> walletControllerRequestRefund()


### Example

```typescript
import {
    WalletApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new WalletApi(configuration);

const { status, data } = await apiInstance.walletControllerRequestRefund();
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

# **walletControllerRequestWithdrawal**
> walletControllerRequestWithdrawal(walletControllerRequestWithdrawalRequest)

إنشاء طلب سحب مبلغ إلى الحساب البنكي

### Example

```typescript
import {
    WalletApi,
    Configuration,
    WalletControllerRequestWithdrawalRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new WalletApi(configuration);

let walletControllerRequestWithdrawalRequest: WalletControllerRequestWithdrawalRequest; //

const { status, data } = await apiInstance.walletControllerRequestWithdrawal(
    walletControllerRequestWithdrawalRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **walletControllerRequestWithdrawalRequest** | **WalletControllerRequestWithdrawalRequest**|  | |


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

# **walletControllerTopupViaKuraimi**
> walletControllerTopupViaKuraimi(walletControllerTopupViaKuraimiRequest)

شحن المحفظة باستخدام بطاقة كريمي

### Example

```typescript
import {
    WalletApi,
    Configuration,
    WalletControllerTopupViaKuraimiRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new WalletApi(configuration);

let walletControllerTopupViaKuraimiRequest: WalletControllerTopupViaKuraimiRequest; //

const { status, data } = await apiInstance.walletControllerTopupViaKuraimi(
    walletControllerTopupViaKuraimiRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **walletControllerTopupViaKuraimiRequest** | **WalletControllerTopupViaKuraimiRequest**|  | |


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
|**200** | تم الشحن بنجاح |  -  |
|**201** | Created |  -  |
|**400** | Bad request |  -  |
|**401** | Unauthorized |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **walletControllerTransferFunds**
> walletControllerTransferFunds()


### Example

```typescript
import {
    WalletApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new WalletApi(configuration);

const { status, data } = await apiInstance.walletControllerTransferFunds();
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

# **walletControllerVerifyTopup**
> walletControllerVerifyTopup(walletControllerVerifyTopupRequest)

التحقق من نجاح عملية الشحن عبر معرّف المعاملة

### Example

```typescript
import {
    WalletApi,
    Configuration,
    WalletControllerVerifyTopupRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new WalletApi(configuration);

let walletControllerVerifyTopupRequest: WalletControllerVerifyTopupRequest; //

const { status, data } = await apiInstance.walletControllerVerifyTopup(
    walletControllerVerifyTopupRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **walletControllerVerifyTopupRequest** | **WalletControllerVerifyTopupRequest**|  | |


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
|**200** | المعاملة ناجحة |  -  |
|**201** | Created |  -  |
|**400** | Bad request |  -  |
|**401** | Unauthorized |  -  |
|**404** | المعاملة غير موجودة |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

