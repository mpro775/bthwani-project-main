# BThwani Webhook System - BTW-NOT-006

## Overview

The BThwani webhook system provides secure, reliable event delivery with HMAC signature verification and replay attack protection.

## Security Features

### HMAC Signature Verification
- Uses SHA-256 HMAC for payload integrity
- Timestamp-based signature with 5-minute tolerance window
- Prevents replay attacks with timestamp validation

### Replay Attack Protection
- Each webhook event can only be processed once
- TTL-based cleanup of processed events (30 days)
- Duplicate event detection and rejection

## API Endpoints

### Receive Webhooks
```
POST /api/v2/webhooks/:webhookId
```

**Headers:**
- `X-Webhook-Signature`: HMAC signature (sha256=...)
- `Content-Type`: application/json

**Payload:**
```json
{
  "event": "order.created",
  "data": { "orderId": "123", "amount": 100.50 },
  "timestamp": 1640995200000,
  "webhookId": "wh_123456789"
}
```

### Test Webhooks
```
POST /api/v2/webhooks/test/:webhookId
```

### Get Delivery History
```
GET /api/v2/webhooks/deliveries?webhookId=wh_123&limit=50
```

### Retry Failed Deliveries
```
POST /api/v2/webhooks/deliveries/retry?webhookId=wh_123
```

## Supported Events

| Event | Description | Data |
|-------|-------------|------|
| `order.created` | New order placed | `{orderId, userId, amount, items}` |
| `payment.completed` | Payment successful | `{paymentId, orderId, amount, method}` |
| `user.registered` | User account created | `{userId, email, phone, source}` |
| `driver.assigned` | Driver assigned to order | `{orderId, driverId, estimatedTime}` |

## Queue Processing

### Webhook Queue
- **Queue Name**: `webhooks`
- **Retries**: 5 attempts with exponential backoff
- **Backoff**: 2s, 4s, 8s, 16s, 32s
- **Processor**: `WebhookProcessor`

### Dead Letter Queue
- **Queue Name**: `webhooks-dlq`
- **Purpose**: Failed webhooks requiring manual review
- **Processor**: `WebhookDLQProcessor`

## Database Collections

### webhook_deliveries
```javascript
{
  webhookId: "wh_123456789",
  eventType: "order.created",
  payload: { /* event data */ },
  signature: "sha256=abc123...",
  status: "delivered", // pending, processing, delivered, failed
  attempts: 1,
  deliveredAt: ISODate(),
  processedAt: ISODate(),
  responseCode: 200,
  errorMessage: null
}
```

### webhook_events
```javascript
{
  eventType: "order.created",
  payload: { /* event data */ },
  webhookId: "wh_123456789",
  receivedAt: ISODate(),
  processed: true,
  processedAt: ISODate(),
  expiresAt: ISODate() // TTL index
}
```

## Configuration

### Environment Variables
```bash
WEBHOOK_SECRET=your-webhook-secret-key
REDIS_HOST=localhost
REDIS_PORT=6379
```

### Queue Configuration
```typescript
// In queues.module.ts
BullModule.registerQueue(
  { name: 'webhooks' },
  { name: 'webhooks-dlq' }
)
```

## Security Best Practices

### 1. Secret Management
- Use unique secrets per webhook endpoint
- Rotate secrets regularly
- Store secrets securely (not in code)

### 2. Signature Verification
- Always verify signatures before processing
- Check timestamp tolerance
- Reject duplicate events

### 3. Rate Limiting
- Implement rate limiting on webhook endpoints
- Monitor for abuse patterns

## Monitoring

### Key Metrics
- **Delivery Success Rate**: `rate(webhook_deliveries{status="delivered"}[5m])`
- **Processing Latency**: `histogram_quantile(0.95, rate(webhook_processing_duration[5m]))`
- **Queue Depth**: `webhooks_queue_depth`
- **Error Rate**: `rate(webhook_deliveries{status="failed"}[5m])`

### Alerts
- High error rate (> 5%)
- Queue depth > 1000
- Processing latency > 30s
- Failed deliveries in DLQ

## Testing

### Test Webhook
```bash
curl -X POST http://localhost:3000/api/v2/webhooks/test/wh_test123 \
  -H "Content-Type: application/json" \
  -d '{"customData": {"test": true}}'
```

### Manual Signature Generation
```javascript
const crypto = require('crypto');

function generateSignature(payload, secret) {
  const timestamp = payload.timestamp || Date.now();
  const message = `${timestamp}.${JSON.stringify(payload)}`;
  const signature = crypto.createHmac('sha256', secret)
    .update(message)
    .digest('hex');
  return `sha256=${signature}`;
}
```

## Troubleshooting

### Common Issues

1. **Invalid Signature**
   - Check secret key
   - Verify timestamp format
   - Ensure payload is properly stringified

2. **Replay Attack Detected**
   - Event already processed
   - Check if webhook was sent multiple times

3. **Queue Processing Failed**
   - Check Redis connectivity
   - Verify queue processor is running
   - Check application logs

4. **High Latency**
   - Monitor queue depth
   - Check database performance
   - Review processing logic

## Integration Guide

### For External Services
1. Register webhook endpoint with BThwani
2. Receive unique `webhookId` and secret
3. Implement signature verification
4. Handle different event types
5. Implement proper error handling

### Example Integration (Node.js)
```javascript
const express = require('express');
const crypto = require('crypto');

const app = express();
app.use(express.json());

function verifySignature(payload, signature, secret) {
  const timestamp = payload.timestamp;
  const message = `${timestamp}.${JSON.stringify(payload)}`;
  const expected = crypto.createHmac('sha256', secret)
    .update(message)
    .digest('hex');
  return signature === `sha256=${expected}`;
}

app.post('/webhooks/bthwani/:webhookId', (req, res) => {
  const { webhookId } = req.params;
  const payload = req.body;
  const signature = req.headers['x-webhook-signature'];
  const secret = process.env.BTHWANI_WEBHOOK_SECRET;

  if (!verifySignature(payload, signature, secret)) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  // Process webhook
  console.log(`Received ${payload.event} for ${webhookId}`);

  res.status(200).json({ received: true });
});

app.listen(3000);
```

---

**Version**: 1.0
**Last Updated**: $(date)
**Security Review**: Required for production deployment
