import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { PricingStrategyService } from './pricing-strategy.service';
import {
  CreatePricingStrategyDto,
  UpdatePricingStrategyDto,
} from './dto/create-pricing-strategy.dto';
import { Auth, Roles } from '../../common/decorators/auth.decorator';
import { AuthType, UnifiedAuthGuard } from '../../common/guards/unified-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';

@ApiTags('Pricing Strategies')
@Controller('pricing-strategies')
@UseGuards(UnifiedAuthGuard, RolesGuard)
@Auth(AuthType.JWT)
@Roles('admin', 'superadmin')
@ApiBearerAuth()
export class PricingStrategyController {
  constructor(
    private readonly pricingStrategyService: PricingStrategyService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'قائمة استراتيجيات التسعير' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll() {
    return this.pricingStrategyService.findAll();
  }

  @Post()
  @ApiOperation({ summary: 'إنشاء استراتيجية تسعير' })
  @ApiResponse({ status: 201, description: 'Created' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async create(@Body() dto: CreatePricingStrategyDto) {
    return this.pricingStrategyService.create(dto);
  }

  @Put(':id')
  @ApiParam({ name: 'id', type: String })
  @ApiOperation({ summary: 'تحديث استراتيجية تسعير' })
  @ApiResponse({ status: 200, description: 'Updated' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdatePricingStrategyDto,
  ) {
    return this.pricingStrategyService.update(id, dto);
  }

  @Delete(':id')
  @ApiParam({ name: 'id', type: String })
  @ApiOperation({ summary: 'حذف استراتيجية تسعير' })
  @ApiResponse({ status: 200, description: 'Deleted' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async delete(@Param('id') id: string) {
    await this.pricingStrategyService.delete(id);
    return { message: 'تم حذف استراتيجية التسعير بنجاح' };
  }
}
