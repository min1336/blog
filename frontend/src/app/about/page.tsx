import { Badge } from '@/components/ui/badge';

const techStack = [
  'TypeScript', 'React', 'Next.js', 'NestJS',
  'Tailwind CSS', 'MySQL', 'TypeORM', 'Docker',
];

export default function AboutPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">About</h1>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">소개</h2>
        <p className="text-muted-foreground leading-relaxed">
          안녕하세요! 웹 개발을 공부하고 있는 개발자입니다.
          이 블로그는 개발 학습 과정에서 배운 것들을 기록하고 공유하기 위해 만들었습니다.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">Tech Stack</h2>
        <div className="flex flex-wrap gap-2">
          {techStack.map((tech) => (
            <Badge key={tech} variant="secondary" className="text-sm">
              {tech}
            </Badge>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-3">Contact</h2>
        <ul className="space-y-2 text-muted-foreground">
          <li>
            GitHub:{' '}
            <a
              href="https://github.com/min1336"
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground hover:underline"
            >
              github.com/min1336
            </a>
          </li>
        </ul>
      </section>
    </div>
  );
}
