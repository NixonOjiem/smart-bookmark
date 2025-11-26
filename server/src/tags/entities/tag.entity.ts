import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  ManyToMany,
  Unique,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Bookmark } from '../../bookmarks/entities/bookmark.entity';

@Entity()
@Unique(['name', 'user'])
export class Tag {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @ManyToOne(() => User, (user) => user.tags, { onDelete: 'CASCADE' })
  user: User;

  @ManyToMany(() => Bookmark, (bookmark) => bookmark.tags)
  bookmarks: Bookmark[];
}
