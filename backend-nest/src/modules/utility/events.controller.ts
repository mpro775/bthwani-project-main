import {
  Controller,
  Post,
  Body,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Public } from '../../common/decorators/auth.decorator';

@ApiTags('Events')
@Controller({ path: 'events', version: ['1', '2'] })
export class EventsController {
  @Public()
  @Post()
  @ApiResponse({ status: 201, description: 'Created' })
  @ApiOperation({ summary: 'تسجيل حدث' })
  async createEvent(@Body() body: any) {
    // TODO: Implement event tracking logic
    return {
      success: true,
      message: 'تم تسجيل الحدث بنجاح',
    };
  }
}

