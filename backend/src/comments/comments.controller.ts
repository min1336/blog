import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller()
export class CommentsController {
  constructor(private commentsService: CommentsService) {}

  @Get('posts/:slug/comments')
  findByPostSlug(@Param('slug') slug: string) {
    return this.commentsService.findByPostSlug(slug);
  }

  @Post('posts/:slug/comments')
  create(@Param('slug') slug: string, @Body() dto: CreateCommentDto) {
    return this.commentsService.create(slug, dto);
  }

  @Patch('comments/:id')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  update(@Param('id') id: string, @Body() dto: UpdateCommentDto) {
    return this.commentsService.update(+id, dto);
  }

  @Delete('comments/:id')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  remove(@Param('id') id: string, @Body('password') password: string) {
    return this.commentsService.remove(+id, password);
  }

  @Delete('admin/comments/:id')
  @UseGuards(JwtAuthGuard)
  adminRemove(@Param('id') id: string) {
    return this.commentsService.remove(+id, undefined, true);
  }

  @Get('admin/comments')
  @UseGuards(JwtAuthGuard)
  findAll() {
    return this.commentsService.findAll();
  }
}
