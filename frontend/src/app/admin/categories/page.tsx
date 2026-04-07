'use client';

import { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getCategoryTree, createCategory, updateCategory, deleteCategory } from '@/lib/api';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import type { CategoryTree, CategoryChild } from '@/lib/types';

interface FormState {
  mode: 'create' | 'edit';
  id?: number;
  name: string;
  slug: string;
  parent_id: number | null;
  sort_order: number;
}

const emptyForm: FormState = {
  mode: 'create',
  name: '',
  slug: '',
  parent_id: null,
  sort_order: 0,
};

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<CategoryTree[]>([]);
  const [form, setForm] = useState<FormState | null>(null);
  const [error, setError] = useState('');

  const fetchCategories = useCallback(async () => {
    const res = await getCategoryTree();
    if (res.success) setCategories(res.data);
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  // 이름 → slug 자동 생성
  const nameToSlug = (name: string) =>
    name.toLowerCase().replace(/[^a-z0-9가-힣]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');

  const openCreate = (parentId: number | null = null) => {
    setForm({ ...emptyForm, parent_id: parentId });
    setError('');
  };

  const openEdit = (cat: CategoryTree | CategoryChild, parentId: number | null = null) => {
    setForm({
      mode: 'edit',
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      parent_id: parentId,
      sort_order: cat.sort_order,
    });
    setError('');
  };

  const handleSubmit = async () => {
    if (!form) return;
    setError('');

    const body = {
      name: form.name,
      slug: form.slug,
      parent_id: form.parent_id ?? undefined,
      sort_order: form.sort_order,
    };

    try {
      if (form.mode === 'create') {
        const res = await createCategory(body);
        if (!res.success) throw new Error(res.message);
      } else {
        const res = await updateCategory(form.id!, body);
        if (!res.success) throw new Error(res.message);
      }
      setForm(null);
      fetchCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다.');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    try {
      const res = await deleteCategory(id);
      if (!res.success) throw new Error(res.message);
      fetchCategories();
    } catch (err) {
      alert(err instanceof Error ? err.message : '삭제에 실패했습니다.');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Categories</h1>
        <Button onClick={() => openCreate(null)}>
          <Plus className="h-4 w-4 mr-1" /> 대분류 추가
        </Button>
      </div>

      {/* 폼 영역 */}
      {form && (
        <div className="border rounded-lg p-4 mb-6 bg-muted/30">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">
              {form.mode === 'create'
                ? (form.parent_id ? '소분류 추가' : '대분류 추가')
                : '카테고리 수정'}
            </h3>
            <Button variant="ghost" size="icon" onClick={() => setForm(null)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <Input
              placeholder="이름"
              value={form.name}
              onChange={(e) =>
                setForm({
                  ...form,
                  name: e.target.value,
                  slug: form.mode === 'create' ? nameToSlug(e.target.value) : form.slug,
                })
              }
            />
            <Input
              placeholder="slug"
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
            />
            <Input
              type="number"
              placeholder="정렬 순서"
              value={form.sort_order}
              onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })}
            />
            <Button onClick={handleSubmit}>
              {form.mode === 'create' ? '추가' : '수정'}
            </Button>
          </div>
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </div>
      )}

      {/* 카테고리 트리 테이블 */}
      <div className="border rounded-lg">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left p-3">이름</th>
              <th className="text-left p-3">Slug</th>
              <th className="text-left p-3">글 수</th>
              <th className="text-left p-3">정렬</th>
              <th className="text-right p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((parent) => (
              <>
                {/* 대분류 */}
                <tr key={parent.id} className="border-b bg-muted/20">
                  <td className="p-3 font-semibold">{parent.name}</td>
                  <td className="p-3 text-muted-foreground">{parent.slug}</td>
                  <td className="p-3">{parent.post_count}</td>
                  <td className="p-3">{parent.sort_order}</td>
                  <td className="p-3 text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="sm" onClick={() => openCreate(parent.id)}>
                        <Plus className="h-3.5 w-3.5 mr-1" /> 소분류
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => openEdit(parent, null)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(parent.id)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </td>
                </tr>
                {/* 소분류 */}
                {parent.children.map((child) => (
                  <tr key={child.id} className="border-b">
                    <td className="p-3 pl-8 text-muted-foreground">└ {child.name}</td>
                    <td className="p-3 text-muted-foreground">{child.slug}</td>
                    <td className="p-3">{child.post_count}</td>
                    <td className="p-3">{child.sort_order}</td>
                    <td className="p-3 text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(child, parent.id)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(child.id)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </>
            ))}
            {categories.length === 0 && (
              <tr>
                <td colSpan={5} className="p-6 text-center text-muted-foreground">
                  카테고리가 없습니다. 첫 번째 카테고리를 추가해보세요.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
