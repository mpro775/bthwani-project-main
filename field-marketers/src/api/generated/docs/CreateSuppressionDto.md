# CreateSuppressionDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**suppressedChannels** | **Array&lt;string&gt;** | القنوات المراد حظرها | [default to undefined]
**reason** | **string** | سبب الحظر | [default to undefined]
**details** | **string** | تفاصيل إضافية | [optional] [default to undefined]
**expiresAt** | **string** | تاريخ انتهاء الحظر | [optional] [default to undefined]

## Example

```typescript
import { CreateSuppressionDto } from './api';

const instance: CreateSuppressionDto = {
    suppressedChannels,
    reason,
    details,
    expiresAt,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
