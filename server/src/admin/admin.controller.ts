import { Controller, Get, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Bookmark } from '../bookmarks/entities/bookmark.entity';
import { Tag } from '../tags/entities/tag.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('v1/admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminController {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Bookmark) private bookmarkRepo: Repository<Bookmark>,
    @InjectRepository(Tag) private tagRepo: Repository<Tag>,
  ) {}

  @Get('stats')
  @Roles('admin')
  async getStats() {
    // Run counts in parallel for speed
    const [users, bookmarks, tags] = await Promise.all([
      this.userRepo.count(),
      this.bookmarkRepo.count(),
      this.tagRepo.count(),
    ]);

    return {
      totalUsers: users,
      totalBookmarks: bookmarks,
      totalTags: tags,
      uptime: 'Healthy', // or process.uptime()
    };
  }
}
