import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { FavoritesService } from './favorites.service';
import { AddFavoriteDto, FavoriteType } from './dto/add-favorite.dto';
import { UnifiedAuthGuard } from '../../common/guards/unified-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Auth, CurrentUser } from '../../common/decorators/auth.decorator';
import { AuthType } from '../../common/guards/unified-auth.guard';

@ApiTags('Favorites')
@ApiBearerAuth()
@Controller('favorites')
@UseGuards(UnifiedAuthGuard, RolesGuard)
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Auth(AuthType.FIREBASE)
  @Get()
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({
    summary: 'جلب جميع المفضلة',
    description: 'الحصول على قائمة جميع العناصر المفضلة للمستخدم الحالي',
  })
  @ApiQuery({
    name: 'flat',
    required: false,
    type: Number,
    description: 'إرجاع البيانات بشكل مسطح (1 أو 0)',
  })
  @ApiResponse({ status: 200, description: 'قائمة المفضلة' })
  @ApiResponse({ status: 401, description: 'غير مصرّح' })
  async getAllFavorites(
    @CurrentUser('id') userId: string,
    @Query('flat') flat?: string,
  ) {
    const flatMode = flat === '1' || flat === 'true';
    return this.favoritesService.getAllFavorites(userId, flatMode);
  }

  @Auth(AuthType.FIREBASE)
  @Post()
  @ApiResponse({ status: 201, description: 'Created' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 409, description: 'Conflict - Already exists' })
  @ApiOperation({
    summary: 'إضافة عنصر للمفضلة',
    description: 'إضافة منتج أو مطعم للمفضلة',
  })
  @ApiBody({ type: AddFavoriteDto })
  @ApiResponse({ status: 201, description: 'تمت الإضافة بنجاح' })
  @ApiResponse({ status: 400, description: 'بيانات غير صالحة' })
  @ApiResponse({ status: 401, description: 'غير مصرّح' })
  @ApiResponse({ status: 409, description: 'العنصر موجود بالفعل' })
  async addFavorite(
    @CurrentUser('id') userId: string,
    @Body() addFavoriteDto: AddFavoriteDto,
  ) {
    return this.favoritesService.addFavorite(userId, addFavoriteDto);
  }

  @Auth(AuthType.FIREBASE)
  @Delete(':type/:id')
  @ApiParam({ name: 'type', enum: FavoriteType, description: 'نوع العنصر' })
  @ApiParam({ name: 'id', type: String, description: 'معرف العنصر' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({
    summary: 'حذف عنصر من المفضلة',
    description: 'حذف منتج أو مطعم من المفضلة',
  })
  @ApiResponse({ status: 200, description: 'تم الحذف بنجاح' })
  @ApiResponse({ status: 404, description: 'العنصر غير موجود في المفضلة' })
  @ApiResponse({ status: 401, description: 'غير مصرّح' })
  async removeFavorite(
    @CurrentUser('id') userId: string,
    @Param('type') itemType: string,
    @Param('id') itemId: string,
  ) {
    return this.favoritesService.removeFavorite(userId, itemType, itemId);
  }

  @Auth(AuthType.FIREBASE)
  @Get('exists/:type/:id')
  @ApiParam({ name: 'type', enum: FavoriteType, description: 'نوع العنصر' })
  @ApiParam({ name: 'id', type: String, description: 'معرف العنصر' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({
    summary: 'التحقق من وجود عنصر في المفضلة',
    description: 'التحقق من وجود منتج أو مطعم في المفضلة',
  })
  @ApiResponse({ status: 200, description: 'نتيجة التحقق' })
  @ApiResponse({ status: 401, description: 'غير مصرّح' })
  async isFavorite(
    @CurrentUser('id') userId: string,
    @Param('type') itemType: string,
    @Param('id') itemId: string,
  ) {
    return this.favoritesService.isFavorite(userId, itemType, itemId);
  }

  @Auth(AuthType.FIREBASE)
  @Get('counts')
  @ApiQuery({ name: 'type', enum: FavoriteType, description: 'نوع العنصر' })
  @ApiQuery({
    name: 'ids',
    type: String,
    description: 'معرفات العناصر مفصولة بفواصل',
  })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({
    summary: 'جلب عدد المفضلة لعدة عناصر',
    description: 'الحصول على عدد المفضلة لعدة عناصر دفعة واحدة',
  })
  @ApiResponse({ status: 200, description: 'عدد المفضلة لكل عنصر' })
  @ApiResponse({ status: 400, description: 'بيانات غير صالحة' })
  @ApiResponse({ status: 401, description: 'غير مصرّح' })
  async getFavoritesCounts(
    @CurrentUser('id') userId: string,
    @Query('type') itemType: string,
    @Query('ids') ids: string,
  ) {
    if (!ids) {
      return {};
    }
    const itemIds = ids.split(',').filter((id) => id.trim());
    return this.favoritesService.getFavoritesCounts(userId, itemType, itemIds);
  }
}
