'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getProjects, deleteProject } from '@/lib/api';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import type { Project } from '@/lib/types';

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);

  const fetchProjects = async () => {
    try {
      const res = await getProjects();
      setProjects(res.data);
    } catch {}
  };

  useEffect(() => { fetchProjects(); }, []);

  const handleDelete = async (slug: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    try {
      await deleteProject(slug);
      fetchProjects();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Delete failed');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Projects</h1>
        <Link href="/admin/projects/new">
          <Button><Plus className="h-4 w-4 mr-1" /> New Project</Button>
        </Link>
      </div>
      <div className="border rounded-lg">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left p-3">Title</th>
              <th className="text-left p-3">Status</th>
              <th className="text-left p-3">Order</th>
              <th className="text-right p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((p) => (
              <tr key={p.id} className="border-b">
                <td className="p-3 font-medium">{p.title}</td>
                <td className="p-3">
                  <Badge variant={p.published ? 'default' : 'secondary'}>
                    {p.published ? 'Published' : 'Draft'}
                  </Badge>
                </td>
                <td className="p-3">{p.sort_order}</td>
                <td className="p-3 text-right">
                  <div className="flex justify-end gap-1">
                    <Link href={`/admin/projects/${p.slug}/edit`}>
                      <Button variant="ghost" size="icon"><Pencil className="h-4 w-4" /></Button>
                    </Link>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(p.slug)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {projects.length === 0 && (
              <tr><td colSpan={4} className="p-6 text-center text-muted-foreground">No projects yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
