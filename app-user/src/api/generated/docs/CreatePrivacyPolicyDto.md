# CreatePrivacyPolicyDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**version** | **string** | إصدار السياسة | [default to undefined]
**content** | **string** | محتوى السياسة بالعربية | [default to undefined]
**contentEn** | **string** | محتوى السياسة بالإنجليزية | [default to undefined]
**effectiveDate** | **string** | تاريخ سريان السياسة | [optional] [default to undefined]
**isActive** | **boolean** | هل السياسة نشطة | [optional] [default to true]

## Example

```typescript
import { CreatePrivacyPolicyDto } from './api';

const instance: CreatePrivacyPolicyDto = {
    version,
    content,
    contentEn,
    effectiveDate,
    isActive,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
