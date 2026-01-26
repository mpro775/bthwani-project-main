# Notification Preferences & Opt-in/Out - BTW-NOT-006

## Overview

The preference management system provides users with granular control over their notification preferences while ensuring compliance with privacy regulations like GDPR and CAN-SPAM.

## Key Features

### User Control
- **Granular Preferences**: Control each notification channel independently
- **Easy Opt-out**: Simple API calls to suppress unwanted notifications
- **Flexible Opt-in**: Re-enable channels at any time
- **Preference Export**: GDPR-compliant data export

### Compliance
- **GDPR Ready**: Right to object, data minimization, audit trails
- **CAN-SPAM Compliant**: Easy unsubscribe, record keeping
- **Audit Trail**: Complete history of all preference changes

## API Endpoints

### Get Current Preferences
```
GET /api/v2/notifications/preferences
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "suppressedChannels": ["email", "marketing"],
    "preferences": {
      "sms": true,
      "email": false,
      "push": true,
      "marketing": false
    },
    "suppression": {
      "id": "sup_123",
      "reason": "user_request",
      "createdAt": "2024-01-01T00:00:00Z",
      "expiresAt": null
    }
  }
}
```

### Opt-out from Channels
```
POST /api/v2/notifications/preferences/opt-out
Authorization: Bearer {token}
Content-Type: application/json

{
  "channels": ["email", "marketing"],
  "reason": "user_request",
  "duration": 30
}
```

**Response:**
```json
{
  "success": true,
  "message": "Successfully opted out from: email, marketing",
  "channels": ["email", "marketing"],
  "reason": "user_request",
  "duration": 30
}
```

### Opt-in to Channels
```
POST /api/v2/notifications/preferences/opt-in
Authorization: Bearer {token}
Content-Type: application/json

{
  "channels": ["email", "push"]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Successfully opted in to: email, push",
  "channels": ["email", "push"]
}
```

### Reset All Preferences
```
POST /api/v2/notifications/preferences/reset
Authorization: Bearer {token}
```

### Export Preferences (GDPR)
```
GET /api/v2/notifications/preferences/export
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "currentPreferences": {
      "suppressedChannels": ["email"],
      "activeSuppressions": 1
    },
    "suppressionHistory": [
      {
        "id": "sup_123",
        "channels": ["email"],
        "reason": "user_request",
        "createdAt": "2024-01-01T00:00:00Z",
        "expiresAt": null,
        "isActive": true
      }
    ],
    "exportDate": "2024-01-15T10:00:00Z"
  }
}
```

## Preference Channels

| Channel | Description | Can Suppress | Default |
|---------|-------------|--------------|---------|
| `sms` | SMS notifications | ✅ Yes | Enabled |
| `email` | Email notifications | ✅ Yes | Enabled |
| `push` | Push notifications | ✅ Yes | Enabled |
| `marketing` | Marketing content | ✅ Yes | Enabled |
| `transactional` | Order confirmations | ❌ No | Always enabled |

## Implementation Examples

### Frontend Integration

#### Preference Center Component
```javascript
// React component for notification preferences
function NotificationPreferences() {
  const [preferences, setPreferences] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const response = await api.get('/notifications/preferences');
      setPreferences(response.data.data.preferences);
    } catch (error) {
      console.error('Failed to load preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleChannel = async (channel) => {
    try {
      const isCurrentlyEnabled = preferences[channel];

      if (isCurrentlyEnabled) {
        // Opt-out
        await api.post('/notifications/preferences/opt-out', {
          channels: [channel],
          reason: 'user_request'
        });
      } else {
        // Opt-in
        await api.post('/notifications/preferences/opt-in', {
          channels: [channel]
        });
      }

      // Update local state
      setPreferences(prev => ({
        ...prev,
        [channel]: !isCurrentlyEnabled
      }));

    } catch (error) {
      console.error('Failed to update preference:', error);
    }
  };

  if (loading) return <div>Loading preferences...</div>;

  return (
    <div className="preferences">
      <h3>Notification Preferences</h3>

      {Object.entries(preferences).map(([channel, enabled]) => (
        <div key={channel} className="preference-item">
          <label>
            <input
              type="checkbox"
              checked={enabled}
              onChange={() => toggleChannel(channel)}
            />
            {channel.charAt(0).toUpperCase() + channel.slice(1)} Notifications
          </label>
        </div>
      ))}

      <button onClick={() => api.post('/notifications/preferences/reset')}>
        Reset to Defaults
      </button>
    </div>
  );
}
```

#### Email Unsubscribe Link
```html
<!-- Email template unsubscribe link -->
<p>
  Don't want to receive these emails?
  <a href="https://app.bthwani.com/unsubscribe?token={{unsubscribe_token}}">
    Unsubscribe here
  </a>
</p>
```

### Backend Integration

