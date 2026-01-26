# CreateProductDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**name** | **string** | اسم المنتج | [default to undefined]
**name_ar** | **string** | الاسم بالعربي | [optional] [default to undefined]
**name_en** | **string** | الاسم بالإنجليزي | [optional] [default to undefined]
**description** | **string** | الوصف | [optional] [default to undefined]
**price** | **number** | السعر | [default to undefined]
**store** | **string** | معرف المتجر | [default to undefined]
**category** | **string** | معرف الفئة | [optional] [default to undefined]
**image** | **string** | صورة المنتج | [optional] [default to undefined]
**images** | **Array&lt;string&gt;** | الصور | [default to undefined]
**inStock** | **boolean** | متوفر في المخزون | [default to true]
**stockQuantity** | **number** | كمية المخزون | [default to 0]
**discount** | **number** | الخصم | [default to 0]

## Example

```typescript
import { CreateProductDto } from './api';

const instance: CreateProductDto = {
    name,
    name_ar,
    name_en,
    description,
    price,
    store,
    category,
    image,
    images,
    inStock,
    stockQuantity,
    discount,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
