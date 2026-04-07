import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from './post.entity';
import { Category } from '../categories/category.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

// 검색 최대 길이 제한
const MAX_SEARCH_LENGTH = 100;

/**
 * LIKE 쿼리에서 와일드카드 문자(%, _, \)를 이스케이프하여 SQL 인젝션 방지
 */
function escapeLike(str: string): string {
  return str.replace(/[%_\\]/g, '\\$&');
}

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private postRepo: Repository<Post>,
    @InjectRepository(Category)
    private categoryRepo: Repository<Category>,
  ) {}

  async findAll(query: {
    page?: number;
    limit?: number;
    category?: string;
    tag?: string;
    search?: string;
    published?: boolean;
  }) {
    const { page = 1, limit = 10, category, tag, search, published } = query;

    const qb = this.postRepo.createQueryBuilder('post');

    // 카테고리 관계 eager load
    qb.leftJoinAndSelect('post.categoryEntity', 'cat');

    if (published !== undefined) {
      qb.andWhere('post.published = :published', { published });
    }
    if (category) {
      // category slug로 필터링: 대분류면 하위 소분류 전체, 소분류면 해당만
      const matched = await this.categoryRepo.findOne({
        where: { slug: category },
        relations: ['children'],
      });
      if (matched) {
        if (matched.parent_id === null && matched.children?.length > 0) {
          // 대분류: 자기 자신 + 소분류 모두 포함
          const ids = [matched.id, ...matched.children.map((c) => c.id)];
          qb.andWhere('post.category_id IN (:...ids)', { ids });
        } else {
          qb.andWhere('post.category_id = :categoryId', { categoryId: matched.id });
        }
      }
    }
    if (tag) {
      qb.andWhere('JSON_CONTAINS(post.tags, :tag)', {
        tag: JSON.stringify(tag),
      });
    }
    if (search) {
      // 서비스 레벨에서 길이 제한 적용
      const safeSearch = search.slice(0, MAX_SEARCH_LENGTH);
      qb.andWhere(
        // COALESCE로 summary가 NULL인 경우 빈 문자열로 대체 — NULL OR 조건 묵시적 제외 방지
        '(post.title LIKE :search OR COALESCE(post.summary, \'\') LIKE :search)',
        { search: `%${escapeLike(safeSearch)}%` },
      );
    }

    qb.orderBy('post.created_at', 'DESC');
    qb.skip((page - 1) * limit).take(limit);

    const [data, total] = await qb.getManyAndCount();

    return {
      success: true,
      message: 'success',
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findBySlug(slug: string) {
    const post = await this.postRepo.findOne({
      where: { slug },
      relations: ['categoryEntity'],
    });
    if (!post) throw new NotFoundException('Post not found');

    await this.postRepo.increment({ id: post.id }, 'view_count', 1);
    post.view_count += 1;

    const prevPost = await this.postRepo
      .createQueryBuilder('post')
      .select(['post.slug', 'post.title'])
      .where('post.published = true AND post.created_at < :date', {
        date: post.created_at,
      })
      .orderBy('post.created_at', 'DESC')
      .getOne();

    const nextPost = await this.postRepo
      .createQueryBuilder('post')
      .select(['post.slug', 'post.title'])
      .where('post.published = true AND post.created_at > :date', {
        date: post.created_at,
      })
      .orderBy('post.created_at', 'ASC')
      .getOne();

    return { ...post, prevPost, nextPost };
  }

  async create(dto: CreatePostDto) {
    const post = this.postRepo.create(dto);
    return this.postRepo.save(post);
  }

  async update(slug: string, dto: UpdatePostDto) {
    const post = await this.postRepo.findOne({ where: { slug } });
    if (!post) throw new NotFoundException('Post not found');
    Object.assign(post, dto);
    return this.postRepo.save(post);
  }

  async remove(slug: string) {
    const post = await this.postRepo.findOne({ where: { slug } });
    if (!post) throw new NotFoundException('Post not found');
    await this.postRepo.remove(post);
    return { message: 'Post deleted' };
  }

  async getStats() {
    const posts = await this.postRepo.find({
      select: ['id', 'title', 'slug', 'category_id', 'view_count', 'published', 'created_at'],
      relations: ['categoryEntity'],
    });

    const published = posts.filter((p) => p.published);
    const totalViews = published.reduce((sum, p) => sum + p.view_count, 0);

    // 글별 조회수 Top 5
    const topPosts = [...published]
      .sort((a, b) => b.view_count - a.view_count)
      .slice(0, 5)
      .map((p) => ({ title: p.title, slug: p.slug, views: p.view_count }));

    // 카테고리별 글 수 + 조회수
    const categoryMap = new Map<string, { count: number; views: number }>();
    for (const p of published) {
      const cat = p.categoryEntity?.name || '미분류';
      const prev = categoryMap.get(cat) || { count: 0, views: 0 };
      categoryMap.set(cat, { count: prev.count + 1, views: prev.views + p.view_count });
    }
    const categories = Array.from(categoryMap, ([name, data]) => ({ name, ...data }));

    return {
      totalPosts: published.length,
      draftPosts: posts.length - published.length,
      totalViews,
      topPosts,
      categories,
    };
  }

  async getTags() {
    const posts = await this.postRepo.find({
      where: { published: true },
      select: ['tags'],
    });
    const tagMap = new Map<string, number>();
    for (const post of posts) {
      if (post.tags) {
        for (const tag of post.tags) {
          tagMap.set(tag, (tagMap.get(tag) || 0) + 1);
        }
      }
    }
    return Array.from(tagMap, ([name, count]) => ({ name, count }));
  }
}
