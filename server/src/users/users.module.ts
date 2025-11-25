import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User])], // <--- THIS IS THE MISSING PART
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService], // We export this so BookmarksModule can use it later
})
export class UsersModule {}
