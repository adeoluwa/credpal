import { Controller, Post, Body, HttpCode } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';

import { LoginDto } from './dto/login.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    await this.authService.register(registerDto);
    return {
      message:
        'Registration successful. Please check your email for verification.',
    };
  }

  @Post('verify')
  async verifyEmail(@Body() verifyDto: VerifyEmailDto) {
    await this.authService.verifyEmail(verifyDto.email, verifyDto.token);
    return { message: 'Email verified successfully' };
  }

  @Post('login')
  @HttpCode(200)
  async login(@Body() loginDto: LoginDto) {
    const access_token = await this.authService.login(loginDto);

    return {
      message: 'Login successful',
      accessToken: access_token,
      user: {
        email: loginDto.email,
      },
    };
  }
}
