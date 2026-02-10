import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Model } from 'mongoose';
import { Types } from 'mongoose';
import { Es3afniDonor } from './entities/es3afni-donor.entity';
import type CreateDonorDto from './dto/create-donor.dto';
import type UpdateDonorDto from './dto/update-donor.dto';

@Injectable()
export class Es3afniDonorService {
  constructor(
    @InjectModel(Es3afniDonor.name) private readonly model: Model<Es3afniDonor>,
  ) {}

  private buildLocationGeo(location?: { lat: number; lng: number }): { type: 'Point'; coordinates: [number, number] } | undefined {
    if (!location || typeof location.lat !== 'number' || typeof location.lng !== 'number') return undefined;
    return { type: 'Point', coordinates: [location.lng, location.lat] };
  }

  async registerDonor(userId: string, dto: CreateDonorDto) {
    const payload: Record<string, unknown> = {
      userId: new Types.ObjectId(userId),
      bloodType: dto.bloodType,
      available: dto.available ?? true,
      city: dto.city,
      governorate: dto.governorate,
      location: dto.location,
    };
    if (dto.lastDonation) payload.lastDonation = new Date(dto.lastDonation);
    payload.locationGeo = this.buildLocationGeo(dto.location);

    const existing = await this.model.findOne({ userId: new Types.ObjectId(userId) }).exec();
    if (existing) {
      const updated = await this.model
        .findByIdAndUpdate(existing._id, payload, { new: true })
        .exec();
      return updated;
    }
    const doc = new this.model(payload);
    return await doc.save();
  }

  async updateDonor(userId: string, dto: UpdateDonorDto) {
    const donor = await this.model.findOne({ userId: new Types.ObjectId(userId) }).exec();
    if (!donor) throw new NotFoundException('Donor profile not found');

    const payload: Record<string, unknown> = { ...dto };
    if (dto?.lastDonation) payload.lastDonation = new Date(dto.lastDonation);
    if (dto?.location) payload.locationGeo = this.buildLocationGeo(dto.location);

    const updated = await this.model
      .findByIdAndUpdate(donor._id, payload, { new: true })
      .exec();
    return updated!;
  }

  async getMyDonorProfile(userId: string) {
    const donor = await this.model
      .findOne({ userId: new Types.ObjectId(userId) })
      .exec();
    if (!donor) throw new NotFoundException('Donor profile not found');
    return donor;
  }

  async findDonorsNearby(opts: {
    lat: number;
    lng: number;
    radiusKm?: number;
    bloodType?: string;
    limit?: number;
  }) {
    const { lat, lng, radiusKm = 50, bloodType, limit = 50 } = opts;
    const radiusMeters = radiusKm * 1000;

    const filter: Record<string, unknown> = {
      available: true,
      locationGeo: {
        $nearSphere: {
          $geometry: {
            type: 'Point',
            coordinates: [lng, lat],
          },
          $maxDistance: radiusMeters,
        },
      },
    };
    if (bloodType) filter.bloodType = bloodType;

    const donors = await this.model
      .find(filter)
      .select('userId bloodType city governorate available lastDonation')
      .limit(limit)
      .lean()
      .exec();

    return donors.map((d) => ({
      _id: (d as any)._id,
      userId: (d as any).userId,
      bloodType: (d as any).bloodType,
      city: (d as any).city,
      governorate: (d as any).governorate,
      available: (d as any).available,
      lastDonation: (d as any).lastDonation,
    }));
  }

  /** قائمة المتبرعين للأدمن (قراءة فقط، بدون موقع دقيق) */
  async findAllForAdmin(opts: {
    cursor?: string;
    limit?: number;
    bloodType?: string;
    available?: boolean;
  }) {
    const limit = Math.min(opts.limit ?? 25, 100);
    const filter: Record<string, unknown> = {};
    if (opts.bloodType) filter.bloodType = opts.bloodType;
    if (typeof opts.available === 'boolean') filter.available = opts.available;
    if (opts.cursor && Types.ObjectId.isValid(opts.cursor)) {
      filter._id = { $lt: new Types.ObjectId(opts.cursor) };
    }

    const donors = await this.model
      .find(filter)
      .select('userId bloodType available lastDonation city governorate createdAt')
      .sort({ _id: -1 })
      .limit(limit)
      .lean()
      .exec();

    const nextCursor = donors.length === limit ? String((donors[donors.length - 1] as any)._id) : null;
    return {
      items: donors.map((d: any) => ({
        _id: d._id,
        userId: d.userId,
        bloodType: d.bloodType,
        available: d.available,
        lastDonation: d.lastDonation,
        city: d.city,
        governorate: d.governorate,
        createdAt: d.createdAt,
      })),
      nextCursor,
    };
  }
}
