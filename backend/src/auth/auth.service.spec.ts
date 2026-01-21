import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaService;
  let jwtService: JwtService;

  const mockPrisma = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    refreshToken: {
      create: jest.fn(),
      update: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
    },
  };

  const mockJwtService = {
    signAsync: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    const registerDto = { email: 'test@example.com', password: 'password123' };

    it('should register a new user and return tokens', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({ id: 1, email: registerDto.email });
      mockPrisma.refreshToken.create.mockResolvedValue({ id: 1 });
      mockPrisma.refreshToken.update.mockResolvedValue({});
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
      mockJwtService.signAsync
        .mockResolvedValueOnce('access_token')
        .mockResolvedValueOnce('refresh_token');

      const result = await service.register(registerDto);

      expect(result).toEqual({
        access_token: 'access_token',
        refresh_token: 'refresh_token',
      });
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: registerDto.email },
      });
      expect(bcrypt.hash).toHaveBeenCalledWith(registerDto.password, 10);
      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: { email: registerDto.email, password: 'hashedPassword' },
      });
    });

    it('should throw ConflictException if email already exists', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 1, email: registerDto.email });

      await expect(service.register(registerDto)).rejects.toThrow(ConflictException);
      expect(mockPrisma.user.create).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    const loginDto = { email: 'test@example.com', password: 'password123' };

    it('should login user and return tokens', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 1,
        email: loginDto.email,
        password: 'hashedPassword',
      });
      mockPrisma.refreshToken.create.mockResolvedValue({ id: 1 });
      mockPrisma.refreshToken.update.mockResolvedValue({});
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedRefreshToken');
      mockJwtService.signAsync
        .mockResolvedValueOnce('access_token')
        .mockResolvedValueOnce('refresh_token');

      const result = await service.login(loginDto);

      expect(result).toEqual({
        access_token: 'access_token',
        refresh_token: 'refresh_token',
      });
    });

    it('should throw UnauthorizedException if user not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if password is invalid', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 1,
        email: loginDto.email,
        password: 'hashedPassword',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('refresh', () => {
    it('should refresh tokens successfully', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);

      mockPrisma.refreshToken.findUnique.mockResolvedValue({
        id: 1,
        userId: 1,
        token: 'hashedToken',
        expiresAt: futureDate,
      });
      mockPrisma.refreshToken.delete.mockResolvedValue({});
      mockPrisma.user.findUnique.mockResolvedValue({ id: 1, email: 'test@example.com' });
      mockPrisma.refreshToken.create.mockResolvedValue({ id: 2 });
      mockPrisma.refreshToken.update.mockResolvedValue({});
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.hash as jest.Mock).mockResolvedValue('newHashedToken');
      mockJwtService.signAsync
        .mockResolvedValueOnce('new_access_token')
        .mockResolvedValueOnce('new_refresh_token');

      const result = await service.refresh(1, 'validRefreshToken', 1);

      expect(result).toEqual({
        access_token: 'new_access_token',
        refresh_token: 'new_refresh_token',
      });
    });

    it('should throw UnauthorizedException if token not found', async () => {
      mockPrisma.refreshToken.findUnique.mockResolvedValue(null);

      await expect(service.refresh(1, 'token', 1)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if userId does not match', async () => {
      mockPrisma.refreshToken.findUnique.mockResolvedValue({
        id: 1,
        userId: 2,
        token: 'hashedToken',
      });

      await expect(service.refresh(1, 'token', 1)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if token is invalid', async () => {
      mockPrisma.refreshToken.findUnique.mockResolvedValue({
        id: 1,
        userId: 1,
        token: 'hashedToken',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.refresh(1, 'invalidToken', 1)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if token is expired', async () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);

      mockPrisma.refreshToken.findUnique.mockResolvedValue({
        id: 1,
        userId: 1,
        token: 'hashedToken',
        expiresAt: pastDate,
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      await expect(service.refresh(1, 'token', 1)).rejects.toThrow(UnauthorizedException);
      expect(mockPrisma.refreshToken.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    });
  });

  describe('logout', () => {
    it('should delete refresh token on logout', async () => {
      mockPrisma.refreshToken.findUnique.mockResolvedValue({ id: 1, userId: 1 });
      mockPrisma.refreshToken.delete.mockResolvedValue({});

      await service.logout(1, 1);

      expect(mockPrisma.refreshToken.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should throw UnauthorizedException if token not found', async () => {
      mockPrisma.refreshToken.findUnique.mockResolvedValue(null);

      await expect(service.logout(1, 1)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if userId does not match', async () => {
      mockPrisma.refreshToken.findUnique.mockResolvedValue({ id: 1, userId: 2 });

      await expect(service.logout(1, 1)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('logoutAll', () => {
    it('should delete all refresh tokens for user', async () => {
      mockPrisma.refreshToken.deleteMany.mockResolvedValue({ count: 3 });

      await service.logoutAll(1);

      expect(mockPrisma.refreshToken.deleteMany).toHaveBeenCalledWith({
        where: { userId: 1 },
      });
    });
  });
});
