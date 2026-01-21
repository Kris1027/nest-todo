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

interface StoredRefreshToken {
  id: number;
  token: string;
  userId: number;
  expiresAt: Date;
  createdAt: Date;
}

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

    const tokens = await this.generateTokens(
      user.id as number,
      user.email as string,
    );

    await this.updateRefreshToken(user.id as number, tokens.refresh_token);

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

    const tokens = await this.generateTokens(
      user.id as number,
      user.email as string,
    );

    await this.updateRefreshToken(user.id as number, tokens.refresh_token);

    return tokens;
  }

  async refresh(userId: number, refreshToken: string) {
    const userTokens = (await this.prisma.refreshToken.findMany({
      where: { userId },
    })) as StoredRefreshToken[];

    let foundToken: StoredRefreshToken | null = null;

    for (const t of userTokens) {
      const isMatch = await bcrypt.compare(refreshToken, t.token);
      if (isMatch) {
        foundToken = t;
        break;
      }
    }

    if (!foundToken) {
      throw new UnauthorizedException('Access denied');
    }

    if (new Date() > foundToken.expiresAt) {
      await this.prisma.refreshToken.delete({ where: { id: foundToken.id } });
      throw new UnauthorizedException('Token expired');
    }

    await this.prisma.refreshToken.delete({ where: { id: foundToken.id } });

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('Access denied');

    const tokens = await this.generateTokens(
      user.id as number,
      user.email as string,
    );

    await this.updateRefreshToken(user.id as number, tokens.refresh_token);

    return tokens;
  }

  async logout(userId: number, refreshToken: string) {
    const userTokens = await this.prisma.refreshToken.findMany({
      where: { userId },
    });

    for (const t of userTokens) {
      const isMatch = await bcrypt.compare(refreshToken, t.token as string);
      if (isMatch) {
        await this.prisma.refreshToken.delete({ where: { id: t.id } });
        break;
      }
    }
  }

  async logoutAll(userId: number) {
    await this.prisma.refreshToken.deleteMany({
      where: { userId },
    });
  }

  private async generateTokens(userId: number, email: string) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync({ sub: userId, email }, { expiresIn: '15m' }),
      this.jwtService.signAsync({ sub: userId, email }, { expiresIn: '7d' }),
    ]);

    return { access_token: accessToken, refresh_token: refreshToken };
  }

  private async updateRefreshToken(userId: number, refreshToken: string) {
    const hashedToken = await bcrypt.hash(refreshToken, 10);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.prisma.refreshToken.create({
      data: { token: hashedToken, userId, expiresAt },
    });
  }
}
