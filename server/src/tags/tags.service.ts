import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { Tag } from './entities/tag.entity';

@Injectable()
export class TagsService {
  constructor(
    @InjectRepository(Tag)
    private tagRepository: Repository<Tag>,
  ) {}

  async create(createTagDto: CreateTagDto, userId: string) {
    // 1. Check if tag already exists FOR THIS USER
    const existing = await this.tagRepository.findOne({
      where: {
        name: createTagDto.name,
        user: { id: userId },
      },
    });

    if (existing) throw new ConflictException('You already have this tag');

    // 2. Create new tag linked to user
    // FIX: Do not use '...createTagDto'. Map 'name' explicitly to satisfy the linter.
    const tag = this.tagRepository.create({
      name: createTagDto.name,
      user: { id: userId },
    });

    return this.tagRepository.save(tag);
  }

  findAll(userId: string) {
    return this.tagRepository.find({
      where: { user: { id: userId } },
      order: { name: 'ASC' },
    });
  }

  async findOne(id: number, userId: string) {
    const tag = await this.tagRepository.findOne({
      where: { id, user: { id: userId } },
    });
    if (!tag) throw new NotFoundException(`Tag #${id} not found`);
    return tag;
  }

  async update(id: number, updateTagDto: UpdateTagDto, userId: string) {
    const tag = await this.findOne(id, userId);

    // Ideally, explicit assignment is safer here too, but Object.assign is usually allowed.
    // If this throws an error later, change it to: tag.name = updateTagDto.name;
    if (updateTagDto.name) {
      tag.name = updateTagDto.name;
    }

    return this.tagRepository.save(tag);
  }

  async remove(id: number, userId: string) {
    const result = await this.tagRepository.delete({
      id,
      user: { id: userId },
    });
    if (result.affected === 0) {
      throw new NotFoundException(`Tag #${id} not found`);
    }
    return { deleted: true };
  }
}
