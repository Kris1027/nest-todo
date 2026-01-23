import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class FindTodosQueryDto {
  // --- PAGINATION ---

  @ApiPropertyOptional({
    description: 'Page number (1-indexed)',
    default: 1,
    minimum: 1,
  })
  @Type(() => Number) // Transform string "1" to number 1
  @IsInt() // Must be an integer, not 1.5
  @Min(1) // Page starts at 1, not 0
  @IsOptional() // Not required - has default
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Items per page',
    default: 10,
    minimum: 1,
    maximum: 100,
  })
  @Type(() => Number) // Transform string to number
  @IsInt()
  @Min(1) // At least 1 item
  @Max(100) // Prevent fetching entire database
  @IsOptional()
  limit?: number = 10;

  // --- FILTERING ---

  @ApiPropertyOptional({
    description: 'Filter by completion status',
    example: true,
  })
  @Type(() => Boolean) // Transform "true"/"false" to boolean
  @IsBoolean()
  @IsOptional()
  completed?: boolean;

  // --- SEARCH ---

  @ApiPropertyOptional({
    description: 'Search todos by title (case-insensitive)',
    example: 'groceries',
  })
  @IsString()
  @IsOptional()
  search?: string;

  // --- SORTING ---

  @ApiPropertyOptional({
    description: 'Sort order by creation date',
    enum: ['asc', 'desc'],
    default: 'desc',
  })
  @IsIn(['asc', 'desc']) // Only allow these two values
  @IsOptional()
  sortOrder?: 'asc' | 'desc' = 'desc';
}
