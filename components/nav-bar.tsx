"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/lib/hooks/use-auth"
import { signOut } from "@/lib/auth-client"
import { Shield } from "lucide-react"

export function HeaderNav() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, isAdmin } = useAuth()

  // No nav on "/", "/auth", "/form/[id]"
  const hide =
    pathname === "/" ||
    pathname.startsWith("/auth") ||
    (pathname.startsWith("/form/") && pathname.split("/").length === 3)

  if (hide) return null

  const handleSignOut = async () => {
    await signOut()
    router.push("/auth")
  }

  const getUserInitials = () => {
    if (user?.name) {
      return user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    }
    if (user?.email) {
      return user.email[0].toUpperCase()
    }
    return "U"
  }

  return (
    <header className="w-full flex items-center justify-between px-6 py-3 border-b bg-background/80 backdrop-blur">
      <div className="flex items-center gap-2">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-md border flex items-center justify-center text-xs">
            <img src="/Logo.png" alt="Logo" className="p-[0.5px] rounded-md"/>
          </div>
          <span className="font-medium">Snap-form</span>
        </Link>
      </div>
      <div className="flex items-center gap-2">
        {isAdmin && (
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin" className="gap-2">
              <Shield className="h-4 w-4" />
              Admin
            </Link>
          </Button>
        )}
        <ThemeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Avatar className="h-8 w-8">
                {user?.image && <AvatarImage src={user.image} alt={user.name || user.email} />}
                <AvatarFallback>{getUserInitials()}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.name || "User"}</p>
                <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                <div className="pt-1">
                  <Badge variant="secondary" className="text-xs">
                    {user?.plan || "FREE"}
                  </Badge>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/dashboard">Dashboard</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/profile">Plans & Billing</Link>
            </DropdownMenuItem>
            {isAdmin && (
              <DropdownMenuItem asChild>
                <Link href="/admin">Admin Panel</Link>
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
