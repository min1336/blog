import {
  IsString,
  IsOptional,
  IsBoolean,
  IsArray,
  IsNumber,
  MinLength,
} from 'class-validator';

export class CreateProjectDto {
  @IsString()
  @MinLength(1)
  title: string;

  @IsString()
  @MinLength(1)
  slug: string;

  @IsString()
  @MinLength(1)
  description: string;

  @IsOptional()
  @IsString()
  summary?: string;

  @IsOptional()
  @IsArray()
  tech_stack?: string[];

  @IsOptional()
  @IsString()
  github_url?: string;

  @IsOptional()
  @IsString()
  demo_url?: string;

  @IsOptional()
  @IsString()
  thumbnail?: string;

  @IsOptional()
  @IsNumber()
  sort_order?: number;

  @IsOptional()
  @IsBoolean()
  published?: boolean;
}
