import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('posts')
export class PostsController {
  constructor(private postsService: PostsService) {}

  @Get('meta/stats')
  @UseGuards(JwtAuthGuard)
  getStats() {
    return this.postsService.getStats();
  }

  @Get('meta/categories')
  getCategories() {
    return this.postsService.getCategories();
  }

  @Get('meta/tags')
  getTags() {
    return this.postsService.getTags();
  }

  @Get()
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('category') category?: string,
    @Query('tag') tag?: string,
    @Query('search') search?: string,
  ) {
    // 비숫자 입력 방어 및 page 상한(1000) + limit 상한(100) 적용
    const parsedPage = parseInt(page ?? '1', 10);
    const safePage = Math.min(1000, Math.max(1, isNaN(parsedPage) ? 1 : parsedPage));
    const parsedLimit = parseInt(limit ?? '10', 10);
    const safeLimit = Math.min(100, Math.max(1, isNaN(parsedLimit) ? 10 : parsedLimit));

    return this.postsService.findAll({
      page: safePage,
      limit: safeLimit,
      category,
      tag,
      search,
      published: true,
    });
  }

  @Get(':slug')
  findBySlug(@Param('slug') slug: string) {
    return this.postsService.findBySlug(slug);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() dto: CreatePostDto) {
    return this.postsService.create(dto);
  }

  @Patch(':slug')
  @UseGuards(JwtAuthGuard)
  update(@Param('slug') slug: string, @Body() dto: UpdatePostDto) {
    return this.postsService.update(slug, dto);
  }

  @Delete(':slug')
  @UseGuards(JwtAuthGuard)
  remove(@Param('slug') slug: string) {
    return this.postsService.remove(slug);
  }
}
