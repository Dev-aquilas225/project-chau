import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AdminDashboardService, type AnalyticsPeriod } from './admin-dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('admin/dashboard')
export class AdminDashboardController {
  constructor(private dashboardService: AdminDashboardService) {}

  @Get('stats')
  getStats() {
    return this.dashboardService.getStats();
  }

  @Get('analytics')
  getAnalytics(@Query('period') period: AnalyticsPeriod = '30d') {
    return this.dashboardService.getAnalytics(period);
  }
}
