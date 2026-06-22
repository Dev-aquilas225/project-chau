import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import type { SellerStatus } from '../../users/entities/user.entity';

export class ApplySellerDto {
  @IsString()
  @MaxLength(100)
  storeName: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  bio?: string;
}

export class UpdateSellerProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  storeName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  bio?: string;

  @IsOptional()
  @IsString()
  iban?: string;
}

export class UpdateSellerStatusDto {
  @IsIn(['approved', 'rejected'])
  status: Extract<SellerStatus, 'approved' | 'rejected'>;

  @IsOptional()
  @IsString()
  note?: string;
}
