import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
// Import the User Entity
import { User } from '../users/entities/user.entity';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<Partial<AuthService>>;

  const mockAuthService = {
    signup: jest.fn(),
    validateUser: jest.fn(),
    login: jest.fn(),
    forgotPassword: jest.fn(),
    resetPassword: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('signin', () => {
    it('should return token if validation succeeds', async () => {
      const loginDto: LoginDto = { email: 'test@test.com', password: '123' };

      const validUser = {
        id: '1',
        email: 'test@test.com',
      } as unknown as User;

      const expectedToken = { access_token: 'xyz', user: validUser };

      // Mock validateUser to return the typed user
      (authService.validateUser as jest.Mock).mockResolvedValue(validUser);
      // Mock login to return the token object
      (authService.login as jest.Mock).mockReturnValue(expectedToken);

      const result = await controller.signin(loginDto);

      expect(authService.validateUser).toHaveBeenCalledWith(
        'test@test.com',
        '123',
      );
      expect(result).toEqual(expectedToken);
    });

    it('should throw UnauthorizedException if validation fails', async () => {
      const loginDto: LoginDto = { email: 'wrong@test.com', password: '123' };

      // Mock validateUser to return null
      (authService.validateUser as jest.Mock).mockResolvedValue(null);

      await expect(controller.signin(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('signup', () => {
    it('should call authService.signup', async () => {
      const dto: CreateUserDto = {
        email: 'a@b.com',
        password: '123',
        name: 'A',
      };
      await controller.signup(dto);
      expect(authService.signup).toHaveBeenCalledWith(dto);
    });
  });

  describe('forgotPassword', () => {
    it('should call authService.forgotPassword', async () => {
      const email = 'test@example.com';
      await controller.forgotPassword(email);
      expect(authService.forgotPassword).toHaveBeenCalledWith(email);
    });
  });

  describe('resetPassword', () => {
    it('should call authService.resetPassword with correct params', async () => {
      const dto: ResetPasswordDto = {
        email: 'test@example.com',
        code: '123456',
        newPassword: 'newPass123',
      };
      await controller.resetPassword(dto);
      expect(authService.resetPassword).toHaveBeenCalledWith(
        dto.email,
        dto.code,
        dto.newPassword,
      );
    });
  });
});
