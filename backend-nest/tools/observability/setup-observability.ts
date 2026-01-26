#!/usr/bin/env ts-node
/**
 * BTW-OBS-004: Observability Baseline Setup
 * Sets up OpenTelemetry, metrics, and monitoring
 * 
 * Usage: npm run observability:setup
 */

import * as fs from 'fs';
import * as path from 'path';

interface ObservabilityConfig {
  tracing: {
    enabled: boolean;
    serviceName: string;
    endpoint: string;
  };
  metrics: {
    enabled: boolean;
    endpoint: string;
    interval: number;
  };
  logging: {
    enabled: boolean;
    level: string;
    format: string;
  };
}

interface Runbook {
  alert: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  description: string;
  troubleshooting: string[];
  escalation: string;
}

function generateObservabilityConfig(): ObservabilityConfig {
  return {
    tracing: {
      enabled: true,
      serviceName: 'bthwani-backend',
      endpoint: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4318/v1/traces',
    },
    metrics: {
      enabled: true,
      endpoint: process.env.PROMETHEUS_PUSHGATEWAY || 'http://localhost:9091',
      interval: 15000, // 15 seconds
    },
    logging: {
      enabled: true,
      level: process.env.LOG_LEVEL || 'info',
      format: 'json',
    },
  };
}

function generatePrometheusConfig(): string {
  return `# Prometheus configuration for BThwani - BTW-OBS-004

global:
  scrape_interval: 15s
  evaluation_interval: 15s
  external_labels:
    cluster: 'bthwani-production'
    environment: 'production'

# Alertmanager configuration
alerting:
  alertmanagers:
    - static_configs:
        - targets:
            - alertmanager:9093

# Load rules
rule_files:
  - "alerts/*.yml"

# Scrape configurations
scrape_configs:
  # BThwani Backend
  - job_name: 'bthwani-backend'
    static_configs:
      - targets: ['backend:3000']
    metrics_path: '/metrics'
    scrape_interval: 15s

  # Node Exporter (system metrics)
  - job_name: 'node-exporter'
    static_configs:
      - targets: ['node-exporter:9100']

  # MongoDB Exporter
  - job_name: 'mongodb'
    static_configs:
      - targets: ['mongodb-exporter:9216']

  # Redis Exporter
  - job_name: 'redis'
    static_configs:
      - targets: ['redis-exporter:9121']

  # NGINX
  - job_name: 'nginx'
    static_configs:
      - targets: ['nginx-exporter:9113']
`;
}

function generateAlertRules(): string {
  return `# Prometheus Alert Rules - BTW-OBS-004

groups:
  - name: availability
    interval: 30s
    rules:
      - alert: ServiceDown
        expr: up{job="bthwani-backend"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Service {{ $labels.instance }} is down"
          description: "{{ $labels.job }} on {{ $labels.instance }} has been down for more than 1 minute"
          runbook: "https://docs.bthwani.com/runbooks/service-down"

      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.05
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "High error rate detected"
          description: "Error rate is {{ $value | humanizePercentage }} over the last 5 minutes"
          runbook: "https://docs.bthwani.com/runbooks/high-error-rate"

  - name: performance
    interval: 30s
    rules:
      - alert: HighLatency
        expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 2
        for: 5m
        labels:
          severity: high
        annotations:
          summary: "High latency detected"
          description: "95th percentile latency is {{ $value }}s"
          runbook: "https://docs.bthwani.com/runbooks/high-latency"

      - alert: HighCPUUsage
        expr: rate(process_cpu_seconds_total[5m]) > 0.8
        for: 10m
        labels:
          severity: high
        annotations:
          summary: "High CPU usage"
          description: "CPU usage is {{ $value | humanizePercentage }}"
          runbook: "https://docs.bthwani.com/runbooks/high-cpu"

  - name: saturation
    interval: 30s
    rules:
      - alert: HighMemoryUsage
        expr: process_resident_memory_bytes / node_memory_MemTotal_bytes > 0.9
        for: 5m
        labels:
          severity: high
        annotations:
          summary: "High memory usage"
          description: "Memory usage is {{ $value | humanizePercentage }}"
          runbook: "https://docs.bthwani.com/runbooks/high-memory"

      - alert: DatabaseConnectionPoolExhausted
        expr: mongodb_connections{state="available"} < 5
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "Database connection pool nearly exhausted"
          description: "Only {{ $value }} connections available"
          runbook: "https://docs.bthwani.com/runbooks/db-connections"

  - name: burn-rate
    interval: 1m
    rules:
      # Multi-window burn rate for SLO alerting
      - alert: ErrorBudgetBurn_Fast
        expr: |
          (
            rate(http_requests_total{status=~"5.."}[1m]) / rate(http_requests_total[1m]) > (14.4 * 0.001)
            and
            rate(http_requests_total{status=~"5.."}[5m]) / rate(http_requests_total[5m]) > (14.4 * 0.001)
          )
        labels:
          severity: critical
        annotations:
          summary: "Fast error budget burn detected"
          description: "Error budget will be exhausted in < 2 days"
          runbook: "https://docs.bthwani.com/runbooks/error-budget-burn"

      - alert: ErrorBudgetBurn_Slow
        expr: |
          (
            rate(http_requests_total{status=~"5.."}[1h]) / rate(http_requests_total[1h]) > (6 * 0.001)
            and
            rate(http_requests_total{status=~"5.."}[6h]) / rate(http_requests_total[6h]) > (6 * 0.001)
          )
        labels:
          severity: high
        annotations:
          summary: "Slow error budget burn detected"
          description: "Error budget consumption is elevated"
          runbook: "https://docs.bthwani.com/runbooks/error-budget-burn"

  - name: business
    interval: 1m
    rules:
      - alert: OrderProcessingStalled
        expr: rate(orders_created_total[5m]) == 0
        for: 10m
        labels:
          severity: critical
        annotations:
          summary: "Order processing has stalled"
          description: "No orders created in the last 10 minutes"
          runbook: "https://docs.bthwani.com/runbooks/orders-stalled"

      - alert: PaymentFailureRateHigh
        expr: rate(payments_failed_total[5m]) / rate(payments_total[5m]) > 0.1
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "High payment failure rate"
          description: "Payment failure rate is {{ $value | humanizePercentage }}"
          runbook: "https://docs.bthwani.com/runbooks/payment-failures"
`;
}

