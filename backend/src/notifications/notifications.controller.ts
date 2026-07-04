import { Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/strategies/jwt.strategy';

@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  @Get('mine')
  findMine(@CurrentUser() user: JwtPayload) {
    return this.notificationsService.findMine(user.sub);
  }

  @Get('unread-count')
  async unreadCount(@CurrentUser() user: JwtPayload) {
    return { count: await this.notificationsService.unreadCount(user.sub) };
  }

  @Patch(':id/read')
  markRead(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.notificationsService.markRead(id, user.sub);
  }

  @Patch('read-all')
  markAllRead(@CurrentUser() user: JwtPayload) {
    return this.notificationsService.markAllRead(user.sub);
  }
}
