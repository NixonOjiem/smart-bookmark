import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';
import { Bookmark } from '../../bookmarks/entities/bookmark.entity';

@Entity('tags')
export class Tag {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @ManyToMany(() => Bookmark, (bookmark) => bookmark.tags)
  bookmarks: Bookmark[];
}
