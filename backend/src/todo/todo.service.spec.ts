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
      count: jest.fn(),
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
    const userId = 1;
    const mockTodos = [
      { id: 1, title: 'Todo 1', userId, completed: false, createdAt: new Date(), updatedAt: new Date(), description: null },
      { id: 2, title: 'Todo 2', userId, completed: true, createdAt: new Date(), updatedAt: new Date(), description: null },
    ];

    it('should return paginated todos with default query', async () => {
      const query = {};
      mockPrisma.todo.findMany.mockResolvedValue(mockTodos);
      mockPrisma.todo.count.mockResolvedValue(2);

      const result = await service.findAll(userId, query);

      expect(result.data).toEqual(mockTodos);
      expect(result.meta).toEqual({
        page: 1,
        limit: 10,
        total: 2,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      });
      expect(mockPrisma.todo.findMany).toHaveBeenCalledWith({
        where: { userId },
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
      });
      expect(mockPrisma.todo.count).toHaveBeenCalledWith({
        where: { userId },
      });
    });

    it('should apply pagination correctly', async () => {
      const query = { page: 2, limit: 5 };
      mockPrisma.todo.findMany.mockResolvedValue([mockTodos[0]]);
      mockPrisma.todo.count.mockResolvedValue(6);

      const result = await service.findAll(userId, query);

      expect(result.meta.page).toBe(2);
      expect(result.meta.limit).toBe(5);
      expect(result.meta.totalPages).toBe(2);
      expect(result.meta.hasNextPage).toBe(false);
      expect(result.meta.hasPreviousPage).toBe(true);
      expect(mockPrisma.todo.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 5,
          take: 5,
        }),
      );
    });

    it('should filter by completed status', async () => {
      const query = { completed: true };
      mockPrisma.todo.findMany.mockResolvedValue([mockTodos[1]]);
      mockPrisma.todo.count.mockResolvedValue(1);

      await service.findAll(userId, query);

      expect(mockPrisma.todo.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId, completed: true },
        }),
      );
    });

    it('should filter by search term', async () => {
      const query = { search: 'milk' };
      mockPrisma.todo.findMany.mockResolvedValue([]);
      mockPrisma.todo.count.mockResolvedValue(0);

      await service.findAll(userId, query);

      expect(mockPrisma.todo.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            userId,
            title: { contains: 'milk' },
          },
        }),
      );
    });

    it('should apply sort order', async () => {
      const query = { sortOrder: 'asc' as const };
      mockPrisma.todo.findMany.mockResolvedValue(mockTodos);
      mockPrisma.todo.count.mockResolvedValue(2);

      await service.findAll(userId, query);

      expect(mockPrisma.todo.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { createdAt: 'asc' },
        }),
      );
    });

    it('should return empty result when no todos exist', async () => {
      mockPrisma.todo.findMany.mockResolvedValue([]);
      mockPrisma.todo.count.mockResolvedValue(0);

      const result = await service.findAll(userId, {});

      expect(result.data).toEqual([]);
      expect(result.meta.total).toBe(0);
      expect(result.meta.totalPages).toBe(0);
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
