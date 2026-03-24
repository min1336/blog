# Blog Website Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Next.js 16.2 + NestJS 11 + MySQL 8 기반 개인 블로그/포트폴리오 웹사이트를 Docker Compose 환경에서 구현한다.

**Architecture:** 프론트엔드(Next.js)와 백엔드(NestJS)를 완전 분리하여 REST API로 통신한다. MySQL에 모든 콘텐츠를 저장하고, TypeORM으로 접근한다. Docker Compose로 3개 서비스(frontend, backend, mysql)를 관리한다.

**Tech Stack:** Next.js 16.2, NestJS 11, TypeORM 0.3.28, MySQL 8, Tailwind CSS 4.2, shadcn/ui, react-markdown, @uiw/react-md-editor, passport-jwt, bcrypt, Docker Compose

**Reference:** `docs/superpowers/specs/2026-03-24-blog-redesign.md`

---

## Phase 1: Infrastructure Setup

### Task 1.1: 기존 코드 정리 및 Docker Compose 구성

**Files:**
- Delete: `backend/` (기존 Spring Boot 프로젝트 전체)
- Delete: `frontend/` (기존 Next.js 프로젝트 전체)
- Create: `docker-compose.yml`
- Create: `.env`
- Modify: `.gitignore`

- [ ] **Step 1: 기존 프로젝트 삭제**

```bash
cd /home/teamo2/Downloads/blog
rm -rf backend/ frontend/
```

- [ ] **Step 2: docker-compose.yml 작성**

```yaml
# docker-compose.yml
services:
  mysql:
    image: mysql:8
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
    environment:
      - MYSQL_ROOT_PASSWORD=${MYSQL_ROOT_PASSWORD}
      - MYSQL_DATABASE=blog
      - MYSQL_USER=blog
      - MYSQL_PASSWORD=${DB_PASSWORD}
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  mysql_data:
```

Note: frontend/backend 서비스는 각각의 프로젝트가 준비된 후 추가한다. 지금은 MySQL만.

- [ ] **Step 3: .env 파일 작성**

```
# .env
DB_PASSWORD=blogpass123
MYSQL_ROOT_PASSWORD=rootpass123
JWT_SECRET=your-super-secret-jwt-key-change-in-production
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
```

- [ ] **Step 4: .gitignore 업데이트**

`.gitignore`에 다음 추가:
```
.env
node_modules/
dist/
uploads/
```

- [ ] **Step 5: MySQL 컨테이너 실행 확인**

```bash
docker compose up -d mysql
docker compose ps
```

Expected: mysql 서비스가 healthy 상태

- [ ] **Step 6: Commit**

```bash
git add docker-compose.yml .gitignore
git commit -m "chore: clean old code, add Docker Compose with MySQL"
```

Note: `.env`는 gitignore 대상이므로 커밋하지 않는다.

---

### Task 1.2: NestJS 백엔드 프로젝트 생성

**Files:**
- Create: `backend/` (NestJS 프로젝트 전체)

- [ ] **Step 1: NestJS CLI로 프로젝트 생성**

```bash
cd /home/teamo2/Downloads/blog
npx @nestjs/cli new backend --package-manager pnpm --skip-git
```

선택: strict mode → Yes

- [ ] **Step 2: 필요 패키지 설치**

```bash
cd backend
pnpm add @nestjs/typeorm typeorm mysql2
pnpm add @nestjs/passport passport passport-jwt @nestjs/jwt
pnpm add class-validator class-transformer
pnpm add bcrypt
pnpm add @nestjs/throttler
pnpm add -D @types/passport-jwt @types/bcrypt
```

- [ ] **Step 3: TypeORM + MySQL 연결 설정**

`backend/src/app.module.ts`:
```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      username: process.env.DB_USERNAME || 'blog',
      password: process.env.DB_PASSWORD || 'blogpass123',
      database: process.env.DB_DATABASE || 'blog',
      autoLoadEntities: true,
      synchronize: true, // dev only — production에서는 migration 사용
    }),
  ],
})
export class AppModule {}
```

- [ ] **Step 4: main.ts에 글로벌 설정 추가**

`backend/src/main.ts`:
```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

  app.enableCors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.listen(4000);
  console.log('Backend running on http://localhost:4000');
}
bootstrap();
```

- [ ] **Step 5: 백엔드 실행 확인**

```bash
cd /home/teamo2/Downloads/blog/backend
pnpm start:dev
```

Expected: `Backend running on http://localhost:4000` 출력. `http://localhost:4000/api` 접근 시 404 (정상 — 아직 라우트 없음).

- [ ] **Step 6: Commit**

```bash
git add backend/
git commit -m "feat: scaffold NestJS backend with TypeORM + MySQL"
```

---

### Task 1.3: Next.js 프론트엔드 프로젝트 생성

**Files:**
- Create: `frontend/` (Next.js 프로젝트 전체)

- [ ] **Step 1: Next.js 프로젝트 생성**

```bash
cd /home/teamo2/Downloads/blog
pnpm create next-app@latest frontend --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
```

- [ ] **Step 2: shadcn/ui 초기화**

```bash
cd frontend
pnpm dlx shadcn@latest init
```

선택: Default style, Zinc base color, CSS variables → Yes

- [ ] **Step 3: 기본 shadcn 컴포넌트 설치**

```bash
pnpm dlx shadcn@latest add button card badge separator scroll-area sheet avatar input textarea select dialog dropdown-menu
```

- [ ] **Step 4: 추가 패키지 설치**

```bash
pnpm add next-themes lucide-react react-markdown rehype-pretty-code shiki @uiw/react-md-editor
```

- [ ] **Step 5: 기본 템플릿 정리**

`frontend/src/app/page.tsx`를 빈 홈페이지로 교체:
```typescript
export default function HomePage() {
  return (
    <main className="flex items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold">Blog</h1>
    </main>
  );
}
```

`frontend/src/app/globals.css`에서 Tailwind 디렉티브만 남기고 기본 스타일 제거.

- [ ] **Step 6: 프론트엔드 실행 확인**