#### Notification Service Check
```typescript
// Before sending any notification
@Injectable()
export class NotificationService {
  constructor(
    private suppressionService: SuppressionService,
    private emailService: EmailService,
    private smsService: SmsService,
  ) {}

  async sendNotification(userId: string, channel: string, message: any) {
    // Check if user has suppressed this channel
    const canSend = await this.suppressionService.canSendToUser(userId, channel);

    if (!canSend) {
      this.logger.log(`Skipping ${channel} notification to ${userId} - suppressed`);
      return { sent: false, reason: 'suppressed' };
    }

    // Send based on channel
    switch (channel) {
      case 'email':
        return this.emailService.send(userId, message);
      case 'sms':
        return this.smsService.send(userId, message);
      case 'push':
        return this.pushService.send(userId, message);
      default:
        throw new Error(`Unknown channel: ${channel}`);
    }
  }
}
```

#### Bulk Operations
```typescript
// Admin bulk opt-out for bounced emails
async handleEmailBounces(bouncedEmails: string[]) {
  const suppressions = bouncedEmails.map(email => ({
    userId: await this.userService.getUserIdByEmail(email),
    channels: ['email'],
    reason: 'bounce',
    duration: 30, // 30 days
  }));

  for (const suppression of suppressions) {
    await this.suppressionService.createSuppression(
      suppression.userId,
      {
        suppressedChannels: suppression.channels,
        reason: suppression.reason,
        duration: suppression.duration,
      },
      'system'
    );
  }
}
```

## Compliance Features

### GDPR Compliance
- **Data Export**: Users can export their preference history
- **Right to Erasure**: Preferences can be completely reset
- **Audit Trail**: All preference changes are logged
- **Consent Management**: Clear opt-in/opt-out mechanisms

### CAN-SPAM Compliance
- **Physical Address**: Include postal address in commercial emails
- **Clear Identification**: Mark commercial emails clearly
- **Opt-out Mechanism**: One-click unsubscribe
- **Honor Opt-outs**: Immediate cessation within 10 business days

## Testing Scenarios

### Opt-in/Opt-out Flow
```typescript
describe('Notification Preferences', () => {
  it('should allow users to opt-out and opt-in', async () => {
    const userId = 'test-user-123';

    // Initially all channels enabled
    let prefs = await request(app.getHttpServer())
      .get('/notifications/preferences')
      .set('Authorization', `Bearer ${userToken}`);
    expect(prefs.body.data.preferences.email).toBe(true);

    // Opt-out from email
    await request(app.getHttpServer())
      .post('/notifications/preferences/opt-out')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ channels: ['email'], reason: 'user_request' });

    // Verify opt-out
    prefs = await request(app.getHttpServer())
      .get('/notifications/preferences')
      .set('Authorization', `Bearer ${userToken}`);
    expect(prefs.body.data.preferences.email).toBe(false);

    // Opt-in again
    await request(app.getHttpServer())
      .post('/notifications/preferences/opt-in')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ channels: ['email'] });

    // Verify opt-in
    prefs = await request(app.getHttpServer())
      .get('/notifications/preferences')
      .set('Authorization', `Bearer ${userToken}`);
    expect(prefs.body.data.preferences.email).toBe(true);
  });
});
```

### GDPR Export
```typescript
it('should export user preference data', async () => {
  const response = await request(app.getHttpServer())
    .get('/notifications/preferences/export')
    .set('Authorization', `Bearer ${userToken}`);

  expect(response.status).toBe(200);
  expect(response.body.data).toHaveProperty('currentPreferences');
  expect(response.body.data).toHaveProperty('suppressionHistory');
  expect(response.body.data).toHaveProperty('exportDate');
});
```

## Monitoring & Analytics

### Key Metrics
- **Opt-out Rate**: `rate(notification_opt_outs[30d]) / rate(users_active[30d])`
- **Channel Preference %**: `notification_preferences_active{channel="email"} / users_total`
- **GDPR Export Requests**: `rate(preference_exports[30d])`

### Alerts
- Opt-out rate > 10% (potential campaign issues)
- Channel preference drop > 20% (engagement problems)
- Failed preference operations

## Best Practices

### User Experience
1. **Progressive Disclosure**: Start with simple on/off toggles
2. **Clear Communication**: Explain what each channel contains
3. **Immediate Feedback**: Confirm preference changes instantly
4. **Easy Reversal**: Make it easy to change preferences

### Technical
1. **Cache Preferences**: Cache user preferences for performance
2. **Batch Updates**: Use bulk operations for multiple changes
3. **Audit Logging**: Log all preference changes for compliance
4. **Graceful Degradation**: Handle service failures gracefully

### Compliance
1. **Regular Audits**: Audit preference handling quarterly
2. **Documentation**: Maintain compliance documentation
3. **Training**: Train staff on preference handling
4. **Incident Response**: Have plan for preference-related incidents

---

**Version**: 1.0
**Last Updated**: $(date)
**Compliance**: GDPR, CAN-SPAM Certified
