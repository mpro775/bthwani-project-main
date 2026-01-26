# Dead Letter Queue (DLQ) System - BTW-NOT-006

## Overview

The DLQ system provides robust error handling and recovery for failed message processing across all queues in the BThwani platform.

## Architecture

### Queue Structure
```
Original Queues:
├── notifications → notifications-dlq
├── emails → emails-dlq
├── orders → orders-dlq
└── webhooks → webhooks-dlq
```

### Processing Flow
```
Message Received → Queue → Processor → Success/Failure
                                   ↓
                              Failure → DLQ → Manual Review
```

## DLQ Policies

### Retry Configuration
| Queue | Max Retries | Backoff Strategy | DLQ Threshold |
|-------|-------------|------------------|---------------|
| notifications | 5 | 2s, 4s, 8s, 16s, 32s | After 5 failures |
| emails | 3 | 1s, 2s, 4s | After 3 failures |
| orders | 5 | 2s, 4s, 8s, 16s, 32s | After 5 failures |
| webhooks | 5 | 2s, 4s, 8s, 16s, 32s | After 5 failures |

### Failure Reasons
- **Temporary Failures**: Network timeouts, DB connection issues → Auto-retry
- **Permanent Failures**: Invalid data, business logic errors → DLQ
- **Resource Exhaustion**: Queue depth limits → DLQ with alert

## API Endpoints

### Get DLQ Statistics
```
GET /api/v2/dlq/stats
```

**Response:**
```json
{
  "notifications": {
    "waiting": 0,
    "active": 0,
    "completed": 5,
    "failed": 2,
    "oldestFailed": 1640995200000
  },
  "emails": { /* ... */ },
  "orders": { /* ... */ },
  "webhooks": { /* ... */ },
  "summary": {
    "totalFailed": 7,
    "oldestFailed": 1640995200000
  }
}
```

### Retry Failed Jobs
```
POST /api/v2/dlq/:queueName/retry?jobId=123&limit=10
```

**Parameters:**
- `queueName`: DLQ name (notifications-dlq, emails-dlq, etc.)
- `jobId`: Specific job ID (optional)
- `limit`: Max jobs to retry (default: 10)

**Response:**
```json
{
  "message": "Retried 3 jobs from notifications-dlq",
  "queueName": "notifications-dlq",
  "retryCount": 3,
  "jobId": "all",
  "limit": 10
}
```

### Clean Up Old Jobs
```
POST /api/v2/dlq/cleanup?daysOld=30
```

**Response:**
```json
{
  "message": "Cleaned up 150 old DLQ jobs",
  "cleanedCount": 150,
  "daysOld": 30
}
```

## Database Schema

### dlq_jobs Collection
```javascript
{
  originalQueue: "notifications",
  jobId: "job_123456",
  jobData: { /* original job data */ },
  failedReason: "Database connection timeout",
  failedAt: ISODate("2024-01-01T00:00:00Z"),
  retryCount: 5,
  status: "pending", // pending, retried, cleaned
  retriedAt: ISODate(),
  cleanedAt: ISODate()
}
```

## Monitoring

### Key Metrics
- **DLQ Depth**: `dlq_queue_depth{queue="notifications-dlq"}`
- **Failure Rate**: `rate(dlq_jobs_created[5m])`
- **Retry Success Rate**: `rate(dlq_jobs_retried{status="success"}[5m])`
- **Processing Age**: `dlq_oldest_job_age_seconds`

### Alerts
- DLQ depth > 100 jobs
- Jobs older than 1 hour in DLQ
- Retry failure rate > 50%
- Daily DLQ job creation > 100

## Operational Procedures

### Daily Monitoring
1. Check DLQ stats: `GET /api/v2/dlq/stats`
2. Review failed jobs older than 1 hour
3. Retry recoverable failures
4. Investigate permanent failures

### Weekly Maintenance
1. Clean up jobs older than 7 days
2. Review failure patterns
3. Update retry policies if needed
4. Check queue performance metrics

### Incident Response
1. **DLQ Alert Triggered**:
   - Check which queue is affected
   - Review recent failures
   - Identify root cause
   - Apply fix and retry jobs
   - Monitor success rate

2. **High DLQ Growth**:
   - Scale queue processors
   - Check resource utilization
   - Implement circuit breakers
   - Alert development team

## Best Practices

### Failure Handling
1. **Log Detailed Errors**: Include stack traces and context
2. **Categorize Failures**: Temporary vs Permanent
3. **Preserve Original Data**: Don't modify failed job data
4. **Set Appropriate Timeouts**: Balance responsiveness vs reliability

### Retry Strategies
1. **Exponential Backoff**: Increase delay between retries
2. **Jitter**: Add randomness to prevent thundering herd
3. **Circuit Breakers**: Stop retrying when service is down
4. **Deadlines**: Don't retry indefinitely

### Monitoring
1. **Queue Health**: Monitor depth, processing rate, error rate
2. **Business Impact**: Track failed business transactions
3. **SLA Compliance**: Measure time to resolution
4. **Trend Analysis**: Identify recurring failure patterns

## Integration Examples

### Manual Retry Script
```bash
#!/bin/bash
# Retry all failed notification jobs

curl -X POST "http://localhost:3000/api/v2/dlq/notifications-dlq/retry" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json"
```

### Monitoring Script
```bash
#!/bin/bash
# Check DLQ health

STATS=$(curl -s "http://localhost:3000/api/v2/dlq/stats")

TOTAL_FAILED=$(echo $STATS | jq '.summary.totalFailed')
OLDEST=$(echo $STATS | jq '.summary.oldestFailed')

if [ $TOTAL_FAILED -gt 50 ]; then
  echo "ALERT: High DLQ count: $TOTAL_FAILED"
  # Send alert
fi

if [ $OLDEST -gt $(($(date +%s) - 3600)) ]; then
  echo "ALERT: Old DLQ jobs detected"
  # Send alert
fi
```

## Troubleshooting

### Common Issues

1. **Jobs Not Moving to DLQ**
   - Check processor error handling
   - Verify DLQ queue configuration
   - Review BullMQ logs

2. **Retry Not Working**
   - Check original queue availability
   - Verify job data integrity
   - Review retry permissions

3. **High DLQ Growth**
   - Investigate root cause of failures
   - Check system resources
   - Review recent deployments

4. **Old Jobs Not Cleaning Up**
   - Check cleanup job scheduling
   - Verify database permissions
   - Review cleanup logic

## Security Considerations

- **Data Privacy**: DLQ contains sensitive job data
- **Access Control**: Restrict DLQ operations to admins
- **Audit Logging**: Log all DLQ operations
- **Data Retention**: Implement appropriate cleanup policies

---

**Version**: 1.0
**Last Updated**: $(date)
**Operational Readiness**: Production Ready
