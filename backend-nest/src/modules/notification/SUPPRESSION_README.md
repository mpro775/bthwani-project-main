# Suppression List System - BTW-NOT-006

## Overview

The suppression list system allows users to opt-out of specific notification channels and provides administrators with tools to manage notification preferences at scale.

## Features

### User-Level Suppression
- **Channel-Specific**: Users can suppress individual channels (SMS, Email, Push)
- **Time-Based**: Temporary suppressions with expiration dates
- **Reason Tracking**: Why the suppression was created
- **Audit Trail**: Complete history of suppression changes

### Administrative Controls
- **Bulk Operations**: Suppress multiple users at once
- **Emergency Overrides**: Admin can override user suppressions for critical notifications
- **Analytics**: Suppression statistics and trends
- **Compliance**: GDPR/opt-in compliance tools

## API Endpoints

### User Suppression Management

#### Get Current Suppressions
```
GET /api/v2/notifications/suppression
Authorization: Bearer {user-token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "suppressedChannels": ["sms", "email"],
    "suppressions": [
      {
        "id": "sup_123",
        "channel": "sms",
        "reason": "user_request",
        "expiresAt": "2024-12-31T23:59:59Z",
        "createdAt": "2024-01-01T00:00:00Z"
      }
    ]
  }
}
```

#### Add Channel Suppression
```
POST /api/v2/notifications/suppression
Authorization: Bearer {user-token}
Content-Type: application/json

{
  "channel": "email",
  "reason": "marketing_preference",
  "duration": 30
}
```

#### Remove Channel Suppression
```
DELETE /api/v2/notifications/suppression/:channel
Authorization: Bearer {user-token}
```

### Administrative Endpoints

#### Get Suppression Statistics
```
GET /api/v2/notifications/suppression/stats
Authorization: Bearer {admin-token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalSuppressions": 1250,
    "activeSuppressions": 890,
    "byChannel": {
      "sms": 450,
      "email": 320,
      "push": 120
    },
    "byReason": {
      "user_request": 600,
      "bounce": 150,
      "complaint": 80,
      "admin_action": 60
    },
    "recentActivity": [
      {
        "date": "2024-01-15",
        "newSuppressions": 25,
        "removedSuppressions": 10
      }
    ]
  }
}
```

#### Bulk Suppression
```
POST /api/v2/notifications/suppression/bulk
Authorization: Bearer {admin-token}
Content-Type: application/json

{
  "userIds": ["user1", "user2", "user3"],
  "channels": ["email", "sms"],
  "reason": "marketing_campaign",
  "duration": 90
}
```

## Suppression Channels

| Channel | Description | Common Reasons |
|---------|-------------|----------------|
| `sms` | SMS notifications | Cost, frequency, wrong number |
| `email` | Email notifications | Spam, inbox clutter, unsubscribe |
| `push` | Push notifications | App permission, disturbance |
| `marketing` | Marketing content | Opt-out, preference center |
| `transactional` | Transaction confirmations | Usually cannot be suppressed |

## Suppression Reasons

| Reason | Description | Auto-Expire |
|--------|-------------|-------------|
| `user_request` | User explicitly requested | No (manual removal) |
| `bounce` | Email bounced/hard failure | 30 days |
| `complaint` | Spam complaint received | 90 days |
| `invalid_number` | SMS number invalid | 30 days |
| `admin_action` | Administrative action | No |
| `marketing_preference` | Marketing opt-out | No |
| `temporary` | Temporary suppression | Yes (specified duration) |

## Database Schema

### notification_suppressions Collection
```javascript
{
  userId: ObjectId("507f1f77bcf86cd799439011"),
  suppressedChannels: ["sms", "email"],
  isActive: true,
  reason: "user_request",
  suppressedBy: "user", // user, admin, system
  suppressedById: ObjectId(),
  expiresAt: ISODate("2024-12-31T23:59:59Z"),
  metadata: {
    source: "preference_center",
    campaign: "newsletter_2024"
  },
  createdAt: ISODate("2024-01-01T00:00:00Z"),
  updatedAt: ISODate("2024-01-01T00:00:00Z")
}
```

### Indexes
```javascript
// Active suppressions by user
{ userId: 1, isActive: 1 }

// Channel-specific suppressions
{ "suppressedChannels": 1, isActive: 1 }

// Expiration cleanup
{ expiresAt: 1 }

// Reason analytics
{ reason: 1, createdAt: 1 }
```

