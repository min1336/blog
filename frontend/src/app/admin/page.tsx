'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { getPosts, getProjects } from '@/lib/api';
import { FileText, Briefcase } from 'lucide-react';

export default function AdminDashboardPage() {
  const [postCount, setPostCount] = useState(0);
  const [projectCount, setProjectCount] = useState(0);

  useEffect(() => {
    getPosts('limit=1').then((res) => setPostCount(res.meta?.total || 0)).catch(() => {});
    getProjects().then((res) => setProjectCount(res.data.length)).catch(() => {});
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Posts</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{postCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Projects</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projectCount}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
