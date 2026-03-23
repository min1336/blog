"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ThemeToggle } from "@/components/common/theme-toggle"
import { cn } from "@/lib/utils"
import { BookOpen, FolderOpen, User } from "lucide-react"

const navigation = [
  { name: "Blog", href: "/blog", icon: BookOpen },
  { name: "Portfolio", href: "/portfolio", icon: FolderOpen },
  { name: "About", href: "/about", icon: User },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 border-r bg-card">
      <div className="flex flex-col flex-1 p-6 gap-6">
        {/* Profile */}
        <Link href="/" className="flex flex-col items-center gap-3 hover:opacity-80 transition-opacity">
          <Avatar className="h-20 w-20">
            <AvatarImage src="/avatar.png" alt="프로필" />
            <AvatarFallback>ME</AvatarFallback>
          </Avatar>
          <div className="text-center">
            <h2 className="font-semibold text-lg">김민혁</h2>
            <p className="text-sm text-muted-foreground">주니어 개발자</p>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="flex flex-col gap-1">
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

        {/* Theme Toggle */}
        <div className="mt-auto">
          <ThemeToggle />
        </div>
      </div>
    </aside>
  )
}
