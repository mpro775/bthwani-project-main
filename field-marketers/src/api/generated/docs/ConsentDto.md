# ConsentDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**consentType** | **string** | نوع الموافقة | [default to undefined]
**granted** | **boolean** | حالة الموافقة (موافق/غير موافق) | [default to undefined]
**version** | **string** | نسخة السياسة أو الشروط | [default to undefined]
**notes** | **string** | ملاحظات إضافية | [optional] [default to undefined]

## Example

```typescript
import { ConsentDto } from './api';

const instance: ConsentDto = {
    consentType,
    granted,
    version,
    notes,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
