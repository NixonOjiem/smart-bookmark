import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateBookmarkDto } from './dto/create-bookmark.dto';
import { UpdateBookmarkDto } from './dto/update-bookmark.dto';
import { Bookmark } from './entities/bookmark.entity';
import { Tag } from '../tags/entities/tag.entity';
import { AutoTaggingService } from './auto-tagging.service';

@Injectable()
export class BookmarksService {
  private readonly logger = new Logger(BookmarksService.name);

  constructor(
    @InjectRepository(Bookmark)
    private bookmarkRepository: Repository<Bookmark>,
    @InjectRepository(Tag)
    private tagRepository: Repository<Tag>,
    private autoTaggingService: AutoTaggingService,
  ) {}

  async create(createBookmarkDto: CreateBookmarkDto, userId: string) {
    const { url, tags, ...rest } = createBookmarkDto;

    // Check if Bookmark exists for THIS user
    const existingBookmark = await this.bookmarkRepository.findOne({
      where: { url, user: { id: userId } },
    });

    if (existingBookmark) {
      throw new ConflictException('You have already bookmarked this URL.');
    }

    // --- AUTO TAGGING LOGIC ---
    let finalTags = tags || [];
    let finalTitle = rest.title;

    // If no tags were provided, try to auto-generate them
    if (finalTags.length === 0) {
      try {
        this.logger.log(`Auto-tagging triggered for: ${url}`);
        const aiResult = await this.autoTaggingService.generateTags(url);

        // Use AI tags
        finalTags = aiResult.tags;

        // If user didn't provide a title, use the one found by scraping
        if (!finalTitle) {
          finalTitle = aiResult.title;
        }
      } catch (error) {
        // If AI fails, log it but don't stop the bookmark creation.

        const errorMessage =
          error instanceof Error ? error.message : String(error);

        this.logger.warn(`Auto-tagging failed: ${errorMessage}`);
      }
    }

    // Resolve Tags (User-Scoped) using the "finalTags" variable
    const tagEntities = await this.preloadTagsByName(finalTags, userId);

    const bookmark = this.bookmarkRepository.create({
      url,
      ...rest,
      title: finalTitle,
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
    // Load the existing bookmark
    const bookmark = await this.findOne(id, userId);

    // Separate tags from the rest of the data
    const { tags, ...rest } = updateBookmarkDto;

    // If tags are being updated, resolve them to Entities
    if (tags) {
      const tagEntities = await this.preloadTagsByName(tags, userId);
      bookmark.tags = tagEntities;
    }

    // Update other fields
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
    if (!tagNames || tagNames.length === 0) {
      return [];
    }

    const entities: Tag[] = [];

    for (const tagName of tagNames) {
      // Normalize tag: lowercase and trim to prevent "React" vs "react"
      const cleanName = tagName.trim().toLowerCase();

      let tag = await this.tagRepository.findOne({
        where: {
          name: cleanName,
          user: { id: userId },
        },
      });

      if (!tag) {
        tag = this.tagRepository.create({
          name: cleanName,
          user: { id: userId },
        });
        await this.tagRepository.save(tag);
      }

      entities.push(tag);
    }
    return entities;
  }
}
