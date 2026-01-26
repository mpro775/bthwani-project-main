# CalculateFeeDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**category** | **string** | نوع الغرض | [default to undefined]
**size** | **string** | حجم الغرض | [default to undefined]
**weightKg** | **number** | الوزن بالكيلوجرام | [optional] [default to undefined]
**pickup** | [**PointDto**](PointDto.md) | نقطة الاستلام | [default to undefined]
**dropoff** | [**PointDto**](PointDto.md) | نقطة التسليم | [default to undefined]
**tip** | **number** | البقشيش | [optional] [default to undefined]

## Example

```typescript
import { CalculateFeeDto } from './api';

const instance: CalculateFeeDto = {
    category,
    size,
    weightKg,
    pickup,
    dropoff,
    tip,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
