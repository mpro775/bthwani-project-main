# CreatePromotionDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**title** | **string** | العنوان | [optional] [default to undefined]
**description** | **string** | الوصف | [optional] [default to undefined]
**image** | **string** | الصورة | [optional] [default to undefined]
**link** | **string** | الرابط | [optional] [default to undefined]
**target** | **string** | الهدف | [default to undefined]
**value** | **number** | القيمة | [optional] [default to undefined]
**valueType** | **string** | نوع القيمة | [optional] [default to undefined]
**product** | **string** | معرف المنتج | [optional] [default to undefined]
**store** | **string** | معرف المتجر | [optional] [default to undefined]
**category** | **string** | معرف الفئة | [optional] [default to undefined]
**placements** | **Array&lt;string&gt;** | المواضع | [default to undefined]
**cities** | **Array&lt;string&gt;** | المدن | [optional] [default to undefined]
**channels** | **Array&lt;string&gt;** | القنوات | [optional] [default to undefined]
**stacking** | **string** | قاعدة التكديس | [optional] [default to undefined]
**minQty** | **number** | الحد الأدنى للكمية | [optional] [default to undefined]
**minOrderSubtotal** | **number** | الحد الأدنى لقيمة الطلب | [optional] [default to undefined]
**maxDiscountAmount** | **number** | الحد الأقصى للخصم | [optional] [default to undefined]
**order** | **number** | الترتيب | [optional] [default to undefined]
**startDate** | **string** | تاريخ البداية | [default to undefined]
**endDate** | **string** | تاريخ النهاية | [default to undefined]
**isActive** | **boolean** | حالة النشاط | [default to true]

## Example

```typescript
import { CreatePromotionDto } from './api';

const instance: CreatePromotionDto = {
    title,
    description,
    image,
    link,
    target,
    value,
    valueType,
    product,
    store,
    category,
    placements,
    cities,
    channels,
    stacking,
    minQty,
    minOrderSubtotal,
    maxDiscountAmount,
    order,
    startDate,
    endDate,
    isActive,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
