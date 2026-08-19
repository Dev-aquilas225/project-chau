import { Body, Controller, Get, Headers, Post, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RequestMagicLinkDto, VerifyMagicLinkDto } from './dto/magic-link.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import type { JwtPayload } from './strategies/jwt.strategy';
import { CLIENT_APP_HEADER, resolveAudience } from './jwt-audience';

// Limite stricte par IP pour contrer le brute-force / credential stuffing sur ces
// deux routes (aucun rate limiting n'existait auparavant — cf. audit sécurité).
const AUTH_THROTTLE = { default: { ttl: 60_000, limit: 5 } };

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Throttle(AUTH_THROTTLE)
  @Post('register')
  register(@Body() dto: RegisterDto, @Headers(CLIENT_APP_HEADER) clientApp?: string) {
    return this.authService.register(dto, resolveAudience(clientApp));
  }

  @Throttle(AUTH_THROTTLE)
  @Post('login')
  login(@Body() dto: LoginDto, @Headers(CLIENT_APP_HEADER) clientApp?: string) {
    return this.authService.login(dto, resolveAudience(clientApp));
  }

  @Throttle(AUTH_THROTTLE)
  @Post('magic-link/request')
  requestMagicLink(@Body() dto: RequestMagicLinkDto) {
    return this.authService.requestMagicLink(dto.email);
  }

  @Throttle(AUTH_THROTTLE)
  @Post('magic-link/verify')
  verifyMagicLink(@Body() dto: VerifyMagicLinkDto) {
    return this.authService.verifyMagicLink(dto.token);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@CurrentUser() user: JwtPayload) {
    return this.authService.me(user.sub);
  }
}
