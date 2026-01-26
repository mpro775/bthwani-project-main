# UpdateOrderStatusDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**status** | **string** | الحالة الجديدة | [default to undefined]
**reason** | **string** | سبب التغيير | [optional] [default to undefined]
**changedBy** | **string** | من قام بالتغيير | [optional] [default to undefined]

## Example

```typescript
import { UpdateOrderStatusDto } from './api';

const instance: UpdateOrderStatusDto = {
    status,
    reason,
    changedBy,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
