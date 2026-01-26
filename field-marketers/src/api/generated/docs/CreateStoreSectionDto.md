# CreateStoreSectionDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**store** | **string** | معرف المتجر | [default to undefined]
**name** | **string** | الاسم | [default to undefined]
**nameAr** | **string** | الاسم بالعربية | [optional] [default to undefined]
**description** | **string** | الوصف | [optional] [default to undefined]
**icon** | **string** | الأيقونة | [optional] [default to undefined]
**usageType** | **string** | نوع الاستخدام | [default to undefined]
**order** | **number** | الترتيب | [default to 0]

## Example

```typescript
import { CreateStoreSectionDto } from './api';

const instance: CreateStoreSectionDto = {
    store,
    name,
    nameAr,
    description,
    icon,
    usageType,
    order,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
