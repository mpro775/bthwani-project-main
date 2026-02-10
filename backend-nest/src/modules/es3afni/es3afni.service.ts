import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import type { Model } from 'mongoose';
import { Types } from 'mongoose';
import { Es3afni, Es3afniStatus } from './entities/es3afni.entity';
import { Es3afniDonorAlert } from './entities/es3afni-donor-alert.entity';
import type CreateEs3afniDto from './dto/create-es3afni.dto';
import type UpdateEs3afniDto from './dto/update-es3afni.dto';
import { Es3afniDonorService } from './es3afni-donor.service';

const DEFAULT_URGENCY = 'normal';
const EXPIRY_HOURS = 48;

@Injectable()
export class Es3afniService {
  constructor(
    @InjectModel(Es3afni.name) private readonly model: Model<Es3afni>,
    @InjectModel(Es3afniDonorAlert.name) private readonly donorAlertModel: Model<Es3afniDonorAlert>,
    private readonly donorService: Es3afniDonorService,
  ) {}

  private buildLocationGeo(location?: { lat?: number; lng?: number }): { type: 'Point'; coordinates: [number, number] } | undefined {
    if (!location || typeof location.lat !== 'number' || typeof location.lng !== 'number') return undefined;
    return { type: 'Point', coordinates: [location.lng, location.lat] };
  }

  async create(dto: CreateEs3afniDto) {
    const payload: Record<string, unknown> = {
      ...dto,
      ownerId: new Types.ObjectId(dto.ownerId),
      urgency: dto.urgency ?? DEFAULT_URGENCY,
    };
    payload.locationGeo = this.buildLocationGeo(dto.location);

    const isPending = (dto.status ?? Es3afniStatus.DRAFT) === Es3afniStatus.PENDING;
    if (isPending) {
      payload.publishedAt = new Date();
      payload.expiresAt = new Date(Date.now() + EXPIRY_HOURS * 60 * 60 * 1000);
    }

    const doc = new this.model(payload);
    const saved = await doc.save();

    if (isPending && saved.bloodType && saved.location?.lat != null && saved.location?.lng != null) {
      await this.notifyDonorsForRequest(String(saved._id)).catch(() => {});
    }
    return saved;
  }

  async notifyDonorsForRequest(requestId: string) {
    const request = await this.model.findById(requestId).exec();
    if (!request || request.status !== Es3afniStatus.PENDING || !request.bloodType) return;

    const lat = request.location?.lat;
    const lng = request.location?.lng;
    if (typeof lat !== 'number' || typeof lng !== 'number') return;

    const radiusKm = request.urgency === 'critical' || request.urgency === 'urgent' ? 80 : 50;
    const donors = await this.donorService.findDonorsNearby({
      lat,
      lng,
      radiusKm,
      bloodType: request.bloodType,
      limit: 100,
    });

    const requestObjId = new Types.ObjectId(requestId);
    for (const d of donors) {
      const donorUserId = (d as any).userId;
      if (!donorUserId) continue;
      try {
        await this.donorAlertModel.findOneAndUpdate(
          { requestId: requestObjId, donorId: donorUserId },
          { $setOnInsert: { requestId: requestObjId, donorId: donorUserId, delivered: false, sentAt: new Date() } },
          { upsert: true },
        );
      } catch {
        // ignore duplicate
      }
    }
  }

  async findAll(opts: {
    cursor?: string;
    bloodType?: string;
    status?: string;
    urgency?: string;
  }) {
    const limit = 25;
    const filter: Record<string, unknown> = {};
    if (opts?.bloodType) filter.bloodType = opts.bloodType;
    if (opts?.status) filter.status = opts.status;
    if (opts?.urgency) filter.urgency = opts.urgency;
    if (opts?.cursor && Types.ObjectId.isValid(opts.cursor)) {
      filter._id = { $lt: new Types.ObjectId(opts.cursor) };
    }

    const items = await this.model
      .find(filter)
      .sort({ _id: -1 })
      .limit(limit)
      .exec();
    const nextCursor = items.length === limit ? String(items[items.length - 1]._id) : null;
    return { items, nextCursor };
  }

  async findMy(userId: string, opts: { cursor?: string }) {
    const limit = 25;
    const filter: Record<string, unknown> = { ownerId: new Types.ObjectId(userId) };
    if (opts?.cursor && Types.ObjectId.isValid(opts.cursor)) {
      filter._id = { $lt: new Types.ObjectId(opts.cursor) };
    }
    const items = await this.model
      .find(filter)
      .sort({ _id: -1 })
      .limit(limit)
      .exec();
    const nextCursor = items.length === limit ? String(items[items.length - 1]._id) : null;
    return { items, nextCursor };
  }

  async search(opts: {
    q?: string;
    bloodType?: string;
    status?: string;
    cursor?: string;
  }) {
    const limit = 25;
    const filter: Record<string, unknown> = {};
    if (opts?.q && opts.q.trim()) {
      filter.$or = [
        { title: new RegExp(escapeRegex(opts.q.trim()), 'i') },
        { description: new RegExp(escapeRegex(opts.q.trim()), 'i') },
      ];
    }
    if (opts?.bloodType) filter.bloodType = opts.bloodType;
    if (opts?.status) filter.status = opts.status;
    if (opts?.cursor && Types.ObjectId.isValid(opts.cursor)) {
      filter._id = { $lt: new Types.ObjectId(opts.cursor) };
    }

    const items = await this.model
      .find(filter)
      .sort({ _id: -1 })
      .limit(limit)
      .exec();
    const nextCursor = items.length === limit ? String(items[items.length - 1]._id) : null;
    return { items, nextCursor };
  }

  async findOne(id: string) {
    const doc = await this.model.findById(id).exec();
    if (!doc) throw new NotFoundException('Not found');
    return doc;
  }

  async update(id: string, dto: UpdateEs3afniDto) {
    const doc = await this.model.findById(id).exec();
    if (!doc) throw new NotFoundException('Not found');

    const payload: Record<string, unknown> = { ...dto };
    if (dto?.location) payload.locationGeo = this.buildLocationGeo(dto.location);

    const wasPending = doc.status === Es3afniStatus.PENDING;
    const becomesPending = dto.status === Es3afniStatus.PENDING;
    if (!wasPending && becomesPending) {
      payload.publishedAt = new Date();
      payload.expiresAt = new Date(Date.now() + EXPIRY_HOURS * 60 * 60 * 1000);
    }

    const updated = await this.model
      .findByIdAndUpdate(id, payload, { new: true })
      .exec();
    if (!updated) throw new NotFoundException('Not found');

    if (!wasPending && becomesPending && updated.bloodType && updated.location?.lat != null && updated.location?.lng != null) {
      await this.notifyDonorsForRequest(id).catch(() => {});
    }
    return updated;
  }

  async remove(id: string) {
    const doc = await this.model.findByIdAndDelete(id).exec();
    if (!doc) throw new NotFoundException('Not found');
    return { ok: true };
  }

  @Cron(CronExpression.EVERY_HOUR)
  async expirePendingRequests() {
    const result = await this.model
      .updateMany(
        { status: Es3afniStatus.PENDING, expiresAt: { $lte: new Date() } },
        { $set: { status: Es3afniStatus.EXPIRED } },
      )
      .exec();
    if (result.modifiedCount > 0) {
      // optional: log
    }
  }
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
