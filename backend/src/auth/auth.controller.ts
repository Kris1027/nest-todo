import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import type { Request as ExpressRequest } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthGuard } from '../common/guards/auth.guard';
import { RefreshTokenGuard } from '../common/guards/refresh-token.guard';

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
  me(@Request() req: ExpressRequest) {
    return req['user'];
  }

  @UseGuards(RefreshTokenGuard)
  @Post('refresh')
  refresh(@Request() req: ExpressRequest) {
    return this.authService.refresh(
      req['user'].sub as number,
      req['refreshToken'] as string,
    );
  }

  @UseGuards(AuthGuard)
  @Post('logout')
  logout(@Request() req: ExpressRequest) {
    return this.authService.logout(req['user'].sub as number);
  }
}
