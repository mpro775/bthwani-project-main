# CreateLeaveRequestDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**leaveType** | **string** | نوع الإجازة | [default to undefined]
**startDate** | **string** | تاريخ البداية | [default to undefined]
**endDate** | **string** | تاريخ النهاية | [default to undefined]
**reason** | **string** | سبب الإجازة | [default to undefined]
**notes** | **string** | ملاحظات إضافية | [optional] [default to undefined]
**attachments** | **Array&lt;string&gt;** | مرفقات (روابط URL) | [optional] [default to undefined]

## Example

```typescript
import { CreateLeaveRequestDto } from './api';

const instance: CreateLeaveRequestDto = {
    leaveType,
    startDate,
    endDate,
    reason,
    notes,
    attachments,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
