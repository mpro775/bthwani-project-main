import { Controller, Get } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  MongooseHealthIndicator,
  MemoryHealthIndicator,
  DiskHealthIndicator,
  HealthCheckResult,
} from '@nestjs/terminus';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { ServiceUnavailableException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiExcludeEndpoint, ApiSecurity } from '@nestjs/swagger';
import { Public } from '../../common/decorators/auth.decorator';
import { RedisHealthIndicator } from './indicators/redis.health';
import { QueueHealthIndicator } from './indicators/queue.health';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    @InjectConnection() private readonly connection: Connection,
    private readonly health: HealthCheckService,
    private readonly db: MongooseHealthIndicator,
    private readonly memory: MemoryHealthIndicator,
    private readonly disk: DiskHealthIndicator,
    private readonly redis: RedisHealthIndicator,
    private readonly queue: QueueHealthIndicator,
  ) {}

  @Get()
  @Public()
  @HealthCheck()
  @ApiOperation({ summary: 'Health Check - الفحص الصحي الشامل للتطبيق' })
  @ApiResponse({ status: 200, description: 'التطبيق يعمل بشكل صحيح' })
  @ApiResponse({ status: 503, description: 'التطبيق يعاني من مشاكل' })
  async check(): Promise<HealthCheckResult> {
    return this.health.check([
      // فحص قاعدة البيانات
      () => this.db.pingCheck('database', { timeout: 3000 }),

      // فحص الذاكرة - Heap
      // 150 MB حد أقصى للـ heap
      () => this.memory.checkHeap('memory_heap', 150 * 1024 * 1024),

      // فحص الذاكرة - RSS (Resident Set Size)
      // 300 MB حد أقصى للـ RSS
      () => this.memory.checkRSS('memory_rss', 300 * 1024 * 1024),

      // فحص مساحة القرص
      // تحذير عند استخدام 90% من المساحة
      () =>
        this.disk.checkStorage('disk_storage', {
          path: process.platform === 'win32' ? 'C:\\' : '/',
          thresholdPercent: 0.9,
        }),

      // فحص Redis/Cache
      () => this.redis.isHealthy('cache'),

      // فحص Queues
      () => this.queue.isHealthy('queues'),
    ]);
  }

  @Get('liveness')
  @Public()
  @HealthCheck()
  @ApiOperation({ summary: 'Liveness Probe - للـ Kubernetes' })
  @ApiResponse({ status: 200, description: 'التطبيق يعمل (alive)' })
  async liveness(): Promise<HealthCheckResult> {
    // فحص بسيط - التطبيق يعمل فقط
    return this.health.check([
      // فحص الذاكرة الأساسي فقط لضمان عدم نفاذها
      () => this.memory.checkHeap('memory_heap', 500 * 1024 * 1024),
    ]);
  }

  @Get('readiness')
  @Public()
  @HealthCheck()
  @ApiOperation({ summary: 'Readiness Probe - للـ Kubernetes' })
  @ApiResponse({ status: 200, description: 'التطبيق جاهز لاستقبال الطلبات' })
  @ApiResponse({ status: 503, description: 'التطبيق غير جاهز' })
  async readiness(): Promise<HealthCheckResult> {
    // فحص شامل - التطبيق جاهز للعمل
    return this.health.check([
      // قاعدة البيانات يجب أن تكون متصلة
      () => this.db.pingCheck('database', { timeout: 2000 }),

      // الذاكرة يجب أن تكون معقولة
      () => this.memory.checkHeap('memory_heap', 200 * 1024 * 1024),

      // Redis/Cache يجب أن يكون متاحاً
      () => this.redis.isHealthy('cache'),
    ]);
  }

  @Get('advanced')
  @Public()
  @HealthCheck()
  @ApiOperation({ summary: 'Advanced Health Check - فحص متقدم شامل' })
  @ApiResponse({ status: 200, description: 'فحص شامل مع جميع المؤشرات' })
  @ApiResponse({ status: 503, description: 'بعض الخدمات تعاني من مشاكل' })
  async advanced(): Promise<HealthCheckResult> {
    return this.health.check([
      // Database
      () => this.db.pingCheck('database', { timeout: 3000 }),

      // Memory
      () => this.memory.checkHeap('memory_heap', 150 * 1024 * 1024),
      () => this.memory.checkRSS('memory_rss', 300 * 1024 * 1024),

      // Disk
      () =>
        this.disk.checkStorage('disk_storage', {
          path: process.platform === 'win32' ? 'C:\\' : '/',
          thresholdPercent: 0.9,
        }),

      // Cache
      () => this.redis.isHealthy('cache'),
      () => this.redis.checkPerformance('cache_performance', 100), // 100ms threshold

      // Queues
      () => this.queue.isHealthy('queues'),
      () => this.queue.checkBacklog('queue_backlog', 1000), // 1000 jobs threshold
      () => this.queue.checkFailedJobs('queue_failures', 100), // 100 failed jobs threshold
    ]);
  }

  @Get('startup')
  @Public()
  @ApiOperation({ summary: 'Startup Probe - للـ Kubernetes' })
  @ApiResponse({ status: 200, description: 'التطبيق انتهى من بدء التشغيل' })
  @ApiResponse({ status: 503, description: 'التطبيق ما زال يبدأ' })
  startup() {
    // يتحقق أن التطبيق انتهى من بدء التشغيل
    const dbReady = Number(this.connection.readyState) === 1;

    if (!dbReady) {
      throw new ServiceUnavailableException({
        started: false,
        reason: 'Application still starting up',
        database: {
          status: this.getDatabaseStatus(Number(this.connection.readyState)),
          readyState: Number(this.connection.readyState),
        },
      });
    }

    return {
      started: true,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: {
        status: 'connected',
        readyState: Number(this.connection.readyState),
      },
    };
  }

  @Get('detailed')
  @Public()
  @ApiOperation({ summary: 'Detailed Health Check - فحص تفصيلي' })
  @ApiResponse({ status: 200, description: 'معلومات تفصيلية عن صحة التطبيق' })
  detailed() {
    const memUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();

    // حساب استخدام CPU كنسبة مئوية
    const cpuPercent = {
      user: Math.round((cpuUsage.user / 1000000) * 100) / 100, // تحويل من microseconds
      system: Math.round((cpuUsage.system / 1000000) * 100) / 100,
    };

    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: {
        seconds: Math.round(process.uptime()),
        formatted: this.formatUptime(process.uptime()),
      },
      environment: {
        nodeEnv: process.env.NODE_ENV || 'development',
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        pid: process.pid,
      },
      database: {
        status: this.getDatabaseStatus(Number(this.connection.readyState)),
        readyState: Number(this.connection.readyState),
        name: this.connection.name,
        host: this.connection.host,
        collections: Object.keys(this.connection.collections).length,
      },
      memory: {
        rss: Math.round(memUsage.rss / 1024 / 1024),
        heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
        heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
        heapUsedPercent: Math.round(
          (memUsage.heapUsed / memUsage.heapTotal) * 100,
        ),
        external: Math.round(memUsage.external / 1024 / 1024),
        arrayBuffers: memUsage.arrayBuffers
          ? Math.round(memUsage.arrayBuffers / 1024 / 1024)
          : 0,
        unit: 'MB',
      },
      cpu: {
        user: cpuPercent.user,
        system: cpuPercent.system,
        total: Math.round((cpuPercent.user + cpuPercent.system) * 100) / 100,
        unit: 'ms',
      },
      process: {
        pid: process.pid,
        ppid: process.ppid,
        title: process.title,
        version: process.version,
        versions: process.versions,
      },
    };
  }

  @Get('metrics')
  @Public()
  @ApiOperation({ summary: 'Health Metrics - مقاييس الصحة المبسطة' })
  @ApiResponse({ status: 200, description: 'مقاييس الصحة' })
  metrics() {
    const memUsage = process.memoryUsage();
    const dbState = Number(this.connection.readyState);

    return {
      timestamp: new Date().toISOString(),
      uptime: Math.round(process.uptime()),
      database: {
        connected: dbState === 1,
        status: this.getDatabaseStatus(dbState),
      },
      memory: {
        heapUsedMB: Math.round(memUsage.heapUsed / 1024 / 1024),
        heapTotalMB: Math.round(memUsage.heapTotal / 1024 / 1024),
        rssMB: Math.round(memUsage.rss / 1024 / 1024),
        heapUsedPercent: Math.round(
          (memUsage.heapUsed / memUsage.heapTotal) * 100,
        ),
      },
      status: dbState === 1 ? 'healthy' : 'unhealthy',
    };
  }

  @Get('info')
  @Public()
  @ApiOperation({ summary: 'Application Info - معلومات التطبيق' })
  @ApiResponse({ status: 200, description: 'معلومات التطبيق' })
  info() {
    return {
      name: 'Bthwani Backend',
      version: process.env.npm_package_version || '1.0.0',
      description: 'منصة بثواني للتوصيل والخدمات',
      environment: process.env.NODE_ENV || 'development',
      nodeVersion: process.version,
      startTime: new Date(Date.now() - process.uptime() * 1000).toISOString(),
      uptime: this.formatUptime(process.uptime()),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };
  }

  private getDatabaseStatus(readyState: number): string {
    const states: Record<number, string> = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting',
    };
    return states[readyState] || 'unknown';
  }

  private formatUptime(seconds: number): string {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    const parts: string[] = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    parts.push(`${secs}s`);

    return parts.join(' ');
  }
}

