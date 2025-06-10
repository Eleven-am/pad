"use client"

import Link from "next/link"
import { Menu, Moon, Search, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { ReactNode, use, useState } from "react"
import { SiteConfig } from "@/lib/config"
import { useTheme } from "next-themes";
import { useMounted } from "@/hooks/useMounted";

interface FooterProps {
	config: SiteConfig
}

interface WebsiteWrapperProps {
	children: ReactNode
	promise: Promise<SiteConfig>
}

function Header({ config }: FooterProps) {
	const mounted = useMounted();
	const {theme, setTheme} = useTheme();
	const [loggedIn] = useState(true);
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
	
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
									link.href === "/" ? "text-primary" : "text-muted-foreground"
								}`}
							>
								{link.label}
							</Link>
						))}
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
							<Button variant="ghost" size="icon"
							        onClick={() => setTheme (theme === "dark" ? "light" : "dark")}>
								{theme === "dark" ? <Sun className="h-5 w-5"/> : <Moon className="h-5 w-5"/>}
								<span className="sr-only">Toggle theme</span>
							</Button>
						</div>
					)}
					
					{loggedIn && (
						<div className="hidden md:block">
							<Avatar className="h-8 w-8 cursor-pointer">
								<AvatarImage src="/placeholder.svg?height=32&width=32" alt="User Avatar"/>
								<AvatarFallback>{config.name.charAt (0).toUpperCase ()}</AvatarFallback>
							</Avatar>
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
									<div className="relative">
										<Search
											className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
										<Input type="search" placeholder="Search..." className="w-full pl-8 h-9"/>
									</div>
									
									{/* Mobile Navigation Links */}
									<nav className="flex flex-col space-y-2">
										{config.navLinks.map ((link) => (
											<Link
												key={link.label}
												href={link.href}
												className="text-muted-foreground hover:text-primary py-1"
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
										<div className="border-t pt-4 mt-auto">
											<div className="flex items-center gap-2">
												<Avatar className="h-8 w-8">
													<AvatarImage src="/placeholder.svg?height=32&width=32"
													             alt="User Avatar"/>
													<AvatarFallback>{config.name.charAt (0).toUpperCase ()}</AvatarFallback>
												</Avatar>
												<span className="text-sm font-medium">User Profile</span>
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
							href={config.padPlatform.projectUrl}
							target="_blank"
							rel="noopener noreferrer"
							className="hover:text-foreground underline"
						>
							{config.padPlatform.name}
						</Link>
						{config.padPlatform.githubUrl && (
							<>
								{" ("}
								<Link
									href={config.padPlatform.githubUrl}
									target="_blank"
									rel="noopener noreferrer"
									className="hover:text-foreground underline"
								>
									Source
								</Link>
								{")"}
							</>
						)}
						.
					</div>
				</div>
			</div>
		</footer>
	)
}

export function WebsiteWrapper({children, promise}: WebsiteWrapperProps) {
	const config = use(promise);

	return (
		<div className="flex flex-col min-h-screen">
			<Header config={config}/>
			<main className="flex-1 relative">
				{children}
			</main>
			<Footer config={config}/>
		</div>
	)
}
