'use client';

import { useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import type { ICommand } from '@uiw/react-md-editor';
import {
  bold, italic, strikethrough, hr,
  link, quote, code, codeBlock, image, table,
  help, divider,
} from '@uiw/react-md-editor/commands';
import { remarkDashList } from '@/lib/remark-dash-list';
import '@uiw/react-md-editor/markdown-editor.css';

const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false });

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
}

const EMPTY_LIST_PATTERN = /^\s*([-*]|\d+\.)\s*$/;

// 불렛 리스트 (•)
const bulletList: ICommand = {
  name: 'bullet-list',
  keyCommand: 'bullet-list',
  buttonProps: { 'aria-label': '불렛 리스트', title: '불렛 리스트 (•)' },
  icon: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <circle cx="4" cy="6" r="2.5" />
      <rect x="9" y="4.5" width="13" height="3" rx="1" />
      <circle cx="4" cy="12" r="2.5" />
      <rect x="9" y="10.5" width="13" height="3" rx="1" />
      <circle cx="4" cy="18" r="2.5" />
      <rect x="9" y="16.5" width="13" height="3" rx="1" />
    </svg>
  ),
  execute: (state, api) => {
    if (!state || !api) return;
    if (!state.selectedText) { api.replaceSelection('* '); return; }
    const lines = state.selectedText.split('\n');
    const toggled = lines.map((l) => l.startsWith('* ') ? l.slice(2) : `* ${l}`);
    api.replaceSelection(toggled.join('\n'));
  },
};

// 대시 리스트 (–)
const dashList: ICommand = {
  name: 'dash-list',
  keyCommand: 'dash-list',
  buttonProps: { 'aria-label': '대시 리스트', title: '대시 리스트 (–)' },
  icon: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <rect x="1" y="5" width="6" height="2" rx="1" />
      <rect x="9" y="4.5" width="13" height="3" rx="1" />
      <rect x="1" y="11" width="6" height="2" rx="1" />
      <rect x="9" y="10.5" width="13" height="3" rx="1" />
      <rect x="1" y="17" width="6" height="2" rx="1" />
      <rect x="9" y="16.5" width="13" height="3" rx="1" />
    </svg>
  ),
  execute: (state, api) => {
    if (!state || !api) return;
    if (!state.selectedText) { api.replaceSelection('- '); return; }
    const lines = state.selectedText.split('\n');
    const toggled = lines.map((l) => l.startsWith('- ') ? l.slice(2) : `- ${l}`);
    api.replaceSelection(toggled.join('\n'));
  },
};

// 숫자 리스트 (1. 2. 3.)
const numberedList: ICommand = {
  name: 'numbered-list',
  keyCommand: 'numbered-list',
  buttonProps: { 'aria-label': '숫자 리스트', title: '숫자 리스트 (1. 2. 3.)' },
  icon: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <text x="1" y="8" fontSize="8" fontWeight="bold" fontFamily="sans-serif">1</text>
      <rect x="9" y="4.5" width="13" height="3" rx="1" />
      <text x="1" y="14.5" fontSize="8" fontWeight="bold" fontFamily="sans-serif">2</text>
      <rect x="9" y="10.5" width="13" height="3" rx="1" />
      <text x="1" y="21" fontSize="8" fontWeight="bold" fontFamily="sans-serif">3</text>
      <rect x="9" y="16.5" width="13" height="3" rx="1" />
    </svg>
  ),
  execute: (state, api) => {
    if (!state || !api) return;
    if (!state.selectedText) { api.replaceSelection('1. '); return; }
    const lines = state.selectedText.split('\n');
    const toggled = lines.map((l, i) =>
      /^\d+\.\s/.test(l) ? l.replace(/^\d+\.\s/, '') : `${i + 1}. ${l}`,
    );
    api.replaceSelection(toggled.join('\n'));
  },
};

const toolbarCommands: ICommand[] = [
  bold, italic, strikethrough, hr,
  divider,
  link, quote, code, codeBlock, image, table,
  divider,
  bulletList, dashList, numberedList,
  divider,
  help,
];

export function MarkdownEditor({ value, onChange }: MarkdownEditorProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  // 빈 리스트 아이템에서 Enter → 리스트 탈출
  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Enter' || e.isComposing || e.shiftKey) return;

      const textarea = wrapper.querySelector('textarea');
      if (!textarea) return;

      const text = textarea.value;
      const { selectionStart } = textarea;
      const beforeCursor = text.slice(0, selectionStart);
      const lineStart = beforeCursor.lastIndexOf('\n') + 1;
      const currentLine = text.slice(lineStart, selectionStart);

      if (EMPTY_LIST_PATTERN.test(currentLine)) {
        e.preventDefault();
        e.stopPropagation();

        const before = text.slice(0, lineStart);
        const after = text.slice(selectionStart);
        onChangeRef.current(before + after);

        requestAnimationFrame(() => {
          textarea.selectionStart = textarea.selectionEnd = lineStart;
        });
      }
    };

    wrapper.addEventListener('keydown', handleKeyDown, true);
    return () => wrapper.removeEventListener('keydown', handleKeyDown, true);
  }, []);

  // 여백 클릭 시 커서를 본문 맨 끝으로 이동
  const handleClick = (e: React.MouseEvent) => {
    const textarea = wrapperRef.current?.querySelector('textarea');
    if (!textarea) return;

    const target = e.target as HTMLElement;
    if (target.closest('.w-md-editor-toolbar') || target.closest('.wmde-markdown')) return;
    if (target === textarea) return;

    textarea.focus();
    textarea.selectionStart = textarea.selectionEnd = textarea.value.length;
  };

  return (
    <div ref={wrapperRef} onClick={handleClick} data-color-mode="light" className="h-full cursor-text [&>.w-md-editor]:!h-full [&_.w-md-editor-content]:!h-[calc(100%-29px)]">
      <MDEditor
        value={value}
        onChange={(val) => onChange(val || '')}
        height="100%"
        preview="live"
        visibleDragbar={false}
        commands={toolbarCommands}
        previewOptions={{
          remarkPlugins: [remarkDashList],
          components: {
            a: ({ children, href, ...props }) => (
              <a {...props} href={href} target="_blank" rel="noopener noreferrer">
                {children}
              </a>
            ),
          },
        }}
      />
    </div>
  );
}
