import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthGuard } from '../common/guards/auth.guard';
import { RefreshTokenGuard } from '../common/guards/refresh-token.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { getRefreshToken } from '../common/decorators/refresh-token.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

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
  ) {
    return this.authService.refresh(userId, refreshToken);
  }

  @UseGuards(RefreshTokenGuard)
  @Post('logout')
  logout(
    @CurrentUser() userId: number,
    @getRefreshToken() refreshToken: string,
  ) {
    return this.authService.logout(userId, refreshToken);
  }

  @UseGuards(AuthGuard)
  @Post('logout-all')
  logoutAll(@CurrentUser() userId: number) {
    return this.authService.logoutAll(userId);
  }
}
