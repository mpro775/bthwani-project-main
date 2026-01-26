import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { UserService } from './user.service';
import { UnifiedAuthGuard } from '../../common/guards/unified-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Auth, CurrentUser } from '../../common/decorators/auth.decorator';
import { AuthType } from '../../common/guards/unified-auth.guard';

/**
 * User Compatibility Controller
 * Provides backward compatibility routes for /user/* paths
 */
@ApiTags('User Compatibility')
@ApiBearerAuth()
@Controller({ path: 'user', version: ['1', '2'] })
@UseGuards(UnifiedAuthGuard, RolesGuard)
export class UserCompatController {
  constructor(private readonly userService: UserService) {}

  @Auth(AuthType.FIREBASE)
  @Get('profile')
  @ApiOperation({ summary: 'جلب الملف الشخصي (compatibility route)' })
  async getUserProfile(@CurrentUser('id') userId: string) {
    return this.userService.getCurrentUser(userId);
  }
}

