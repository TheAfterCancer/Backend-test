import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Controller('auth')
export class AuthController {
  constructor(private readonly jwtService: JwtService) {}

  @Post('login')
  async login(@Body() loginDto: { username: string; password: string }) {
    if (loginDto.username === 'theaftercancer' && loginDto.password === 'backendTest') {
      const payload = { username: loginDto.username, sub: 1 };
      return {
        access_token: this.jwtService.sign(payload),
      };
    } else {
      throw new UnauthorizedException();
    }
  }
}
