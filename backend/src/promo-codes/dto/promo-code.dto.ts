import { IsBoolean, IsIn, IsISO8601, IsNumber, IsOptional, IsString, Min, MinLength } from 'class-validator';
import type { DiscountType } from '../entities/promo-code.entity';

export class CreatePromoCodeDto {
  @IsString()
  @MinLength(1)
  code: string;

  @IsIn(['percentage', 'fixed'])
  discountType: DiscountType;

  @IsNumber()
  @Min(0)
  discountValue: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minAmount?: number;

  @IsOptional()
  @IsISO8601()
  expiresAt?: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}

export class UpdatePromoCodeDto {
  @IsOptional() @IsString() @MinLength(1) code?: string;
  @IsOptional() @IsIn(['percentage', 'fixed']) discountType?: DiscountType;
  @IsOptional() @IsNumber() @Min(0) discountValue?: number;
  @IsOptional() @IsNumber() @Min(0) minAmount?: number;
  @IsOptional() @IsISO8601() expiresAt?: string;
  @IsOptional() @IsBoolean() active?: boolean;
}

export class ValidatePromoCodeDto {
  @IsString()
  @MinLength(1)
  code: string;

  @IsNumber()
  @Min(0)
  subtotal: number;
}
