import {
  ArrayMinSize,
  ArrayNotEmpty,
  IsArray,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreatePostDto {
  @IsString()
  @IsOptional()
  text: string;

  @IsString()
  @IsOptional()
  image: string;

  @IsArray()
  @ArrayNotEmpty()
  @ArrayMinSize(1)
  @IsString({ each: true })
  readonly hash_tags: string[];

  @IsString()
  @IsOptional()
  user_id: string;
}
