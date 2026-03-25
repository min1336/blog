import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Code2, Database, Cloud } from 'lucide-react';

const skillCategories = [
  {
    label: 'Frontend',
    icon: Code2,
    skills: ['TypeScript', 'React', 'Next.js', 'Tailwind CSS'],
  },
  {
    label: 'Backend',
    icon: Database,
    skills: ['NestJS', 'TypeORM', 'MySQL', 'REST API'],
  },
  {
    label: 'DevOps',
    icon: Cloud,
    skills: ['Docker', 'AWS EC2', 'GitHub Actions', 'Vercel'],
  },
];

export default function AboutPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">About</h1>
      <p className="text-muted-foreground mb-8">이 블로그를 만든 사람에 대해</p>

      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-full bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center shrink-0">
              <span className="text-xl font-bold text-zinc-100 dark:text-zinc-900">MH</span>
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-1">김민혁</h2>
              <p className="text-sm text-muted-foreground mb-3">Web Developer</p>
              <p className="text-muted-foreground leading-relaxed">
                웹 개발을 공부하고 있는 개발자입니다.
                학습 과정에서 배운 것들을 기록하고 공유하기 위해 이 블로그를 직접 만들었습니다.
                프론트엔드부터 백엔드, 배포까지 풀스택으로 구현했습니다.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Tech Stack</h2>
        <div className="grid gap-4">
          {skillCategories.map((category) => (
            <div key={category.label} className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-accent shrink-0 mt-0.5">
                <category.icon className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium mb-1.5">{category.label}</p>
                <div className="flex flex-wrap gap-1.5">
                  {category.skills.map((skill) => (
                    <Badge key={skill} variant="outline" className="text-xs font-normal">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Separator className="my-8" />

      <section>
        <h2 className="text-xl font-semibold mb-4">Contact</h2>
        <a
          href="https://github.com/min1336"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border hover:bg-accent transition-colors text-sm"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
          </svg>
          github.com/min1336
        </a>
      </section>
    </div>
  );
}
