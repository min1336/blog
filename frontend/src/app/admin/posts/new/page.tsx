'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MarkdownEditor } from '@/components/admin/markdown-editor';
import { createPost, getCategoryTree } from '@/lib/api';
import { ChevronDown, ChevronRight } from 'lucide-react';
import type { CategoryTree } from '@/lib/types';

export default function NewPostPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [content, setContent] = useState('');
  const [summary, setSummary] = useState('');
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [categories, setCategories] = useState<CategoryTree[]>([]);
  const [tags, setTags] = useState('');
  const [published, setPublished] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [metaOpen, setMetaOpen] = useState(false);

  useEffect(() => {
    getCategoryTree().then((res) => {
      if (res.success) setCategories(res.data);
    });
  }, []);

  const handleTitleChange = (value: string) => {
    setTitle(value);
    const base = value
      .toLowerCase()
      .replace(/[^a-z0-9가-힣ㄱ-ㅎㅏ-ㅣ\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    const suffix = Math.random().toString(36).slice(2, 6);
    setSlug(`${base || 'post'}-${suffix}`);
  };

  const handleSubmit = async () => {
    if (!title.trim() || loading) return;
    setLoading(true);
    setError('');
    try {
      await createPost({
        title,
        slug,
        content,
        summary,
        category_id: categoryId,
        tags: tags ? tags.split(',').map((t) => t.trim()) : [],
        published,
      });
      router.push('/admin/posts');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  // 선택된 카테고리 이름 찾기
  const selectedCategoryName = categories
    .flatMap((p) => p.children)
    .find((c) => c.id === categoryId)?.name;

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* 제목 + 요약 */}
      <div className="px-2 pt-2 pb-4 space-y-2">
        <input
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="제목을 입력하세요..."
          className="w-full text-3xl font-bold bg-transparent border-none outline-none placeholder:text-muted-foreground/40"
          autoFocus
        />
        <input
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          placeholder="요약을 입력하세요... (선택)"
          className="w-full text-base text-muted-foreground bg-transparent border-none outline-none placeholder:text-muted-foreground/30"
        />
      </div>

      {/* 메타데이터 접기/펼치기 */}
      <div className="px-2 pb-3">
        <button
          onClick={() => setMetaOpen(!metaOpen)}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          {metaOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
          <span>
            {selectedCategoryName || '미분류'}
            {tags && ` · ${tags}`}
          </span>
        </button>

        {metaOpen && (
          <div className="mt-2 flex gap-3 items-end">
            <div className="flex-1 max-w-xs">
              <label className="text-xs text-muted-foreground mb-1 block">카테고리</label>
              <select
                value={categoryId ?? ''}
                onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : null)}
                className="w-full h-9 px-3 rounded-lg border bg-background text-sm"
              >
                <option value="">미분류</option>
                {categories.map((parent) => (
                  <optgroup key={parent.id} label={parent.name}>
                    {parent.children.length > 0
                      ? parent.children.map((child) => (
                          <option key={child.id} value={child.id}>{child.name}</option>
                        ))
                      : <option disabled>소분류를 먼저 추가하세요</option>
                    }
                  </optgroup>
                ))}
              </select>
            </div>
            <div className="flex-1 max-w-xs">
              <label className="text-xs text-muted-foreground mb-1 block">태그</label>
              <Input
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="nestjs, typescript"
                className="h-9"
              />
            </div>
          </div>
        )}
      </div>

      {/* 마크다운 에디터 — 남은 공간 전부 차지 */}
      <div className="flex-1 min-h-0">
        <MarkdownEditor value={content} onChange={setContent} />
      </div>

      {/* 하단 고정 바 */}
      <div className="border-t bg-background px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
          <button
            onClick={() => setPublished(false)}
            className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
              !published ? 'bg-background shadow-sm font-medium' : 'text-muted-foreground'
            }`}
          >
            Draft
          </button>
          <button
            onClick={() => setPublished(true)}
            className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
              published ? 'bg-background shadow-sm font-medium' : 'text-muted-foreground'
            }`}
          >
            Publish
          </button>
        </div>

        <div className="flex items-center gap-3">
          {error && <span className="text-sm text-red-500">{error}</span>}
          <Button variant="ghost" onClick={() => router.back()}>
            취소
          </Button>
          <Button onClick={handleSubmit} disabled={loading || !title.trim()}>
            {loading ? '저장 중...' : published ? '발행하기' : '저장하기'}
          </Button>
        </div>
      </div>
    </div>
  );
}
