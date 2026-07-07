import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class AdminUpdateUserDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  displayName?: string;

  @IsOptional()
  @IsEmail()
  email?: string;
}
