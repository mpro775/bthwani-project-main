# HighLatency

**Severity:** HIGH

## Description

P95 latency is above 2 seconds

## Troubleshooting Steps

1. Check slow queries in MongoDB: db.currentOp({secs_running: {$gt: 1}})
2. Review APM traces for slow transactions
3. Check database indexes: npm run audit:indexes
4. Verify cache hit rate in Redis
5. Check for N+1 query problems
6. Review recent code changes

## Escalation

Notify backend team if latency > 5s