```bash
cd /home/teamo2/Downloads/blog/frontend
pnpm dev
```

Expected: `http://localhost:3000`에서 "Blog" 텍스트 표시

- [ ] **Step 7: Commit**

```bash
git add frontend/
git commit -m "feat: scaffold Next.js frontend with Tailwind + shadcn/ui"
```

---

## Phase 2: Backend — Common Modules + Auth

### Task 2.1: Response Interceptor + Exception Filter

**Files:**
- Create: `backend/src/common/interceptors/response.interceptor.ts`
- Create: `backend/src/common/filters/global-exception.filter.ts`
- Create: `backend/src/common/dto/pagination-query.dto.ts`
- Modify: `backend/src/main.ts`

- [ ] **Step 1: Response Interceptor 작성**

`backend/src/common/interceptors/response.interceptor.ts`:
```typescript
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  meta?: Record<string, unknown>;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((data) => {
        // 이미 envelope 형태면 그대로 반환 (페이지네이션 등)
        if (data && data.success !== undefined) {
          return data;
        }
        return {
          success: true,
          data,
          message: 'success',
        };
      }),
    );
  }
}
```

- [ ] **Step 2: Global Exception Filter 작성**

`backend/src/common/filters/global-exception.filter.ts`:
```typescript
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.message
        : 'Internal server error';

    const errorCode =
      exception instanceof HttpException
        ? (exception.getResponse() as any).error || 'UNKNOWN_ERROR'
        : 'INTERNAL_ERROR';

    response.status(status).json({
      success: false,
      error: {
        code: errorCode,
        message,
      },
      statusCode: status,
    });
  }
}
```

- [ ] **Step 3: Pagination DTO 작성**

`backend/src/common/dto/pagination-query.dto.ts`:
```typescript
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';

export class PaginationQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;
}
```

- [ ] **Step 4: main.ts에 글로벌 등록**

`backend/src/main.ts`에 추가:
```typescript
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';

// bootstrap() 내부에 추가:
app.useGlobalInterceptors(new ResponseInterceptor());
app.useGlobalFilters(new GlobalExceptionFilter());
```

- [ ] **Step 5: Health check 엔드포인트 추가**

`backend/src/app.controller.ts`:
```typescript
import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get('health')
  health() {
    return { status: 'ok' };
  }
}
```

- [ ] **Step 6: 확인**

```bash
curl http://localhost:4000/api/health
```

Expected: `{"success":true,"data":{"status":"ok"},"message":"success"}`

- [ ] **Step 7: Commit**

```bash
git add backend/src/common/ backend/src/main.ts backend/src/app.controller.ts
git commit -m "feat: add response interceptor, exception filter, pagination DTO"
```

---

### Task 2.2: Admin Entity + Auth Module

**Files:**
- Create: `backend/src/auth/admin.entity.ts`
- Create: `backend/src/auth/auth.module.ts`
- Create: `backend/src/auth/auth.controller.ts`
- Create: `backend/src/auth/auth.service.ts`
- Create: `backend/src/auth/jwt.strategy.ts`
- Create: `backend/src/auth/guards/jwt-auth.guard.ts`
- Create: `backend/src/auth/dto/login.dto.ts`
- Modify: `backend/src/app.module.ts`

- [ ] **Step 1: Admin Entity**

`backend/src/auth/admin.entity.ts`:
```typescript
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('admins')
export class Admin {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50, unique: true })
  username: string;

  @Column({ length: 255 })
  password: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
```

- [ ] **Step 2: Login DTO**

`backend/src/auth/dto/login.dto.ts`:
```typescript
import { IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsString()
  username: string;

  @IsString()
  @MinLength(4)
  password: string;
}
```

- [ ] **Step 3: JWT Strategy**

`backend/src/auth/jwt.strategy.ts`:
```typescript
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => request?.cookies?.access_token,
      ]),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'default-secret',
    });
  }

  async validate(payload: { sub: number; username: string }) {
    return { id: payload.sub, username: payload.username };
  }
}
```

- [ ] **Step 4: JWT Auth Guard**

`backend/src/auth/guards/jwt-auth.guard.ts`:
```typescript
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
```

- [ ] **Step 5: Auth Service (시딩 포함)**

`backend/src/auth/auth.service.ts`:
```typescript
import { Injectable, UnauthorizedException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Admin } from './admin.entity';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService implements OnModuleInit {
  constructor(
    @InjectRepository(Admin)
    private adminRepo: Repository<Admin>,
    private jwtService: JwtService,
  ) {}

  async onModuleInit() {
    const count = await this.adminRepo.count();
    if (count === 0) {
      const username = process.env.ADMIN_USERNAME || 'admin';
      const password = process.env.ADMIN_PASSWORD || 'admin123';
      const hashed = await bcrypt.hash(password, 10);
      await this.adminRepo.save({ username, password: hashed });
      console.log(`Default admin created: ${username}`);
    }
  }

  async login(dto: LoginDto) {
    const admin = await this.adminRepo.findOne({
      where: { username: dto.username },
    });

    if (!admin || !(await bcrypt.compare(dto.password, admin.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: admin.id, username: admin.username };
    const token = this.jwtService.sign(payload);

    return { token, username: admin.username };
  }

  async getMe(userId: number) {
    const admin = await this.adminRepo.findOne({ where: { id: userId } });
    if (!admin) throw new UnauthorizedException();
    return { id: admin.id, username: admin.username };
  }
}
```

- [ ] **Step 6: Auth Controller**

`backend/src/auth/auth.controller.ts`:
```typescript
import { Controller, Post, Get, Body, Res, Req, UseGuards } from '@nestjs/common';
import { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const { token, username } = await this.authService.login(dto);

    res.cookie('access_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 24시간
    });

    return { username };
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('access_token');
    return { message: 'Logged out' };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getMe(@Req() req: Request) {
    return this.authService.getMe((req.user as any).id);
  }
}
```

- [ ] **Step 7: Auth Module**

