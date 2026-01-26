# RecordConsentDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**consentType** | **string** | نوع الموافقة | [default to undefined]
**version** | **string** | إصدار المستند | [default to undefined]
**accepted** | **boolean** | هل تمت الموافقة | [default to true]
**ipAddress** | **string** | عنوان IP | [optional] [default to undefined]
**userAgent** | **string** | User Agent | [optional] [default to undefined]

## Example

```typescript
import { RecordConsentDto } from './api';

const instance: RecordConsentDto = {
    consentType,
    version,
    accepted,
    ipAddress,
    userAgent,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
