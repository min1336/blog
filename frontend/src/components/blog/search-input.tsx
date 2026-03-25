'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { Search, X } from 'lucide-react';

// 검색 최대 길이 제한
const MAX_SEARCH_LENGTH = 100;

interface SearchInputProps {
  // 검색 결과를 보낼 기본 경로 (기본값: /blog)
  basePath?: string;
  placeholder?: string;
}

export function SearchInput({ basePath = '/blog', placeholder = '글 검색...' }: SearchInputProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(searchParams.get('search') || '');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = value.trim();
    if (trimmed) {
      router.push(`${basePath}?search=${encodeURIComponent(trimmed)}`);
    } else {
      router.push(basePath);
    }
  }

  // 검색어 초기화
  function handleClear() {
    setValue('');
    router.push(basePath);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    // 최대 길이 제한 적용
    if (e.target.value.length <= MAX_SEARCH_LENGTH) {
      setValue(e.target.value);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        maxLength={MAX_SEARCH_LENGTH}
        className="w-full pl-10 pr-8 py-2 rounded-lg border bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
      />
      {/* 검색어가 있을 때 X 버튼 표시 */}
      {value && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-2 top-1/2 -translate-y-1/2 h-5 w-5 flex items-center justify-center rounded-full hover:bg-accent text-muted-foreground"
          aria-label="검색어 초기화"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </form>
  );
}
