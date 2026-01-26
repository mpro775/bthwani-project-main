# AddAddressDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**label** | **string** | تسمية العنوان (منزل، عمل، إلخ) | [default to undefined]
**city** | **string** | المدينة | [default to undefined]
**street** | **string** | الشارع | [default to undefined]
**location** | [**LocationDto**](LocationDto.md) | الموقع الجغرافي | [optional] [default to undefined]

## Example

```typescript
import { AddAddressDto } from './api';

const instance: AddAddressDto = {
    label,
    city,
    street,
    location,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
