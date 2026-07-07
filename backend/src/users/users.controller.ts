import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { AssignCustomRoleDto } from './dto/assign-custom-role.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { AdminUpdateUserDto } from './dto/admin-update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RequirePermission } from '../auth/decorators/require-permission.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/strategies/jwt.strategy';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('me')
  getMe(@CurrentUser() user: JwtPayload) {
    return this.usersService.findOne(user.sub);
  }

  @Patch('me')
  updateMe(@CurrentUser() user: JwtPayload, @Body() dto: UpdateProfileDto) {
    return this.usersService.updateProfile(user.sub, dto);
  }

  @Patch('me/password')
  changeMyPassword(@CurrentUser() user: JwtPayload, @Body() dto: ChangePasswordDto) {
    return this.usersService.changePassword(user.sub, dto);
  }

  @UseGuards(PermissionsGuard)
  @RequirePermission('users', 'view_any')
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @UseGuards(PermissionsGuard)
  @RequirePermission('users', 'view')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  // Promotion vers le rôle natif 'admin' reste strictement réservée aux admins :
  // déléguer cette route reviendrait à permettre à un rôle personnalisé de s'auto-octroyer le bypass total.
  @UseGuards(RolesGuard)
  @Roles('admin')
  @Patch(':id/role')
  updateRole(@Param('id') id: string, @Body() dto: UpdateRoleDto) {
    return this.usersService.updateRole(id, dto);
  }

  @UseGuards(PermissionsGuard)
  @RequirePermission('users', 'update')
  @Patch(':id/custom-role')
  assignCustomRole(@Param('id') id: string, @Body() dto: AssignCustomRoleDto) {
    return this.usersService.assignCustomRole(id, dto.roleId);
  }

  @UseGuards(PermissionsGuard)
  @RequirePermission('users', 'create')
  @Post()
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @UseGuards(PermissionsGuard)
  @RequirePermission('users', 'update')
  @Patch(':id')
  adminUpdate(@Param('id') id: string, @Body() dto: AdminUpdateUserDto) {
    return this.usersService.adminUpdate(id, dto);
  }

  @UseGuards(PermissionsGuard)
  @RequirePermission('users', 'delete')
  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.usersService.remove(id, user.sub);
  }
}
