import { IsIn } from 'class-validator';
import type { Role } from '../entities/user.entity';

export class UpdateRoleDto {
  @IsIn(['customer', 'admin'])
  role: Role;
}
