import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreatePayoutDto {
  @IsNumber() @Min(1) amount: number;
}

export class ReviewPayoutDto {
  @IsString() status: 'paid' | 'rejected';
  @IsOptional() @IsString() reviewNote?: string;
}
