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
@Controller('/v1/bookmarks')
export class BookmarksController {
  constructor(private readonly bookmarksService: BookmarksService) {}

  @Post()
  create(@Body() createBookmarkDto: CreateBookmarkDto, @Req() req: JwtRequest) {
    console.log('Request user:', req.user);
    console.log('User sub:', req.user?.userId); // sub is id
    return this.bookmarksService.create(createBookmarkDto, req.user.userId);
  }

  @Get()
  findAll(@Req() req: JwtRequest) {
    return this.bookmarksService.findAll(req.user.userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: JwtRequest) {
    return this.bookmarksService.findOne(id, req.user.userId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateBookmarkDto: UpdateBookmarkDto,
    @Req() req: JwtRequest,
  ) {
    return this.bookmarksService.update(id, updateBookmarkDto, req.user.userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: JwtRequest) {
    return this.bookmarksService.remove(id, req.user.userId);
  }
}
