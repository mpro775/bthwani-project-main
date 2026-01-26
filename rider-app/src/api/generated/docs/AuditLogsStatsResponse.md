# AuditLogsStatsResponse


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**totalActions** | **number** |  | [optional] [default to undefined]
**actionsByType** | **{ [key: string]: number; }** |  | [optional] [default to undefined]
**actionsByUser** | **{ [key: string]: number; }** |  | [optional] [default to undefined]

## Example

```typescript
import { AuditLogsStatsResponse } from './api';

const instance: AuditLogsStatsResponse = {
    totalActions,
    actionsByType,
    actionsByUser,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