`backend/src/auth/auth.module.ts`:
```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { Admin } from './admin.entity';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([Admin]),
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'default-secret',
      signOptions: { expiresIn: '24h' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [JwtAuthGuard],
})
export class AuthModule {}
```

- [ ] **Step 8: AppModule에 AuthModule 등록 + cookie-parser 설치**

```bash
cd backend && pnpm add cookie-parser && pnpm add -D @types/cookie-parser
```

`backend/src/main.ts`에 추가:
```typescript
import * as cookieParser from 'cookie-parser';
// bootstrap() 내부:
app.use(cookieParser());
```

`backend/src/app.module.ts` imports에 `AuthModule` 추가.

- [ ] **Step 9: 로그인 테스트**

```bash
# 서버 재시작 후
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' -v
```

Expected: 200 OK + `Set-Cookie: access_token=...` 헤더 + `{"success":true,"data":{"username":"admin"},"message":"success"}`

- [ ] **Step 10: Commit**

```bash
git add backend/src/auth/ backend/src/app.module.ts backend/src/main.ts backend/package.json backend/pnpm-lock.yaml
git commit -m "feat: add admin auth with JWT (login, logout, seeding)"
```

---

## Phase 3: Backend — Posts + Projects CRUD

### Task 3.1: Post Entity + Posts Module

**Files:**
- Create: `backend/src/posts/post.entity.ts`
- Create: `backend/src/posts/posts.module.ts`
- Create: `backend/src/posts/posts.controller.ts`
- Create: `backend/src/posts/posts.service.ts`
- Create: `backend/src/posts/dto/create-post.dto.ts`
- Create: `backend/src/posts/dto/update-post.dto.ts`
- Modify: `backend/src/app.module.ts`

- [ ] **Step 1: Post Entity**

`backend/src/posts/post.entity.ts`:
```typescript
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('posts')
@Index('idx_posts_published_created', ['published', 'created_at'])
@Index('idx_posts_category', ['category'])
export class Post {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  title: string;

  @Column({ length: 255, unique: true })
  slug: string;

  @Column('longtext')
  content: string;

  @Column({ length: 500, nullable: true })
  summary: string;

  @Column({ length: 100, nullable: true })
  category: string;

  @Column('json', { nullable: true })
  tags: string[];

  @Column({ length: 500, nullable: true })
  thumbnail: string;

  @Column({ default: 0 })
  view_count: number;

  @Column({ default: false })
  published: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
```

- [ ] **Step 2: DTOs**

`backend/src/posts/dto/create-post.dto.ts`:
```typescript
import { IsString, IsOptional, IsBoolean, IsArray, MinLength } from 'class-validator';

export class CreatePostDto {
  @IsString()
  @MinLength(1)
  title: string;

  @IsString()
  @MinLength(1)
  slug: string;

  @IsString()
  @MinLength(1)
  content: string;

  @IsOptional()
  @IsString()
  summary?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsArray()
  tags?: string[];

  @IsOptional()
  @IsString()
  thumbnail?: string;

  @IsOptional()
  @IsBoolean()
  published?: boolean;
}
```

`backend/src/posts/dto/update-post.dto.ts`:
```typescript
import { PartialType } from '@nestjs/mapped-types';
import { CreatePostDto } from './create-post.dto';

export class UpdatePostDto extends PartialType(CreatePostDto) {}
```

- [ ] **Step 3: Posts Service**

`backend/src/posts/posts.service.ts`:
```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Post } from './post.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

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
      qb.andWhere('JSON_CONTAINS(post.tags, :tag)', { tag: JSON.stringify(tag) });
    }
    if (search) {
      qb.andWhere('(post.title LIKE :search OR post.summary LIKE :search)', {
        search: `%${search}%`,
      });
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

    // 조회수 증가
    await this.postRepo.increment({ id: post.id }, 'view_count', 1);
    post.view_count += 1;

    // 이전/다음 글
    const prevPost = await this.postRepo
      .createQueryBuilder('post')
      .select(['post.slug', 'post.title'])
      .where('post.published = true AND post.created_at < :date', { date: post.created_at })
      .orderBy('post.created_at', 'DESC')
      .getOne();

    const nextPost = await this.postRepo
      .createQueryBuilder('post')
      .select(['post.slug', 'post.title'])
      .where('post.published = true AND post.created_at > :date', { date: post.created_at })
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
    const result = await this.postRepo
      .createQueryBuilder('post')
      .select('post.category', 'category')
      .addSelect('COUNT(*)', 'count')
      .where('post.published = true AND post.category IS NOT NULL')
      .groupBy('post.category')
      .getRawMany();
    return result;
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
```

- [ ] **Step 4: Posts Controller**

`backend/src/posts/posts.controller.ts`:
```typescript
import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('posts')
export class PostsController {
  constructor(private postsService: PostsService) {}

  @Get()
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('category') category?: string,
    @Query('tag') tag?: string,
    @Query('search') search?: string,
  ) {
    return this.postsService.findAll({
      page: page ? +page : 1,
      limit: limit ? +limit : 10,
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
```

- [ ] **Step 5: Posts Module + Categories/Tags Controller**

`backend/src/posts/posts.module.ts`:
```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from './post.entity';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Post])],
  controllers: [PostsController],
  providers: [PostsService],
  exports: [PostsService],
})
export class PostsModule {}
```

`backend/src/app.module.ts` imports에 `PostsModule` 추가.

Categories/Tags 엔드포인트를 위해 `PostsController`에 추가:
```typescript
@Get('/meta/categories')
getCategories() {
  return this.postsService.getCategories();
}

@Get('/meta/tags')
getTags() {
  return this.postsService.getTags();
}
```

Note: `/meta/categories`와 `/meta/tags` 경로를 사용하여 `:slug` 파라미터와 충돌하지 않게 한다. 또는 별도의 `CategoriesController`를 만들어도 된다.

- [ ] **Step 6: API 테스트**

