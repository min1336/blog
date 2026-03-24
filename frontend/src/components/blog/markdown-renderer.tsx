import ReactMarkdown from 'react-markdown';

export function MarkdownRenderer({ content }: { content: string }) {
  return (
    <div className="prose prose-zinc dark:prose-invert max-w-none">
      <ReactMarkdown
        components={{
          h1: ({ children, ...props }) => {
            const id = String(children)
              .toLowerCase()
              .replace(/[^a-z0-9가-힣\s-]/g, '')
              .replace(/\s+/g, '-');
            return <h1 id={id} {...props}>{children}</h1>;
          },
          h2: ({ children, ...props }) => {
            const id = String(children)
              .toLowerCase()
              .replace(/[^a-z0-9가-힣\s-]/g, '')
              .replace(/\s+/g, '-');
            return <h2 id={id} {...props}>{children}</h2>;
          },
          h3: ({ children, ...props }) => {
            const id = String(children)
              .toLowerCase()
              .replace(/[^a-z0-9가-힣\s-]/g, '')
              .replace(/\s+/g, '-');
            return <h3 id={id} {...props}>{children}</h3>;
          },
          code: ({ className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || '');
            if (match) {
              return (
                <pre className={`${className} rounded-lg p-4 overflow-x-auto bg-zinc-950 text-zinc-50`}>
                  <code {...props}>{children}</code>
                </pre>
              );
            }
            return (
              <code className="bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-sm" {...props}>
                {children}
              </code>
            );
          },
          pre: ({ children }) => <>{children}</>,
        }}
      />
    </div>
  );
}
