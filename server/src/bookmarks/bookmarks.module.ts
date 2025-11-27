import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookmarksService } from './bookmarks.service';
import { BookmarksController } from './bookmarks.controller';
import { Bookmark } from './entities/bookmark.entity';
import { Tag } from '../tags/entities/tag.entity';
import { AutoTaggingService } from './auto-tagging.service';

@Module({
  imports: [TypeOrmModule.forFeature([Bookmark, Tag])],
  controllers: [BookmarksController],
  providers: [BookmarksService, AutoTaggingService],
})
export class BookmarksModule {}
