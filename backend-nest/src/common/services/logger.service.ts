import { Injectable, LoggerService as NestLoggerService, Scope } from '@nestjs/common';

export interface LogContext {
  correlationId?: string;
  userId?: string;
  orderId?: string;
  action?: string;
  duration?: number;
  statusCode?: number;
  method?: string;
  url?: string;
  ip?: string;
  userAgent?: string;
  [key: string]: any;
}

@Injectable({ scope: Scope.TRANSIENT })
export class AppLoggerService implements NestLoggerService {
  private context?: string;

  setContext(context: string) {
    this.context = context;
  }

  /**
   * Log with structured format
   */
  log(message: string, context?: string | LogContext) {
    this.printLog('info', message, context);
  }

  /**
   * Error log with structured format
   */
  error(message: string, trace?: string, context?: string | LogContext) {
    this.printLog('error', message, context, trace);
  }

  /**
   * Warning log with structured format
   */
  warn(message: string, context?: string | LogContext) {
    this.printLog('warn', message, context);
  }

  /**
   * Debug log with structured format
   */
  debug(message: string, context?: string | LogContext) {
    if (process.env.NODE_ENV === 'development' || process.env.LOG_LEVEL === 'debug') {
      this.printLog('debug', message, context);
    }
  }

  /**
   * Verbose log with structured format
   */
  verbose(message: string, context?: string | LogContext) {
    if (process.env.LOG_LEVEL === 'verbose') {
      this.printLog('verbose', message, context);
    }
  }

  /**
   * Log HTTP request
   */
  logRequest(req: any, statusCode: number, duration: number) {
    const logData: LogContext = {
      correlationId: req.correlationId,
      method: req.method,
      url: req.url,
      statusCode,
      duration,
      ip: req.ip || req.connection?.remoteAddress,
      userAgent: req.headers?.['user-agent'],
      userId: req.user?.userId || req.user?.id,
    };

    const message = `${req.method} ${req.url} ${statusCode} - ${duration}ms`;
    
    if (statusCode >= 500) {
      this.error(message, undefined, logData);
    } else if (statusCode >= 400) {
      this.warn(message, logData);
    } else {
      this.log(message, logData);
    }
  }

  /**
   * Log business event
   */
  logEvent(event: string, data: LogContext) {
    this.log(`Event: ${event}`, {
      event,
      ...data,
    });
  }

  /**
   * Log database query
   */
  logQuery(query: string, duration: number, context?: LogContext) {
    this.debug(`Query: ${query}`, {
      query,
      duration,
      type: 'database',
      ...context,
    });
  }

  /**
   * Log external API call
   */
  logExternalCall(service: string, endpoint: string, duration: number, statusCode?: number, context?: LogContext) {
    this.log(`External API: ${service} - ${endpoint}`, {
      service,
      endpoint,
      duration,
      statusCode,
      type: 'external_api',
      ...context,
    });
  }

  /**
   * Print formatted log
   */
  private printLog(
    level: 'info' | 'error' | 'warn' | 'debug' | 'verbose',
    message: string,
    context?: string | LogContext,
    trace?: string,
  ) {
    const timestamp = new Date().toISOString();
    const contextName = typeof context === 'string' ? context : this.context;

    // Structured log object
    const logObject: any = {
      timestamp,
      level: level.toUpperCase(),
      context: contextName,
      message,
    };

    // Add context data if it's an object
    if (typeof context === 'object') {
      Object.assign(logObject, context);
    }

    // Add trace for errors
    if (trace) {
      logObject.trace = trace;
    }

    // Add environment info
    logObject.environment = process.env.NODE_ENV || 'development';
    logObject.pid = process.pid;

    // Format output based on environment
    if (process.env.NODE_ENV === 'production') {
      // JSON format for production (easy to parse by log aggregators)
      console.log(JSON.stringify(logObject));
    } else {
      // Human-readable format for development
      const color = this.getColorForLevel(level);
      const contextStr = contextName ? `[${contextName}]` : '';
      const correlationStr = logObject.correlationId ? `[${logObject.correlationId.slice(0, 8)}]` : '';
      
      console.log(
        `${color}[${timestamp}] [${level.toUpperCase()}]${this.resetColor} ${contextStr}${correlationStr} ${message}`
      );

      // Print additional context in development
      if (typeof context === 'object' && Object.keys(context).length > 0) {
        const filteredContext = { ...context };
        delete filteredContext.correlationId;
        
        if (Object.keys(filteredContext).length > 0) {
          console.log(`${color}  Context:${this.resetColor}`, JSON.stringify(filteredContext, null, 2));
        }
      }

      if (trace) {
        console.log(`${color}  Trace:${this.resetColor}`, trace);
      }
    }
  }

  /**
   * Get color code for log level
   */
  private getColorForLevel(level: string): string {
    const colors: Record<string, string> = {
      info: '\x1b[32m',    // Green
      error: '\x1b[31m',   // Red
      warn: '\x1b[33m',    // Yellow
      debug: '\x1b[36m',   // Cyan
      verbose: '\x1b[35m', // Magenta
    };
    return colors[level] || '';
  }

  private get resetColor(): string {
    return '\x1b[0m';
  }
}

