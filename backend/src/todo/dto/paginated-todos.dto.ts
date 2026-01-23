import { ApiProperty } from '@nestjs/swagger';
import { Todo } from '@prisma/client';

// Metadata about the pagination state
class PaginationMeta {
  @ApiProperty({ example: 1, description: 'Current page number' })
  page: number;

  @ApiProperty({ example: 10, description: 'Items per page' })
  limit: number;

  @ApiProperty({ example: 100, description: 'Total items in database' })
  total: number;

  @ApiProperty({ example: 10, description: 'Total number of pages' })
  totalPages: number;

  @ApiProperty({ example: true, description: 'Is there a next page?' })
  hasNextPage: boolean;

  @ApiProperty({ example: false, description: 'Is there a previous page?' })
  hasPreviousPage: boolean;
}

// The full paginated response
export class PaginatedTodosDto {
  @ApiProperty({
    type: [Object],
    description: 'Array of todos for current page',
  })
  data: Todo[];

  @ApiProperty({
    type: PaginationMeta,
    description: 'Pagination metadata',
  })
  meta: PaginationMeta;
}

// Helper type for building the response in the service
export interface PaginatedResult<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}
