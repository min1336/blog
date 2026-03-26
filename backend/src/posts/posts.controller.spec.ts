import { Test, TestingModule } from '@nestjs/testing';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';

// PostsService 모의 객체 — 컨트롤러 단위 테스트용
const mockPostsService = {
  findAll: jest.fn().mockResolvedValue({ data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 0 } }),
  findBySlug: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  getCategories: jest.fn(),
  getTags: jest.fn(),
};

describe('PostsController', () => {
  let controller: PostsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostsController],
      providers: [{ provide: PostsService, useValue: mockPostsService }],
    }).compile();

    controller = module.get<PostsController>(PostsController);
    jest.clearAllMocks();
    mockPostsService.findAll.mockResolvedValue({ data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 0 } });
  });

  describe('findAll — safePage / safeLimit 입력 정규화', () => {
    it('page, limit 미입력 시 기본값 page=1, limit=10으로 호출된다', async () => {
      await controller.findAll();

      expect(mockPostsService.findAll).toHaveBeenCalledWith(
        expect.objectContaining({ page: 1, limit: 10 }),
      );
    });

    it('page=0 입력 시 최소값 1로 보정된다', async () => {
      await controller.findAll('0');

      expect(mockPostsService.findAll).toHaveBeenCalledWith(
        expect.objectContaining({ page: 1 }),
      );
    });

    it('page=-1 입력 시 최소값 1로 보정된다', async () => {
      await controller.findAll('-1');

      expect(mockPostsService.findAll).toHaveBeenCalledWith(
        expect.objectContaining({ page: 1 }),
      );
    });

    it('page=abc 비숫자 입력 시 기본값 1로 폴백된다', async () => {
      await controller.findAll('abc');

      expect(mockPostsService.findAll).toHaveBeenCalledWith(
        expect.objectContaining({ page: 1 }),
      );
    });

    it('page=5 정상 입력 시 그대로 전달된다', async () => {
      await controller.findAll('5');

      expect(mockPostsService.findAll).toHaveBeenCalledWith(
        expect.objectContaining({ page: 5 }),
      );
    });

    it('limit=0 입력 시 최소값 1로 보정된다 (isNaN 패턴: parseInt("0")=0 → Math.max(1,0)=1)', async () => {
      await controller.findAll(undefined, '0');

      expect(mockPostsService.findAll).toHaveBeenCalledWith(
        expect.objectContaining({ limit: 1 }),
      );
    });

    it('limit=-1 입력 시 최소값 1로 보정된다', async () => {
      await controller.findAll(undefined, '-1');

      expect(mockPostsService.findAll).toHaveBeenCalledWith(
        expect.objectContaining({ limit: 1 }),
      );
    });

    it('limit=abc 비숫자 입력 시 기본값 10으로 폴백된다', async () => {
      await controller.findAll(undefined, 'abc');

      expect(mockPostsService.findAll).toHaveBeenCalledWith(
        expect.objectContaining({ limit: 10 }),
      );
    });

    it('limit=200 입력 시 상한 100으로 제한된다', async () => {
      await controller.findAll(undefined, '200');

      expect(mockPostsService.findAll).toHaveBeenCalledWith(
        expect.objectContaining({ limit: 100 }),
      );
    });

    it('limit=100 경계값은 그대로 전달된다', async () => {
      await controller.findAll(undefined, '100');

      expect(mockPostsService.findAll).toHaveBeenCalledWith(
        expect.objectContaining({ limit: 100 }),
      );
    });

    it('limit=50 정상 입력 시 그대로 전달된다', async () => {
      await controller.findAll(undefined, '50');

      expect(mockPostsService.findAll).toHaveBeenCalledWith(
        expect.objectContaining({ limit: 50 }),
      );
    });

    it('category, tag, search 파라미터가 service로 그대로 전달된다', async () => {
      await controller.findAll('1', '10', 'tech', 'nestjs', '검색어');

      expect(mockPostsService.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          category: 'tech',
          tag: 'nestjs',
          search: '검색어',
          published: true,
        }),
      );
    });
  });
});
