import { IsString, MinLength } from 'class-validator';

export class AddFavoriteDto {
  @IsString()
  @MinLength(1)
  productId: string;
}
