# OrderProcessingStalled

**Severity:** CRITICAL

## Description

No orders are being processed

## Troubleshooting Steps

1. Check order queue: redis-cli LLEN orders:pending
2. Verify worker processes are running
3. Check database write locks
4. Review payment gateway status
5. Check notification service
6. Restart queue workers if needed

## Escalation

Page backend and operations immediately - revenue impact
