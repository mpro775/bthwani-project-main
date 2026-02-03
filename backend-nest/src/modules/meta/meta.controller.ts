import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UtilityService } from '../utility/services/utility.service';

@ApiTags('Meta')
@Controller('meta')
export class MetaController {
  constructor(private readonly utilityService: UtilityService) {}

  @Get('cities')
  @ApiOperation({ summary: 'قائمة المدن المتاحة (من تسعير الغاز/الماء)' })
  @ApiResponse({ status: 200, description: 'مصفوفة أسماء المدن' })
  async getCities(): Promise<string[]> {
    return this.utilityService.getCities();
  }
}
