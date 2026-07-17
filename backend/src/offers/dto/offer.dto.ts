import { IsNumber, IsString, Min } from 'class-validator';

export class CreateOfferDto {
  @IsString() productId: string;
  @IsNumber() @Min(0) suggestedPrice: number;
}
