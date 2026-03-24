'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import type { Comment } from '@/lib/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function AdminCommentsPage() {
  const [comments, setComments] = useState<(Comment & { post?: { title: string; slug: string } })[]>([]);

  const fetchComments = async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/comments`, { credentials: 'include' });
      const json = await res.json();
      if (json.success) setComments(json.data);
    } catch {}
  };

  useEffect(() => { fetchComments(); }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('댓글을 삭제하시겠습니까?')) return;
    try {
      await fetch(`${API_URL}/api/admin/comments/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      fetchComments();
    } catch {}
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Comments</h1>
      <div className="border rounded-lg">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left p-3">Post</th>
              <th className="text-left p-3">Nickname</th>
              <th className="text-left p-3">Content</th>
              <th className="text-left p-3">Date</th>
              <th className="text-right p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {comments.map((c) => (
              <tr key={c.id} className={`border-b ${c.deleted_at ? 'opacity-50' : ''}`}>
                <td className="p-3">{c.post?.title || '-'}</td>
                <td className="p-3">{c.nickname}</td>
                <td className="p-3 max-w-xs truncate">{c.content}</td>
                <td className="p-3 text-muted-foreground">
                  {new Date(c.created_at).toLocaleDateString('ko-KR')}
                </td>
                <td className="p-3 text-right">
                  {!c.deleted_at && (
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(c.id)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  )}
                </td>
              </tr>
            ))}
            {comments.length === 0 && (
              <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">No comments yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
