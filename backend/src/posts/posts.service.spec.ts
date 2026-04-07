import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { PostsService } from './posts.service';
import { Post } from './post.entity';
import { Category } from '../categories/category.entity';

// TypeORM QueryBuilder 모의 객체 — projects.service.spec.ts와 동일한 패턴 사용
const createQueryBuilderMock = (returnValue: Post[], total = returnValue.length) => ({
  andWhere: jest.fn().mockReturnThis(),
  innerJoin: jest.fn().mockReturnThis(),
  leftJoinAndSelect: jest.fn().mockReturnThis(),
  orderBy: jest.fn().mockReturnThis(),
  skip: jest.fn().mockReturnThis(),
  take: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  addSelect: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
  getOne: jest.fn().mockResolvedValue(null),
  getManyAndCount: jest.fn().mockResolvedValue([returnValue, total]),
  getMany: jest.fn().mockResolvedValue(returnValue),
  getRawMany: jest.fn().mockResolvedValue([]),
  groupBy: jest.fn().mockReturnThis(),
});

const mockPost = (override: Partial<Post> = {}): Post => ({
  id: 1,
  title: 'Test Post',
  slug: 'test-post',
  content: '# Test Content',
  summary: 'Test summary' as string,
  category_id: null,
  categoryEntity: null as unknown as Category,
  tags: null as unknown as string[],
  thumbnail: null as unknown as string,
  view_count: 0,
  published: true,
  created_at: new Date('2026-01-01'),
  updated_at: new Date('2026-01-01'),
  ...override,
});

describe('PostsService', () => {
  let service: PostsService;
  let qbMock: ReturnType<typeof createQueryBuilderMock>;

  const mockRepo = {
    createQueryBuilder: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
    increment: jest.fn(),
  };

  const mockCategoryRepo = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostsService,
        { provide: getRepositoryToken(Post), useValue: mockRepo },
        { provide: getRepositoryToken(Category), useValue: mockCategoryRepo },
      ],
    }).compile();

    service = module.get<PostsService>(PostsService);
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('published=true인 글을 제목으로 검색하면 결과를 반환한다', async () => {
      const posts = [mockPost({ title: 'Next.js 시작하기' })];
      qbMock = createQueryBuilderMock(posts);
      mockRepo.createQueryBuilder.mockReturnValue(qbMock);

      const result = await service.findAll({ search: 'Next.js', published: true });

      expect(result.data).toEqual(posts);
      expect(result.meta.total).toBe(1);
      // COALESCE가 포함된 LIKE 조건 적용 확인
      expect(qbMock.andWhere).toHaveBeenCalledWith(
        "(post.title LIKE :search OR COALESCE(post.summary, '') LIKE :search)",
        { search: '%Next.js%' },
      );
    });

    it('summary=NULL인 글도 제목 검색에서 정상 반환한다', async () => {
      // summary가 null이어도 제목에 키워드가 있으면 결과에 포함돼야 함
      const posts = [mockPost({ title: 'Next.js 심화', summary: null as unknown as string })];
      qbMock = createQueryBuilderMock(posts);
      mockRepo.createQueryBuilder.mockReturnValue(qbMock);

      const result = await service.findAll({ search: 'Next.js', published: true });

      // COALESCE 적용으로 NULL summary 글이 포함됨
      expect(qbMock.andWhere).toHaveBeenCalledWith(
        "(post.title LIKE :search OR COALESCE(post.summary, '') LIKE :search)",
        { search: '%Next.js%' },
      );
      expect(result.data).toEqual(posts);
    });

    it('published=false인 글은 공개 검색에서 제외된다', async () => {
      qbMock = createQueryBuilderMock([]);
      mockRepo.createQueryBuilder.mockReturnValue(qbMock);

      await service.findAll({ search: 'Next.js', published: true });

      // published 필터가 항상 적용되는지 확인
      expect(qbMock.andWhere).toHaveBeenCalledWith(
        'post.published = :published',
        { published: true },
      );
    });

    it('검색어 없이 조회 시 LIKE 조건이 추가되지 않는다', async () => {
      qbMock = createQueryBuilderMock([]);
      mockRepo.createQueryBuilder.mockReturnValue(qbMock);

      await service.findAll({ published: true });

      // andWhere 호출 횟수: published 1번만
      expect(qbMock.andWhere).toHaveBeenCalledTimes(1);
      expect(qbMock.andWhere).toHaveBeenCalledWith(
        'post.published = :published',
        { published: true },
      );
    });

    it('특수문자(%, _) 포함 검색어는 이스케이프 처리된다', async () => {
      qbMock = createQueryBuilderMock([]);
      mockRepo.createQueryBuilder.mockReturnValue(qbMock);

      await service.findAll({ search: '50%_할인', published: true });

      // escapeLike로 %, _ 가 \%, \_ 로 이스케이프되어 전달돼야 함
      expect(qbMock.andWhere).toHaveBeenCalledWith(
        "(post.title LIKE :search OR COALESCE(post.summary, '') LIKE :search)",
        { search: '%50\\%\\_할인%' },
      );
    });

    it('100자 초과 검색어는 100자로 잘린다', async () => {
      qbMock = createQueryBuilderMock([]);
      mockRepo.createQueryBuilder.mockReturnValue(qbMock);

      const longSearch = 'a'.repeat(150);
      await service.findAll({ search: longSearch, published: true });

      // 서비스 레벨에서 slice(100) 적용
      const expectedSearch = '%' + 'a'.repeat(100) + '%';
      expect(qbMock.andWhere).toHaveBeenCalledWith(
        "(post.title LIKE :search OR COALESCE(post.summary, '') LIKE :search)",
        { search: expectedSearch },
      );
    });

    it('페이지네이션 메타데이터를 올바르게 반환한다', async () => {
      const posts = [mockPost(), mockPost({ id: 2, slug: 'post-2' })];
      qbMock = createQueryBuilderMock(posts, 20);
      mockRepo.createQueryBuilder.mockReturnValue(qbMock);

      const result = await service.findAll({ page: 2, limit: 10, published: true });

      expect(result.meta).toEqual({
        page: 2,
        limit: 10,
        total: 20,
        totalPages: 2,
      });
      // skip, take 적용 확인
      expect(qbMock.skip).toHaveBeenCalledWith(10);
      expect(qbMock.take).toHaveBeenCalledWith(10);
    });
  });

  describe('findBySlug', () => {
    it('존재하는 slug로 글을 조회하면 반환한다', async () => {
      const post = mockPost();
      mockRepo.findOne.mockResolvedValue(post);
      mockRepo.increment.mockResolvedValue(undefined);

      // findBySlug는 내부적으로 prevPost/nextPost 조회도 하므로 qb 모의 설정
      qbMock = createQueryBuilderMock([]);
      mockRepo.createQueryBuilder.mockReturnValue(qbMock);

      const result = await service.findBySlug('test-post');

      expect(result.id).toBe(post.id);
      expect(result.title).toBe(post.title);
    });

    it('존재하지 않는 slug는 NotFoundException을 던진다', async () => {
      mockRepo.findOne.mockResolvedValue(null);

      await expect(service.findBySlug('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
