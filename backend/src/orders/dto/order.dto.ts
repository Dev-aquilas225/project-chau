import { Type } from 'class-transformer';
import {
  IsArray, IsIn, IsNumber, IsOptional, IsString, Min, MinLength, ValidateNested,
} from 'class-validator';
import type { Address, OrderItem, OrderStatus } from '../entities/order.entity';

class OrderItemDto implements OrderItem {
  @IsString() productId: string;
  @IsString() name: string;
  @IsOptional() @IsString() brand: string;
  @IsOptional() @IsString() image: string;
  @IsNumber() @Min(0) unitPrice: number;
  @IsNumber() @Min(1) qty: number;
}

class AddressDto implements Address {
  @IsString() @MinLength(1) fullName: string;
  @IsString() @MinLength(1) line1: string;
  @IsString() @MinLength(1) city: string;
  @IsString() @MinLength(1) zip: string;
  @IsString() @MinLength(1) country: string;
}

export class CreateOrderDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @IsNumber() @Min(0) subtotal: number;

  @IsOptional() @IsNumber() @Min(0) discount?: number;

  @IsNumber() @Min(0) total: number;

  @IsOptional() @IsString() promoCode?: string;

  @ValidateNested()
  @Type(() => AddressDto)
  shippingAddress: AddressDto;

  @IsString() paymentMethod: string;
}

export class UpdateOrderStatusDto {
  @IsIn(['pending', 'paid', 'shipped', 'delivered', 'cancelled'])
  status: OrderStatus;
}
