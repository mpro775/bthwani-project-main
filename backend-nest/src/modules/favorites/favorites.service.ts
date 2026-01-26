import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Favorite, FavoriteDocument } from './entities/favorite.entity';
import { User } from '../auth/entities/user.entity';
import { AddFavoriteDto } from './dto/add-favorite.dto';
import { FavoriteType } from './dto/add-favorite.dto';

@Injectable()
export class FavoritesService {
  constructor(
    @InjectModel(Favorite.name) private favoriteModel: Model<FavoriteDocument>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  /**
   * جلب جميع المفضلة للمستخدم
   */
  async getAllFavorites(userId: string, flat: boolean = false) {
    const favorites = await this.favoriteModel
      .find({ user: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .lean();

    if (flat) {
      // Return flat array for frontend compatibility
      return favorites.map((fav) => ({
        _id: fav._id,
        itemId: fav.itemId,
        itemType: fav.itemType,
        userId: fav.user,
        ...fav.itemSnapshot,
        createdAt: fav.createdAt,
        updatedAt: fav.updatedAt,
      }));
    }

    return favorites;
  }

  /**
   * إضافة عنصر للمفضلة
   */
  async addFavorite(userId: string, addFavoriteDto: AddFavoriteDto) {
    // التحقق من وجود المستخدم
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException({
        code: 'USER_NOT_FOUND',
        message: 'User not found',
        userMessage: 'المستخدم غير موجود',
      });
    }

    // التحقق من عدم وجود العنصر في المفضلة
    const existing = await this.favoriteModel.findOne({
      user: new Types.ObjectId(userId),
      itemId: addFavoriteDto.itemId,
      itemType: addFavoriteDto.itemType,
    });

    if (existing) {
      throw new ConflictException({
        code: 'FAVORITE_ALREADY_EXISTS',
        message: 'Item already in favorites',
        userMessage: 'العنصر موجود بالفعل في المفضلة',
      });
    }

    // إضافة للمفضلة
    const favorite = new this.favoriteModel({
      user: new Types.ObjectId(userId),
      itemId: addFavoriteDto.itemId,
      itemType: addFavoriteDto.itemType,
      itemSnapshot: addFavoriteDto.itemSnapshot || {},
    });

    await favorite.save();

    // تحديث favorites array في User entity (للتوافق مع البنية القديمة)
    if (!user.favorites) {
      user.favorites = [];
    }
    if (!user.favorites.includes(new Types.ObjectId(addFavoriteDto.itemId))) {
      user.favorites.push(new Types.ObjectId(addFavoriteDto.itemId));
      await user.save();
    }

    return favorite;
  }

  /**
   * حذف عنصر من المفضلة
   */
  async removeFavorite(userId: string, itemType: string, itemId: string) {
    const favorite = await this.favoriteModel.findOneAndDelete({
      user: new Types.ObjectId(userId),
      itemId,
      itemType,
    });

    if (!favorite) {
      throw new NotFoundException({
        code: 'FAVORITE_NOT_FOUND',
        message: 'Favorite not found',
        userMessage: 'العنصر غير موجود في المفضلة',
      });
    }

    // تحديث favorites array في User entity
    const user = await this.userModel.findById(userId);
    if (user && user.favorites) {
      user.favorites = user.favorites.filter(
        (id) => id.toString() !== itemId,
      ) as Types.ObjectId[];
      await user.save();
    }

    return {
      message: 'تم حذف العنصر من المفضلة',
      deleted: true,
    };
  }

  /**
   * التحقق من وجود عنصر في المفضلة
   */
  async isFavorite(userId: string, itemType: string, itemId: string) {
    const favorite = await this.favoriteModel.findOne({
      user: new Types.ObjectId(userId),
      itemId,
      itemType,
    });

    return {
      exists: !!favorite,
    };
  }

  /**
   * جلب عدد المفضلة لعدة عناصر
   */
  async getFavoritesCounts(
    userId: string,
    itemType: string,
    itemIds: string[],
  ) {
    const favorites = await this.favoriteModel.find({
      user: new Types.ObjectId(userId),
      itemType,
      itemId: { $in: itemIds },
    });

    const counts: Record<string, number> = {};
    itemIds.forEach((id) => {
      counts[id] = favorites.filter((f) => f.itemId === id).length;
    });

    return counts;
  }
}
