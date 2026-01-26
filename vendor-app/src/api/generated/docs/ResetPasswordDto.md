# ResetPasswordDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**emailOrPhone** | **string** | البريد الإلكتروني أو رقم الهاتف | [default to undefined]
**code** | **string** | رمز التحقق | [default to undefined]
**newPassword** | **string** | كلمة المرور الجديدة | [default to undefined]

## Example

```typescript
import { ResetPasswordDto } from './api';

const instance: ResetPasswordDto = {
    emailOrPhone,
    code,
    newPassword,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
