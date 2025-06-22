"use client"

import Link from "next/link"
import { Menu, Moon, Search, Sun, User, Settings, BarChart3, LogOut, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { ReactNode, use, useState, useEffect } from "react"
import { SiteConfig } from "@/lib/config"
import { useTheme } from "next-themes";
import { useMounted } from "@/hooks/useMounted";
import { AuthSession } from "@/types/auth";
import { UserProfileDropdown } from "@/components/user-profile-dropdown";
import { useRouter, usePathname } from "next/navigation";

interface FooterProps {
	config: SiteConfig
}

interface HeaderProps {
	config: SiteConfig;
	session: AuthSession | null;
}

interface WebsiteWrapperProps {
	children: ReactNode
	configPromise: Promise<SiteConfig>
	sessionPromise: Promise<AuthSession | null>
}

function Header({ config, session }: HeaderProps) {
	const mounted = useMounted();
	const {theme, setTheme} = useTheme();
	const router = useRouter();
	const pathname = usePathname();
	const loggedIn = !!session?.user;
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
	const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
	const [searchQuery, setSearchQuery] = useState("");
	
	// For now, we'll use the image from OAuth providers
	// TODO: Implement fetching extended user data with avatarFileId
	useEffect(() => {
		if (session?.user?.image) {
			setAvatarUrl(session.user.image);
		}
	}, [session]);

	const handleSearch = (e: React.FormEvent) => {
		e.preventDefault();
		if (searchQuery.trim()) {
			router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
		} else {
			router.push('/search');
		}
	};

	const handleSearchKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === 'Enter') {
			handleSearch(e);
		}
	};

	// Helper function to check if a route is active
	const isRouteActive = (href: string) => {
		if (href === '/') {
			return pathname === '/';
		}
		return pathname.startsWith(href);
	};
	
	return (
		<header className="sticky flex items-center justify-center top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-sm">
			<div className="container flex h-14 items-center justify-between px-4">
				<Link href="/" className="text-xl font-semibold tracking-tight flex items-center">
					{config.name}
				</Link>
				<div className="flex items-center gap-3 md:gap-4">
					<nav className="hidden md:flex items-center gap-4 lg:gap-6">
						{config.navLinks.map ((link) => (
							<Link
								key={link.label}
								href={link.href}
								className={`text-sm font-medium transition-colors hover:text-primary ${
									isRouteActive(link.href) ? "text-primary" : "text-muted-foreground"
								}`}
							>
								{link.label}
							</Link>
						))}
					</nav>
					
					<form onSubmit={handleSearch} className="relative hidden md:block group">
						<Search
							className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-hover:text-primary pointer-events-none z-10"/>
						<Input
							type="search"
							placeholder="Search articles..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							onKeyDown={handleSearchKeyDown}
							className="h-9 w-9 rounded-full bg-background md:bg-transparent md:dark:bg-[transparent] pl-8 text-sm border border-transparent
                         group-hover:w-[220px] group-hover:rounded-md group-hover:border-input
                         focus:w-[250px] focus:rounded-md focus:border-primary focus:pl-8 focus:pr-2 md:shadow-none md:hover:shadow-xs
                         placeholder:text-transparent group-hover:placeholder:text-muted-foreground focus:placeholder:text-muted-foreground
                         transition-all duration-300 ease-in-out"
						/>
					</form>
					
					{mounted && (
						<div className="hidden md:block">
							<Button variant="ghost" size="icon"
							        onClick={() => setTheme (theme === "dark" ? "light" : "dark")}>
								{theme === "dark" ? <Sun className="h-5 w-5"/> : <Moon className="h-5 w-5"/>}
								<span className="sr-only">Toggle theme</span>
							</Button>
						</div>
					)}
					
					{loggedIn && (
						<div className="hidden md:block">
							<UserProfileDropdown session={session} />
						</div>
					)}
					
					<div className="md:hidden">
						<Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
							<SheetTrigger asChild>
								<Button variant="ghost" size="icon">
									<Menu className="h-5 w-5"/>
									<span className="sr-only">Open menu</span>
								</Button>
							</SheetTrigger>
							<SheetContent side="right" className="w-[280px] p-4">
								<div className="flex flex-col space-y-4">
									<Link href="/" className="text-lg font-semibold mb-2"
									      onClick={() => setIsMobileMenuOpen (false)}>
										{config.name}
									</Link>
									
									{/* Mobile Search */}
									<form onSubmit={handleSearch} className="relative">
										<Search
											className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
										<Input 
											type="search" 
											placeholder="Search articles..." 
											value={searchQuery}
											onChange={(e) => setSearchQuery(e.target.value)}
											onKeyDown={handleSearchKeyDown}
											className="w-full pl-8 h-9"
										/>
									</form>
									
									{/* Mobile Navigation Links */}
									<nav className="flex flex-col space-y-2">
										{config.navLinks.map ((link) => (
											<Link
												key={link.label}
												href={link.href}
												className={`py-1 transition-colors hover:text-primary ${
													isRouteActive(link.href) ? "text-primary font-medium" : "text-muted-foreground"
												}`}
												onClick={() => setIsMobileMenuOpen (false)}
											>
												{link.label}
											</Link>
										))}
									</nav>
									
									{mounted && (
										<Button
											variant="ghost"
											className="w-full justify-start gap-2"
											onClick={() => {
												setTheme (theme === "dark" ? "light" : "dark")
												setIsMobileMenuOpen (false)
											}}
										>
											{theme === "dark" ? <Sun className="h-5 w-5"/> :
												<Moon className="h-5 w-5"/>}
											<span>Toggle Theme</span>
										</Button>
									)}
									
									{loggedIn && (
										<div className="border-t pt-4 mt-auto space-y-2">
											{/* User info header */}
											<div className="flex items-center gap-3 p-2 bg-muted/30 rounded-lg">
												<Avatar className="h-10 w-10">
													<AvatarImage 
														src={avatarUrl || session?.user?.image || undefined}
														alt={session?.user?.name || "User Avatar"}
													/>
													<AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-medium">
														{session?.user?.name?.charAt(0)?.toUpperCase() || session?.user?.email?.charAt(0)?.toUpperCase() || 'U'}
													</AvatarFallback>
												</Avatar>
												<div className="flex flex-col min-w-0">
													<div className="font-medium text-sm truncate">{session?.user?.name || 'User'}</div>
													{session?.user?.email && (
														<div className="text-xs text-muted-foreground truncate">{session?.user?.email}</div>
													)}
												</div>
											</div>
											
											{/* User menu items */}
											<div className="space-y-1">
												<Link 
													href="/profile" 
													className={`flex items-center gap-3 hover:bg-accent rounded-md p-2 transition-colors ${
														isRouteActive('/profile') ? 'bg-accent' : ''
													}`}
													onClick={() => setIsMobileMenuOpen(false)}
												>
													<User className={`h-4 w-4 ${isRouteActive('/profile') ? 'text-primary' : 'text-muted-foreground'}`} />
													<span className={`text-sm font-medium ${isRouteActive('/profile') ? 'text-primary' : ''}`}>Profile</span>
												</Link>
												<Link 
													href="/my-posts" 
													className={`flex items-center gap-3 hover:bg-accent rounded-md p-2 transition-colors ${
														isRouteActive('/my-posts') ? 'bg-accent' : ''
													}`}
													onClick={() => setIsMobileMenuOpen(false)}
												>
													<FileText className={`h-4 w-4 ${isRouteActive('/my-posts') ? 'text-primary' : 'text-muted-foreground'}`} />
													<span className={`text-sm font-medium ${isRouteActive('/my-posts') ? 'text-primary' : ''}`}>My Posts</span>
												</Link>
												<Link 
													href="/dashboard" 
													className={`flex items-center gap-3 hover:bg-accent rounded-md p-2 transition-colors ${
														isRouteActive('/dashboard') ? 'bg-accent' : ''
													}`}
													onClick={() => setIsMobileMenuOpen(false)}
												>
													<BarChart3 className={`h-4 w-4 ${isRouteActive('/dashboard') ? 'text-primary' : 'text-muted-foreground'}`} />
													<span className={`text-sm font-medium ${isRouteActive('/dashboard') ? 'text-primary' : ''}`}>Dashboard</span>
												</Link>
												<Link 
													href="/settings" 
													className={`flex items-center gap-3 hover:bg-accent rounded-md p-2 transition-colors ${
														isRouteActive('/settings') ? 'bg-accent' : ''
													}`}
													onClick={() => setIsMobileMenuOpen(false)}
												>
													<Settings className={`h-4 w-4 ${isRouteActive('/settings') ? 'text-primary' : 'text-muted-foreground'}`} />
													<span className={`text-sm font-medium ${isRouteActive('/settings') ? 'text-primary' : ''}`}>Settings</span>
												</Link>
												<button 
													className="flex items-center gap-3 hover:bg-destructive/10 text-destructive rounded-md p-2 transition-colors w-full text-left"
													onClick={async () => {
														setIsMobileMenuOpen(false);
														try {
															const response = await fetch('/api/auth/sign-out', {
																method: 'POST',
																credentials: 'include',
															});
															if (response.ok) {
																window.location.href = '/';
															}
														} catch (error) {
															console.error('Sign out error:', error);
														}
													}}
												>
													<LogOut className="h-4 w-4" />
													<span className="text-sm font-medium">Sign out</span>
												</button>
											</div>
										</div>
									)}
								</div>
							</SheetContent>
						</Sheet>
					</div>
				</div>
			</div>
		</header>
	)
}

