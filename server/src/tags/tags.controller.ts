import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards, // <--- Import this
  Req, // <--- Import this
} from '@nestjs/common';
import { TagsService } from './tags.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard'; // <--- Import Guard
import type { JwtRequest } from '../auth/interfaces/jwt-request.interface'; // <--- Import Interface

@UseGuards(JwtAuthGuard) // <--- Protect all routes in this controller
@Controller('/v1/tags') // I removed '/v1' to be consistent with bookmarks, add it back if you prefer
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Post()
  create(@Body() createTagDto: CreateTagDto, @Req() req: JwtRequest) {
    // FIX: Pass req.user.userId
    return this.tagsService.create(createTagDto, req.user.userId);
  }

  @Get()
  findAll(@Req() req: JwtRequest) {
    // FIX: Pass req.user.userId
    return this.tagsService.findAll(req.user.userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: JwtRequest) {
    // FIX: Pass req.user.userId
    return this.tagsService.findOne(+id, req.user.userId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateTagDto: UpdateTagDto,
    @Req() req: JwtRequest, // <--- Inject Request
  ) {
    // FIX: Pass req.user.userId
    return this.tagsService.update(+id, updateTagDto, req.user.userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: JwtRequest) {
    // FIX: Pass req.user.userId
    return this.tagsService.remove(+id, req.user.userId);
  }
}