## Integration with Notification System

### Before Sending Notification
```typescript
async shouldSendNotification(userId: string, channel: string): Promise<boolean> {
  // Check suppression list
  const suppression = await this.suppressionService.getUserSuppression(userId);

  // Don't send if channel is suppressed and not expired
  if (suppression?.suppressedChannels.includes(channel)) {
    if (!suppression.expiresAt || suppression.expiresAt > new Date()) {
      return false;
    }
  }

  return true;
}
```

### Automatic Cleanup
```typescript
// Cron job runs daily
@Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
async cleanupExpiredSuppressions() {
  const expiredCount = await this.suppressionModel.updateMany(
    {
      isActive: true,
      expiresAt: { $lt: new Date() }
    },
    {
      isActive: false,
      updatedAt: new Date()
    }
  );

  this.logger.log(`Cleaned up ${expiredCount.modifiedCount} expired suppressions`);
}
```

## Compliance Features

### GDPR Compliance
- **Right to Object**: Users can suppress marketing communications
- **Data Minimization**: Suppressions are retained only as needed
- **Audit Trail**: Complete history of all suppression changes
- **Data Portability**: Export user's suppression history

### CAN-SPAM Compliance
- **Opt-out Links**: Easy unsubscribe in all marketing emails
- **Suppression Honor**: Immediate cessation of suppressed communications
- **Record Keeping**: Maintain suppression records for 5+ years

## Monitoring & Analytics

### Key Metrics
- **Suppression Rate**: `rate(notification_suppressions_created[30d]) / rate(users_registered[30d])`
- **Channel Suppression %**: `notification_suppressions_active{channel="email"} / users_total`
- **Unsubscribe Rate**: `rate(suppressions{reason="user_request"}[7d])`
- **Bounce Rate**: `rate(suppressions{reason="bounce"}[7d]) / emails_sent_total`

### Alerts
- Suppression rate > 5% (potential campaign issues)
- Channel suppression > 20% (communication problems)
- Bulk suppressions without admin approval
- Failed cleanup jobs

## Best Practices

### User Experience
1. **Clear Opt-out**: Easy-to-find unsubscribe links
2. **Granular Control**: Allow channel-specific preferences
3. **Confirmation**: Confirm suppression actions
4. **Re-opt-in**: Allow users to re-subscribe easily

### Administrative
1. **Reason Tracking**: Always specify why suppression was created
2. **Audit Logging**: Log all administrative suppressions
3. **Bulk Limits**: Prevent accidental mass suppressions
4. **Emergency Override**: Allow critical notifications to bypass suppressions

### Technical
1. **Cache Suppressions**: Cache active suppressions for performance
2. **Batch Operations**: Use bulk operations for large datasets
3. **Data Retention**: Implement appropriate cleanup policies
4. **Monitoring**: Monitor suppression impact on delivery rates

## Troubleshooting

### Common Issues

1. **Suppressions Not Working**
   - Check if suppression is active and not expired
   - Verify channel name matches exactly
   - Check notification service integration

2. **High Suppression Rates**
   - Review recent campaigns for issues
   - Check email deliverability metrics
   - Investigate SMS carrier issues

3. **Cleanup Not Working**
   - Check cron job execution
   - Verify database permissions
   - Review cleanup job logs

4. **Bulk Operations Failing**
   - Check user ID validity
   - Verify admin permissions
   - Review bulk operation limits

## Integration Examples

### Frontend Integration
```javascript
// Preference center
const suppressions = await api.get('/notifications/suppression');

function toggleChannel(channel) {
  if (suppressions.suppressedChannels.includes(channel)) {
    await api.delete(`/notifications/suppression/${channel}`);
  } else {
    await api.post('/notifications/suppression', {
      channel,
      reason: 'user_request'
    });
  }
}
```

### Notification Service Integration
```typescript
// Before sending notification
const canSend = await suppressionService.canSendToUser(userId, channel);
if (!canSend) {
  this.logger.log(`Skipping notification to ${userId} - suppressed channel: ${channel}`);
  return;
}

// Send notification
await this.sendNotification(userId, channel, message);
```

---

**Version**: 1.0
**Last Updated**: $(date)
**Compliance**: GDPR, CAN-SPAM Ready
