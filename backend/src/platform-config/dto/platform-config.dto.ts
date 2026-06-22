import { IsBoolean, IsNumber, IsOptional, Max, Min } from 'class-validator';

export class UpdatePlatformConfigDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  commissionRate?: number;

  @IsOptional()
  @IsBoolean()
  sellerRegistrationEnabled?: boolean;
}
