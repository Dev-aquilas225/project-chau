import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { PlatformConfigService } from './platform-config.service';
import { UpdatePlatformConfigDto } from './dto/platform-config.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermission } from '../auth/decorators/require-permission.decorator';

@Controller('platform/config')
export class PlatformConfigController {
  constructor(private configService: PlatformConfigService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  getAll() {
    return this.configService.getAll();
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('platformConfig', 'manage')
  @Patch()
  update(@Body() dto: UpdatePlatformConfigDto) {
    return this.configService.update(dto);
  }
}
