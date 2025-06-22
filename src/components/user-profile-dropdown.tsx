"use client"

import { Settings, BarChart3, LogOut, UserCircle, FileText } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { AuthSession } from "@/types/auth"
import Link from "next/link"
import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"

interface UserProfileDropdownProps {
  session: AuthSession
}

export function UserProfileDropdown({ session }: UserProfileDropdownProps) {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const pathname = usePathname()
  
  useEffect(() => {
    if (session?.user?.image) {
      setAvatarUrl(session.user.image)
    }
  }, [session])

  // Helper function to check if a route is active
  const isRouteActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  const userInitials = session?.user?.name?.charAt(0)?.toUpperCase() || 
                      session?.user?.email?.charAt(0)?.toUpperCase() || 'U'

  const displayName = session?.user?.name || 'User'
  const displayEmail = session?.user?.email

  const handleSignOut = async () => {
    try {
      const response = await fetch('/api/auth/sign-out', {
        method: 'POST',
        credentials: 'include',
      })
      
      if (response.ok) {
        // Redirect to home page after successful sign out
        window.location.href = '/'
      }
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all duration-200">
          <Avatar className="h-8 w-8 cursor-pointer transition-all hover:ring-2 hover:ring-primary/50 hover:ring-offset-2">
            <AvatarImage 
              src={avatarUrl || session?.user?.image || undefined} 
              alt={displayName}
            />
            <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-medium">
              {userInitials}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        className="w-64 p-2" 
        align="end" 
        sideOffset={8}
      >
        <DropdownMenuLabel className="p-3 bg-gradient-to-r from-background to-muted/20 rounded-lg mb-2">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage 
                src={avatarUrl || session?.user?.image || undefined} 
                alt={displayName}
              />
              <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-medium">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col min-w-0">
              <div className="font-medium text-sm truncate">{displayName}</div>
              {displayEmail && (
                <div className="text-xs text-muted-foreground truncate">{displayEmail}</div>
              )}
            </div>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator className="my-2" />

        <Link href="/profile" className="block">
          <DropdownMenuItem className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors hover:bg-muted/50 ${
            isRouteActive('/profile') ? 'bg-muted/30' : ''
          }`}>
            <UserCircle className={`h-4 w-4 ${isRouteActive('/profile') ? 'text-primary' : 'text-muted-foreground'}`} />
            <span className={`font-medium ${isRouteActive('/profile') ? 'text-primary' : ''}`}>Profile</span>
          </DropdownMenuItem>
        </Link>

        <Link href="/my-posts" className="block">
          <DropdownMenuItem className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors hover:bg-muted/50 ${
            isRouteActive('/my-posts') ? 'bg-muted/30' : ''
          }`}>
            <FileText className={`h-4 w-4 ${isRouteActive('/my-posts') ? 'text-primary' : 'text-muted-foreground'}`} />
            <span className={`font-medium ${isRouteActive('/my-posts') ? 'text-primary' : ''}`}>My Posts</span>
          </DropdownMenuItem>
        </Link>

        <Link href="/dashboard" className="block">
          <DropdownMenuItem className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors hover:bg-muted/50 ${
            isRouteActive('/dashboard') ? 'bg-muted/30' : ''
          }`}>
            <BarChart3 className={`h-4 w-4 ${isRouteActive('/dashboard') ? 'text-primary' : 'text-muted-foreground'}`} />
            <span className={`font-medium ${isRouteActive('/dashboard') ? 'text-primary' : ''}`}>Dashboard</span>
          </DropdownMenuItem>
        </Link>

        <Link href="/settings" className="block">
          <DropdownMenuItem className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors hover:bg-muted/50 ${
            isRouteActive('/settings') ? 'bg-muted/30' : ''
          }`}>
            <Settings className={`h-4 w-4 ${isRouteActive('/settings') ? 'text-primary' : 'text-muted-foreground'}`} />
            <span className={`font-medium ${isRouteActive('/settings') ? 'text-primary' : ''}`}>Settings</span>
          </DropdownMenuItem>
        </Link>

        <DropdownMenuSeparator className="my-2" />

        <DropdownMenuItem 
          className="flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors hover:bg-destructive/10 text-destructive focus:bg-destructive/10 focus:text-destructive"
          onClick={handleSignOut}
        >
          <LogOut className="h-4 w-4" />
          <span className="font-medium">Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}