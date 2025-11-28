import { Test, TestingModule } from '@nestjs/testing';
import { BookmarksController } from './bookmarks.controller';
import { BookmarksService } from './bookmarks.service';
import { CreateBookmarkDto } from './dto/create-bookmark.dto';
import { UpdateBookmarkDto } from './dto/update-bookmark.dto';
import { JwtRequest } from '../auth/interfaces/jwt-request.interface';

describe('BookmarksController', () => {
  let controller: BookmarksController;

  // Create a mock for the Service
  const mockBookmarksService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  // Define a mock User/Request object to reuse
  const mockUserId = 'user-123-uuid';
  const mockRequest = {
    user: {
      userId: mockUserId,
      email: 'test@example.com',
    },
  } as unknown as JwtRequest;

  const mockBookmark = {
    id: 'bookmark-1',
    title: 'NestJS Docs',
    link: 'https://docs.nestjs.com',
    userId: mockUserId,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BookmarksController],
      providers: [
        {
          provide: BookmarksService,
          useValue: mockBookmarksService,
        },
      ],
    }).compile();

    controller = module.get<BookmarksController>(BookmarksController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a bookmark', async () => {
      const dto: CreateBookmarkDto = {
        title: 'New Bookmark',
        url: 'https://google.com',
      };

      // Mock the service return value
      mockBookmarksService.create.mockResolvedValue(mockBookmark);

      const result = await controller.create(dto, mockRequest);

      // Assertions
      expect(result).toEqual(mockBookmark);
      expect(mockBookmarksService.create).toHaveBeenCalledWith(dto, mockUserId);
    });
  });

  describe('findAll', () => {
    it('should return an array of bookmarks for the user', async () => {
      const bookmarksArray = [mockBookmark];
      mockBookmarksService.findAll.mockResolvedValue(bookmarksArray);

      const result = await controller.findAll(mockRequest);

      expect(result).toEqual(bookmarksArray);
      expect(mockBookmarksService.findAll).toHaveBeenCalledWith(mockUserId);
    });
  });

  describe('findOne', () => {
    it('should return a single bookmark', async () => {
      mockBookmarksService.findOne.mockResolvedValue(mockBookmark);

      const result = await controller.findOne('bookmark-1', mockRequest);

      expect(result).toEqual(mockBookmark);
      expect(mockBookmarksService.findOne).toHaveBeenCalledWith(
        'bookmark-1',
        mockUserId,
      );
    });
  });

  describe('update', () => {
    it('should update a bookmark', async () => {
      const dto: UpdateBookmarkDto = { title: 'Updated Title' };
      const updatedBookmark = { ...mockBookmark, ...dto };

      mockBookmarksService.update.mockResolvedValue(updatedBookmark);

      const result = await controller.update('bookmark-1', dto, mockRequest);

      expect(result).toEqual(updatedBookmark);
      expect(mockBookmarksService.update).toHaveBeenCalledWith(
        'bookmark-1',
        dto,
        mockUserId,
      );
    });
  });

  describe('remove', () => {
    it('should remove a bookmark', async () => {
      const deleteResponse = { deleted: true };
      mockBookmarksService.remove.mockResolvedValue(deleteResponse);

      const result = await controller.remove('bookmark-1', mockRequest);

      expect(result).toEqual(deleteResponse);
      expect(mockBookmarksService.remove).toHaveBeenCalledWith(
        'bookmark-1',
        mockUserId,
      );
    });
  });
});
