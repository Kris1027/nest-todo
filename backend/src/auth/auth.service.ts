import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}
  async register(dto: RegisterDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) throw new ConflictException('Email already exists');

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
      },
    });

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const tokenRecord = await this.prisma.refreshToken.create({
      data: {
        token: 'placeholder',
        userId: user.id,
        expiresAt,
      },
    });

    const tokens = await this.generateTokens(
      user.id as number,
      user.email as string,
      tokenRecord.id as number,
    );

    await this.prisma.refreshToken.update({
      where: { id: tokenRecord.id },
      data: { token: await bcrypt.hash(tokens.refresh_token, 10) },
    });

    return tokens;
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) throw new UnauthorizedException('Invalid credentials');

    const isPasswordValid = await bcrypt.compare(
      dto.password,
      user.password as string,
    );

    if (!isPasswordValid)
      throw new UnauthorizedException('Invalid credentials');

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const tokenRecord = await this.prisma.refreshToken.create({
      data: {
        token: 'placeholder',
        userId: user.id,
        expiresAt,
      },
    });

    const tokens = await this.generateTokens(
      user.id as number,
      user.email as string,
      tokenRecord.id as number,
    );

    await this.prisma.refreshToken.update({
      where: { id: tokenRecord.id },
      data: { token: await bcrypt.hash(tokens.refresh_token, 10) },
    });

    return tokens;
  }

  async refresh(userId: number, refreshToken: string, tokenId: number) {
    const storedToken = await this.prisma.refreshToken.findUnique({
      where: { id: tokenId },
    });

    if (!storedToken || storedToken.userId !== userId) {
      throw new UnauthorizedException('Access denied');
    }

    const isValid = await bcrypt.compare(
      refreshToken,
      storedToken.token as string,
    );
    if (!isValid) {
      throw new UnauthorizedException('Access denied');
    }

    if (new Date() > storedToken.expiresAt) {
      await this.prisma.refreshToken.delete({ where: { id: tokenId } });
      throw new UnauthorizedException('Token expired');
    }

    await this.prisma.refreshToken.delete({ where: { id: tokenId } });

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('Access denied');

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const newTokenRecord = await this.prisma.refreshToken.create({
      data: { token: 'placeholder', userId, expiresAt },
    });

    const tokens = await this.generateTokens(
      user.id as number,
      user.email as string,
      newTokenRecord.id as number,
    );

    await this.prisma.refreshToken.update({
      where: { id: newTokenRecord.id },
      data: { token: await bcrypt.hash(tokens.refresh_token, 10) },
    });

    return tokens;
  }

  async logout(userId: number, tokenId: number) {
    const token = await this.prisma.refreshToken.findUnique({
      where: { id: tokenId },
    });

    if (!token || token.userId !== userId) {
      throw new UnauthorizedException('Access denied');
    }

    await this.prisma.refreshToken.delete({ where: { id: tokenId } });
  }

  async logoutAll(userId: number) {
    await this.prisma.refreshToken.deleteMany({
      where: { userId },
    });
  }

  private async generateTokens(
    userId: number,
    email: string,
    tokenId?: number,
  ) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync({ sub: userId, email }, { expiresIn: '15m' }),
      this.jwtService.signAsync(
        { sub: userId, email, tokenId },
        { expiresIn: '7d' },
      ),
    ]);

    return { access_token: accessToken, refresh_token: refreshToken };
  }
}
