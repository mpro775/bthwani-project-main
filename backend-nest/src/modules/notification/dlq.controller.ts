import { Controller, Get, Post, Param, Query, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { DLQService } from './services/dlq.service';
import { UnifiedAuthGuard } from '../../common/guards/unified-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/auth.decorator';

@ApiTags('DLQ Management')
@ApiBearerAuth()
@Controller('dlq')
@UseGuards(UnifiedAuthGuard, RolesGuard)
export class DLQController {
  constructor(private readonly dlqService: DLQService) {}

  @Get('stats')
  @Roles('admin', 'ops')
  @ApiOperation({
    summary: 'Get DLQ statistics',
    description: 'Retrieve statistics for all Dead Letter Queues'
  })
  @ApiResponse({ status: 200, description: 'DLQ statistics retrieved' })
  @ApiResponse({ status: 403, description: 'Unauthorized' })
  async getDLQStats() {
    return this.dlqService.getDLQStats();
  }

  @Post(':queueName/retry')
  @Roles('admin', 'ops')
  @ApiOperation({
    summary: 'Retry jobs from DLQ',
    description: 'Retry processing of failed jobs from a specific DLQ'
  })
  @ApiParam({
    name: 'queueName',
    description: 'DLQ name (notifications-dlq, emails-dlq, orders-dlq, webhooks-dlq)',
    example: 'notifications-dlq'
  })
  @ApiQuery({
    name: 'jobId',
    description: 'Specific job ID to retry (optional)',
    required: false
  })
  @ApiQuery({
    name: 'limit',
    description: 'Maximum number of jobs to retry',
    required: false,
    example: 10
  })
  @ApiResponse({ status: 200, description: 'Retry operation completed' })
  @ApiResponse({ status: 400, description: 'Invalid queue name' })
  @ApiResponse({ status: 403, description: 'Unauthorized' })
  async retryFromDLQ(
    @Param('queueName') queueName: string,
    @Query('jobId') jobId?: string,
    @Query('limit') limit?: number,
  ) {
    const limitNum = limit ? parseInt(limit.toString(), 10) : 10;
    const retryCount = await this.dlqService.retryFailedJobs(queueName);

    return {
      message: `Retried ${retryCount} jobs from ${queueName}`,
      queueName,
      retryCount,
      jobId: jobId || 'all',
      limit: limitNum,
    };
  }

  @Post('cleanup')
  @Roles('admin', 'ops')
  @ApiOperation({
    summary: 'Clean up old DLQ jobs',
    description: 'Remove old completed and failed jobs from all DLQs'
  })
  @ApiQuery({
    name: 'daysOld',
    description: 'Remove jobs older than this many days',
    required: false,
    example: 30
  })
  @ApiResponse({ status: 200, description: 'Cleanup completed' })
  @ApiResponse({ status: 403, description: 'Unauthorized' })
  async cleanupDLQ(@Query('daysOld') daysOld?: number) {
    const days = daysOld ? parseInt(daysOld.toString(), 10) : 30;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    const cleanedCount = await this.dlqService.cleanupDLQ(cutoffDate);

    return {
      message: `Cleaned up ${cleanedCount} old DLQ jobs`,
      cleanedCount,
      daysOld: days,
    };
  }

  @Post(':queueName/cleanup')
  @Roles('admin', 'ops')
  @ApiOperation({
    summary: 'Clean up old jobs from specific DLQ',
    description: 'Remove old completed and failed jobs from a specific DLQ'
  })
  @ApiParam({
    name: 'queueName',
    description: 'DLQ name to clean up',
    example: 'notifications-dlq'
  })
  @ApiQuery({
    name: 'daysOld',
    description: 'Remove jobs older than this many days',
    required: false,
    example: 30
  })
  @ApiResponse({ status: 200, description: 'DLQ cleanup completed' })
  @ApiResponse({ status: 400, description: 'Invalid queue name' })
  @ApiResponse({ status: 403, description: 'Unauthorized' })
  async cleanupSpecificDLQ(
    @Param('queueName') queueName: string,
    @Query('daysOld') daysOld?: number,
  ) {
    // This would need additional implementation in DLQService
    // For now, return not implemented
    return {
      message: `Cleanup for specific DLQ ${queueName} not yet implemented`,
      queueName,
      status: 'not_implemented'
    };
  }
}