```bash
# 글 작성 (로그인 후 쿠키 사용)
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' -c cookies.txt

curl -X POST http://localhost:4000/api/posts \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"title":"첫 번째 글","slug":"first-post","content":"# Hello\n본문입니다","summary":"첫 글 요약","category":"dev","tags":["nestjs","typescript"],"published":true}'

# 글 목록
curl http://localhost:4000/api/posts

# 글 상세
curl http://localhost:4000/api/posts/first-post
```

Expected: 각 API가 Simple Envelope 형태로 응답

- [ ] **Step 7: Commit**

```bash
git add backend/src/posts/ backend/src/app.module.ts
git commit -m "feat: add posts CRUD API with search, pagination, categories/tags"
```

---

### Task 3.2: Projects Module

**Files:**
- Create: `backend/src/projects/project.entity.ts`
- Create: `backend/src/projects/projects.module.ts`
- Create: `backend/src/projects/projects.controller.ts`
- Create: `backend/src/projects/projects.service.ts`
- Create: `backend/src/projects/dto/create-project.dto.ts`
- Create: `backend/src/projects/dto/update-project.dto.ts`
- Modify: `backend/src/app.module.ts`

- [ ] **Step 1: Project Entity**

`backend/src/projects/project.entity.ts`:
```typescript
import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn,
} from 'typeorm';

@Entity('projects')
export class Project {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  title: string;

  @Column({ length: 255, unique: true })
  slug: string;

  @Column('longtext')
  description: string;

  @Column({ length: 500, nullable: true })
  summary: string;

  @Column('json', { nullable: true })
  tech_stack: string[];

  @Column({ length: 500, nullable: true })
  github_url: string;

  @Column({ length: 500, nullable: true })
  demo_url: string;

  @Column({ length: 500, nullable: true })
  thumbnail: string;

  @Column({ default: 0 })
  sort_order: number;

  @Column({ default: false })
  published: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
```

- [ ] **Step 2: DTOs (Posts와 동일 패턴)**

`backend/src/projects/dto/create-project.dto.ts`:
```typescript
import { IsString, IsOptional, IsBoolean, IsArray, IsNumber, MinLength } from 'class-validator';

export class CreateProjectDto {
  @IsString()
  @MinLength(1)
  title: string;

  @IsString()
  @MinLength(1)
  slug: string;

  @IsString()
  @MinLength(1)
  description: string;

  @IsOptional()
  @IsString()
  summary?: string;

  @IsOptional()
  @IsArray()
  tech_stack?: string[];

  @IsOptional()
  @IsString()
  github_url?: string;

  @IsOptional()
  @IsString()
  demo_url?: string;

  @IsOptional()
  @IsString()
  thumbnail?: string;

  @IsOptional()
  @IsNumber()
  sort_order?: number;

  @IsOptional()
  @IsBoolean()
  published?: boolean;
}
```

`backend/src/projects/dto/update-project.dto.ts`:
```typescript
import { PartialType } from '@nestjs/mapped-types';
import { CreateProjectDto } from './create-project.dto';

export class UpdateProjectDto extends PartialType(CreateProjectDto) {}
```

- [ ] **Step 3: Projects Service**

`backend/src/projects/projects.service.ts`:
```typescript
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
```

- [ ] **Step 4: Projects Controller + Module**

`backend/src/projects/projects.controller.ts`:
```typescript
import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, UseGuards,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('projects')
export class ProjectsController {
  constructor(private projectsService: ProjectsService) {}

  @Get()
  findAll() {
    return this.projectsService.findAll();
  }

  @Get(':slug')
  findBySlug(@Param('slug') slug: string) {
    return this.projectsService.findBySlug(slug);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() dto: CreateProjectDto) {
    return this.projectsService.create(dto);
  }

  @Patch(':slug')
  @UseGuards(JwtAuthGuard)
  update(@Param('slug') slug: string, @Body() dto: UpdateProjectDto) {
    return this.projectsService.update(slug, dto);
  }

  @Delete(':slug')
  @UseGuards(JwtAuthGuard)
  remove(@Param('slug') slug: string) {
    return this.projectsService.remove(slug);
  }
}
```

`backend/src/projects/projects.module.ts`:
```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from './project.entity';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Project])],
  controllers: [ProjectsController],
  providers: [ProjectsService],
})
export class ProjectsModule {}
```

`backend/src/app.module.ts` imports에 `ProjectsModule` 추가.

- [ ] **Step 5: Commit**

```bash
git add backend/src/projects/ backend/src/app.module.ts
git commit -m "feat: add projects CRUD API"
```

---

## Phase 4: Backend — Comments + Image Upload

### Task 4.1: Comments Module

**Files:**
- Create: `backend/src/comments/comment.entity.ts`
- Create: `backend/src/comments/comments.module.ts`
- Create: `backend/src/comments/comments.controller.ts`
- Create: `backend/src/comments/comments.service.ts`
- Create: `backend/src/comments/dto/create-comment.dto.ts`
- Create: `backend/src/comments/dto/update-comment.dto.ts`
- Modify: `backend/src/app.module.ts`

- [ ] **Step 1: Comment Entity**

`backend/src/comments/comment.entity.ts`:
```typescript
import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn, Index,
  ManyToOne, OneToMany, JoinColumn,
} from 'typeorm';
import { Post } from '../posts/post.entity';

@Entity('comments')
export class Comment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Index('idx_comments_post_id')
  post_id: number;

  @ManyToOne(() => Post, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'post_id' })
  post: Post;

  @Column({ nullable: true })
  @Index('idx_comments_parent_id')
  parent_id: number;

  @ManyToOne(() => Comment, (comment) => comment.replies, { nullable: true })
  @JoinColumn({ name: 'parent_id' })
  parent: Comment;

  @OneToMany(() => Comment, (comment) => comment.parent)
  replies: Comment[];

  @Column({ length: 50 })
  nickname: string;

  @Column({ length: 255, select: false })
  password: string;

  @Column('text')
  content: string;

  @Column({ type: 'datetime', nullable: true })
  deleted_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
```

- [ ] **Step 2: DTOs**

