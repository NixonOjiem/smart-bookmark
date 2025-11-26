import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';

import { Bookmark } from '../../bookmarks/entities/bookmark.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true }) // Logical Constraint: No duplicate emails
  email: string;

  @Column()
  name: string;

  @Column({ select: false }) // Security: password is not returened in queries
  password: string;

  @Column({ default: 'user' }) // New Role Column (Defaults to 'user')
  role: string;

  @CreateDateColumn()
  createdAt: Date;

  // Relation: One User has Many Bookmarks
  @OneToMany(() => Bookmark, (bookmark) => bookmark.user)
  bookmarks: Bookmark[];
}
