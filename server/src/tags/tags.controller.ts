import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { TagsService } from './tags.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { JwtRequest } from '../auth/interfaces/jwt-request.interface';

@UseGuards(JwtAuthGuard)
@Controller('/v1/tags')
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Post()
  create(@Body() createTagDto: CreateTagDto, @Req() req: JwtRequest) {
    return this.tagsService.create(createTagDto, req.user.userId);
  }

  @Get()
  findAll(@Req() req: JwtRequest) {
    return this.tagsService.findAll(req.user.userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: JwtRequest) {
    return this.tagsService.findOne(+id, req.user.userId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateTagDto: UpdateTagDto,
    @Req() req: JwtRequest,
  ) {
    return this.tagsService.update(+id, updateTagDto, req.user.userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: JwtRequest) {
    return this.tagsService.remove(+id, req.user.userId);
  }
}
