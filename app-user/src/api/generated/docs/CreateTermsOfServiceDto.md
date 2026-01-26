# CreateTermsOfServiceDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**version** | **string** | إصدار الشروط | [default to undefined]
**content** | **string** | محتوى الشروط بالعربية | [default to undefined]
**contentEn** | **string** | محتوى الشروط بالإنجليزية | [default to undefined]
**effectiveDate** | **string** | تاريخ سريان الشروط | [optional] [default to undefined]
**isActive** | **boolean** | هل الشروط نشطة | [optional] [default to true]

## Example

```typescript
import { CreateTermsOfServiceDto } from './api';

const instance: CreateTermsOfServiceDto = {
    version,
    content,
    contentEn,
    effectiveDate,
    isActive,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
