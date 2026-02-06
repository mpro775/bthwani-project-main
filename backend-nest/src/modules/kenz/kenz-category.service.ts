import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Model } from 'mongoose';
import { Types } from 'mongoose';
import { KenzCategory } from './entities/kenz-category.entity';
import type CreateKenzCategoryDto from './dto/create-kenz-category.dto';
import type UpdateKenzCategoryDto from './dto/update-kenz-category.dto';

export interface KenzCategoryTreeItem {
  _id: string;
  nameAr: string;
  nameEn: string;
  slug: string;
  parentId: string | null;
  order: number;
  children?: KenzCategoryTreeItem[];
}

@Injectable()
export class KenzCategoryService {
  constructor(
    @InjectModel(KenzCategory.name) private readonly model: Model<KenzCategory>,
  ) {}

  async create(dto: CreateKenzCategoryDto) {
    const existing = await this.model.findOne({ slug: dto.slug }).exec();
    if (existing) throw new ConflictException('Category with this slug already exists');
    const parentId = dto.parentId ? new Types.ObjectId(dto.parentId) : null;
    const doc = new this.model({
      nameAr: dto.nameAr,
      nameEn: dto.nameEn,
      slug: dto.slug,
      parentId,
      order: dto.order ?? 0,
    });
    return await doc.save();
  }

  async findAll(): Promise<KenzCategory[]> {
    return this.model.find().sort({ order: 1, _id: 1 }).exec();
  }

  /** شجرة الفئات (للـ API العام والتطبيق) */
  async getTree(): Promise<KenzCategoryTreeItem[]> {
    const all = await this.model.find().sort({ order: 1, _id: 1 }).lean().exec();
    const map = new Map<string, KenzCategoryTreeItem>();
    all.forEach((c: any) => {
      map.set(String(c._id), {
        _id: String(c._id),
        nameAr: c.nameAr,
        nameEn: c.nameEn,
        slug: c.slug,
        parentId: c.parentId ? String(c.parentId) : null,
        order: c.order ?? 0,
        children: [],
      });
    });
    const roots: KenzCategoryTreeItem[] = [];
    map.forEach((node) => {
      if (!node.parentId || !map.has(node.parentId)) {
        roots.push(node);
      } else {
        const parent = map.get(node.parentId!);
        if (parent) {
          if (!parent.children) parent.children = [];
          parent.children.push(node);
        } else {
          roots.push(node);
        }
      }
    });
    const sortChildren = (items: KenzCategoryTreeItem[]) => {
      items.sort((a, b) => a.order - b.order || a._id.localeCompare(b._id));
      items.forEach((n) => n.children?.length && sortChildren(n.children));
    };
    sortChildren(roots);
    return roots;
  }

  async findOne(id: string) {
    const doc = await this.model.findById(id).exec();
    if (!doc) throw new NotFoundException('Category not found');
    return doc;
  }

  async update(id: string, dto: UpdateKenzCategoryDto) {
    if (dto.slug) {
      const existing = await this.model.findOne({ slug: dto.slug, _id: { $ne: id } }).exec();
      if (existing) throw new ConflictException('Category with this slug already exists');
    }
    const update: any = { ...dto };
    if (dto.parentId !== undefined) {
      update.parentId = dto.parentId ? new Types.ObjectId(dto.parentId) : null;
    }
    const doc = await this.model.findByIdAndUpdate(id, update, { new: true }).exec();
    if (!doc) throw new NotFoundException('Category not found');
    return doc;
  }

  async remove(id: string) {
    const doc = await this.model.findByIdAndDelete(id).exec();
    if (!doc) throw new NotFoundException('Category not found');
    await this.model.updateMany({ parentId: doc._id }, { parentId: null }).exec();
    return { ok: true };
  }
}
