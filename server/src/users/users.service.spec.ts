import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { ConflictException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Repository, ObjectLiteral } from 'typeorm';
type MockRepository<T extends ObjectLiteral = any> = Partial<
  Record<keyof Repository<T>, jest.Mock>
>;

// --- MOCK BCRYPT ---
// This prevents actual hashing and allows us to spy on calls
jest.mock('bcrypt', () => ({
  genSalt: jest.fn().mockResolvedValue('somesalt'),
  hash: jest.fn().mockResolvedValue('hashedpassword'),
}));

describe('UsersService', () => {
  let service: UsersService;
  let repository: MockRepository<User>;

  // Define the mock repository methods we need
  const mockUsersRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    findOneBy: jest.fn(),
    merge: jest.fn(),
    delete: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUsersRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get(getRepositoryToken(User));

    // Clear mock history before every test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // --- CREATE ---
  describe('create', () => {
    const createUserDto = {
      email: 'test@test.com',
      password: 'password123',
      name: 'Test User',
    };

    it('should successfully create a user if email does not exist', async () => {
      // Mock that no user exists
      mockUsersRepository.findOne.mockResolvedValue(null);
      // Mock the create method to return an entity object
      mockUsersRepository.create.mockReturnValue(createUserDto);
      // Mock the save method
      mockUsersRepository.save.mockResolvedValue({ id: '1', ...createUserDto });

      const result = await service.create(createUserDto);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { email: createUserDto.email },
      });
      expect(repository.save).toHaveBeenCalled();
      expect(result).toEqual({ id: '1', ...createUserDto });
    });

    it('should throw ConflictException if email already exists', async () => {
      // Mock that a user DOES exist
      mockUsersRepository.findOne.mockResolvedValue({
        id: '1',
        email: 'test@test.com',
      });

      await expect(service.create(createUserDto)).rejects.toThrow(
        ConflictException,
      );
      expect(repository.save).not.toHaveBeenCalled();
    });
  });

  // --- FIND ALL ---
  describe('findAll', () => {
    it('should return an array of users', async () => {
      const usersArray = [{ id: '1', name: 'Test' }];
      mockUsersRepository.find.mockResolvedValue(usersArray);

      const result = await service.findAll();
      expect(result).toEqual(usersArray);
    });
  });

  // --- FIND ONE ---
  describe('findOne', () => {
    it('should return a user by ID', async () => {
      const user = { id: '1', name: 'Test' };
      mockUsersRepository.findOne.mockResolvedValue(user);

      const result = await service.findOne('1');
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
        relations: ['bookmarks'],
      });
      expect(result).toEqual(user);
    });
  });

  // --- FIND ONE BY EMAIL ---
  describe('findOneByEmail', () => {
    it('should return a user with specific fields selected', async () => {
      const user = { id: '1', email: 'test@test.com' } as User;
      mockUsersRepository.findOne.mockResolvedValue(user);

      await service.findOneByEmail('test@test.com');

      expect(repository.findOne).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { email: 'test@test.com' },

          select: [
            'id',
            'email',
            'name',
            'password',
            'role',
            'createdAt',
            'resetToken',
            'resetTokenExpiry',
          ],
        }),
      );
    });
  });

  // --- UPDATE ---
  describe('update', () => {
    const updateUserDto = { name: 'Updated Name', password: 'newpassword' };
    const existingUser = { id: '1', name: 'Old Name', password: 'oldhash' };

    it('should update a user and hash password if provided', async () => {
      // Mock finding the user
      mockUsersRepository.findOneBy.mockResolvedValue(existingUser);
      // Mock merge
      mockUsersRepository.merge.mockReturnValue({
        ...existingUser,
        ...updateUserDto,
        password: 'hashedpassword',
      });
      // Mock save
      mockUsersRepository.save.mockResolvedValue({
        ...existingUser,
        ...updateUserDto,
        password: 'hashedpassword',
      });

      await service.update('1', updateUserDto);

      // Verify Bcrypt was called because password was provided
      expect(bcrypt.genSalt).toHaveBeenCalled();
      expect(bcrypt.hash).toHaveBeenCalledWith('newpassword', 'somesalt');

      expect(repository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if user to update does not exist', async () => {
      mockUsersRepository.findOneBy.mockResolvedValue(null);

      await expect(service.update('99', updateUserDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should not hash password if not provided in dto', async () => {
      const dtoWithoutPass = { name: 'Just Name' };
      mockUsersRepository.findOneBy.mockResolvedValue(existingUser);
      mockUsersRepository.merge.mockReturnValue({
        ...existingUser,
        ...dtoWithoutPass,
      });
      mockUsersRepository.save.mockResolvedValue({
        ...existingUser,
        ...dtoWithoutPass,
      });

      await service.update('1', dtoWithoutPass);

      // Verify Bcrypt was NOT called
      expect(bcrypt.hash).not.toHaveBeenCalled();
    });
  });

  // --- REMOVE ---
  describe('remove', () => {
    it('should delete a user if found', async () => {
      // Mock finding the user first (service.remove calls this.findOne)
      // Note: service.remove calls `this.findOne`, which calls `repo.findOne`
      mockUsersRepository.findOne.mockResolvedValue({ id: '1' });
      mockUsersRepository.delete.mockResolvedValue({ affected: 1 });

      await service.remove('1');
      expect(repository.delete).toHaveBeenCalledWith('1');
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUsersRepository.findOne.mockResolvedValue(null);

      await expect(service.remove('99')).rejects.toThrow(NotFoundException);
      expect(repository.delete).not.toHaveBeenCalled();
    });
  });

  // --- RESET TOKEN METHODS ---
  describe('setResetToken', () => {
    it('should update user with token and expiry', async () => {
      const date = new Date();
      await service.setResetToken('1', '123456', date);

      expect(repository.update).toHaveBeenCalledWith('1', {
        resetToken: '123456',
        resetTokenExpiry: date,
      });
    });
  });

  describe('updatePasswordAndClearToken', () => {
    it('should update password and clear tokens', async () => {
      await service.updatePasswordAndClearToken('1', 'newhashedpass');

      expect(repository.update).toHaveBeenCalledWith('1', {
        password: 'newhashedpass',
        resetToken: null,
        resetTokenExpiry: null,
      });
    });
  });
});
