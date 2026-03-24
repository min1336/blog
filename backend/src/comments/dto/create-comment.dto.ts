import {
  IsString,
  IsOptional,
  IsNumber,
  MinLength,
  MaxLength,
} from 'class-validator';

export class CreateCommentDto {
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  nickname: string;

  @IsString()
  @MinLength(4)
  password: string;

  @IsString()
  @MinLength(1)
  content: string;

  @IsOptional()
  @IsNumber()
  parent_id?: number;
}
