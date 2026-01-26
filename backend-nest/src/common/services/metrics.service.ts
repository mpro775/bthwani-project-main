import { Injectable } from '@nestjs/common';

interface MetricData {
  count: number;
  sum: number;
  min: number;
  max: number;
  lastUpdated: number;
}

interface Histogram {
  buckets: Map<number, number>;
  sum: number;
  count: number;
}

export interface JsonMetrics {
  timestamp: string;
  counters: Record<string, number>;
  gauges: Record<string, number>;
  histograms: Record<string, {
    buckets: Record<number, number>;
    sum: number;
    count: number;
    avg: number;
  }>;
  summaries: Record<string, MetricData & { avg: number }>;
  system: Record<string, any>;
}

@Injectable()
export class MetricsService {
  // Counters: للعد التراكمي (مثل عدد الطلبات)
  private counters: Map<string, number> = new Map();

  // Gauges: للقيم الحالية (مثل عدد المستخدمين النشطين)
  private gauges: Map<string, number> = new Map();

  // Histograms: لتوزيع القيم (مثل أوقات الاستجابة)
  private histograms: Map<string, Histogram> = new Map();

  // Summary metrics
  private summaries: Map<string, MetricData> = new Map();

  // Labels for metrics
  private labels: Map<string, Record<string, string>> = new Map();

  /**
   * Increment a counter
   */
  incrementCounter(name: string, value: number = 1, labels?: Record<string, string>) {
    const key = this.getMetricKey(name, labels);
    const current = this.counters.get(key) || 0;
    this.counters.set(key, current + value);
    if (labels) {
      this.labels.set(key, labels);
    }
  }

  /**
   * Set a gauge value
   */
  setGauge(name: string, value: number, labels?: Record<string, string>) {
    const key = this.getMetricKey(name, labels);
    this.gauges.set(key, value);
    if (labels) {
      this.labels.set(key, labels);
    }
  }

  /**
   * Increment a gauge
   */
  incrementGauge(name: string, value: number = 1, labels?: Record<string, string>) {
    const key = this.getMetricKey(name, labels);
    const current = this.gauges.get(key) || 0;
    this.gauges.set(key, current + value);
    if (labels) {
      this.labels.set(key, labels);
    }
  }

  /**
   * Decrement a gauge
   */
  decrementGauge(name: string, value: number = 1, labels?: Record<string, string>) {
    const key = this.getMetricKey(name, labels);
    const current = this.gauges.get(key) || 0;
    this.gauges.set(key, Math.max(0, current - value));
    if (labels) {
      this.labels.set(key, labels);
    }
  }

  /**
   * Observe a value in histogram
   */
  observeHistogram(name: string, value: number, buckets: number[] = [0.1, 0.5, 1, 2, 5, 10]) {
    if (!this.histograms.has(name)) {
      this.histograms.set(name, {
        buckets: new Map(buckets.map(b => [b, 0])),
        sum: 0,
        count: 0,
      });
    }

    const histogram = this.histograms.get(name)!;
    histogram.sum += value;
    histogram.count += 1;

    // Increment appropriate buckets
    for (const [bucket, _] of histogram.buckets) {
      if (value <= bucket) {
        histogram.buckets.set(bucket, (histogram.buckets.get(bucket) || 0) + 1);
      }
    }
  }

  /**
   * Record a summary value
   */
  recordSummary(name: string, value: number, labels?: Record<string, string>) {
    const key = this.getMetricKey(name, labels);
    const current = this.summaries.get(key);

    if (!current) {
      this.summaries.set(key, {
        count: 1,
        sum: value,
        min: value,
        max: value,
        lastUpdated: Date.now(),
      });
    } else {
      current.count += 1;
      current.sum += value;
      current.min = Math.min(current.min, value);
      current.max = Math.max(current.max, value);
      current.lastUpdated = Date.now();
    }

    if (labels) {
      this.labels.set(key, labels);
    }
  }

  /**
   * Get all metrics in Prometheus format
   */
  getPrometheusMetrics(): string {
    const lines: string[] = [];

    // Counters
    for (const [key, value] of this.counters) {
      const { name, labelsStr } = this.parseMetricKey(key);
      lines.push(`# TYPE ${name} counter`);
      lines.push(`${name}${labelsStr} ${value}`);
    }

    // Gauges
    for (const [key, value] of this.gauges) {
      const { name, labelsStr } = this.parseMetricKey(key);
      lines.push(`# TYPE ${name} gauge`);
      lines.push(`${name}${labelsStr} ${value}`);
    }

    // Histograms
    for (const [name, histogram] of this.histograms) {
      lines.push(`# TYPE ${name} histogram`);
      
      for (const [bucket, count] of histogram.buckets) {
        lines.push(`${name}_bucket{le="${bucket}"} ${count}`);
      }
      
      lines.push(`${name}_bucket{le="+Inf"} ${histogram.count}`);
      lines.push(`${name}_sum ${histogram.sum}`);
      lines.push(`${name}_count ${histogram.count}`);
    }

    // Summaries
    for (const [key, summary] of this.summaries) {
      const { name, labelsStr } = this.parseMetricKey(key);
      const avg = summary.count > 0 ? summary.sum / summary.count : 0;
      
      lines.push(`# TYPE ${name} summary`);
      lines.push(`${name}_sum${labelsStr} ${summary.sum}`);
      lines.push(`${name}_count${labelsStr} ${summary.count}`);
      lines.push(`${name}_min${labelsStr} ${summary.min}`);
      lines.push(`${name}_max${labelsStr} ${summary.max}`);
      lines.push(`${name}_avg${labelsStr} ${avg.toFixed(2)}`);
    }

    // Add system metrics
    lines.push(...this.getSystemMetrics());

    return lines.join('\n') + '\n';
  }

