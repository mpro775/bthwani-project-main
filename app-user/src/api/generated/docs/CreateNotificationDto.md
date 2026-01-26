# CreateNotificationDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**toUser** | **string** | معرف المستخدم المستهدف | [optional] [default to undefined]
**audience** | **Array&lt;string&gt;** | الجمهور المستهدف | [optional] [default to undefined]
**title** | **string** | العنوان | [default to undefined]
**body** | **string** | المحتوى | [default to undefined]
**data** | **object** | بيانات إضافية | [optional] [default to undefined]
**collapseId** | **string** | معرف التجميع | [optional] [default to undefined]

## Example

```typescript
import { CreateNotificationDto } from './api';

const instance: CreateNotificationDto = {
    toUser,
    audience,
    title,
    body,
    data,
    collapseId,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
