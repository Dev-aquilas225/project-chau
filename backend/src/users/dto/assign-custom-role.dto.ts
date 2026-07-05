import { IsString, ValidateIf } from 'class-validator';

export class AssignCustomRoleDto {
  @ValidateIf((o) => o.roleId !== null)
  @IsString()
  roleId: string | null;
}
