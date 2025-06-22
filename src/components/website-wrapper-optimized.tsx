"use client"

import React, { ReactNode, use, useState, useEffect } from "react"
import Link from "next/link"
import { Menu, Moon, Search, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { SiteConfig } from "@/lib/config"
import { useTheme } from "next-themes";
import { useMounted } from "@/hooks/useMounted";
import { AuthSession } from "@/types/auth";

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

// Optimized Header component
const Header = React.memo<HeaderProps>(({ config, session }) => {
	const mounted = useMounted();
	const { theme, setTheme } = useTheme();
	const loggedIn = !!session?.user;
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
	const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
	
	// Memoized handlers
	const handleThemeToggle = React.useCallback(() => {
		setTheme(theme === "dark" ? "light" : "dark");
	}, [theme, setTheme]);

	// Removed handleMobileMenuToggle as it's handled by Sheet component

	const closeMobileMenu = React.useCallback(() => {
		setIsMobileMenuOpen(false);
	}, []);

	// Avatar URL effect
	useEffect(() => {
		if (session?.user?.image) {
			setAvatarUrl(session.user.image);
		}
	}, [session]);

	// Memoized navigation links
	const navigationLinks = React.useMemo(() => 
		config.navLinks.map((link) => (
			<Link
				key={link.label}
				href={link.href}
				className={`text-sm font-medium transition-colors hover:text-primary ${
					link.href === "/" ? "text-primary" : "text-muted-foreground"
				}`}
			>
				{link.label}
			</Link>
		)), [config.navLinks]
	);

	// Memoized mobile navigation links
	const mobileNavigationLinks = React.useMemo(() =>
		config.navLinks.map((link) => (
			<Link
				key={link.label}
				href={link.href}
				className="text-muted-foreground hover:text-primary py-1"
				onClick={closeMobileMenu}
			>
				{link.label}
			</Link>
		)), [config.navLinks, closeMobileMenu]
	);

	// Memoized user avatar component
	const UserAvatar = React.useMemo(() => {
		if (!loggedIn) return null;

		const userInitials = session?.user?.name?.charAt(0)?.toUpperCase() || 
			session?.user?.email?.charAt(0)?.toUpperCase() || 'U';

		return (
			<Link href="/profile" className="hidden md:block">
				<Avatar className="h-8 w-8 cursor-pointer transition-all hover:ring-2 hover:ring-primary hover:ring-offset-2">
					<AvatarImage 
						src={avatarUrl || session?.user?.image || undefined} 
						alt={session?.user?.name || "User Avatar"}
					/>
					<AvatarFallback>
						{userInitials}
					</AvatarFallback>
				</Avatar>
			</Link>
		);
	}, [loggedIn, avatarUrl, session]);

	// Memoized mobile user section
	const MobileUserSection = React.useMemo(() => {
		if (!loggedIn) return null;

		const userInitials = session?.user?.name?.charAt(0)?.toUpperCase() || 
			session?.user?.email?.charAt(0)?.toUpperCase() || 'U';

		return (
			<div className="border-t pt-4 mt-auto">
				<Link 
					href="/profile" 
					className="flex items-center gap-2 hover:bg-accent rounded-md p-2 -m-2 transition-colors"
					onClick={closeMobileMenu}
				>
					<Avatar className="h-8 w-8">
						<AvatarImage 
							src={avatarUrl || session?.user?.image || undefined}
							alt={session?.user?.name || "User Avatar"}
						/>
						<AvatarFallback>
							{userInitials}
						</AvatarFallback>
					</Avatar>
					<span className="text-sm font-medium">
						{session?.user?.name || 'User Profile'}
					</span>
				</Link>
			</div>
		);
	}, [loggedIn, avatarUrl, session, closeMobileMenu]);

	return (
		<header className="sticky flex items-center justify-center top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-sm">
			<div className="container flex h-14 items-center justify-between px-4">
				<Link href="/" className="text-xl font-semibold tracking-tight flex items-center">
					{config.name}
				</Link>
				<div className="flex items-center gap-3 md:gap-4">
					<nav className="hidden md:flex items-center gap-4 lg:gap-6">
						{navigationLinks}
					</nav>
					
					<div className="relative hidden md:block group">
						<Search
							className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-hover:text-primary pointer-events-none z-10"/>
						<Input
							type="search"
							placeholder="Search..."
							className="h-9 w-9 rounded-full bg-background md:bg-transparent md:dark:bg-[transparent] pl-8 text-sm border border-transparent
                         group-hover:w-[200px] group-hover:rounded-md group-hover:border-input
                         focus:w-[230px] focus:rounded-md focus:border-primary focus:pl-8 focus:pr-2 md:shadow-none md:hover:shadow-xs
                         placeholder:text-transparent group-hover:placeholder:text-muted-foreground focus:placeholder:text-muted-foreground
                         transition-all duration-300 ease-in-out"
						/>
					</div>
					
					{mounted && (
						<div className="hidden md:block">
							<Button variant="ghost" size="icon" onClick={handleThemeToggle}>
								{theme === "dark" ? <Sun className="h-5 w-5"/> : <Moon className="h-5 w-5"/>}
								<span className="sr-only">Toggle theme</span>
							</Button>
						</div>
					)}
					
					{UserAvatar}
					
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
									      onClick={closeMobileMenu}>
										{config.name}
									</Link>
									
									{/* Mobile Search */}
									<div className="relative">
										<Search
											className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
										<Input type="search" placeholder="Search..." className="w-full pl-8 h-9"/>
									</div>
									
									{/* Mobile Navigation Links */}
									<nav className="flex flex-col space-y-2">
										{mobileNavigationLinks}
									</nav>
									
									{mounted && (
										<Button
											variant="ghost"
											className="w-full justify-start gap-2"
											onClick={() => {
												handleThemeToggle();
												closeMobileMenu();
											}}
										>
											{theme === "dark" ? <Sun className="h-5 w-5"/> :
												<Moon className="h-5 w-5"/>}
											<span>Toggle Theme</span>
										</Button>
									)}
									
									{MobileUserSection}
								</div>
							</SheetContent>
						</Sheet>
					</div>
				</div>
			</div>
		</header>
	)
});

// Optimized Footer component
const Footer = React.memo<FooterProps>(({ config }) => {
	const currentYear = React.useMemo(() => new Date().getFullYear(), []);

	const footerLinks = React.useMemo(() =>
		config.footerLinks.map((link) => (
			<Link key={link.label} href={link.href} className="hover:text-foreground transition-colors">
				{link.label}
			</Link>
		)), [config.footerLinks]
	);

	const platformLinks = React.useMemo(() => (
		<>
			<Link
				href="https://github.com/eleven-am/pad"
				target="_blank"
				rel="noopener noreferrer"
				className="hover:text-foreground underline"
			>
				Pad
			</Link>
			{", "}
			<Link
				href="https://github.com/eleven-am"
				target="_blank"
				rel="noopener noreferrer"
				className="hover:text-foreground underline"
			>
				Roy OSSAI
			</Link>
		</>
	), []);

	return (
		<footer className="flex items-center justify-center border-t border-border/40 bg-background w-full">
			<div className="container px-4 py-8 w-full">
				<div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
					<div className="text-center md:text-left">
						<Link href="/" className="font-semibold tracking-tight hover:text-foreground transition-colors">
							{config.name}
						</Link>
					</div>
					
					<div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-muted-foreground">
						{footerLinks}
					</div>
					
					{/* Copyright & Platform Credit */}
					<div className="text-xs text-muted-foreground text-center md:text-right">
						© {currentYear} {config.name}.<span className="mx-1">Powered by</span>
						{platformLinks}.
					</div>
				</div>
			</div>
		</footer>
	)
});

export const WebsiteWrapperOptimized = React.memo<WebsiteWrapperProps>(({
	children, 
	configPromise, 
	sessionPromise
}) => {
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
});

Header.displayName = 'Header';
Footer.displayName = 'Footer';
WebsiteWrapperOptimized.displayName = 'WebsiteWrapperOptimized';