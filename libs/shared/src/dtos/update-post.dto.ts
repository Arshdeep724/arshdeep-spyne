import {
  ArrayMinSize,
  ArrayNotEmpty,
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdatePostDto {
  @IsString()
  @IsOptional()
  text: string;

  @IsString()
  @IsOptional()
  image: string;

  @IsArray()
  @IsOptional()
  @ArrayNotEmpty()
  @ArrayMinSize(1)
  @IsString({ each: true })
  readonly hash_tags: string[];

  @IsNumber()
  @IsOptional()
  id: number;
}