`backend/src/comments/dto/create-comment.dto.ts`:
```typescript
import { IsString, IsOptional, IsNumber, MinLength, MaxLength } from 'class-validator';

export class CreateCommentDto {
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  nickname: string;

  @IsString()
  @MinLength(4)
  password: string;

  @IsString()
  @MinLength(1)
  content: string;

  @IsOptional()
  @IsNumber()
  parent_id?: number;
}
```

`backend/src/comments/dto/update-comment.dto.ts`:
```typescript
import { IsString, MinLength } from 'class-validator';

export class UpdateCommentDto {
  @IsString()
  @MinLength(4)
  password: string;

  @IsString()
  @MinLength(1)
  content: string;
}
```

- [ ] **Step 3: Comments Service**

`backend/src/comments/comments.service.ts`:
```typescript
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
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

    // soft delete된 댓글 내용 마스킹
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
    const comment = this.commentRepo.create({
      post_id: post.id,
      parent_id: dto.parent_id || null,
      nickname: dto.nickname,
      password: hashed,
      content: dto.content,
    });

    return this.commentRepo.save(comment);
  }

  async update(id: number, dto: UpdateCommentDto) {
    const comment = await this.commentRepo.findOne({
      where: { id },
      select: ['id', 'password', 'content', 'deleted_at'],
    });
    if (!comment || comment.deleted_at) throw new NotFoundException('Comment not found');

    const isMatch = await bcrypt.compare(dto.password, comment.password);
    if (!isMatch) throw new ForbiddenException('Wrong password');

    comment.content = dto.content;
    return this.commentRepo.save(comment);
  }

  async remove(id: number, password?: string, isAdmin = false) {
    const comment = await this.commentRepo.findOne({
      where: { id },
      select: ['id', 'password', 'deleted_at'],
    });
    if (!comment || comment.deleted_at) throw new NotFoundException('Comment not found');

    if (!isAdmin) {
      if (!password) throw new ForbiddenException('Password required');
      const isMatch = await bcrypt.compare(password, comment.password);
      if (!isMatch) throw new ForbiddenException('Wrong password');
    }

    comment.deleted_at = new Date();
    return this.commentRepo.save(comment);
  }
}
```

- [ ] **Step 4: Comments Controller (with rate limiting)**

`backend/src/comments/comments.controller.ts`:
```typescript
import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, UseGuards, Req,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { Request } from 'express';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller()
export class CommentsController {
  constructor(private commentsService: CommentsService) {}

  @Get('posts/:slug/comments')
  findByPostSlug(@Param('slug') slug: string) {
    return this.commentsService.findByPostSlug(slug);
  }

  @Post('posts/:slug/comments')
  create(@Param('slug') slug: string, @Body() dto: CreateCommentDto) {
    return this.commentsService.create(slug, dto);
  }

  @Patch('comments/:id')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  update(@Param('id') id: string, @Body() dto: UpdateCommentDto) {
    return this.commentsService.update(+id, dto);
  }

  @Delete('comments/:id')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  remove(@Param('id') id: string, @Body('password') password: string) {
    return this.commentsService.remove(+id, password);
  }

  @Delete('admin/comments/:id')
  @UseGuards(JwtAuthGuard)
  adminRemove(@Param('id') id: string) {
    return this.commentsService.remove(+id, undefined, true);
  }
}
```

- [ ] **Step 5: Comments Module**

`backend/src/comments/comments.module.ts`:
```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comment } from './comment.entity';
import { Post } from '../posts/post.entity';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Comment, Post])],
  controllers: [CommentsController],
  providers: [CommentsService],
})
export class CommentsModule {}
```

`backend/src/app.module.ts` imports에 `CommentsModule` + `ThrottlerModule` 추가:
```typescript
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

// imports 배열에:
ThrottlerModule.forRoot([{ ttl: 60000, limit: 60 }]),

// providers 배열에:
{ provide: APP_GUARD, useClass: ThrottlerGuard },
```

- [ ] **Step 6: Commit**

```bash
git add backend/src/comments/ backend/src/app.module.ts
git commit -m "feat: add comments API with replies, soft delete, rate limiting"
```

---

### Task 4.2: Image Upload

**Files:**
- Create: `backend/src/upload/upload.module.ts`
- Create: `backend/src/upload/upload.controller.ts`
- Modify: `backend/src/app.module.ts`
- Modify: `backend/src/main.ts`

- [ ] **Step 1: Upload Controller**

```bash
cd backend && pnpm add multer && pnpm add -D @types/multer
```

`backend/src/upload/upload.controller.ts`:
```typescript
import {
  Controller, Post, UseGuards, UseInterceptors,
  UploadedFile, BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuid } from 'uuid';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('upload')
export class UploadController {
  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (_req, file, cb) => {
          const name = uuid() + extname(file.originalname);
          cb(null, name);
        },
      }),
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
      fileFilter: (_req, file, cb) => {
        if (!file.mimetype.match(/^image\//)) {
          cb(new BadRequestException('Only image files allowed'), false);
        } else {
          cb(null, true);
        }
      },
    }),
  )
  upload(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No file uploaded');
    return { url: `/uploads/${file.filename}` };
  }
}
```

```bash
cd backend && pnpm add uuid && pnpm add -D @types/uuid
```

- [ ] **Step 2: Upload Module**

`backend/src/upload/upload.module.ts`:
```typescript
import { Module } from '@nestjs/common';
import { UploadController } from './upload.controller';

@Module({
  controllers: [UploadController],
})
export class UploadModule {}
```

- [ ] **Step 3: Static file serving 설정**

`backend/src/main.ts`에 추가:
```typescript
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

// NestFactory.create에 타입 추가:
const app = await NestFactory.create<NestExpressApplication>(AppModule);

// static files:
app.useStaticAssets(join(__dirname, '..', 'uploads'), { prefix: '/uploads/' });
```

uploads 디렉터리 생성:
```bash
mkdir -p backend/uploads && echo '*\n!.gitkeep' > backend/uploads/.gitignore
```

`backend/src/app.module.ts` imports에 `UploadModule` 추가.

- [ ] **Step 4: Commit**

