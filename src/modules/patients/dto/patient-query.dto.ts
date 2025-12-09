import { IsOptional, IsString, IsInt, Min, IsEnum } from 'class-validator';
import { Transform, Type } from 'class-transformer';

enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export class PatientQueryDto {
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  search?: string;

  @IsOptional()
  @IsString()
  bloodType?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @IsOptional()
  @IsEnum(SortOrder)
  sortBy?: SortOrder = SortOrder.DESC;

  @IsOptional()
  @IsString()
  sortField?: string = 'createdAt';
}
