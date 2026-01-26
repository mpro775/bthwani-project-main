# CreateDriverDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**fullName** | **string** | الاسم الكامل | [default to undefined]
**email** | **string** | البريد الإلكتروني | [default to undefined]
**password** | **string** | كلمة المرور | [default to undefined]
**phone** | **string** | رقم الهاتف | [default to undefined]
**role** | **string** | الدور | [default to undefined]
**vehicleType** | **string** | نوع المركبة | [default to undefined]
**vehicleClass** | **string** | فئة المركبة | [optional] [default to undefined]
**vehiclePower** | **number** | قوة المركبة | [optional] [default to undefined]
**driverType** | **string** | نوع السائق | [optional] [default to undefined]
**isFemaleDriver** | **boolean** | سائقة أنثى | [optional] [default to undefined]

## Example

```typescript
import { CreateDriverDto } from './api';

const instance: CreateDriverDto = {
    fullName,
    email,
    password,
    phone,
    role,
    vehicleType,
    vehicleClass,
    vehiclePower,
    driverType,
    isFemaleDriver,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
