import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthGuard } from '../common/guards/auth.guard';
import { RefreshTokenGuard } from '../common/guards/refresh-token.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { getRefreshToken } from '../common/decorators/refresh-token.decorator';
import { GetTokenId } from '../common/decorators/get-token-id.decorator';
import { Throttle } from '@nestjs/throttler';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Throttle({
    short: { limit: 1, ttl: 1000 },
    medium: { limit: 5, ttl: 60000 },
    long: { limit: 10, ttl: 300000 },
  })
  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Throttle({
    short: { limit: 1, ttl: 1000 },
    medium: { limit: 5, ttl: 60000 },
    long: { limit: 10, ttl: 300000 },
  })
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @UseGuards(AuthGuard)
  @Get('me')
  me(@CurrentUser() userId: number) {
    return { userId };
  }

  @UseGuards(RefreshTokenGuard)
  @Post('refresh')
  refresh(
    @CurrentUser() userId: number,
    @getRefreshToken() refreshToken: string,
    @GetTokenId() tokenId: number,
  ) {
    return this.authService.refresh(userId, refreshToken, tokenId);
  }

  @UseGuards(RefreshTokenGuard)
  @Post('logout')
  logout(@CurrentUser() userId: number, @GetTokenId() tokenId: number) {
    return this.authService.logout(userId, tokenId);
  }

  @UseGuards(AuthGuard)
  @Post('logout-all')
  logoutAll(@CurrentUser() userId: number) {
    return this.authService.logoutAll(userId);
  }
}
