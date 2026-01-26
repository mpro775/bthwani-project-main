import { Controller, Get, Header } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiSecurity } from '@nestjs/swagger';
import { MetricsService } from '../../common/services/metrics.service';
import type { JsonMetrics } from '../../common/services/metrics.service';
import { Public } from '../../common/decorators/auth.decorator';

@ApiTags('Metrics')
@Controller('metrics')
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @Get()
  @Public()
  @Header('Content-Type', 'text/plain; version=0.0.4')
  @ApiOperation({ summary: 'Prometheus Metrics Endpoint' })
  @ApiResponse({ status: 200, description: 'Metrics in Prometheus format' })
  getPrometheusMetrics(): string {
    return this.metricsService.getPrometheusMetrics();
  }

  @Get('json')
  @Public()
  @ApiOperation({ summary: 'Metrics in JSON format' })
  @ApiResponse({ status: 200, description: 'Metrics in JSON format' })
  getJsonMetrics(): JsonMetrics {
    return this.metricsService.getJsonMetrics();
  }
}