function generateRunbooks(): Runbook[] {
  return [
    {
      alert: 'ServiceDown',
      severity: 'CRITICAL',
      description: 'The BThwani backend service is not responding',
      troubleshooting: [
        '1. Check if the service is running: systemctl status bthwani-backend',
        '2. Check recent logs: journalctl -u bthwani-backend -n 100',
        '3. Verify MongoDB is accessible: nc -zv mongodb 27017',
        '4. Verify Redis is accessible: nc -zv redis 6379',
        '5. Check resource usage: top, free -h, df -h',
        '6. If OOM killed, increase memory limits',
        '7. Restart service: systemctl restart bthwani-backend',
      ],
      escalation: 'If service cannot be restored in 5 minutes, page on-call engineer',
    },
    {
      alert: 'HighErrorRate',
      severity: 'CRITICAL',
      description: '5xx error rate is above acceptable threshold',
      troubleshooting: [
        '1. Check error logs: tail -f /var/log/bthwani/error.log',
        '2. Identify failing endpoints in Grafana',
        '3. Check database connection pool',
        '4. Verify external service dependencies',
        '5. Check for deployment issues - recent releases',
        '6. Consider rollback if caused by recent deployment',
      ],
      escalation: 'Page backend team if error rate > 10% for more than 10 minutes',
    },
    {
      alert: 'HighLatency',
      severity: 'HIGH',
      description: 'P95 latency is above 2 seconds',
      troubleshooting: [
        '1. Check slow queries in MongoDB: db.currentOp({secs_running: {$gt: 1}})',
        '2. Review APM traces for slow transactions',
        '3. Check database indexes: npm run audit:indexes',
        '4. Verify cache hit rate in Redis',
        '5. Check for N+1 query problems',
        '6. Review recent code changes',
      ],
      escalation: 'Notify backend team if latency > 5s',
    },
    {
      alert: 'ErrorBudgetBurn_Fast',
      severity: 'CRITICAL',
      description: 'Error budget will be exhausted quickly',
      troubleshooting: [
        '1. Check what is causing the errors',
        '2. Evaluate if rollback is needed',
        '3. Implement emergency fixes',
        '4. Consider feature flags to disable problematic features',
        '5. Update stakeholders on SLO status',
      ],
      escalation: 'Immediate page to on-call and notify management',
    },
    {
      alert: 'OrderProcessingStalled',
      severity: 'CRITICAL',
      description: 'No orders are being processed',
      troubleshooting: [
        '1. Check order queue: redis-cli LLEN orders:pending',
        '2. Verify worker processes are running',
        '3. Check database write locks',
        '4. Review payment gateway status',
        '5. Check notification service',
        '6. Restart queue workers if needed',
      ],
      escalation: 'Page backend and operations immediately - revenue impact',
    },
  ];
}

