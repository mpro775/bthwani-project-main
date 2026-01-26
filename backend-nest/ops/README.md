# BThwani Observability Setup - BTW-OBS-004

## 📊 Dashboards Overview

### 1. Full Observability Overview (`grafana-dashboards/bthwani-full-overview.json`)
**Purpose**: Comprehensive monitoring dashboard covering all key metrics
**Metrics Covered**:
- **RPS**: Requests per Second (Last 5m)
- **LAT**: Latency percentiles (P50/P95/P99)
- **ERR**: Error rates by status code
- **SAT**: System saturation (CPU/Memory/Disk)
- **Database**: MongoDB connection pools
- **Cache**: Redis performance metrics
- **Business**: Orders and payments metrics
- **SLOs**: Error budget, latency, availability status
- **Alerts**: Current alert status

### 2. Business Metrics (`grafana-dashboards/business-metrics.json`)
**Purpose**: Business-focused metrics for revenue and growth tracking
**Metrics Covered**:
- Order volume and trends
- Revenue metrics and AOV
- Conversion rates
- Top selling products
- Payment method distribution
- User acquisition
- Geographic distribution

### 3. SLO Tracking (`grafana-dashboards/slo-tracking.json`)
**Purpose**: Service Level Objective monitoring and burn rate alerts
**Metrics Covered**:
- Error budget remaining (99.9% target)
- Latency budget (P95 < 2s target)
- Availability status (99.95% target)
- Multi-window burn rate alerts
- MTTR/MTTD tracking
- SLO burn rate history

## 🚀 Deployment Instructions

### Prerequisites
```bash
# Install Prometheus
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm install prometheus prometheus-community/prometheus

# Install Grafana
helm repo add grafana https://grafana.github.io/helm-charts
helm install grafana grafana/grafana

# Install Alertmanager
helm install alertmanager prometheus-community/alertmanager
```

### Step 1: Deploy Prometheus
```bash
# Apply Prometheus configuration
kubectl apply -f ops/prometheus.yml

# Verify Prometheus is running
kubectl get pods -l app=prometheus
```

### Step 2: Import Grafana Dashboards
```bash
# Import dashboards via Grafana UI
# 1. Go to Grafana Dashboard -> Import
# 2. Upload each JSON file from ops/grafana-dashboards/
# 3. Configure data sources (Prometheus)
```

### Step 3: Configure Alertmanager
```bash
# Apply alert rules
kubectl apply -f ops/alerts/rules.yml

# Configure alert routing (email, Slack, PagerDuty)
kubectl apply -f ops/alertmanager.yml
```

### Step 4: Instrument Application
```bash
# Add OpenTelemetry to package.json
npm install @opentelemetry/api @opentelemetry/sdk-node @opentelemetry/exporter-otlp-proto

# Configure OTel in main.ts
# See: tools/observability/setup-observability.ts
```

## 📈 Key Metrics Explained

### RED Method (Google SRE)
- **Rate**: Requests per second
- **Errors**: Error rate percentage
- **Duration**: Response time percentiles

### USE Method (Brendan Gregg)
- **Utilization**: Resource usage percentage
- **Saturation**: Queue depth/resource contention
- **Errors**: Hardware/software errors

### Business Metrics
- **Conversion Rate**: Orders / Visits
- **AOV**: Average Order Value
- **Churn Rate**: User attrition rate
- **Revenue Growth**: Month-over-month growth

## 🚨 Alert Configuration

### Multi-Window Burn Rate Alerts
```yaml
# Fast burn: Budget exhausted in < 2 days
- alert: ErrorBudgetBurn_Fast
  expr: rate(errors[1m])/rate(requests[1m]) > threshold_fast

# Slow burn: Budget exhausted in 2-7 days
- alert: ErrorBudgetBurn_Slow
  expr: rate(errors[1h])/rate(requests[1h]) > threshold_slow
```

### Thresholds
- **Error Rate**: > 0.1% sustained
- **Latency P95**: > 2 seconds
- **CPU Usage**: > 80%
- **Memory Usage**: > 90%
- **Availability**: < 99.95%

## 📋 Runbooks

Each alert has a corresponding runbook in `ops/runbooks/`:
- `service-down.md`
- `high-error-rate.md`
- `high-latency.md`
- `error-budget-burn.md`
- `order-processing-stalled.md`

## 🎯 SLO Targets

| Metric | Target | Warning | Critical |
|--------|--------|---------|----------|
| Availability | 99.95% | 99.9% | 99.5% |
| Latency P95 | < 2s | < 5s | < 10s |
| Error Rate | < 0.1% | < 1% | < 5% |
| MTTR | < 30m | < 1h | < 4h |

## 🔧 Maintenance

### Daily Checks
- [ ] Alert status in Grafana
- [ ] Error budget remaining
- [ ] SLO compliance

### Weekly Reviews
- [ ] Update alert thresholds
- [ ] Review runbooks accuracy
- [ ] Analyze incident patterns

### Monthly Reports
- [ ] SLO achievement report
- [ ] Error budget usage
- [ ] MTTR/MTTD trends

## 📞 Support

For observability issues:
- **Grafana**: `grafana.bthwani.com`
- **Prometheus**: `prometheus.bthwani.com`
- **Alertmanager**: `alertmanager.bthwani.com`

## 📚 References

- [Google SRE Book](https://sre.google/books/)
- [Prometheus Documentation](https://prometheus.io/docs/)
- [Grafana Documentation](https://grafana.com/docs/)
- [OpenTelemetry](https://opentelemetry.io/)

---

**Version**: 1.0
**Last Updated**: $(date)
**Maintained by**: DevOps Team
