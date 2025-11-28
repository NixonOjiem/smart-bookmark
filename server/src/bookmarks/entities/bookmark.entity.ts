import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Tag } from '../../tags/entities/tag.entity';

@Entity('bookmarks')
export class Bookmark {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column()
  url: string;

  @Column({ nullable: true }) // Description is optional
  description: string;

  @CreateDateColumn()
  createdAt: Date;

  // Relation: Many Bookmarks belong to One User
  @ManyToOne(() => User, (user) => user.bookmarks, { onDelete: 'CASCADE' }) // If User is deleted, delete their bookmarks
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string; // for API filtering

  // Relation: Many-to-Many with Tags
  @ManyToMany(() => Tag, (tag) => tag.bookmarks, { onDelete: 'CASCADE' })
  @JoinTable() // This creates the pivot table (bookmark_tags) automatically
  tags: Tag[];
}
