import {
  IsString,
  IsOptional,
  IsNumber,
  Min,
  Max,
  IsPhoneNumber,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreatePatientDto {
  @IsString()
  userId: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  medicalRecord?: string;

  @IsOptional()
  @IsString()
  bloodType?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  allergies?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  chronicDiseases?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  emergencyContact?: string;

  @IsOptional()
  @IsPhoneNumber(undefined, { message: 'Please provide a valid phone number' })
  emergencyPhone?: string;

  @IsOptional()
  @Transform(({ value }) =>
    value !== undefined && value !== null && value !== ''
      ? parseFloat(value)
      : undefined,
  )
  @IsNumber({}, { message: 'Height must be a number' })
  @Min(50, { message: 'Height must be at least 50 cm' })
  @Max(250, { message: 'Height must be at most 250 cm' })
  height?: number;

  @IsOptional()
  @Transform(({ value }) =>
    value !== undefined && value !== null && value !== ''
      ? parseFloat(value)
      : undefined,
  )
  @IsNumber({}, { message: 'Weight must be a number' })
  @Min(20, { message: 'Weight must be at least 20 kg' })
  @Max(300, { message: 'Weight must be at most 300 kg' })
  weight?: number;
}
