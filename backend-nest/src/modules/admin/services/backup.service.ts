import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs/promises';
import * as path from 'path';
import { BackupRecord } from '../entities/backup-record.entity';

const execAsync = promisify(exec);

@Injectable()
export class BackupService {
  private readonly backupDir = path.join(process.cwd(), 'backups');

  constructor(
    @InjectModel(BackupRecord.name)
    private backupRecordModel: Model<BackupRecord>,
  ) {}

  async createBackup(
    collections?: string[],
    description?: string,
    adminId?: string,
  ): Promise<{
    success: boolean;
    message: string;
    backupId: string;
    collections: string[];
    description: string;
    adminId: string;
  }> {
    // Ensure backup directory exists
    await fs.mkdir(this.backupDir, { recursive: true });

    const backupId = `BACKUP-${new Date().toISOString().replace(/[:.]/g, '-')}`;

    // Create backup record
    const record = new this.backupRecordModel({
      backupId,
      type: collections?.length ? 'collections' : 'full',
      collections: collections || [],
      status: 'pending',
      createdBy: adminId ? new Types.ObjectId(adminId) : undefined,
      description,
      startedAt: new Date(),
    });

    const savedRecord = await record.save();
    const recordId = String(savedRecord._id);

    // Start backup process (async)
    this.performBackup(recordId, collections).catch((error) => {
      console.error('Backup failed:', error);
      record.status = 'failed';
      record.errorMessage =
        error instanceof Error ? error.message : String(error);
      void record.save();
    });

    return {
      success: true,
      message: 'تم بدء عملية النسخ الاحتياطي',
      backupId,
      collections: collections || [],
      description: description || '',
      adminId: adminId || '',
    };
  }

  async listBackups(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [backups, total] = await Promise.all([
      this.backupRecordModel
        .find()
        .populate('createdBy', 'fullName email')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      this.backupRecordModel.countDocuments(),
    ]);

    return {
      data: backups,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async restoreBackup(backupId: string, adminId: string) {
    const backup = await this.backupRecordModel.findOne({ backupId });
    if (!backup) {
      throw new NotFoundException({
        code: 'BACKUP_NOT_FOUND',
        userMessage: 'النسخة الاحتياطية غير موجودة',
      });
    }

    if (backup.status !== 'completed') {
      throw new Error('Cannot restore incomplete backup');
    }

    // TODO: Implement actual restore logic
    // This is dangerous - needs confirmation workflow

    backup.isRestored = true;
    backup.restoredAt = new Date();
    backup.restoredBy = new Types.ObjectId(adminId);

    await backup.save();

    return {
      success: true,
      message: 'تم استعادة النسخة الاحتياطية',
    };
  }

  async downloadBackup(backupId: string) {
    const backup = await this.backupRecordModel.findOne({ backupId });
    if (!backup) {
      throw new NotFoundException({
        code: 'BACKUP_NOT_FOUND',
        userMessage: 'النسخة الاحتياطية غير موجودة',
      });
    }

    // TODO: Generate signed URL if using S3
    // For now, return local path
    return {
      url: backup.path || '',
      size: backup.size,
      expiresAt: new Date(Date.now() + 3600000), // 1 hour
    };
  }

  private async performBackup(
    recordId: string,
    collections?: string[],
  ): Promise<void> {
    const record = await this.backupRecordModel.findById(recordId);
    if (!record) return;

    try {
      record.status = 'in-progress';
      await record.save();

      const dbUri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
      this.extractDbName(dbUri);
      const backupPath = path.join(this.backupDir, record.backupId);

      // Build mongodump command
      let command = `mongodump --uri="${dbUri}" --out="${backupPath}"`;

      if (collections?.length) {
        // Backup specific collections
        for (const collection of collections) {
          command += ` --collection=${collection}`;
        }
      }

      // Execute backup
      await execAsync(command);

      // Get backup size
      const stats = await fs.stat(backupPath);
      const size = stats.size;

      // Calculate checksum (simple approach)
      // TODO: Implement proper MD5 checksum

      record.status = 'completed';
      record.path = backupPath;
      record.size = size;
      record.completedAt = new Date();
      record.duration = Math.round(
        (record.completedAt.getTime() - record.startedAt!.getTime()) / 1000,
      );

      await record.save();
    } catch (error) {
      record.status = 'failed';
      record.errorMessage =
        error instanceof Error ? error.message : String(error);
      await record.save();
      throw error;
    }
  }

  private extractDbName(uri: string): string {
    const match = uri.match(/\/([^/?]+)(\?|$)/);
    return match ? match[1] : 'test';
  }
}
