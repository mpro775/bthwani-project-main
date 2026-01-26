import { Module, Global } from '@nestjs/common';
import { MetricsController } from './metrics.controller';
import { MetricsService } from '../../common/services/metrics.service';
import { AppLoggerService } from '../../common/services/logger.service';

@Global()
@Module({
  controllers: [MetricsController],
  providers: [MetricsService, AppLoggerService],
  exports: [MetricsService, AppLoggerService],
})
export class MetricsModule {}
