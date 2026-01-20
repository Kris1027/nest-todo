import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { PrismaService } from '../prisma/prisma.service';

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

  findAll(userId: number) {
    return this.prisma.todo.findMany({
      where: { userId },
    });
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