```bash
git add backend/src/upload/ backend/src/main.ts backend/src/app.module.ts backend/uploads/.gitignore backend/package.json backend/pnpm-lock.yaml
git commit -m "feat: add image upload API with local storage"
```

---

## Phase 5: Frontend — Layout + Shared Components

### Task 5.1: Theme Provider + API Client + Types

**Files:**
- Create: `frontend/src/components/providers/theme-provider.tsx`
- Create: `frontend/src/lib/api.ts`
- Create: `frontend/src/lib/types.ts`
- Modify: `frontend/src/app/layout.tsx`

- [ ] **Step 1: Types 정의**

`frontend/src/lib/types.ts`:
```typescript
export interface Post {
  id: number;
  title: string;
  slug: string;
  content: string;
  summary: string;
  category: string;
  tags: string[];
  thumbnail: string;
  view_count: number;
  published: boolean;
  created_at: string;
  updated_at: string;
  prevPost?: { slug: string; title: string } | null;
  nextPost?: { slug: string; title: string } | null;
}

export interface Project {
  id: number;
  title: string;
  slug: string;
  description: string;
  summary: string;
  tech_stack: string[];
  github_url: string;
  demo_url: string;
  thumbnail: string;
  sort_order: number;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export interface Comment {
  id: number;
  post_id: number;
  parent_id: number | null;
  nickname: string;
  content: string;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
  replies?: Comment[];
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface Category {
  category: string;
  count: number;
}

export interface Tag {
  name: string;
  count: number;
}
```

- [ ] **Step 2: API Client**

`frontend/src/lib/api.ts`:
```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

async function fetchApi<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}/api${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });
  const json = await res.json();
  if (!json.success) {
    throw new Error(json.error?.message || 'API Error');
  }
  return json;
}

// Posts
export const getPosts = (params?: string) =>
  fetchApi(`/posts${params ? `?${params}` : ''}`);

export const getPost = (slug: string) =>
  fetchApi(`/posts/${slug}`);

// Projects
export const getProjects = () => fetchApi('/projects');

export const getProject = (slug: string) =>
  fetchApi(`/projects/${slug}`);

// Comments
export const getComments = (slug: string) =>
  fetchApi(`/posts/${slug}/comments`);

export const createComment = (slug: string, body: {
  nickname: string; password: string; content: string; parent_id?: number;
}) => fetchApi(`/posts/${slug}/comments`, {
  method: 'POST', body: JSON.stringify(body),
});

export const updateComment = (id: number, body: { password: string; content: string }) =>
  fetchApi(`/comments/${id}`, { method: 'PATCH', body: JSON.stringify(body) });

export const deleteComment = (id: number, password: string) =>
  fetchApi(`/comments/${id}`, {
    method: 'DELETE', body: JSON.stringify({ password }),
  });

// Auth
export const login = (body: { username: string; password: string }) =>
  fetchApi('/auth/login', { method: 'POST', body: JSON.stringify(body) });

export const logout = () =>
  fetchApi('/auth/logout', { method: 'POST' });

export const getMe = () => fetchApi('/auth/me');

// Categories & Tags
export const getCategories = () => fetchApi('/posts/meta/categories');
export const getTags = () => fetchApi('/posts/meta/tags');

// Admin CRUD
export const createPost = (body: Partial<import('./types').Post>) =>
  fetchApi('/posts', { method: 'POST', body: JSON.stringify(body) });

export const updatePost = (slug: string, body: Partial<import('./types').Post>) =>
  fetchApi(`/posts/${slug}`, { method: 'PATCH', body: JSON.stringify(body) });

export const deletePost = (slug: string) =>
  fetchApi(`/posts/${slug}`, { method: 'DELETE' });

export const createProject = (body: Partial<import('./types').Project>) =>
  fetchApi('/projects', { method: 'POST', body: JSON.stringify(body) });

export const updateProject = (slug: string, body: Partial<import('./types').Project>) =>
  fetchApi(`/projects/${slug}`, { method: 'PATCH', body: JSON.stringify(body) });

export const deleteProject = (slug: string) =>
  fetchApi(`/projects/${slug}`, { method: 'DELETE' });

// Upload
export const uploadImage = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(`${API_URL}/api/upload`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error?.message || 'Upload failed');
  return json.data as { url: string };
};
```

- [ ] **Step 3: Theme Provider**

`frontend/src/components/providers/theme-provider.tsx`:
```typescript
'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="light" enableSystem={false}>
      {children}
    </NextThemesProvider>
  );
}
```

- [ ] **Step 4: Root Layout 설정**

`frontend/src/app/layout.tsx`:
```typescript
import type { Metadata } from 'next';
import { ThemeProvider } from '@/components/providers/theme-provider';
import './globals.css';

export const metadata: Metadata = {
  title: 'My Blog',
  description: '개인 기술 블로그',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add frontend/src/lib/ frontend/src/components/providers/ frontend/src/app/layout.tsx
git commit -m "feat: add theme provider, API client, shared types"
```

---

### Task 5.2: Sidebar + Mobile Header + Theme Toggle

**Files:**
- Create: `frontend/src/components/layout/sidebar.tsx`
- Create: `frontend/src/components/layout/mobile-header.tsx`
- Create: `frontend/src/components/common/theme-toggle.tsx`

- [ ] **Step 1: Theme Toggle**

`frontend/src/components/common/theme-toggle.tsx`:
```typescript
'use client';

import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
    >
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
    </Button>
  );
}
```

- [ ] **Step 2: Sidebar**

