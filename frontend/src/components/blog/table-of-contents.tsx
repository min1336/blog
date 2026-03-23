interface TocItem {
  id: string
  text: string
  level: number
}

export function TableOfContents({ content }: { content: string }) {
  const headings: TocItem[] = content
    .split("\n")
    .filter((line) => /^#{2,3}\s/.test(line))
    .map((line) => {
      const level = line.match(/^#+/)![0].length
      const text = line.replace(/^#+\s/, "")
      const id = text
        .toLowerCase()
        .replace(/[^a-z0-9가-힣\s]+/g, "")
        .replace(/\s+/g, "-")
        .replace(/(^-|-$)/g, "")
      return { id, text, level }
    })

  if (headings.length === 0) return null

  return (
    <nav className="hidden xl:block sticky top-6">
      <h3 className="text-sm font-semibold mb-3">목차</h3>
      <ul className="space-y-2 text-sm">
        {headings.map((h) => (
          <li key={h.id} className={h.level === 3 ? "ml-4" : ""}>
            <a
              href={`#${h.id}`}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
