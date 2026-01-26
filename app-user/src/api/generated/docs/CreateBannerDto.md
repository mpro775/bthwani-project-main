# CreateBannerDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**title** | **string** | العنوان | [optional] [default to undefined]
**description** | **string** | الوصف | [optional] [default to undefined]
**image** | **string** | الصورة | [default to undefined]
**link** | **string** | الرابط | [optional] [default to undefined]
**store** | **string** | معرف المتجر | [optional] [default to undefined]
**category** | **string** | معرف الفئة | [optional] [default to undefined]
**placement** | **string** | موضع العرض | [optional] [default to undefined]
**order** | **number** | الترتيب | [default to 0]
**startDate** | **string** | تاريخ البداية | [optional] [default to undefined]
**endDate** | **string** | تاريخ النهاية | [optional] [default to undefined]

## Example

```typescript
import { CreateBannerDto } from './api';

const instance: CreateBannerDto = {
    title,
    description,
    image,
    link,
    store,
    category,
    placement,
    order,
    startDate,
    endDate,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
