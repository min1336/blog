import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from './project.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

// 검색 최대 길이 제한
const MAX_SEARCH_LENGTH = 100;

/**
 * LIKE 쿼리에서 와일드카드 문자(%, _, \)를 이스케이프하여 SQL 인젝션 방지
 */
function escapeLike(str: string): string {
  return str.replace(/[%_\\]/g, '\\$&');
}

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private projectRepo: Repository<Project>,
  ) {}

  async findAll(query: { search?: string; publishedOnly?: boolean } = {}) {
    const { search, publishedOnly = true } = query;

    const qb = this.projectRepo.createQueryBuilder('project');

    if (publishedOnly) {
      qb.andWhere('project.published = :published', { published: true });
    }

    // title 또는 description 대상 LIKE 검색 (SQL Injection 방지: 파라미터 바인딩 + 와일드카드 이스케이프)
    if (search) {
      // 서비스 레벨에서 길이 제한 적용
      const safeSearch = search.slice(0, MAX_SEARCH_LENGTH);
      qb.andWhere(
        '(project.title LIKE :search OR project.description LIKE :search)',
        { search: `%${escapeLike(safeSearch)}%` },
      );
    }

    qb.orderBy('project.sort_order', 'ASC').addOrderBy(
      'project.created_at',
      'DESC',
    );

    return qb.getMany();
  }

  async findBySlug(slug: string) {
    const project = await this.projectRepo.findOne({ where: { slug } });
    if (!project) throw new NotFoundException('Project not found');
    return project;
  }

  async create(dto: CreateProjectDto) {
    const project = this.projectRepo.create(dto);
    return this.projectRepo.save(project);
  }

  async update(slug: string, dto: UpdateProjectDto) {
    const project = await this.projectRepo.findOne({ where: { slug } });
    if (!project) throw new NotFoundException('Project not found');
    Object.assign(project, dto);
    return this.projectRepo.save(project);
  }

  async remove(slug: string) {
    const project = await this.projectRepo.findOne({ where: { slug } });
    if (!project) throw new NotFoundException('Project not found');
    await this.projectRepo.remove(project);
    return { message: 'Project deleted' };
  }
}
