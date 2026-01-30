import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { DeliveryCategory } from './entities/delivery-category.entity';

/** شكل الفئة كما يُرجع من الـ API (كائن عادي بعد lean/toObject) */
export type DeliveryCategoryPlain = Omit<DeliveryCategory, keyof import('mongoose').Document> & {
  _id: Types.ObjectId;
};

@Injectable()
export class DeliveryCategoryService {
  constructor(
    @InjectModel(DeliveryCategory.name)
    private categoryModel: Model<DeliveryCategory>,
  ) {}

  async findAll(filters?: { usageType?: string; search?: string }): Promise<DeliveryCategoryPlain[]> {
    const query: Record<string, unknown> = { isActive: true };
    if (filters?.usageType && filters.usageType !== 'all') {
      query.usageType = filters.usageType;
    }
    if (filters?.search) {
      query.name = new RegExp(filters.search, 'i');
    }
    const list = await this.categoryModel.find(query).sort({ sortOrder: 1, createdAt: 1 }).lean().exec();
    return list as unknown as DeliveryCategoryPlain[];
  }

  async findMain(filters?: { usageType?: string; search?: string }): Promise<DeliveryCategoryPlain[]> {
    const query: Record<string, unknown> = { parent: null };
    if (filters?.usageType && filters.usageType !== 'all') {
      query.usageType = filters.usageType;
    }
    if (filters?.search) {
      query.name = new RegExp(filters.search, 'i');
    }
    const list = await this.categoryModel.find(query).sort({ sortOrder: 1, createdAt: 1 }).lean().exec();
    return list as unknown as DeliveryCategoryPlain[];
  }

  async findChildren(parentId: string): Promise<DeliveryCategoryPlain[]> {
    const list = await this.categoryModel
      .find({ parent: new Types.ObjectId(parentId) })
      .sort({ sortOrder: 1, createdAt: 1 })
      .lean()
      .exec();
    return list as unknown as DeliveryCategoryPlain[];
  }

  async findById(id: string): Promise<DeliveryCategoryPlain> {
    const cat = await this.categoryModel.findById(id).lean().exec();
    if (!cat) {
      throw new NotFoundException({ code: 'CATEGORY_NOT_FOUND', userMessage: 'الفئة غير موجودة' });
    }
    return cat as unknown as DeliveryCategoryPlain;
  }

  async create(dto: {
    name: string;
    image?: string;
    icon?: string;
    isActive?: boolean;
    parent?: string | null;
    usageType?: string;
    sortOrder?: number;
  }): Promise<DeliveryCategoryPlain> {
    const doc = await this.categoryModel.create({
      name: dto.name,
      image: dto.image ?? '',
      icon: dto.icon ?? '',
      isActive: dto.isActive ?? true,
      parent: dto.parent ? new Types.ObjectId(dto.parent) : null,
      usageType: dto.usageType ?? 'all',
      sortOrder: dto.sortOrder ?? 0,
    });
    return doc.toObject() as DeliveryCategoryPlain;
  }

  async update(
    id: string,
    dto: Partial<{
      name: string;
      image: string;
      icon: string;
      isActive: boolean;
      parent: string | null;
      usageType: string;
      sortOrder: number;
    }>,
  ): Promise<DeliveryCategoryPlain> {
    const update: Record<string, unknown> = { ...dto };
    if (dto.parent !== undefined) {
      update.parent = dto.parent ? new Types.ObjectId(dto.parent) : null;
    }
    const cat = await this.categoryModel
      .findByIdAndUpdate(id, update, { new: true })
      .lean()
      .exec();
    if (!cat) {
      throw new NotFoundException({ code: 'CATEGORY_NOT_FOUND', userMessage: 'الفئة غير موجودة' });
    }
    return cat as unknown as DeliveryCategoryPlain;
  }

  async delete(id: string): Promise<void> {
    const result = await this.categoryModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException({ code: 'CATEGORY_NOT_FOUND', userMessage: 'الفئة غير موجودة' });
    }
  }

  async bulkReorder(updates: { id: string; sortOrder: number }[]): Promise<void> {
    await Promise.all(
      updates.map((u) => this.categoryModel.updateOne({ _id: u.id }, { sortOrder: u.sortOrder }).exec()),
    );
  }

  /** إنشاء فئات افتراضية إذا لم توجد أي فئة (تُستدعى عند أول طلب) */
  async ensureDefaultCategories(): Promise<DeliveryCategoryPlain[]> {
    const count = await this.categoryModel.countDocuments().exec();
    if (count > 0) {
      const list = await this.categoryModel.find({}).sort({ sortOrder: 1 }).lean().exec();
      return list as unknown as DeliveryCategoryPlain[];
    }
    const defaults = [
      { name: 'مطاعم', icon: '🍽️', sortOrder: 1, usageType: 'restaurant' },
      { name: 'سوبرماركت', icon: '🛒', sortOrder: 2, usageType: 'grocery' },
      { name: 'صيدليات', icon: '💊', sortOrder: 3, usageType: 'retail' },
      { name: 'محلات', icon: '🏪', sortOrder: 4, usageType: 'retail' },
    ];
    await this.categoryModel.insertMany(defaults);
    const list = await this.categoryModel.find({}).sort({ sortOrder: 1 }).lean().exec();
    return list as unknown as DeliveryCategoryPlain[];
  }
}
