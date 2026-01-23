import { Test, TestingModule } from '@nestjs/testing';
import { TodoController } from './todo.controller';
import { TodoService } from './todo.service';
import { AuthGuard } from '../common/guards/auth.guard';

describe('TodoController', () => {
  let controller: TodoController;
  let todoService: TodoService;

  const mockTodoService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockAuthGuard = { canActivate: jest.fn(() => true) };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TodoController],
      providers: [{ provide: TodoService, useValue: mockTodoService }],
    })
      .overrideGuard(AuthGuard)
      .useValue(mockAuthGuard)
      .compile();

    controller = module.get<TodoController>(TodoController);
    todoService = module.get<TodoService>(TodoService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a todo', async () => {
      const createDto = { title: 'Test Todo', description: 'Description' };
      const userId = 1;
      const expectedTodo = { id: 1, ...createDto, userId, completed: false };
      mockTodoService.create.mockResolvedValue(expectedTodo);

      const result = await controller.create(createDto, userId);

      expect(result).toEqual(expectedTodo);
      expect(mockTodoService.create).toHaveBeenCalledWith(createDto, userId);
    });
  });

  describe('findAll', () => {
    it('should return paginated todos for the user', async () => {
      const userId = 1;
      const query = { page: 1, limit: 10 };
      const paginatedResult = {
        data: [
          { id: 1, title: 'Todo 1', userId, completed: false },
          { id: 2, title: 'Todo 2', userId, completed: true },
        ],
        meta: {
          page: 1,
          limit: 10,
          total: 2,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      };
      mockTodoService.findAll.mockResolvedValue(paginatedResult);

      const result = await controller.findAll(query, userId);

      expect(result).toEqual(paginatedResult);
      expect(mockTodoService.findAll).toHaveBeenCalledWith(userId, query);
    });

    it('should pass query params to service', async () => {
      const userId = 1;
      const query = { page: 2, limit: 5, completed: true, search: 'test', sortOrder: 'asc' as const };
      mockTodoService.findAll.mockResolvedValue({ data: [], meta: {} });

      await controller.findAll(query, userId);

      expect(mockTodoService.findAll).toHaveBeenCalledWith(userId, query);
    });
  });

  describe('findOne', () => {
    it('should return a single todo', async () => {
      const todo = { id: 1, title: 'Test', userId: 1, completed: false };
      mockTodoService.findOne.mockResolvedValue(todo);

      const result = await controller.findOne(1, 1);

      expect(result).toEqual(todo);
      expect(mockTodoService.findOne).toHaveBeenCalledWith(1, 1);
    });
  });

  describe('update', () => {
    it('should update a todo', async () => {
      const updateDto = { title: 'Updated', completed: true };
      const updatedTodo = { id: 1, ...updateDto, userId: 1 };
      mockTodoService.update.mockResolvedValue(updatedTodo);

      const result = await controller.update(1, updateDto, 1);

      expect(result).toEqual(updatedTodo);
      expect(mockTodoService.update).toHaveBeenCalledWith(1, updateDto, 1);
    });
  });

  describe('remove', () => {
    it('should delete a todo', async () => {
      const todo = { id: 1, title: 'Test', userId: 1, completed: false };
      mockTodoService.remove.mockResolvedValue(todo);

      const result = await controller.remove(1, 1);

      expect(result).toEqual(todo);
      expect(mockTodoService.remove).toHaveBeenCalledWith(1, 1);
    });
  });
});
