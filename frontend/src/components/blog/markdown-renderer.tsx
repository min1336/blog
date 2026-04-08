import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

function makeHeadingId(children: React.ReactNode) {
  return String(children)
    .toLowerCase()
    .replace(/[^a-z0-9가-힣\s-]/g, '')
    .replace(/\s+/g, '-');
}

export function MarkdownRenderer({ content }: { content: string }) {
  // 본문 첫 번째 h1 제거 (페이지 헤더와 중복 방지)
  const trimmed = content.replace(/^#\s+.+\n+/, '');

  return (
    <div className="prose prose-zinc dark:prose-invert max-w-[75ch] prose-headings:scroll-mt-20 prose-a:text-foreground prose-a:underline-offset-4 prose-h2:border-b prose-h2:border-border prose-h2:pb-2 prose-h2:mt-12 prose-h2:mb-4 prose-h3:mt-8 prose-p:leading-relaxed">
      <ReactMarkdown
        children={trimmed}
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children, ...props }) => (
            <h1 id={makeHeadingId(children)} {...props}>{children}</h1>
          ),
          h2: ({ children, ...props }) => (
            <h2 id={makeHeadingId(children)} {...props}>{children}</h2>
          ),
          h3: ({ children, ...props }) => (
            <h3 id={makeHeadingId(children)} {...props}>{children}</h3>
          ),
          code: ({ className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || '');
            if (match) {
              return (
                <pre className="relative rounded-lg overflow-x-auto bg-zinc-950 text-zinc-50 text-sm">
                  <div className="absolute top-0 right-0 px-3 py-1 text-xs text-zinc-500 select-none">
                    {match[1]}
                  </div>
                  <code className="block p-4 pt-8" {...props}>{children}</code>
                </pre>
              );
            }
            return (
              <code className="bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
                {children}
              </code>
            );
          },
          pre: ({ children }) => <>{children}</>,
          blockquote: ({ children, ...props }) => (
            <blockquote className="border-l-4 border-blue-500 dark:border-blue-400 pl-4 italic text-muted-foreground bg-blue-50/50 dark:bg-blue-950/20 py-2 rounded-r-lg" {...props}>
              {children}
            </blockquote>
          ),
          table: ({ children, ...props }) => (
            <div className="overflow-x-auto my-6">
              <table className="w-full text-sm" {...props}>{children}</table>
            </div>
          ),
          th: ({ children, ...props }) => (
            <th className="border border-border bg-muted px-4 py-2 text-left font-semibold" {...props}>{children}</th>
          ),
          td: ({ children, ...props }) => (
            <td className="border border-border px-4 py-2" {...props}>{children}</td>
          ),
          strong: ({ children, ...props }) => (
            <strong className="font-semibold text-foreground" {...props}>{children}</strong>
          ),
        }}
      />
    </div>
  );
}