`frontend/src/components/layout/sidebar.tsx`:
```typescript
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, Briefcase, User } from 'lucide-react';
import { ThemeToggle } from '@/components/common/theme-toggle';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/blog', label: 'Blog', icon: BookOpen },
  { href: '/portfolio', label: 'Portfolio', icon: Briefcase },
  { href: '/about', label: 'About', icon: User },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col w-64 min-h-screen border-r bg-background p-6">
      {/* Profile */}
      <Link href="/" className="mb-8">
        <div className="flex flex-col items-center">
          <div className="w-20 h-20 rounded-full bg-muted mb-3" />
          <h2 className="font-bold text-lg">My Blog</h2>
          <p className="text-sm text-muted-foreground">개발 학습 기록</p>
        </div>
      </Link>

      {/* Navigation */}
      <nav className="flex flex-col gap-1 mb-8">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors',
              pathname.startsWith(item.href)
                ? 'bg-accent text-accent-foreground font-medium'
                : 'text-muted-foreground hover:bg-accent/50',
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Categories placeholder - will be populated from API */}
      <div className="flex-1" />

      {/* Theme Toggle */}
      <div className="flex justify-center">
        <ThemeToggle />
      </div>
    </aside>
  );
}
```

- [ ] **Step 3: Mobile Header**

`frontend/src/components/layout/mobile-header.tsx`:
```typescript
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, BookOpen, Briefcase, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { ThemeToggle } from '@/components/common/theme-toggle';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/blog', label: 'Blog', icon: BookOpen },
  { href: '/portfolio', label: 'Portfolio', icon: Briefcase },
  { href: '/about', label: 'About', icon: User },
];

export function MobileHeader() {
  const pathname = usePathname();

  return (
    <header className="md:hidden flex items-center justify-between p-4 border-b bg-background">
      <Link href="/" className="font-bold text-lg">My Blog</Link>
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left">
            <nav className="flex flex-col gap-2 mt-8">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-md text-sm',
                    pathname.startsWith(item.href)
                      ? 'bg-accent font-medium'
                      : 'text-muted-foreground',
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              ))}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
```

- [ ] **Step 4: 공개 페이지 레이아웃 적용**

`frontend/src/app/layout.tsx` 업데이트 — Sidebar와 MobileHeader를 포함하는 레이아웃:
```typescript
import { Sidebar } from '@/components/layout/sidebar';
import { MobileHeader } from '@/components/layout/mobile-header';

// RootLayout 내부 body:
<body>
  <ThemeProvider>
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <MobileHeader />
        <main className="flex-1 p-6 md:p-8">{children}</main>
      </div>
    </div>
  </ThemeProvider>
</body>
```

- [ ] **Step 5: Commit**

```bash
git add frontend/src/components/layout/ frontend/src/components/common/ frontend/src/app/layout.tsx
git commit -m "feat: add sidebar, mobile header, theme toggle layout"
```

---

## Phase 6: Frontend — Blog + Portfolio + About Pages

### Task 6.1: Blog List Page

**Files:**
- Create: `frontend/src/app/blog/page.tsx`
- Create: `frontend/src/components/blog/post-card.tsx`
- Create: `frontend/src/components/blog/tag-badge.tsx`

구현: 글 목록을 API에서 가져와서 PostCard 그리드로 표시. 카테고리/태그 필터, 검색, 페이지네이션 포함.

- [ ] **Step 1: PostCard, TagBadge 컴포넌트 작성**
- [ ] **Step 2: Blog list page 작성 (서버 컴포넌트, fetch로 API 호출)**
- [ ] **Step 3: 동작 확인 후 Commit**

```bash
git commit -m "feat: add blog list page with post cards, filtering, search"
```

---

### Task 6.2: Blog Detail Page

**Files:**
- Create: `frontend/src/app/blog/[slug]/page.tsx`
- Create: `frontend/src/components/blog/table-of-contents.tsx`
- Create: `frontend/src/components/blog/markdown-renderer.tsx`
- Create: `frontend/src/components/comments/comment-section.tsx`
- Create: `frontend/src/components/comments/comment-item.tsx`
- Create: `frontend/src/components/comments/comment-form.tsx`

구현: 마크다운 렌더링 (react-markdown + rehype-pretty-code), 목차, 읽기 시간, 이전/다음 글 네비게이션, 댓글 섹션.

- [ ] **Step 1: MarkdownRenderer 컴포넌트 (react-markdown + code highlighting)**
- [ ] **Step 2: TableOfContents 컴포넌트 (마크다운 헤딩 파싱)**
- [ ] **Step 3: CommentSection, CommentItem, CommentForm 컴포넌트**
- [ ] **Step 4: Blog detail page 조합**
- [ ] **Step 5: SEO metadata (generateMetadata)**
- [ ] **Step 6: 동작 확인 후 Commit**

```bash
git commit -m "feat: add blog detail page with markdown, TOC, comments"
```

---

### Task 6.3: Portfolio Pages

**Files:**
- Create: `frontend/src/app/portfolio/page.tsx`
- Create: `frontend/src/app/portfolio/[slug]/page.tsx`
- Create: `frontend/src/components/portfolio/project-card.tsx`

구현: 프로젝트 카드 그리드 (목록) + 프로젝트 상세 (마크다운 렌더링, 기술 스택 배지, GitHub/데모 링크).

- [ ] **Step 1: ProjectCard 컴포넌트**
- [ ] **Step 2: Portfolio list page**
- [ ] **Step 3: Portfolio detail page**
- [ ] **Step 4: Commit**

```bash
git commit -m "feat: add portfolio list and detail pages"
```

---

### Task 6.4: Homepage + About Page

**Files:**
- Create: `frontend/src/app/page.tsx` (업데이트)
- Create: `frontend/src/app/about/page.tsx`

구현: 홈페이지 (최신 글 + 주요 프로젝트 + 소개), About 페이지 (자기소개, 기술 스택, 연락처).

- [ ] **Step 1: Homepage — API에서 최신 글 5개 + 프로젝트 3개 가져와서 표시**
- [ ] **Step 2: About page**
- [ ] **Step 3: Commit**

```bash
git commit -m "feat: add homepage and about page"
```

---

## Phase 7: Frontend — Admin Pages

### Task 7.1: Admin Layout + Login Page

**Files:**
- Create: `frontend/src/app/admin/layout.tsx`
- Create: `frontend/src/app/admin/login/page.tsx`
- Create: `frontend/src/components/admin/admin-nav.tsx`

구현: 관리자 전용 레이아웃 (상단 네비게이션), 로그인 페이지. JWT 쿠키 기반 인증 상태 관리.

