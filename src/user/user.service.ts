import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { WalletService } from '../wallet/wallet.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private walletService: WalletService,
  ) {}

  private async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const { email, password } = createUserDto;

    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: { email },
    });
    if (existingUser) {
      throw new ConflictException('Email already in use');
    }

    try {
      const hashedPassword = await this.hashPassword(password);
      const user = this.userRepository.create({
        email,
        password: hashedPassword,
        isVerified: false,
      });

      const savedUser = await this.userRepository.save(user);

      // Create initial wallet
      await this.walletService.createInitialWallet(savedUser.id);

      return savedUser;
    } catch {
      throw new InternalServerErrorException('Failed to create user');
    }
  }

  async findUserById(id: number): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id },
      relations: ['wallets', 'transactions'],
    });
  }

  async findUserByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email },
      select: [
        'id',
        'email',
        'password',
        'isVerified',
        'verificationTokenHash',
      ],
    });
  }

  async updateUser(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findUserById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (updateUserDto.password) {
      updateUserDto.password = await this.hashPassword(updateUserDto.password);
    }

    try {
      await this.userRepository.update(id, updateUserDto);
      const updatedUser = await this.findUserById(id);
      if (!updatedUser) {
        throw new InternalServerErrorException(
          'Failed to retrieve updated user',
        );
      }
      return updatedUser;
    } catch {
      throw new InternalServerErrorException('Failed to update user');
    }
  }

  async markEmailAsVerified(email: string): Promise<void> {
    const result = await this.userRepository.update(
      { email },
      {
        isVerified: true,
        verificationTokenHash: undefined,
        // verificationTokenExpires: null,
      },
    );

    if (result.affected === 0) {
      throw new NotFoundException('User not found');
    }
  }

  async setVerificationToken(
    userId: number,
    token: string,
    expiresAt: Date,
  ): Promise<void> {
    const hashedToken = await this.hashPassword(token);
    await this.userRepository.update(userId, {
      verificationTokenHash: hashedToken,
      verificationTokenExpires: expiresAt,
    });
  }

  async getUserWithWallets(userId: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['wallets'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async deleteUser(id: number): Promise<void> {
    const result = await this.userRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('User not found');
    }
  }

  async comparePassword(user: User, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.password);
  }
}
