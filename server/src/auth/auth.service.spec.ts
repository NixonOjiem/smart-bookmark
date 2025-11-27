import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { EmailService } from '../email/email.service';
import { BadRequestException } from '@nestjs/common';
import { User } from '../users/entities/user.entity';

// MOCK BCRYPT GLOBALLY
jest.mock('bcrypt');
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<Partial<UsersService>>;
  let jwtService: jest.Mocked<Partial<JwtService>>;
  let emailService: jest.Mocked<Partial<EmailService>>;

  const mockUser = {
    id: 'user-123',
    email: 'test@test.com',
    password: '$2b$10$hashedpassword',
    name: 'Test User',
    role: 'user',
    resetToken: '123456',
    // Ensure expiry is in the future
    resetTokenExpiry: new Date(Date.now() + 1000 * 60 * 15),
    createdAt: new Date(),
    bookmarks: [],
  } as unknown as User;

  beforeEach(async () => {
    // Define mock implementations
    const mockUsersServiceObj = {
      findOneByEmail: jest.fn(),
      create: jest.fn(),
      setResetToken: jest.fn(),
      updatePasswordAndClearToken: jest.fn(),
    };

    const mockJwtServiceObj = {
      sign: jest.fn().mockReturnValue('fake_jwt_token'),
    };

    const mockEmailServiceObj = {
      sendResetCode: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersServiceObj },
        { provide: JwtService, useValue: mockJwtServiceObj },
        { provide: EmailService, useValue: mockEmailServiceObj },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get(UsersService);
    jwtService = module.get(JwtService);
    emailService = module.get(EmailService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return user result without password if password matches', async () => {
      // Mock User Found
      (usersService.findOneByEmail as jest.Mock).mockResolvedValue(mockUser);

      // Mock Bcrypt Compare (Success)
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser(
        'test@test.com',
        'plainpassword',
      );

      expect(result).toEqual(expect.objectContaining({ id: 'user-123' }));
      expect(result).not.toHaveProperty('password');
    });

    it('should return null if password does not match', async () => {
      (usersService.findOneByEmail as jest.Mock).mockResolvedValue(mockUser);
      // Mock Bcrypt Compare (Fail)
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await service.validateUser(
        'test@test.com',
        'wrongpassword',
      );
      expect(result).toBeNull();
    });

    it('should return null if user not found', async () => {
      (usersService.findOneByEmail as jest.Mock).mockResolvedValue(null);
      const result = await service.validateUser('unknown@test.com', 'any');
      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should return access_token and user info', () => {
      const result = service.login(mockUser);
      expect(result).toHaveProperty('access_token', 'fake_jwt_token');
      expect(result).toHaveProperty('user');
      expect(jwtService.sign).toHaveBeenCalled();
    });
  });

  describe('signup', () => {
    it('should hash password and create user', async () => {
      const dto = { email: 'new@test.com', password: '123', name: 'New' };

      // Mock Bcrypt Hash
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_123');

      // Mock Create to return the new user object
      (usersService.create as jest.Mock).mockResolvedValue({
        ...dto,
        id: '1',
        password: 'hashed_123',
        role: 'user',
      });

      await service.signup(dto);

      expect(bcrypt.hash).toHaveBeenCalledWith('123', 10);
      expect(usersService.create).toHaveBeenCalledWith({
        ...dto,
        password: 'hashed_123',
      });
    });
  });

  describe('forgotPassword', () => {
    it('should generate token and send email if user exists', async () => {
      (usersService.findOneByEmail as jest.Mock).mockResolvedValue(mockUser);

      await service.forgotPassword('test@test.com');

      expect(usersService.setResetToken).toHaveBeenCalled();
      expect(emailService.sendResetCode).toHaveBeenCalledWith(
        'test@test.com',
        expect.any(String),
      );
    });

    it('should NOT send email if user does not exist', async () => {
      (usersService.findOneByEmail as jest.Mock).mockResolvedValue(null);

      await service.forgotPassword('ghost@test.com');

      expect(emailService.sendResetCode).not.toHaveBeenCalled();
    });
  });

  describe('resetPassword', () => {
    it('should throw BadRequest if token is mismatch', async () => {
      const badUser = { ...mockUser, resetToken: '999999' };
      (usersService.findOneByEmail as jest.Mock).mockResolvedValue(badUser);

      await expect(
        service.resetPassword('test@test.com', '111111', 'newpass'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequest if token is expired', async () => {
      // Create user with expired token
      const expiredUser = {
        ...mockUser,
        resetToken: '111111',
        resetTokenExpiry: new Date(Date.now() - 10000),
      };
      (usersService.findOneByEmail as jest.Mock).mockResolvedValue(expiredUser);

      await expect(
        service.resetPassword('test@test.com', '111111', 'newpass'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should update password if token is valid', async () => {
      (usersService.findOneByEmail as jest.Mock).mockResolvedValue(mockUser);

      // Mock Bcrypt Hash for new password
      (bcrypt.hash as jest.Mock).mockResolvedValue('new_hashed_pass');

      await service.resetPassword('test@test.com', '123456', 'newpass');

      expect(usersService.updatePasswordAndClearToken).toHaveBeenCalledWith(
        mockUser.id,
        'new_hashed_pass',
      );
    });
  });
});
