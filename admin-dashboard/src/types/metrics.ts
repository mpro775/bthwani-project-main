/**
 * Metrics Types
 */

export interface PrometheusMetrics {
  raw: string;
}

export interface JsonMetrics {
  http: {
    requests_total: number;
    requests_duration_seconds: number;
    requests_errors_total: number;
  };
  database: {
    connections_active: number;
    query_duration_seconds: number;
  };
  cache: {
    hits_total: number;
    misses_total: number;
    hit_rate: number;
  };
  queues: {
    jobs_waiting: number;
    jobs_active: number;
    jobs_completed: number;
    jobs_failed: number;
  };
  nodejs: {
    heap_used_bytes: number;
    heap_total_bytes: number;
    external_bytes: number;
    rss_bytes: number;
    version: string;
  };
}

