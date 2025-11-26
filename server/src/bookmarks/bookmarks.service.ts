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

    const existingBookmark = await this.bookmarkRepository.findOne({
      where: { url, user: { id: userId } },
    });

    if (existingBookmark) {
      throw new ConflictException('You have already bookmarked this URL.');
    }

    // FIX: Add explicit type ': Tag[]' here
    const tagEntities: Tag[] = [];

    if (tags && tags.length > 0) {
      for (const tagName of tags) {
        let tag = await this.tagRepository.findOne({
          where: { name: tagName },
        });
        if (!tag) {
          tag = this.tagRepository.create({ name: tagName });
          await this.tagRepository.save(tag);
        }
        tagEntities.push(tag);
      }
    }

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
    const bookmark = await this.findOne(id, userId);
    Object.assign(bookmark, updateBookmarkDto);
    return this.bookmarkRepository.save(bookmark);
  }

  async remove(id: string, userId: string) {
    const bookmark = await this.findOne(id, userId);
    return this.bookmarkRepository.remove(bookmark);
  }
}
