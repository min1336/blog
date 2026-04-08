import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Category } from './category.entity';
import { Post } from '../posts/post.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryEventsService } from './category-events.service';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private categoryRepo: Repository<Category>,
    @InjectRepository(Post)
    private postRepo: Repository<Post>,
    private events: CategoryEventsService,
  ) {}

  /**
   * 대분류 + 소분류 트리 구조로 반환, 각 카테고리별 published post 수 포함
   */
  async findAllTree() {
    // 모든 카테고리 조회 (children eager load)
    const roots = await this.categoryRepo.find({
      where: { parent_id: IsNull() },
      relations: ['children'],
      order: { sort_order: 'ASC', created_at: 'ASC' },
    });

    // children도 sort_order로 정렬
    for (const root of roots) {
      root.children.sort((a, b) => a.sort_order - b.sort_order || a.id - b.id);
    }

    // 카테고리별 published post 수 집계
    const counts = await this.postRepo
      .createQueryBuilder('post')
      .select('post.category_id', 'category_id')
      .addSelect('COUNT(*)', 'count')
      .where('post.published = true AND post.category_id IS NOT NULL')
      .groupBy('post.category_id')
      .getRawMany<{ category_id: number; count: string }>();

    const countMap = new Map<number, number>();
    for (const row of counts) {
      countMap.set(Number(row.category_id), Number(row.count));
    }

    // 트리에 post_count 추가
    return roots.map((root) => ({
      id: root.id,
      name: root.name,
      slug: root.slug,
      sort_order: root.sort_order,
      post_count: countMap.get(root.id) || 0,
      children: root.children.map((child) => ({
        id: child.id,
        name: child.name,
        slug: child.slug,
        sort_order: child.sort_order,
        post_count: countMap.get(child.id) || 0,
      })),
    }));
  }

  async findBySlug(slug: string) {
    const category = await this.categoryRepo.findOne({
      where: { slug },
      relations: ['children', 'parent'],
    });
    if (!category) throw new NotFoundException('카테고리를 찾을 수 없습니다.');
    return category;
  }

  async create(dto: CreateCategoryDto) {
    // slug 중복 검사
    const exists = await this.categoryRepo.findOne({ where: { slug: dto.slug } });
    if (exists) throw new ConflictException('이미 사용 중인 slug입니다.');

    // 2단계 제한 검증
    if (dto.parent_id) {
      const parent = await this.categoryRepo.findOne({ where: { id: dto.parent_id } });
      if (!parent) throw new NotFoundException('부모 카테고리를 찾을 수 없습니다.');
      if (parent.parent_id !== null) {
        throw new BadRequestException('2단계까지만 지원합니다.');
      }
    }

    const category = this.categoryRepo.create(dto);
    const saved = await this.categoryRepo.save(category);
    this.events.emit({ type: 'created' });
    return saved;
  }

  async update(id: number, dto: UpdateCategoryDto) {
    const category = await this.categoryRepo.findOne({ where: { id } });
    if (!category) throw new NotFoundException('카테고리를 찾을 수 없습니다.');

    // slug 변경 시 중복 검사
    if (dto.slug && dto.slug !== category.slug) {
      const exists = await this.categoryRepo.findOne({ where: { slug: dto.slug } });
      if (exists) throw new ConflictException('이미 사용 중인 slug입니다.');
    }

    // parent_id 변경 시 2단계 제한 검증
    if (dto.parent_id !== undefined && dto.parent_id !== category.parent_id) {
      if (dto.parent_id !== null) {
        const parent = await this.categoryRepo.findOne({ where: { id: dto.parent_id } });
        if (!parent) throw new NotFoundException('부모 카테고리를 찾을 수 없습니다.');
        if (parent.parent_id !== null) {
          throw new BadRequestException('2단계까지만 지원합니다.');
        }
      }
    }

    Object.assign(category, dto);
    const saved = await this.categoryRepo.save(category);
    this.events.emit({ type: 'updated' });
    return saved;
  }

  async remove(id: number) {
    const category = await this.categoryRepo.findOne({
      where: { id },
      relations: ['children'],
    });
    if (!category) throw new NotFoundException('카테고리를 찾을 수 없습니다.');

    // 하위 카테고리 존재 검사
    if (category.children && category.children.length > 0) {
      throw new BadRequestException('하위 카테고리가 있어 삭제할 수 없습니다.');
    }

    // 해당 카테고리에 글 존재 검사
    const postCount = await this.postRepo.count({ where: { category_id: id } });
    if (postCount > 0) {
      throw new BadRequestException(
        '해당 카테고리에 글이 있어 삭제할 수 없습니다. 글을 다른 카테고리로 이동한 후 삭제해주세요.',
      );
    }

    await this.categoryRepo.remove(category);
    this.events.emit({ type: 'deleted' });
    return { message: '카테고리가 삭제되었습니다.' };
  }
}
