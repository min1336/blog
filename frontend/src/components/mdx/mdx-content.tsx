import { MDXRemote } from "next-mdx-remote/rsc"
import rehypePrettyCode from "rehype-pretty-code"
import rehypeSlug from "rehype-slug"
import rehypeAutolinkHeadings from "rehype-autolink-headings"

const options = {
  mdxOptions: {
    rehypePlugins: [
      rehypeSlug,
      [rehypeAutolinkHeadings, { behavior: "wrap" }],
      [rehypePrettyCode, { theme: "one-dark-pro", keepBackground: true }],
    ],
  },
}

export function MDXContent({ source }: { source: string }) {
  return (
    <article className="prose prose-invert max-w-none prose-headings:scroll-mt-20 prose-code:before:hidden prose-code:after:hidden">
      {/* @ts-expect-error Server Component */}
      <MDXRemote source={source} options={options} />
    </article>
  )
}
