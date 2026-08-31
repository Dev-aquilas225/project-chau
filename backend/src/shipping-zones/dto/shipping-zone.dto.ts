import {
  IsArray,
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';

export class CreateShippingZoneDto {
  @IsString()
  @MinLength(1)
  name: string;

  @IsString()
  carrier: string;

  @IsArray()
  @IsString({ each: true })
  countryCodes: string[];

  @IsNumber()
  @Min(0)
  basePrice: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  freeThreshold?: number | null;

  @IsInt()
  @Min(1)
  estimatedDaysMin: number;

  @IsInt()
  @Min(1)
  estimatedDaysMax: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}

export class UpdateShippingZoneDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  name?: string;

  @IsOptional()
  @IsString()
  carrier?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  countryCodes?: string[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  basePrice?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  freeThreshold?: number | null;

  @IsOptional()
  @IsInt()
  @Min(1)
  estimatedDaysMin?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  estimatedDaysMax?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
