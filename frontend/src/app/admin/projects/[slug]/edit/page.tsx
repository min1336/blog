'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MarkdownEditor } from '@/components/admin/markdown-editor';
import { getProject, updateProject } from '@/lib/api';

export default function EditProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [projectSlug, setProjectSlug] = useState('');
  const [description, setDescription] = useState('');
  const [summary, setSummary] = useState('');
  const [techStack, setTechStack] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [demoUrl, setDemoUrl] = useState('');
  const [sortOrder, setSortOrder] = useState(0);
  const [published, setPublished] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getProject(slug).then((res) => {
      const p = res.data;
      setTitle(p.title); setProjectSlug(p.slug);
      setDescription(p.description); setSummary(p.summary || '');
      setTechStack(p.tech_stack ? p.tech_stack.join(', ') : '');
      setGithubUrl(p.github_url || ''); setDemoUrl(p.demo_url || '');
      setSortOrder(p.sort_order); setPublished(p.published);
    }).catch(() => {});
  }, [slug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await updateProject(slug, {
        title, slug: projectSlug, description, summary,
        tech_stack: techStack ? techStack.split(',').map((t) => t.trim()) : [],
        github_url: githubUrl || undefined, demo_url: demoUrl || undefined,
        sort_order: sortOrder, published,
      });
      router.push('/admin/projects');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Edit Project</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div><label className="text-sm font-medium">Title</label><Input value={title} onChange={(e) => setTitle(e.target.value)} required /></div>
          <div><label className="text-sm font-medium">Slug</label><Input value={projectSlug} onChange={(e) => setProjectSlug(e.target.value)} required /></div>
        </div>
        <div><label className="text-sm font-medium">Summary</label><Input value={summary} onChange={(e) => setSummary(e.target.value)} /></div>
        <div className="grid gap-4 md:grid-cols-3">
          <div><label className="text-sm font-medium">Tech Stack (comma)</label><Input value={techStack} onChange={(e) => setTechStack(e.target.value)} /></div>
          <div><label className="text-sm font-medium">GitHub URL</label><Input value={githubUrl} onChange={(e) => setGithubUrl(e.target.value)} /></div>
          <div><label className="text-sm font-medium">Demo URL</label><Input value={demoUrl} onChange={(e) => setDemoUrl(e.target.value)} /></div>
        </div>
        <div><label className="text-sm font-medium">Sort Order</label><Input type="number" value={sortOrder} onChange={(e) => setSortOrder(+e.target.value)} /></div>
        <div><label className="text-sm font-medium">Description</label><MarkdownEditor value={description} onChange={setDescription} /></div>
        <div className="flex items-center gap-2">
          <input type="checkbox" id="published" checked={published} onChange={(e) => setPublished(e.target.checked)} />
          <label htmlFor="published" className="text-sm">Publish</label>
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
        <div className="flex gap-2">
          <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save Changes'}</Button>
          <Button type="button" variant="ghost" onClick={() => router.back()}>Cancel</Button>
        </div>
      </form>
    </div>
  );
}