function Footer ({ config }: FooterProps) {
	return (
		<footer className="flex items-center justify-center border-t border-border/40 bg-background w-full">
			<div className="container px-4 py-8 w-full">
				<div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
					<div className="text-center md:text-left">
						<Link href="/" className="font-semibold tracking-tight hover:text-foreground transition-colors">
							{config.name /* Example: "My Pad Site" */}
						</Link>
					</div>
					
					<div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-muted-foreground">
						{config.footerLinks.map ((link) => (
							<Link key={link.label} href={link.href} className="hover:text-foreground transition-colors">
								{link.label}
							</Link>
						))}
					</div>
					
					{/* Copyright & Platform Credit */}
					<div className="text-xs text-muted-foreground text-center md:text-right">
						© {new Date ().getFullYear ()} {config.name}.<span className="mx-1">Powered by</span>
						<Link
							href={'https://github.com/eleven-am/pad'}
							target="_blank"
							rel="noopener noreferrer"
							className="hover:text-foreground underline"
						>
							Pad
						</Link>
						{", "}
						<Link
							href={'https://github.com/eleven-am'}
							target="_blank"
							rel="noopener noreferrer"
							className="hover:text-foreground underline"
						>
							Roy OSSAI
						</Link>
						.
					</div>
				</div>
			</div>
		</footer>
	)
}

export function WebsiteWrapper({children, configPromise, sessionPromise}: WebsiteWrapperProps) {
	const config = use(configPromise);
	const session = use(sessionPromise);

	return (
		<div className="flex flex-col min-h-screen">
			<Header config={config} session={session}/>
			<main className="flex-1 relative">
				{children}
			</main>
			<Footer config={config}/>
		</div>
	)
}
