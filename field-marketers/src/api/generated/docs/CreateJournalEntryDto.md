# CreateJournalEntryDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**date** | **string** | تاريخ القيد | [default to undefined]
**description** | **string** | وصف القيد | [default to undefined]
**lines** | [**Array&lt;JournalLineDto&gt;**](JournalLineDto.md) | سطور القيد | [default to undefined]
**type** | **string** | نوع القيد | [default to undefined]
**reference** | **string** | المرجع الخارجي | [optional] [default to undefined]
**relatedEntity** | **string** | الكيان المرتبط | [optional] [default to undefined]
**relatedEntityModel** | **string** | نوع الكيان المرتبط | [optional] [default to undefined]
**notes** | **string** | ملاحظات إضافية | [optional] [default to undefined]

## Example

```typescript
import { CreateJournalEntryDto } from './api';

const instance: CreateJournalEntryDto = {
    date,
    description,
    lines,
    type,
    reference,
    relatedEntity,
    relatedEntityModel,
    notes,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
