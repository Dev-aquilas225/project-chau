import { IsDateString, IsIn, IsOptional, IsString, Length, MaxLength, ValidateIf } from 'class-validator';
import type { IdType, SellerStatus } from '../../users/entities/user.entity';

export class ApplySellerDto {
  @IsString()
  @MaxLength(100)
  storeName: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  bio?: string;

  @IsIn(['national_id', 'passport'])
  idType: IdType;

  @IsString()
  @MaxLength(50)
  idNumber: string;

  @IsString()
  @Length(2, 2)
  idCountry: string;

  @IsString()
  @MaxLength(150)
  fullNameOnId: string;

  @IsDateString()
  dateOfBirth: string;

  @IsString()
  idDocumentRef: string;

  @ValidateIf((o) => o.idType === 'national_id')
  @IsString()
  idDocumentBackRef?: string;

  @IsString()
  profilePhotoRef: string;
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
