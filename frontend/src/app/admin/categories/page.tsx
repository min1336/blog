'use client';

import { Fragment, useEffect, useState, useCallback, useRef } from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getCategoryTree, createCategory, updateCategory, deleteCategory } from '@/lib/api';
import { useCategoryEvents } from '@/lib/use-category-events';
import { Plus, Trash2, GripVertical, Check, X } from 'lucide-react';
import type { CategoryTree, CategoryChild } from '@/lib/types';

const nameToSlug = (name: string) => {
  const base = name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9가-힣ㄱ-ㅎㅏ-ㅣ-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  // 항상 고유한 suffix 추가
  const suffix = Math.random().toString(36).slice(2, 6);
  return `${base || 'cat'}-${suffix}`;
};

// 인라인 입력
function InlineInput({
  defaultValue,
  placeholder,
  indent,
  onSubmit,
  onCancel,
}: {
  defaultValue?: string;
  placeholder: string;
  indent?: boolean;
  onSubmit: (name: string) => void;
  onCancel: () => void;
}) {
  const [value, setValue] = useState(defaultValue || '');
  const [submitted, setSubmitted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const submit = () => {
    if (submitted || !value.trim()) return;
    setSubmitted(true);
    onSubmit(value.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.nativeEvent.isComposing) return;
    if (e.key === 'Enter') submit();
    if (e.key === 'Escape') onCancel();
  };

  return (
    <div className={`flex items-center gap-2 px-3 py-2 border-b bg-accent/30 ${indent ? 'pl-12' : 'pl-10'}`}>
      {indent && <span className="text-muted-foreground">└</span>}
      <Input
        ref={inputRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => { if (!value.trim()) onCancel(); }}
        placeholder={placeholder}
        className="h-8 max-w-xs"
        disabled={submitted}
      />
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 shrink-0"
        onClick={submit}
        disabled={!value.trim() || submitted}
      >
        <Check className="h-4 w-4 text-green-600" />
      </Button>
      <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={onCancel}>
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}

// 대분류 행
function SortableParentRow({
  parent,
  isEditing,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onDelete,
  onAddChild,
  children,
}: {
  parent: CategoryTree;
  isEditing: boolean;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSaveEdit: (name: string) => void;
  onDelete: () => void;
  onAddChild: () => void;
  children: React.ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: `parent-${parent.id}`,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  if (isEditing) {
    return (
      <div>
        <InlineInput
          defaultValue={parent.name}
          placeholder="대분류 이름"
          onSubmit={onSaveEdit}
          onCancel={onCancelEdit}
        />
        {children}
      </div>
    );
  }

  return (
    <div ref={setNodeRef} style={style}>
      <div className="flex items-center border-b bg-muted/20 group">
        <div className="p-3 w-10 shrink-0">
          <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground">
            <GripVertical className="h-4 w-4" />
          </button>
        </div>
        <div className="p-3 font-semibold flex-1 cursor-default" onDoubleClick={onStartEdit}>
          {parent.name}
        </div>
        <div className="p-3 text-muted-foreground text-xs w-16 shrink-0">{parent.post_count}개</div>
        <div className="p-3 shrink-0">
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={onAddChild}>
              <Plus className="h-3 w-3 mr-1" /> 소분류
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onDelete}>
              <Trash2 className="h-3.5 w-3.5 text-red-500" />
            </Button>
          </div>
        </div>
      </div>
      {children}
    </div>
  );
}

// 소분류 행
function SortableChildRow({
  child,
  parentId,
  isEditing,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onDelete,
}: {
  child: CategoryChild;
  parentId: number;
  isEditing: boolean;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSaveEdit: (name: string) => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: `child-${parentId}-${child.id}`,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  if (isEditing) {
    return (
      <InlineInput
        defaultValue={child.name}
        placeholder="소분류 이름"
        indent
        onSubmit={onSaveEdit}
        onCancel={onCancelEdit}
      />
    );
  }

  return (
    <div ref={setNodeRef} style={style} className="flex items-center border-b group">
      <div className="p-3 w-10 pl-8 shrink-0">
        <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground">
          <GripVertical className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="p-3 pl-8 text-muted-foreground flex-1 cursor-default" onDoubleClick={onStartEdit}>
        └ {child.name}
      </div>
      <div className="p-3 text-muted-foreground text-xs w-16 shrink-0">{child.post_count}개</div>
      <div className="p-3 shrink-0">
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onDelete}>
            <Trash2 className="h-3.5 w-3.5 text-red-500" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<CategoryTree[]>([]);
  const [adding, setAdding] = useState<{ parentId: number | null } | null>(null);
  const [editing, setEditing] = useState<{ id: number; parentId: number | null } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  const fetchCategories = useCallback(async () => {
    const res = await getCategoryTree();
    if (res.success) setCategories(res.data);
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  // SSE: 다른 탭/사용자가 변경해도 자동 갱신
  useCategoryEvents(fetchCategories);

  const handleCreate = async (name: string, parentId: number | null) => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const res = await createCategory({
        name,
        slug: nameToSlug(name),
        parent_id: parentId ?? undefined,
      });
      if (res.success) {
        setAdding(null);
        fetchCategories();
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async (id: number, name: string) => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const res = await updateCategory(id, { name, slug: nameToSlug(name) });
      if (res.success) {
        setEditing(null);
        fetchCategories();
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    await deleteCategory(id);
    fetchCategories();
  };

  const handleParentDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeId = Number(String(active.id).replace('parent-', ''));
    const overId = Number(String(over.id).replace('parent-', ''));
    const oldIndex = categories.findIndex((c) => c.id === activeId);
    const newIndex = categories.findIndex((c) => c.id === overId);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = [...categories];
    const [moved] = reordered.splice(oldIndex, 1);
    reordered.splice(newIndex, 0, moved);
    setCategories(reordered);

    await Promise.all(reordered.map((cat, i) => updateCategory(cat.id, { sort_order: i })));
    fetchCategories();
  };

  const handleChildDragEnd = async (event: DragEndEvent, parentId: number) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeChildId = Number(String(active.id).split('-').pop());
    const overChildId = Number(String(over.id).split('-').pop());
    const parent = categories.find((c) => c.id === parentId);
    if (!parent) return;

    const oldIndex = parent.children.findIndex((c) => c.id === activeChildId);
    const newIndex = parent.children.findIndex((c) => c.id === overChildId);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = [...parent.children];
    const [moved] = reordered.splice(oldIndex, 1);
    reordered.splice(newIndex, 0, moved);
    setCategories((prev) => prev.map((c) => (c.id === parentId ? { ...c, children: reordered } : c)));

    await Promise.all(reordered.map((child, i) => updateCategory(child.id, { sort_order: i })));
    fetchCategories();
  };

  const parentIds = categories.map((c) => `parent-${c.id}`);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Categories</h1>

      <div className="border rounded-lg overflow-hidden">
        {/* 헤더 */}
        <div className="flex items-center border-b bg-muted/50 text-sm font-medium">
          <div className="w-10 p-3 shrink-0" />
          <div className="p-3 flex-1">이름</div>
          <div className="p-3 w-16 shrink-0">글 수</div>
          <div className="p-3 w-28 shrink-0" />
        </div>

        {/* 대분류 리스트 */}
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleParentDragEnd}>
          <SortableContext items={parentIds} strategy={verticalListSortingStrategy}>
            {categories.map((parent) => (
              <SortableParentRow
                key={parent.id}
                parent={parent}
                isEditing={editing?.id === parent.id && editing.parentId === null}
                onStartEdit={() => { setEditing({ id: parent.id, parentId: null }); setAdding(null); }}
                onCancelEdit={() => setEditing(null)}
                onSaveEdit={(name) => handleEdit(parent.id, name)}
                onDelete={() => handleDelete(parent.id)}
                onAddChild={() => { setAdding({ parentId: parent.id }); setEditing(null); }}
              >
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={(e) => handleChildDragEnd(e, parent.id)}
                >
                  <SortableContext
                    items={parent.children.map((c) => `child-${parent.id}-${c.id}`)}
                    strategy={verticalListSortingStrategy}
                  >
                    {parent.children.map((child) => (
                      <SortableChildRow
                        key={child.id}
                        child={child}
                        parentId={parent.id}
                        isEditing={editing?.id === child.id}
                        onStartEdit={() => { setEditing({ id: child.id, parentId: parent.id }); setAdding(null); }}
                        onCancelEdit={() => setEditing(null)}
                        onSaveEdit={(name) => handleEdit(child.id, name)}
                        onDelete={() => handleDelete(child.id)}
                      />
                    ))}
                  </SortableContext>
                </DndContext>

                {adding?.parentId === parent.id && (
                  <InlineInput
                    placeholder="소분류 이름 입력 후 Enter"
                    indent
                    onSubmit={(name) => handleCreate(name, parent.id)}
                    onCancel={() => setAdding(null)}
                  />
                )}
              </SortableParentRow>
            ))}
          </SortableContext>
        </DndContext>

        {/* 대분류 인라인 추가 */}
        {adding?.parentId === null && (
          <InlineInput
            placeholder="대분류 이름 입력 후 Enter"
            onSubmit={(name) => handleCreate(name, null)}
            onCancel={() => setAdding(null)}
          />
        )}

        {/* 빈 상태 */}
        {categories.length === 0 && !adding && (
          <div className="p-8 text-center text-muted-foreground">카테고리가 없습니다</div>
        )}

        {/* 대분류 추가 버튼 */}
        {!adding && (
          <button
            onClick={() => { setAdding({ parentId: null }); setEditing(null); }}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors px-5 py-3 hover:bg-accent w-full"
          >
            <Plus className="h-3.5 w-3.5" /> 대분류 추가
          </button>
        )}
      </div>

      <p className="text-xs text-muted-foreground mt-3">
        드래그로 순서 변경 · 더블클릭으로 이름 수정
      </p>
    </div>
  );
}
