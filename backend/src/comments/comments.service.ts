import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Comment } from './comment.entity';
import { Post } from '../posts/post.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private commentRepo: Repository<Comment>,
    @InjectRepository(Post)
    private postRepo: Repository<Post>,
  ) {}

  async findByPostSlug(slug: string) {
    const post = await this.postRepo.findOne({ where: { slug } });
    if (!post) throw new NotFoundException('Post not found');

    const comments = await this.commentRepo.find({
      where: { post_id: post.id, parent_id: IsNull() },
      relations: ['replies'],
      order: { created_at: 'ASC' },
    });

    const mask = (c: Comment) => {
      if (c.deleted_at) {
        c.content = '삭제된 댓글입니다.';
        c.nickname = '';
      }
      if (c.replies) {
        c.replies = c.replies
          .sort((a, b) => a.created_at.getTime() - b.created_at.getTime())
          .map(mask);
      }
      return c;
    };

    return comments.map(mask);
  }

  async create(slug: string, dto: CreateCommentDto) {
    const post = await this.postRepo.findOne({ where: { slug } });
    if (!post) throw new NotFoundException('Post not found');

    const hashed = await bcrypt.hash(dto.password, 10);
    const comment = new Comment();
    comment.post_id = post.id;
    comment.parent_id = dto.parent_id ?? null;
    comment.nickname = dto.nickname;
    comment.password = hashed;
    comment.content = dto.content;

    const saved = await this.commentRepo.save(comment);
    delete (saved as Partial<Comment>).password;
    return saved;
  }

  async update(id: number, dto: UpdateCommentDto) {
    const comment = await this.commentRepo.findOne({
      where: { id },
      select: ['id', 'password', 'content', 'deleted_at', 'nickname', 'created_at', 'updated_at', 'post_id', 'parent_id'],
    });
    if (!comment || comment.deleted_at)
      throw new NotFoundException('Comment not found');

    const isMatch = await bcrypt.compare(dto.password, comment.password);
    if (!isMatch) throw new ForbiddenException('Wrong password');

    comment.content = dto.content;
    const saved = await this.commentRepo.save(comment);
    delete (saved as Partial<Comment>).password;
    return saved;
  }

  async remove(id: number, password?: string, isAdmin = false) {
    const comment = await this.commentRepo.findOne({
      where: { id },
      select: ['id', 'password', 'deleted_at', 'nickname', 'content', 'created_at', 'updated_at', 'post_id', 'parent_id'],
    });
    if (!comment || comment.deleted_at)
      throw new NotFoundException('Comment not found');

    if (!isAdmin) {
      if (!password) throw new ForbiddenException('Password required');
      const isMatch = await bcrypt.compare(password, comment.password);
      if (!isMatch) throw new ForbiddenException('Wrong password');
    }

    comment.deleted_at = new Date();
    await this.commentRepo.save(comment);
    return { message: 'Comment deleted' };
  }

  async findAll() {
    return this.commentRepo.find({
      order: { created_at: 'DESC' },
      relations: ['post'],
    });
  }
}
