import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, MoreThan, Not, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
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
    private mailService: MailService,
  ) {}

  async register(registerDto: RegisterDto): Promise<void> {
    const { email, password } = registerDto;

    const exisitingUser = await this.usersRepository.findOne({
      where: { email },
    });

    if (exisitingUser) {
      throw new UnauthorizedException('Email already in use');
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenHash = await bcrypt.hash(verificationToken, 10);

    // Set token expiration (e.g., 1 hour)
    const tokenExpires = new Date();
    tokenExpires.setHours(tokenExpires.getHours() + 1);

    console.log('Token:', verificationToken);
    const user = this.usersRepository.create({
      email,
      password: hashedPassword,
      verificationTokenHash,
      isVerified: false,
      verificationTokenExpires: tokenExpires,
    });

    await this.usersRepository.save(user);
    // await this.mailService.sendVerificationEmail(email, verificationToken);

    console.log(
      `Please use this verification token for ${email}: ${verificationToken}`,
    );
  }

  async verifyEmail(token: string): Promise<void> {
    const unverifiedUsers = await this.usersRepository.find({
      where: {
        isVerified: false,
        verificationTokenHash: Not(IsNull()),
        verificationTokenExpires: MoreThan(new Date()),
      },
    });

    let verifiedUser: User | null = null;
    for (const user of unverifiedUsers) {
      console.log(
        'Comparing with user verification token hash:',
        user.verificationTokenHash,
      );

      // Compare the plain token with the stored hashed token
      const tokenIsValid = user.verificationTokenHash
        ? await bcrypt.compare(token, user.verificationTokenHash)
        : false;

      if (tokenIsValid) {
        verifiedUser = user;
        break;
      }
    }

    if (!verifiedUser) {
      throw new NotFoundException('Invalid or expired token');
    }

    // Successfully verified the token
    console.log(`User ${verifiedUser.email} successfully verified`);

    await this.usersRepository.update(verifiedUser.id, {
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
