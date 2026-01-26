import { Controller, Delete, Param, SetMetadata } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';
import { HRService } from './services/hr.service';
import { Auth } from '../../common/decorators/auth.decorator';
import { AuthType } from '../../common/guards/unified-auth.guard';

const Roles = (...roles: string[]) => SetMetadata('roles', roles);

/**
 * Employees Compatibility Controller
 * Provides backward compatibility routes for /employees/* paths
 */
@ApiTags('Employees Compatibility')
@ApiBearerAuth()
@Controller({ path: 'employees', version: ['1', '2'] })
export class EmployeesCompatController {
  constructor(private readonly hrService: HRService) {}

  @Delete(':id')
  @ApiParam({ name: 'id', type: String })
  @Auth(AuthType.JWT)
  @Roles('admin', 'superadmin')
  @ApiOperation({ summary: 'حذف موظف (compatibility route)' })
  async deleteEmployee(@Param('id') id: string) {
    return this.hrService.deleteEmployee(id);
  }
}