  /**
   * Get metrics as JSON
   */
  getJsonMetrics(): JsonMetrics {
    const countersObj: Record<string, number> = {};
    for (const [key, value] of this.counters) {
      countersObj[key] = value;
    }

    const gaugesObj: Record<string, number> = {};
    for (const [key, value] of this.gauges) {
      gaugesObj[key] = value;
    }

    const histogramsObj: Record<string, {
      buckets: Record<number, number>;
      sum: number;
      count: number;
      avg: number;
    }> = {};
    for (const [name, histogram] of this.histograms) {
      histogramsObj[name] = {
        buckets: Object.fromEntries(histogram.buckets),
        sum: histogram.sum,
        count: histogram.count,
        avg: histogram.count > 0 ? histogram.sum / histogram.count : 0,
      };
    }

    const summariesObj: Record<string, MetricData & { avg: number }> = {};
    for (const [key, summary] of this.summaries) {
      summariesObj[key] = {
        ...summary,
        avg: summary.count > 0 ? summary.sum / summary.count : 0,
      };
    }

    return {
      timestamp: new Date().toISOString(),
      counters: countersObj,
      gauges: gaugesObj,
      histograms: histogramsObj,
      summaries: summariesObj,
      system: this.getSystemMetricsJson(),
    };
  }

  /**
   * Reset all metrics
   */
  reset() {
    this.counters.clear();
    this.gauges.clear();
    this.histograms.clear();
    this.summaries.clear();
    this.labels.clear();
  }

  /**
   * Get system metrics in Prometheus format
   */
  private getSystemMetrics(): string[] {
    const memUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();
    const uptime = process.uptime();

    return [
      '# TYPE nodejs_memory_heap_used_bytes gauge',
      `nodejs_memory_heap_used_bytes ${memUsage.heapUsed}`,
      '# TYPE nodejs_memory_heap_total_bytes gauge',
      `nodejs_memory_heap_total_bytes ${memUsage.heapTotal}`,
      '# TYPE nodejs_memory_rss_bytes gauge',
      `nodejs_memory_rss_bytes ${memUsage.rss}`,
      '# TYPE nodejs_memory_external_bytes gauge',
      `nodejs_memory_external_bytes ${memUsage.external}`,
      '# TYPE nodejs_cpu_user_seconds_total counter',
      `nodejs_cpu_user_seconds_total ${cpuUsage.user / 1000000}`,
      '# TYPE nodejs_cpu_system_seconds_total counter',
      `nodejs_cpu_system_seconds_total ${cpuUsage.system / 1000000}`,
      '# TYPE nodejs_process_uptime_seconds gauge',
      `nodejs_process_uptime_seconds ${uptime}`,
    ];
  }

  /**
   * Get system metrics as JSON
   */
  private getSystemMetricsJson(): any {
    const memUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();

    return {
      memory: {
        heapUsed: memUsage.heapUsed,
        heapTotal: memUsage.heapTotal,
        rss: memUsage.rss,
        external: memUsage.external,
        heapUsedMB: Math.round(memUsage.heapUsed / 1024 / 1024),
        heapTotalMB: Math.round(memUsage.heapTotal / 1024 / 1024),
        rssMB: Math.round(memUsage.rss / 1024 / 1024),
      },
      cpu: {
        user: cpuUsage.user,
        system: cpuUsage.system,
        userSeconds: cpuUsage.user / 1000000,
        systemSeconds: cpuUsage.system / 1000000,
      },
      uptime: process.uptime(),
      pid: process.pid,
    };
  }

  /**
   * Generate metric key with labels
   */
  private getMetricKey(name: string, labels?: Record<string, string>): string {
    if (!labels || Object.keys(labels).length === 0) {
      return name;
    }

    const labelPairs = Object.entries(labels)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}="${v}"`)
      .join(',');

    return `${name}{${labelPairs}}`;
  }

  /**
   * Parse metric key to extract name and labels
   */
  private parseMetricKey(key: string): { name: string; labelsStr: string } {
    const braceIndex = key.indexOf('{');
    
    if (braceIndex === -1) {
      return { name: key, labelsStr: '' };
    }

    return {
      name: key.substring(0, braceIndex),
      labelsStr: key.substring(braceIndex),
    };
  }
}

