import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { DeliverySubCategory } from './entities/delivery-subcategory.entity';

@Injectable()
export class DeliverySubCategoryService {
  constructor(
    @InjectModel(DeliverySubCategory.name)
    private subCategoryModel: Model<DeliverySubCategory>,
  ) {}

  async findAllByStore(storeId: string) {
    const list = await this.subCategoryModel
      .find({ store: new Types.ObjectId(storeId) })
      .sort({ createdAt: 1 })
      .lean()
      .exec();
    return list.map((doc) => ({
      ...doc,
      _id: String((doc as unknown as { _id: Types.ObjectId })._id),
      storeId,
    }));
  }

  async findById(id: string) {
    const doc = await this.subCategoryModel.findById(id).lean().exec();
    if (!doc) {
      throw new NotFoundException({
        code: 'SUBCATEGORY_NOT_FOUND',
        userMessage: 'الفئة الداخلية غير موجودة',
      });
    }
    return {
      ...doc,
      _id: String((doc as unknown as { _id: Types.ObjectId })._id),
      storeId: (doc as unknown as { store: Types.ObjectId }).store != null
        ? String((doc as unknown as { store: Types.ObjectId }).store)
        : undefined,
    };
  }

  async create(dto: { storeId: string; name: string }) {
    const created = await this.subCategoryModel.create({
      name: dto.name.trim(),
      store: new Types.ObjectId(dto.storeId),
    });
    return created.toObject();
  }

  async update(id: string, dto: { name?: string }) {
    const updated = await this.subCategoryModel
      .findByIdAndUpdate(
        id,
        { ...(dto.name !== undefined && { name: dto.name.trim() }) },
        { new: true },
      )
      .lean()
      .exec();
    if (!updated) {
      throw new NotFoundException({
        code: 'SUBCATEGORY_NOT_FOUND',
        userMessage: 'الفئة الداخلية غير موجودة',
      });
    }
    return {
      ...updated,
      _id: String((updated as unknown as { _id: Types.ObjectId })._id),
      storeId: (updated as unknown as { store: Types.ObjectId }).store != null
        ? String((updated as unknown as { store: Types.ObjectId }).store)
        : undefined,
    };
  }

  async delete(id: string): Promise<void> {
    const result = await this.subCategoryModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException({
        code: 'SUBCATEGORY_NOT_FOUND',
        userMessage: 'الفئة الداخلية غير موجودة',
      });
    }
  }
}
