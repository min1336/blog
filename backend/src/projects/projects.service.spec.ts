import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { Project } from './project.entity';

// TypeORM QueryBuilder 모의 객체
const createQueryBuilderMock = (returnValue: Project[]) => ({
  andWhere: jest.fn().mockReturnThis(),
  orderBy: jest.fn().mockReturnThis(),
  addOrderBy: jest.fn().mockReturnThis(),
  getMany: jest.fn().mockResolvedValue(returnValue),
});

const mockProject = (override: Partial<Project> = {}): Project => ({
  id: 1,
  title: 'Test Project',
  slug: 'test-project',
  description: 'Test description content',
  summary: 'Test summary',
  tech_stack: ['TypeScript', 'NestJS'],
  github_url: null,
  demo_url: null,
  thumbnail: null,
  sort_order: 0,
  published: true,
  created_at: new Date(),
  updated_at: new Date(),
  ...override,
});

describe('ProjectsService', () => {
  let service: ProjectsService;
  let qbMock: ReturnType<typeof createQueryBuilderMock>;

  const mockRepo = {
    createQueryBuilder: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectsService,
        { provide: getRepositoryToken(Project), useValue: mockRepo },
      ],
    }).compile();

    service = module.get<ProjectsService>(ProjectsService);
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('검색어 없이 전체 published 프로젝트를 반환한다', async () => {
      const projects = [mockProject()];
      qbMock = createQueryBuilderMock(projects);
      mockRepo.createQueryBuilder.mockReturnValue(qbMock);

      const result = await service.findAll();

      expect(result).toEqual(projects);
      // published 필터 적용 확인
      expect(qbMock.andWhere).toHaveBeenCalledWith(
        'project.published = :published',
        { published: true },
      );
      // search 조건 미적용 확인
      expect(qbMock.andWhere).toHaveBeenCalledTimes(1);
    });

    it('title 키워드로 검색하면 LIKE 조건이 추가된다', async () => {
      const projects = [mockProject({ title: 'Next.js Blog' })];
      qbMock = createQueryBuilderMock(projects);
      mockRepo.createQueryBuilder.mockReturnValue(qbMock);

      const result = await service.findAll({ search: 'Next.js' });

      expect(result).toEqual(projects);
      // search LIKE 조건 적용 확인
      expect(qbMock.andWhere).toHaveBeenCalledWith(
        '(project.title LIKE :search OR project.description LIKE :search)',
        { search: '%Next.js%' },
      );
    });

    it('description 키워드로 검색하면 LIKE 조건이 추가된다', async () => {
      const projects = [mockProject({ description: 'Built with TypeScript' })];
      qbMock = createQueryBuilderMock(projects);
      mockRepo.createQueryBuilder.mockReturnValue(qbMock);

      await service.findAll({ search: 'TypeScript' });

      expect(qbMock.andWhere).toHaveBeenCalledWith(
        '(project.title LIKE :search OR project.description LIKE :search)',
        { search: '%TypeScript%' },
      );
    });

    it('검색 결과가 없으면 빈 배열을 반환한다', async () => {
      qbMock = createQueryBuilderMock([]);
      mockRepo.createQueryBuilder.mockReturnValue(qbMock);

      const result = await service.findAll({ search: '존재하지않는키워드' });

      expect(result).toEqual([]);
    });

    it('특수문자(\', ", ;) 검색 시 파라미터 바인딩으로 안전하게 처리된다', async () => {
      qbMock = createQueryBuilderMock([]);
      mockRepo.createQueryBuilder.mockReturnValue(qbMock);

      // SQL Injection 시도 문자열 — QueryBuilder 파라미터 바인딩으로 이스케이프됨
      await service.findAll({ search: "'; DROP TABLE projects; --" });

      expect(qbMock.andWhere).toHaveBeenCalledWith(
        '(project.title LIKE :search OR project.description LIKE :search)',
        { search: `%'; DROP TABLE projects; --%` },
      );
    });
  });

  describe('findBySlug', () => {
    it('존재하는 slug로 프로젝트를 조회하면 반환한다', async () => {
      const project = mockProject();
      mockRepo.findOne.mockResolvedValue(project);

      const result = await service.findBySlug('test-project');

      expect(result).toEqual(project);
    });

    it('존재하지 않는 slug는 NotFoundException을 던진다', async () => {
      mockRepo.findOne.mockResolvedValue(null);

      await expect(service.findBySlug('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
