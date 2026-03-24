import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from './project.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private projectRepo: Repository<Project>,
  ) {}

  async findAll(publishedOnly = true) {
    const where = publishedOnly ? { published: true } : {};
    return this.projectRepo.find({
      where,
      order: { sort_order: 'ASC', created_at: 'DESC' },
    });
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
