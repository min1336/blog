import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { PostsModule } from './posts/posts.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3307'),
      username: process.env.DB_USERNAME || 'blog',
      password: process.env.DB_PASSWORD || 'blogpass123',
      database: process.env.DB_DATABASE || 'blog',
      autoLoadEntities: true,
      synchronize: true,
    }),
    AuthModule,
    PostsModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
