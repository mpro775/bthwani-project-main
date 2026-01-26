# ErrorBudgetBurn_Critical

**Severity:** CRITICAL
**Alert Type:** Error Budget Burn Rate
**Detection:** Error rate > 10% sustained over 5-10 minutes

## Description

The error budget is being consumed at a critical rate. At this burn rate, the entire monthly error budget (0.1% of requests) will be exhausted in less than 1 hour.

## Impact

- **Service Reliability:** Severely compromised
- **User Experience:** Significant degradation
- **Business Impact:** Revenue loss, customer dissatisfaction
- **SLO Compliance:** 99.9% availability target at risk

## Immediate Actions (First 5 minutes)

### 1. Assess Situation
```bash
# Check current error rate
curl -s "http://prometheus:9090/api/v1/query?query=rate(http_requests_total{status=~\"5..\"}[5m])/rate(http_requests_total[5m])" | jq

# Check which endpoints are failing
curl -s "http://prometheus:9090/api/v1/query?query=topk(5,rate(http_requests_total{status=~\"5..\"}[5m]))" | jq
```

### 2. Emergency Response
- **Page on-call engineer immediately**
- **Notify engineering lead and CTO**
- **Consider emergency rollback to previous version**

### 3. Quick Diagnosis
```bash
# Check application logs
kubectl logs -f deployment/bthwani-backend --tail=100

# Check database connectivity
kubectl exec -it deployment/bthwani-backend -- nc -zv mongodb 27017

# Check Redis connectivity
kubectl exec -it deployment/bthwani-backend -- nc -zv redis 6379
```

## Troubleshooting Steps

### Step 1: Identify Root Cause
1. **Check recent deployments:**
   ```bash
   kubectl rollout history deployment/bthwani-backend
   kubectl describe deployment/bthwani-backend | grep Image
   ```

2. **Review error logs:**
   ```bash
   # Get detailed error breakdown
   curl -s "http://prometheus:9090/api/v1/query?query=sum(rate(http_requests_total{status=~\"5..\"}[5m])) by (status)" | jq
   ```

3. **Check external dependencies:**
   - Firebase connectivity
   - Payment gateway status
   - Third-party APIs

### Step 2: Emergency Mitigation
1. **Enable circuit breakers** for failing services
2. **Implement emergency rate limiting**
3. **Switch to read-only mode** if applicable
4. **Scale up resources** if resource exhaustion

### Step 3: Recovery Options
1. **Rollback deployment:**
   ```bash
   kubectl rollout undo deployment/bthwani-backend
   ```

2. **Apply hotfix:**
   ```bash
   # Quick fix for critical bugs
   git checkout -b hotfix/critical-error-fix
   # Apply minimal fix
   git push origin hotfix/critical-error-fix
   ```

3. **Enable feature flags:**
   ```bash
   # Disable problematic features
   curl -X POST http://config-service/feature-flags/disable-payment-processing
   ```

## Prevention

### Immediate (Next 24 hours)
- **Post-incident review** within 24 hours
- **Update monitoring thresholds** if too sensitive
- **Add canary deployments** for risky changes

### Medium-term (Next week)
- **Improve error handling** in application code
- **Add circuit breakers** for external services
- **Implement gradual rollouts** with automated rollback

### Long-term (Next month)
- **Chaos engineering** to test failure scenarios
- **Improve test coverage** for critical paths
- **Implement proper retry mechanisms**

## Escalation

- **5 minutes:** On-call engineer not responding → Engineering Lead
- **15 minutes:** Issue not resolved → CTO and DevOps Lead
- **30 minutes:** Service still down → CEO and customer success

## Related Alerts

- `ErrorBudgetBurn_Fast` - Less critical burn rate
- `ServiceDown` - Complete service outage
- `HighErrorRate` - General error rate increase

## Metrics to Monitor

- Error rate by endpoint
- Response time percentiles
- Database connection pool usage
- External service response times
- Resource utilization (CPU, Memory, Disk)

---

**Last Updated:** $(date)
**Version:** 1.0
**Review Date:** Monthly