- [ ] **Step 1: Admin 레이아웃 (인증 체크, 미로그인 시 /admin/login으로 리다이렉트)**
- [ ] **Step 2: AdminNav 컴포넌트**
- [ ] **Step 3: Login page (아이디/비밀번호 폼)**
- [ ] **Step 4: Commit**

```bash
git commit -m "feat: add admin layout and login page"
```

---

### Task 7.2: Admin Dashboard

**Files:**
- Create: `frontend/src/app/admin/page.tsx`

구현: 글/프로젝트/댓글 수 표시 대시보드.

- [ ] **Step 1: Dashboard page**
- [ ] **Step 2: Commit**

```bash
git commit -m "feat: add admin dashboard"
```

---

### Task 7.3: Admin Post Management

**Files:**
- Create: `frontend/src/app/admin/posts/page.tsx`
- Create: `frontend/src/app/admin/posts/new/page.tsx`
- Create: `frontend/src/app/admin/posts/[slug]/edit/page.tsx`
- Create: `frontend/src/components/admin/markdown-editor.tsx`

구현: 글 목록 (공개/초안 필터), 글 작성 (마크다운 에디터 + 미리보기), 글 수정, 글 삭제.

- [ ] **Step 1: MarkdownEditor 컴포넌트 (@uiw/react-md-editor 래핑)**
- [ ] **Step 2: Post list page (관리자용 — published/draft 모두 표시)**
- [ ] **Step 3: New post page (에디터 + 메타데이터 폼 + 이미지 업로드)**
- [ ] **Step 4: Edit post page (기존 데이터 로드 + 수정)**
- [ ] **Step 5: Commit**

```bash
git commit -m "feat: add admin post management with markdown editor"
```

---

### Task 7.4: Admin Project Management

**Files:**
- Create: `frontend/src/app/admin/projects/page.tsx`
- Create: `frontend/src/app/admin/projects/new/page.tsx`
- Create: `frontend/src/app/admin/projects/[slug]/edit/page.tsx`

구현: Post management와 동일 패턴. 프로젝트 목록/작성/수정/삭제.

- [ ] **Step 1: Project list, new, edit pages (Post와 동일 패턴)**
- [ ] **Step 2: Commit**

```bash
git commit -m "feat: add admin project management"
```

---

### Task 7.5: Admin Comment Management

**Files:**
- Create: `frontend/src/app/admin/comments/page.tsx`

구현: 전체 댓글 조회 (글별 그룹핑), 관리자 삭제 기능.

- [ ] **Step 1: Comment management page**
- [ ] **Step 2: Commit**

```bash
git commit -m "feat: add admin comment management"
```

---

## Phase 8: Docker + Polish

### Task 8.1: Docker Production Build

**Files:**
- Create: `frontend/Dockerfile`
- Create: `backend/Dockerfile`
- Modify: `docker-compose.yml`

- [ ] **Step 1: Backend Dockerfile**

`backend/Dockerfile`:
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN corepack enable && pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
RUN mkdir -p uploads
EXPOSE 4000
CMD ["node", "dist/main"]
```

- [ ] **Step 2: Frontend Dockerfile**

`frontend/Dockerfile`:
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN corepack enable && pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["pnpm", "start"]
```

- [ ] **Step 3: docker-compose.yml에 frontend/backend 서비스 추가**

기존 MySQL만 있던 docker-compose.yml에 frontend, backend 서비스를 스펙 문서의 구조대로 추가한다. healthcheck, volumes, environment 변수 모두 포함.

- [ ] **Step 4: 전체 빌드 테스트**

```bash
docker compose up --build
```

Expected: 3개 서비스 모두 실행. `http://localhost:3000`에서 블로그 접근 가능.

- [ ] **Step 5: Commit**

```bash
git add frontend/Dockerfile backend/Dockerfile docker-compose.yml
git commit -m "feat: add Docker production build for all services"
```

---

### Task 8.2: SEO Metadata

**Files:**
- Modify: `frontend/src/app/blog/[slug]/page.tsx`
- Modify: `frontend/src/app/portfolio/[slug]/page.tsx`
- Modify: `frontend/src/app/blog/page.tsx`
- Modify: `frontend/src/app/about/page.tsx`

- [ ] **Step 1: 각 페이지에 generateMetadata 추가**

블로그 상세 예시:
```typescript
export async function generateMetadata({ params }: { params: { slug: string } }) {
  const res = await getPost(params.slug);
  const post = res.data;
  return {
    title: `${post.title} | My Blog`,
    description: post.summary,
    openGraph: {
      title: post.title,
      description: post.summary,
      images: post.thumbnail ? [post.thumbnail] : [],
    },
  };
}
```

- [ ] **Step 2: 나머지 페이지에도 적용**
- [ ] **Step 3: Commit**

```bash
git commit -m "feat: add SEO metadata to all pages"
```

---

### Task 8.3: 최종 정리

- [ ] **Step 1: 기존 `docs/plans/` 문서에 deprecated 표시**
- [ ] **Step 2: 불필요한 파일 정리**
- [ ] **Step 3: 최종 Commit**

```bash
git commit -m "chore: clean up deprecated docs and unused files"
```

---

## Summary

| Phase | Tasks | Description |
|-------|-------|-------------|
| 1 | 1.1-1.3 | Docker + NestJS + Next.js 프로젝트 세팅 |
| 2 | 2.1-2.2 | 백엔드 공통 모듈 + 관리자 인증 |
| 3 | 3.1-3.2 | 블로그 + 포트폴리오 CRUD API |
| 4 | 4.1-4.2 | 댓글 API + 이미지 업로드 |
| 5 | 5.1-5.2 | 프론트엔드 레이아웃 + 공통 컴포넌트 |
| 6 | 6.1-6.4 | 블로그/포트폴리오/홈/About 페이지 |
| 7 | 7.1-7.5 | 관리자 페이지 전체 |
| 8 | 8.1-8.3 | Docker 빌드 + SEO + 정리 |

**Total:** 8 Phase, 17 Tasks
