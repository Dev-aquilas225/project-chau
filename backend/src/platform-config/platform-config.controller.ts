import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { PlatformConfigService } from './platform-config.service';
import { UpdatePlatformConfigDto } from './dto/platform-config.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('platform/config')
export class PlatformConfigController {
  constructor(private configService: PlatformConfigService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  getAll() {
    return this.configService.getAll();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch()
  update(@Body() dto: UpdatePlatformConfigDto) {
    return this.configService.update(dto);
  }
}
