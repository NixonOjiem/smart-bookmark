import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm'; // 1. Import TypeOrmModule
import { TagsService } from './tags.service';
import { TagsController } from './tags.controller';
import { Tag } from './entities/tag.entity'; // 2. Import your Entity

@Module({
  // 3. Register the entity here
  imports: [TypeOrmModule.forFeature([Tag])],
  controllers: [TagsController],
  providers: [TagsService],
  // 4. Export the TypeOrmModule if other modules (like Bookmarks) need to use the Tag Repository
  exports: [TagsService, TypeOrmModule],
})
export class TagsModule {}
