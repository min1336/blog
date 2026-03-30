import ReactMarkdown from 'react-markdown';

function makeHeadingId(children: React.ReactNode) {
  return String(children)
    .toLowerCase()
    .replace(/[^a-z0-9가-힣\s-]/g, '')
    .replace(/\s+/g, '-');
}

export function MarkdownRenderer({ content }: { content: string }) {
  return (
    <div className="prose prose-zinc dark:prose-invert max-w-none prose-headings:scroll-mt-20 prose-a:text-foreground prose-a:underline-offset-4">
      <ReactMarkdown
        children={content}
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
            <blockquote className="border-l-4 border-zinc-300 dark:border-zinc-600 pl-4 italic text-muted-foreground" {...props}>
              {children}
            </blockquote>
          ),
        }}
      />
    </div>
  );
}
