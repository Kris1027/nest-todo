import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthGuard } from '../common/guards/auth.guard';
import { RefreshTokenGuard } from '../common/guards/refresh-token.guard';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
    refresh: jest.fn(),
    logout: jest.fn(),
    logoutAll: jest.fn(),
  };

  const mockAuthGuard = { canActivate: jest.fn(() => true) };
  const mockRefreshTokenGuard = { canActivate: jest.fn(() => true) };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    })
      .overrideGuard(AuthGuard)
      .useValue(mockAuthGuard)
      .overrideGuard(RefreshTokenGuard)
      .useValue(mockRefreshTokenGuard)
      .compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should call authService.register with dto', async () => {
      const dto = { email: 'test@example.com', password: 'password123' };
      const tokens = { access_token: 'at', refresh_token: 'rt' };
      mockAuthService.register.mockResolvedValue(tokens);

      const result = await controller.register(dto);

      expect(result).toEqual(tokens);
      expect(mockAuthService.register).toHaveBeenCalledWith(dto);
    });
  });

  describe('login', () => {
    it('should call authService.login with dto', async () => {
      const dto = { email: 'test@example.com', password: 'password123' };
      const tokens = { access_token: 'at', refresh_token: 'rt' };
      mockAuthService.login.mockResolvedValue(tokens);

      const result = await controller.login(dto);

      expect(result).toEqual(tokens);
      expect(mockAuthService.login).toHaveBeenCalledWith(dto);
    });
  });

  describe('me', () => {
    it('should return userId', () => {
      const userId = 1;

      const result = controller.me(userId);

      expect(result).toEqual({ userId });
    });
  });

  describe('refresh', () => {
    it('should call authService.refresh with userId, refreshToken, and tokenId', async () => {
      const tokens = { access_token: 'new_at', refresh_token: 'new_rt' };
      mockAuthService.refresh.mockResolvedValue(tokens);

      const result = await controller.refresh(1, 'refreshToken', 5);

      expect(result).toEqual(tokens);
      expect(mockAuthService.refresh).toHaveBeenCalledWith(1, 'refreshToken', 5);
    });
  });

  describe('logout', () => {
    it('should call authService.logout with userId and tokenId', async () => {
      mockAuthService.logout.mockResolvedValue(undefined);

      await controller.logout(1, 5);

      expect(mockAuthService.logout).toHaveBeenCalledWith(1, 5);
    });
  });

  describe('logoutAll', () => {
    it('should call authService.logoutAll with userId', async () => {
      mockAuthService.logoutAll.mockResolvedValue(undefined);

      await controller.logoutAll(1);

      expect(mockAuthService.logoutAll).toHaveBeenCalledWith(1);
    });
  });
});
