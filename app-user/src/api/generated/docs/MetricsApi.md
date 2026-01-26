# MetricsApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**metricsControllerGetJsonMetrics**](#metricscontrollergetjsonmetrics) | **GET** /metrics/json | Metrics in JSON format|
|[**metricsControllerGetPrometheusMetrics**](#metricscontrollergetprometheusmetrics) | **GET** /metrics | Prometheus Metrics Endpoint|

# **metricsControllerGetJsonMetrics**
> metricsControllerGetJsonMetrics()


### Example

```typescript
import {
    MetricsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new MetricsApi(configuration);

const { status, data } = await apiInstance.metricsControllerGetJsonMetrics();
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
|**200** | Metrics in JSON format |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **metricsControllerGetPrometheusMetrics**
> metricsControllerGetPrometheusMetrics()


### Example

```typescript
import {
    MetricsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new MetricsApi(configuration);

const { status, data } = await apiInstance.metricsControllerGetPrometheusMetrics();
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
|**200** | Metrics in Prometheus format |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

