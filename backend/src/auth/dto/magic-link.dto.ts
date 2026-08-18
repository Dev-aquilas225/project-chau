import { IsEmail, IsString, Length } from 'class-validator';

export class RequestMagicLinkDto {
  @IsEmail()
  email: string;
}

export class VerifyMagicLinkDto {
  @IsString()
  @Length(64, 64)
  token: string;
}
