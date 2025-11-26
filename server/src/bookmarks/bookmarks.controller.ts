import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Req,
} from '@nestjs/common';
import { BookmarksService } from './bookmarks.service';
import { CreateBookmarkDto } from './dto/create-bookmark.dto';
import { UpdateBookmarkDto } from './dto/update-bookmark.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { JwtRequest } from 'src/auth/interfaces/jwt-request.interface';

@UseGuards(JwtAuthGuard)
@Controller('bookmarks')
export class BookmarksController {
  constructor(private readonly bookmarksService: BookmarksService) {}

  @Post()
  create(@Body() createBookmarkDto: CreateBookmarkDto, @Req() req: JwtRequest) {
    return this.bookmarksService.create(createBookmarkDto, req.user.sub);
  }

  @Get()
  findAll(@Req() req: JwtRequest) {
    return this.bookmarksService.findAll(req.user.sub);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: JwtRequest) {
    return this.bookmarksService.findOne(id, req.user.sub);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateBookmarkDto: UpdateBookmarkDto,
    @Req() req: JwtRequest,
  ) {
    return this.bookmarksService.update(id, updateBookmarkDto, req.user.sub);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: JwtRequest) {
    return this.bookmarksService.remove(id, req.user.sub);
  }
}
