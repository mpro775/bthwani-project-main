import { Connection, ClientSession } from 'mongoose';
import { Logger } from '@nestjs/common';

/**
 * Helper class لإدارة الـ database transactions
 * يوحد منطق الـ transaction management ويقلل التكرار
 */
export class TransactionHelper {
  private static readonly logger = new Logger(TransactionHelper.name);

  /**
   * تنفيذ عملية ضمن transaction
   *
   * @example
   * ```typescript
   * return TransactionHelper.executeInTransaction(
   *   this.connection,
   *   async (session) => {
   *     const user = await this.userModel.findById(userId).session(session);
   *     // ... عمليات أخرى
   *     return result;
   *   }
   * );
   * ```
   */
  static async executeInTransaction<T>(
    connection: Connection,
    operation: (session: ClientSession) => Promise<T>,
  ): Promise<T> {
    const session = await connection.startSession();
    session.startTransaction();

    try {
      const result = await operation(session);
      await session.commitTransaction();
      return result;
    } catch (error) {
      await session.abortTransaction();
      const message = error instanceof Error ? error.message : String(error);
      const stack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Transaction failed: ${message}`, stack);
      throw error;
    } finally {
      void session.endSession();
    }
  }

  /**
   * تنفيذ عدة عمليات بالتوازي ضمن transaction واحد
   */
  static async executeMultipleInTransaction<T>(
    connection: Connection,
    operations: Array<(session: ClientSession) => Promise<T>>,
  ): Promise<T[]> {
    return this.executeInTransaction(connection, async (session) => {
      return Promise.all(operations.map((op) => op(session)));
    });
  }

  /**
   * تنفيذ عملية مع retry logic
   */
  static async executeWithRetry<T>(
    connection: Connection,
    operation: (session: ClientSession) => Promise<T>,
    maxRetries: number = 3,
    retryDelay: number = 1000,
  ): Promise<T> {
    let lastError: Error | undefined;

    for (let i = 0; i < maxRetries; i++) {
      try {
        return await this.executeInTransaction(connection, operation);
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        const message = error instanceof Error ? error.message : String(error);
        this.logger.warn(`Transaction attempt ${i + 1} failed: ${message}`);

        if (i < maxRetries - 1) {
          // Wait before retry (exponential backoff)
          await new Promise((resolve) =>
            setTimeout(resolve, retryDelay * Math.pow(2, i)),
          );
        }
      }
    }

    throw lastError || new Error('Transaction failed after all retries');
  }
}
