import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const techStack: Record<string, string[]> = {
  "Frontend": ["Next.js", "React", "TypeScript", "Tailwind CSS"],
  "Backend": ["Spring Boot", "Java", "Spring Security"],
  "Database": ["PostgreSQL", "Supabase"],
  "DevOps": ["Vercel", "Railway", "Git"],
}

const contacts = [
  { name: "GitHub", url: "https://github.com/username" },
  { name: "Email", url: "mailto:email@example.com" },
]

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <section>
        <h1 className="text-3xl font-bold mb-4">About</h1>
        <p className="text-muted-foreground leading-relaxed">
          안녕하세요! 개발을 배우며 성장하는 주니어 개발자입니다.
          웹 개발에 관심이 많으며, 특히 React/Next.js와 Spring Boot를 학습하고 있습니다.
          이 블로그를 통해 학습한 내용을 정리하고 프로젝트 경험을 공유합니다.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">기술 스택</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(techStack).map(([category, skills]) => (
            <Card key={category}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">{category}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill) => (
                    <Badge key={skill} variant="secondary">{skill}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">연락처</h2>
        <div className="flex gap-4">
          {contacts.map((contact) => (
            <a
              key={contact.name}
              href={contact.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {contact.name}
            </a>
          ))}
        </div>
      </section>
    </div>
  )
}