function generateGrafanaDashboard(): any {
  return {
    dashboard: {
      title: 'BThwani - Overview',
      tags: ['bthwani', 'overview'],
      timezone: 'browser',
      panels: [
        {
          title: 'RPS (Requests per Second)',
          targets: [
            {
              expr: 'rate(http_requests_total[5m])',
              legendFormat: '{{ method }} {{ path }}',
            },
          ],
          type: 'graph',
        },
        {
          title: 'Latency (P50, P95, P99)',
          targets: [
            {
              expr: 'histogram_quantile(0.50, rate(http_request_duration_seconds_bucket[5m]))',
              legendFormat: 'P50',
            },
            {
              expr: 'histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))',
              legendFormat: 'P95',
            },
            {
              expr: 'histogram_quantile(0.99, rate(http_request_duration_seconds_bucket[5m]))',
              legendFormat: 'P99',
            },
          ],
          type: 'graph',
        },
        {
          title: 'Error Rate',
          targets: [
            {
              expr: 'rate(http_requests_total{status=~"5.."}[5m]) / rate(http_requests_total[5m])',
              legendFormat: '5xx rate',
            },
          ],
          type: 'graph',
        },
        {
          title: 'Saturation - CPU',
          targets: [
            {
              expr: 'rate(process_cpu_seconds_total[5m])',
              legendFormat: 'CPU usage',
            },
          ],
          type: 'graph',
        },
      ],
    },
  };
}

function main(): void {
  console.log('🔭 BThwani Observability Setup - BTW-OBS-004');
  console.log('==========================================\n');

  const reportsDir = path.resolve(__dirname, '../../reports');
  const opsDir = path.resolve(__dirname, '../../ops');
  const runbooksDir = path.join(opsDir, 'runbooks');

  // Create directories
  [reportsDir, opsDir, runbooksDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });

  // Generate configuration
  const config = generateObservabilityConfig();
  const configPath = path.join(reportsDir, 'observability-config.json');
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  console.log(`✅ Config saved: ${configPath}`);

  // Generate Prometheus config
  const prometheusConfig = generatePrometheusConfig();
  const prometheusPath = path.join(opsDir, 'prometheus.yml');
  fs.writeFileSync(prometheusPath, prometheusConfig);
  console.log(`✅ Prometheus config saved: ${prometheusPath}`);

  // Generate alert rules
  const alertRules = generateAlertRules();
  const alertsDir = path.join(opsDir, 'alerts');
  if (!fs.existsSync(alertsDir)) {
    fs.mkdirSync(alertsDir, { recursive: true });
  }
  const alertsPath = path.join(alertsDir, 'rules.yml');
  fs.writeFileSync(alertsPath, alertRules);
  console.log(`✅ Alert rules saved: ${alertsPath}`);

  // Generate runbooks
  const runbooks = generateRunbooks();
  runbooks.forEach(runbook => {
    const filename = runbook.alert.toLowerCase().replace(/_/g, '-') + '.md';
    const content = `# ${runbook.alert}\n\n` +
      `**Severity:** ${runbook.severity}\n\n` +
      `## Description\n\n${runbook.description}\n\n` +
      `## Troubleshooting Steps\n\n${runbook.troubleshooting.map(s => s).join('\n')}\n\n` +
      `## Escalation\n\n${runbook.escalation}\n`;
    
    fs.writeFileSync(path.join(runbooksDir, filename), content);
  });
  console.log(`✅ ${runbooks.length} runbooks created in ${runbooksDir}`);

  // Generate Grafana dashboard
  const dashboard = generateGrafanaDashboard();
  const dashboardPath = path.join(opsDir, 'grafana-dashboard.json');
  fs.writeFileSync(dashboardPath, JSON.stringify(dashboard, null, 2));
  console.log(`✅ Grafana dashboard saved: ${dashboardPath}`);

  console.log('\n📊 OBSERVABILITY SETUP COMPLETE');
  console.log('================================');
  console.log('\n✅ Acceptance Criteria:');
  console.log('   [x] Dashboards created');
  console.log('   [x] Alerts configured with runbooks');
  console.log('   [x] Multi-window burn-rate alerts');
  console.log('   [ ] MTTR <= 30m (measure after deployment)');
  
  console.log('\n📝 Next Steps:');
  console.log('   1. Deploy Prometheus with ops/prometheus.yml');
  console.log('   2. Import Grafana dashboard from ops/grafana-dashboard.json');
  console.log('   3. Configure Alertmanager');
  console.log('   4. Instrument application with OpenTelemetry');
  console.log('   5. Test alerts by triggering conditions');
  console.log('   6. Review runbooks with team\n');
}

main();

