'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Settings } from 'lucide-react';
import { getMe } from '@/lib/api';

/**
 * 로그인된 관리자가 공개 페이지에 있을 때 표시되는 플로팅 버튼
 * 클릭하면 현재 페이지에 대응하는 관리자 페이지로 이동
 */
export function AdminFab() {
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    getMe().then((res) => {
      if (res.success) setIsAdmin(true);
    });
  }, []);

  // 이미 관리자 페이지면 표시 안 함
  if (!isAdmin || pathname.startsWith('/admin')) return null;

  // 현재 페이지에 대응하는 관리자 페이지
  let adminHref = '/admin';
  if (pathname === '/' || pathname.startsWith('/blog')) {
    adminHref = '/admin/posts';
  } else if (pathname.startsWith('/portfolio')) {
    adminHref = '/admin/projects';
  }

  return (
    <Link
      href={adminHref}
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-full bg-zinc-900 text-zinc-100 dark:bg-zinc-100 dark:text-zinc-900 shadow-lg hover:scale-105 transition-transform text-sm font-medium"
    >
      <Settings className="h-4 w-4" />
      Admin
    </Link>
  );
}
