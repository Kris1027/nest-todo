import { Test, TestingModule } from '@nestjs/testing';
import { TodoService } from './todo.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('TodoService', () => {
  let service: TodoService;
  let prisma: PrismaService;

  const mockPrisma = {
    todo: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TodoService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<TodoService>(TodoService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a todo', async () => {
      const createDto = { title: 'Test Todo', description: 'Description' };
      const userId = 1;
      const expectedTodo = {
        id: 1,
        ...createDto,
        completed: false,
        userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockPrisma.todo.create.mockResolvedValue(expectedTodo);

      const result = await service.create(createDto, userId);

      expect(result).toEqual(expectedTodo);
      expect(mockPrisma.todo.create).toHaveBeenCalledWith({
        data: { ...createDto, userId },
      });
    });

    it('should create a todo without description', async () => {
      const createDto = { title: 'Test Todo' };
      const userId = 1;
      const expectedTodo = {
        id: 1,
        title: 'Test Todo',
        description: null,
        completed: false,
        userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockPrisma.todo.create.mockResolvedValue(expectedTodo);

      const result = await service.create(createDto, userId);

      expect(result).toEqual(expectedTodo);
    });
  });

  describe('findAll', () => {
    it('should return all todos for a user', async () => {
      const userId = 1;
      const todos = [
        { id: 1, title: 'Todo 1', userId, completed: false },
        { id: 2, title: 'Todo 2', userId, completed: true },
      ];
      mockPrisma.todo.findMany.mockResolvedValue(todos);

      const result = await service.findAll(userId);

      expect(result).toEqual(todos);
      expect(mockPrisma.todo.findMany).toHaveBeenCalledWith({
        where: { userId },
      });
    });

    it('should return empty array if user has no todos', async () => {
      mockPrisma.todo.findMany.mockResolvedValue([]);

      const result = await service.findAll(1);

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a todo by id', async () => {
      const todo = { id: 1, title: 'Test', userId: 1, completed: false };
      mockPrisma.todo.findUnique.mockResolvedValue(todo);

      const result = await service.findOne(1, 1);

      expect(result).toEqual(todo);
      expect(mockPrisma.todo.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('should throw NotFoundException if todo not found', async () => {
      mockPrisma.todo.findUnique.mockResolvedValue(null);

      await expect(service.findOne(999, 1)).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if todo belongs to different user', async () => {
      const todo = { id: 1, title: 'Test', userId: 2, completed: false };
      mockPrisma.todo.findUnique.mockResolvedValue(todo);

      await expect(service.findOne(1, 1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a todo', async () => {
      const todo = { id: 1, title: 'Test', userId: 1, completed: false };
      const updateDto = { title: 'Updated Title', completed: true };
      const updatedTodo = { ...todo, ...updateDto };

      mockPrisma.todo.findUnique.mockResolvedValue(todo);
      mockPrisma.todo.update.mockResolvedValue(updatedTodo);

      const result = await service.update(1, updateDto, 1);

      expect(result).toEqual(updatedTodo);
      expect(mockPrisma.todo.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: updateDto,
      });
    });

    it('should throw NotFoundException if todo not found', async () => {
      mockPrisma.todo.findUnique.mockResolvedValue(null);

      await expect(service.update(999, { title: 'New' }, 1)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockPrisma.todo.update).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if todo belongs to different user', async () => {
      const todo = { id: 1, title: 'Test', userId: 2, completed: false };
      mockPrisma.todo.findUnique.mockResolvedValue(todo);

      await expect(service.update(1, { title: 'New' }, 1)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockPrisma.todo.update).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should delete a todo', async () => {
      const todo = { id: 1, title: 'Test', userId: 1, completed: false };
      mockPrisma.todo.findUnique.mockResolvedValue(todo);
      mockPrisma.todo.delete.mockResolvedValue(todo);

      const result = await service.remove(1, 1);

      expect(result).toEqual(todo);
      expect(mockPrisma.todo.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('should throw NotFoundException if todo not found', async () => {
      mockPrisma.todo.findUnique.mockResolvedValue(null);

      await expect(service.remove(999, 1)).rejects.toThrow(NotFoundException);
      expect(mockPrisma.todo.delete).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if todo belongs to different user', async () => {
      const todo = { id: 1, title: 'Test', userId: 2, completed: false };
      mockPrisma.todo.findUnique.mockResolvedValue(todo);

      await expect(service.remove(1, 1)).rejects.toThrow(NotFoundException);
      expect(mockPrisma.todo.delete).not.toHaveBeenCalled();
    });
  });
});
