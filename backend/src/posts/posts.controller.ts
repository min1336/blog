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
    // 비숫자 page 입력(NaN) 방어: parseInt 실패 시 1로 폴백
    const safePage = Math.max(1, parseInt(page || '1') || 1);
    // limit 상한 100 적용: 대량 조회 요청 차단
    const safeLimit = Math.min(100, Math.max(1, parseInt(limit || '10') || 10));

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
