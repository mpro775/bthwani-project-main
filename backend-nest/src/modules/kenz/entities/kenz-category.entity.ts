import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

@Schema({ timestamps: true, collection: 'kenz_categories' })
export class KenzCategory extends Document {
  @ApiProperty({ description: 'الاسم بالعربية' })
  @Prop({ required: true })
  nameAr: string;

  @ApiProperty({ description: 'الاسم بالإنجليزية' })
  @Prop({ required: true })
  nameEn: string;

  @ApiProperty({ description: 'المعرف الفريد في الرابط', example: 'electronics' })
  @Prop({ required: true, unique: true, index: true })
  slug: string;

  @ApiProperty({ description: 'الفئة الأب (للتسلسل الهرمي)', required: false })
  @Prop({ type: Types.ObjectId, ref: 'KenzCategory', default: null, index: true })
  parentId: Types.ObjectId | null;

  @ApiProperty({ description: 'ترتيب العرض ضمن نفس المستوى', default: 0 })
  @Prop({ default: 0 })
  order: number;
}

export const KenzCategorySchema = SchemaFactory.createForClass(KenzCategory);
KenzCategorySchema.index({ parentId: 1, order: 1 });
