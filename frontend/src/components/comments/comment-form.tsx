'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { createComment } from '@/lib/api';

interface CommentFormProps {
  slug: string;
  parentId?: number;
  onSuccess: () => void;
  onCancel?: () => void;
}

export function CommentForm({ slug, parentId, onSuccess, onCancel }: CommentFormProps) {
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await createComment(slug, {
        nickname,
        password,
        content,
        parent_id: parentId,
      });
      setNickname('');
      setPassword('');
      setContent('');
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to post comment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex gap-2">
        <Input
          placeholder="닉네임"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          required
          className="flex-1"
        />
        <Input
          type="password"
          placeholder="비밀번호 (4자 이상)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={4}
          className="flex-1"
        />
      </div>
      <Textarea
        placeholder={parentId ? '답글을 작성하세요...' : '댓글을 작성하세요...'}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        required
        rows={3}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={loading}>
          {loading ? '작성 중...' : parentId ? '답글 작성' : '댓글 작성'}
        </Button>
        {onCancel && (
          <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
            취소
          </Button>
        )}
      </div>
    </form>
  );
}
