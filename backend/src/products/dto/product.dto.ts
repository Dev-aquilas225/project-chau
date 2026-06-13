import { IsArray, IsBoolean, IsIn, IsNumber, IsOptional, IsString, Min, MinLength } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductDto {
  @IsString()
  @MinLength(1)
  name: string;

  @IsOptional()
  @IsString()
  brand?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsArray()
  images?: string[];

  @IsNumber()
  @Min(0)
  stock: number;

  @IsOptional()
  @IsString()
  condition?: string;

  @IsOptional()
  @IsString()
  size?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @IsOptional()
  @IsBoolean()
  weLove?: boolean;
}

export class UpdateProductDto {
  @IsOptional() @IsString() @MinLength(1) name?: string;
  @IsOptional() @IsString() brand?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsNumber() @Min(0) price?: number;
  @IsOptional() @IsString() categoryId?: string;
  @IsOptional() @IsArray() images?: string[];
  @IsOptional() @IsNumber() @Min(0) stock?: number;
  @IsOptional() @IsString() condition?: string;
  @IsOptional() @IsString() size?: string;
  @IsOptional() @IsString() location?: string;
  @IsOptional() @IsBoolean() active?: boolean;
  @IsOptional() @IsBoolean() weLove?: boolean;
}

export class ProductFiltersDto {
  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  minPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maxPrice?: number;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsIn(['recent', 'price-asc', 'price-desc'])
  sort?: 'recent' | 'price-asc' | 'price-desc';
}
