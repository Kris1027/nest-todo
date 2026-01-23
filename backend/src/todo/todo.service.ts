import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { PrismaService } from '../prisma/prisma.service';
import { FindTodosQueryDto } from './dto/find-todos-query.dto';
import { PaginatedResult } from './dto/paginated-todos.dto';
import { Prisma, Todo } from '@prisma/client';

@Injectable()
export class TodoService {
  constructor(private prisma: PrismaService) {}

  create(createTodoDto: CreateTodoDto, userId: number) {
    return this.prisma.todo.create({
      data: {
        ...createTodoDto,
        userId,
      },
    });
  }

  async findAll(
    userId: number,
    query: FindTodosQueryDto,
  ): Promise<PaginatedResult<Todo>> {
    // 1. Extract query params with defaults
    const {
      page = 1,
      limit = 10,
      completed,
      search,
      sortOrder = 'desc',
    } = query;
    // 2. Build the WHERE clause dynamically
    const where: Prisma.TodoWhereInput = {
      userId, // Always filter by current user

      // Only add 'completed' filter if it was provided
      ...(completed !== undefined && { completed }),

      // Only add search filter if search term provided
      ...(search && {
        title: {
          contains: search, // SQLite LIKE is case-insensitive by default
        },
      }),
    };

    // 3. Calculate skip value (how many records to skip)
    // Page 1 = skip 0, Page 2 = skip 10, Page 3 = skip 20...
    const skip = (page - 1) * limit;

    // 4. Run BOTH queries in parallel for efficiency
    const [todos, total] = await Promise.all([
      // Query 1: Get the actual todos for this page
      this.prisma.todo.findMany({
        where,
        skip,
        take: limit, // Prisma's LIMIT
        orderBy: {
          createdAt: sortOrder, // 'asc' or 'desc'
        },
      }),
      // Query 2: Count ALL matching todos (for pagination math)
      this.prisma.todo.count({ where }),
    ]);

    // 5. Calculate pagination metadata
    const totalPages = Math.ceil(total / limit);

    return {
      data: todos,
      meta: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  async findOne(id: number, userId: number) {
    const todo = await this.prisma.todo.findUnique({
      where: { id },
    });
    if (!todo || todo.userId !== userId) {
      throw new NotFoundException(`Todo with ID ${id} not found`);
    }
    return todo;
  }

  async update(id: number, updateTodoDto: UpdateTodoDto, userId: number) {
    await this.findOne(id, userId);
    return this.prisma.todo.update({
      where: { id },
      data: updateTodoDto,
    });
  }

  async remove(id: number, userId: number) {
    await this.findOne(id, userId);
    return this.prisma.todo.delete({
      where: { id },
    });
  }
}
