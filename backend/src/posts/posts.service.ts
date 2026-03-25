import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from './post.entity';
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

    if (published !== undefined) {
      qb.andWhere('post.published = :published', { published });
    }
    if (category) {
      qb.andWhere('post.category = :category', { category });
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
        '(post.title LIKE :search OR post.summary LIKE :search)',
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
    const post = await this.postRepo.findOne({ where: { slug } });
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

  async getCategories() {
    return this.postRepo
      .createQueryBuilder('post')
      .select('post.category', 'category')
      .addSelect('COUNT(*)', 'count')
      .where('post.published = true AND post.category IS NOT NULL')
      .groupBy('post.category')
      .getRawMany();
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
