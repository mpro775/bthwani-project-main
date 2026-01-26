# CreateStoreDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**name** | **string** | اسم المتجر | [default to undefined]
**name_ar** | **string** | الاسم بالعربي | [optional] [default to undefined]
**name_en** | **string** | الاسم بالإنجليزي | [optional] [default to undefined]
**address** | **string** | العنوان | [default to undefined]
**location** | [**LocationDto**](LocationDto.md) | الموقع | [default to undefined]
**category** | **string** | معرف الفئة | [optional] [default to undefined]
**image** | **string** | صورة المتجر | [optional] [default to undefined]
**logo** | **string** | الشعار | [optional] [default to undefined]
**commissionRate** | **number** | نسبة العمولة | [optional] [default to undefined]
**usageType** | **string** | نوع المتجر | [optional] [default to undefined]
**tags** | **Array&lt;string&gt;** | الوسوم | [optional] [default to undefined]

## Example

```typescript
import { CreateStoreDto } from './api';

const instance: CreateStoreDto = {
    name,
    name_ar,
    name_en,
    address,
    location,
    category,
    image,
    logo,
    commissionRate,
    usageType,
    tags,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
