import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, MoreThan, Not, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../user/user.entity';
import { MailService } from '../mail/mail.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
    private _mailService: MailService,
  ) {}

  /**
   * The function generates a random six-digit code.
   * @returns A six-digit random code as a string is being returned.
   */
  private generateSixDigitCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async register(registerDto: RegisterDto): Promise<void> {
    const { email, password } = registerDto;

    const exisitingUser = await this.usersRepository.findOne({
      where: { email },
    });

    if (exisitingUser) {
      throw new UnauthorizedException('Email already in use');
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = this.generateSixDigitCode();
    const verificationTokenHash = await bcrypt.hash(verificationToken, 10);

    // Set token expiration (e.g., 1 hour)
    const codeExpires = new Date();
    codeExpires.setHours(codeExpires.getHours() + 2);

    console.log('Token:', verificationToken);
    const user = this.usersRepository.create({
      email,
      password: hashedPassword,
      verificationTokenHash,
      isVerified: false,
      verificationTokenExpires: codeExpires,
    });

    await this.usersRepository.save(user);
    // await this.mailService.sendVerificationEmail(email, verificationToken);

    console.log(
      `Please use this verification token for ${email}: ${verificationToken}`,
    );
  }

  async verifyEmail(email: string, token: string): Promise<void> {
    if (!email || !token) {
      throw new BadRequestException('Email and token are required');
    }

    const user = await this.usersRepository.findOne({
      where: {
        email,
        isVerified: false,
        verificationTokenHash: Not(IsNull()),
        verificationTokenExpires: MoreThan(new Date()),
      },
    });

    if (!user || !user.verificationTokenHash) {
      throw new NotFoundException('Invalid or expired token');
    }

    const isTokenValid = await bcrypt.compare(
      token,
      user.verificationTokenHash,
    );

    if (!isTokenValid) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    // Successfully verified the token
    console.log(`User ${user.email} successfully verified`);

    await this.usersRepository.update(user.id, {
      isVerified: true,
      verificationTokenHash: undefined,
      verificationTokenExpires: undefined,
    });
  }

  async login(loginDto: LoginDto): Promise<{ access_token: string }> {
    const user = await this.usersRepository.findOne({
      where: { email: loginDto.email },
    });

    if (!user || !(await bcrypt.compare(loginDto.password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isVerified) {
      throw new UnauthorizedException('Please verify your email first');
    }

    const payload = { sub: user.id, email: user.email };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
