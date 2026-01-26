# UpdateEmployeeDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**firstName** | **string** | الاسم الأول | [optional] [default to undefined]
**lastName** | **string** | اسم العائلة | [optional] [default to undefined]
**email** | **string** | البريد الإلكتروني | [optional] [default to undefined]
**phone** | **string** | رقم الهاتف | [optional] [default to undefined]
**nationalId** | **string** | رقم الهوية الوطنية | [optional] [default to undefined]
**position** | **string** | المنصب | [optional] [default to undefined]
**department** | **string** | القسم | [optional] [default to undefined]
**employmentType** | **string** | نوع التوظيف | [optional] [default to undefined]
**salary** | **number** | الراتب الأساسي | [optional] [default to undefined]
**hireDate** | **string** | تاريخ التعيين | [optional] [default to undefined]
**terminationDate** | **string** | تاريخ إنهاء الخدمة | [optional] [default to undefined]
**address** | **object** | العنوان | [optional] [default to undefined]
**emergencyContact** | **string** | جهة الاتصال للطوارئ | [optional] [default to undefined]
**emergencyPhone** | **string** | رقم هاتف الطوارئ | [optional] [default to undefined]
**manager** | **string** | المدير المباشر | [optional] [default to undefined]
**skills** | **Array&lt;string&gt;** | المهارات | [optional] [default to undefined]
**bankDetails** | **object** | تفاصيل البنك | [optional] [default to undefined]
**annualLeaveDays** | **number** | أيام الإجازة السنوية | [optional] [default to undefined]
**sickLeaveDays** | **number** | أيام الإجازة المرضية | [optional] [default to undefined]

## Example

```typescript
import { UpdateEmployeeDto } from './api';

const instance: UpdateEmployeeDto = {
    firstName,
    lastName,
    email,
    phone,
    nationalId,
    position,
    department,
    employmentType,
    salary,
    hireDate,
    terminationDate,
    address,
    emergencyContact,
    emergencyPhone,
    manager,
    skills,
    bankDetails,
    annualLeaveDays,
    sickLeaveDays,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
