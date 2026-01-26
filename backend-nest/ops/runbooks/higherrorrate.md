# HighErrorRate

**Severity:** CRITICAL

## Description

5xx error rate is above acceptable threshold

## Troubleshooting Steps

1. Check error logs: tail -f /var/log/bthwani/error.log
2. Identify failing endpoints in Grafana
3. Check database connection pool
4. Verify external service dependencies
5. Check for deployment issues - recent releases
6. Consider rollback if caused by recent deployment

## Escalation

Page backend team if error rate > 10% for more than 10 minutes
