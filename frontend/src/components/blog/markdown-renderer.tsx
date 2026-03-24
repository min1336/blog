import ReactMarkdown from 'react-markdown';
import rehypePrettyCode from 'rehype-pretty-code';

export function MarkdownRenderer({ content }: { content: string }) {
  return (
    <div className="prose prose-zinc dark:prose-invert max-w-none">
      <ReactMarkdown
        rehypePlugins={[[rehypePrettyCode, { theme: 'github-light' }]]}
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
        }}
      />
    </div>
  );
}
