import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config'; // for env
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { BookmarksModule } from './bookmarks/bookmarks.module';
import { TagsModule } from './tags/tags.module';
import { User } from './users/entities/user.entity';
import { Bookmark } from './bookmarks/entities/bookmark.entity';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost', // Connecting from machine to Docker
      port: 5434,
      username: 'user',
      password: 'password123',
      database: 'bookmark_manager',
      entities: [User, Bookmark],
      synchronize: true, // auto-creates tables
    }),
    ConfigModule.forRoot({ isGlobal: true }),
    UsersModule,
    BookmarksModule,
    TagsModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
