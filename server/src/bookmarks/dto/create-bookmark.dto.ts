// export class CreateBookmarkDto {
//   title: string;
//   url: string;
//   description?: string;
//   tags?: string[]; // e.g. ["Tech", "News"]
// }
import { IsString, IsNotEmpty, IsOptional, IsArray } from 'class-validator';

export class CreateBookmarkDto {
  @IsString()
  @IsNotEmpty()
  url: string;

  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  // Ensure this field exists so the frontend can send ["tag1", "tag2"]
  @IsArray()
  @IsOptional()
  tags?: string[];
}
