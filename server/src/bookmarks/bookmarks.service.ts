import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateBookmarkDto } from './dto/create-bookmark.dto';
import { UpdateBookmarkDto } from './dto/update-bookmark.dto';
import { Bookmark } from './entities/bookmark.entity';
import { Tag } from '../tags/entities/tag.entity';

@Injectable()
export class BookmarksService {
  constructor(
    @InjectRepository(Bookmark)
    private bookmarkRepository: Repository<Bookmark>,
    @InjectRepository(Tag)
    private tagRepository: Repository<Tag>,
  ) {}

  async create(createBookmarkDto: CreateBookmarkDto, userId: string) {
    const { url, tags, ...rest } = createBookmarkDto;

    // 1. Check if Bookmark exists for THIS user
    const existingBookmark = await this.bookmarkRepository.findOne({
      where: { url, user: { id: userId } },
    });

    if (existingBookmark) {
      throw new ConflictException('You have already bookmarked this URL.');
    }

    // 2. Resolve Tags (User-Scoped)
    const tagEntities = await this.preloadTagsByName(tags, userId);

    const bookmark = this.bookmarkRepository.create({
      url,
      ...rest,
      user: { id: userId },
      tags: tagEntities,
    });

    return this.bookmarkRepository.save(bookmark);
  }

  findAll(userId: string) {
    return this.bookmarkRepository.find({
      where: { user: { id: userId } },
      relations: ['tags'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, userId: string) {
    const bookmark = await this.bookmarkRepository.findOne({
      where: { id, user: { id: userId } },
      relations: ['tags'],
    });
    if (!bookmark) throw new NotFoundException('Bookmark not found');
    return bookmark;
  }

  async update(
    id: string,
    updateBookmarkDto: UpdateBookmarkDto,
    userId: string,
  ) {
    // 1. Load the existing bookmark
    const bookmark = await this.findOne(id, userId);

    // 2. Separate tags from the rest of the data
    const { tags, ...rest } = updateBookmarkDto;

    // 3. If tags are being updated, resolve them to Entities
    if (tags) {
      const tagEntities = await this.preloadTagsByName(tags, userId);
      bookmark.tags = tagEntities;
    }

    // 4. Update other fields
    Object.assign(bookmark, rest);

    return this.bookmarkRepository.save(bookmark);
  }

  async remove(id: string, userId: string) {
    const bookmark = await this.findOne(id, userId);
    return this.bookmarkRepository.remove(bookmark);
  }

  // --- HELPER METHOD ---
  private async preloadTagsByName(
    tagNames: string[] | undefined,
    userId: string,
  ): Promise<Tag[]> {
    // This check handles the undefined case safely
    if (!tagNames || tagNames.length === 0) {
      return [];
    }

    const entities: Tag[] = [];

    for (const tagName of tagNames) {
      let tag = await this.tagRepository.findOne({
        where: {
          name: tagName,
          user: { id: userId },
        },
      });

      if (!tag) {
        tag = this.tagRepository.create({
          name: tagName,
          user: { id: userId },
        });
        await this.tagRepository.save(tag);
      }

      entities.push(tag);
    }
    return entities;
  }
}
