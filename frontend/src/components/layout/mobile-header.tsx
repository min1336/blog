"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/common/theme-toggle"
import { cn } from "@/lib/utils"
import { Menu, BookOpen, FolderOpen, User } from "lucide-react"

const navigation = [
  { name: "Blog", href: "/blog", icon: BookOpen },
  { name: "Portfolio", href: "/portfolio", icon: FolderOpen },
  { name: "About", href: "/about", icon: User },
]

export function MobileHeader() {
  const pathname = usePathname()

  return (
    <header className="md:hidden flex items-center justify-between p-4 border-b bg-card">
      <Link href="/" className="font-bold text-lg">Blog</Link>
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <Sheet>
          <SheetTrigger render={<Button variant="ghost" size="icon" />}>
            <Menu className="h-5 w-5" />
          </SheetTrigger>
          <SheetContent side="left" className="w-64">
            <nav className="flex flex-col gap-1 mt-8">
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                    pathname.startsWith(item.href)
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </Link>
              ))}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}
