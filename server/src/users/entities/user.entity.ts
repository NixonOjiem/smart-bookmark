import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';

import { Bookmark } from '../../bookmarks/entities/bookmark.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true }) // Logical Constraint: No duplicate emails
  email: string;

  @Column()
  name: string;

  @CreateDateColumn()
  createdAt: Date;

  // Relation: One User has Many Bookmarks
  @OneToMany(() => Bookmark, (bookmark) => bookmark.user)
  bookmarks: Bookmark[];
}
