import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { User } from '../users/entities/user.entity';
import { EmailService } from '../email/email.service';
import { BadRequestException } from '@nestjs/common';
@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private emailService: EmailService,
  ) {}

  // Return explicit 'User' or 'null'
  async validateUser(email: string, pass: string): Promise<User | null> {
    const user = await this.usersService.findOneByEmail(email);

    // DEBUGGING LOGS
    console.log('1. Trying to find user:', email);
    console.log('2. User found in DB?', !!user);

    // Check if user exists AND password matches
    if (user && (await bcrypt.compare(pass, user.password))) {
      // Destructure to remove password from the result
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _password, ...result } = user;
      return result as User;
    }
    return null;
  }

  async forgotPassword(email: string) {
    const user = await this.usersService.findOneByEmail(email);
    if (!user) {
      // Security: Not revealing if user is available.
      return { message: 'If that email exists, we sent a code.' };
    }

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Set Expiry (15 mins from now)
    const expiry = new Date();
    expiry.setMinutes(expiry.getMinutes() + 15);
    await this.usersService.setResetToken(user.id, code, expiry);

    // Send Email
    await this.emailService.sendResetCode(email, code);

    return { message: 'Code sent to email' };
  }

  // STEP 2: Verify & Reset
  async resetPassword(email: string, code: string, newPassword: string) {
    const user: User | null = await this.usersService.findOneByEmail(email);

    if (
      !user ||
      user.resetToken !== code ||
      !user.resetTokenExpiry ||
      new Date() > user.resetTokenExpiry
    ) {
      throw new BadRequestException('Invalid or expired reset code');
    }

    // Hash new password
    const salt = await bcrypt.genSalt();
    const hash = await bcrypt.hash(newPassword, salt);

    await this.usersService.updatePasswordAndClearToken(user.id, hash);

    // Auto-Login: Generate Token
    const payload = { email: user.email, sub: user.id, role: user.role };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }

  // 2. Login - NOW INCLUDES ROLE AND NAME
  login(user: User) {
    const payload = {
      // email: user.email,
      sub: user.id,
      name: user.name,
      role: user.role,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }

  // 3. Signup
  async signup(createUserDto: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const newUser = await this.usersService.create({
      ...createUserDto,
      password: hashedPassword,
    });
    return this.login(newUser);
  }
}
