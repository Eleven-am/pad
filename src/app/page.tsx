"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, User, TrendingUp, Star, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";

const FEATURED_POSTS = [
	{
		id: "1",
		title: "The Future of Web Development",
		excerpt: "Exploring the latest trends and technologies shaping the future of web development...",
		content: "The landscape of web development is undergoing a remarkable transformation. As we move further into 2024, we're seeing unprecedented changes in how we build, deploy, and maintain web applications. From the rise of edge computing to the increasing importance of WebAssembly, developers are facing both exciting opportunities and new challenges...",
		author: {
			name: "John Doe",
			avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuDI6PhjRTYv5lKoEn8TVesppVrXWlNvTrRl4uym7nS9rDjCRe5e-g1LnqVqXqCArcsv7eBbNIjDrRXuFsmfIMHKyBICVB8wrFJKUHHi_7TMiXHUeUXoHaubT5JxXe7kRaeigjl0YXkGy6TPKrd-ws7naUczd132KQr7_xqAhA0OhJrAhGXiA4OzEdBbQxm7cqTaschgA7NDR386g5RI_lpXJanAlLVc1y6jJyWGv3Fl0uCrzFrJmxQs19nvQi43V7JRNFzo_ZJIUEU",
		},
		category: "Technology",
		tags: ["Web Development", "Future", "Technology"],
		readTime: "5 min read",
		date: "2024-03-15",
		image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDI6PhjRTYv5lKoEn8TVesppVrXWlNvTrRl4uym7nS9rDjCRe5e-g1LnqVqXqCArcsv7eBbNIjDrRXuFsmfIMHKyBICVB8wrFJKUHHi_7TMiXHUeUXoHaubT5JxXe7kRaeigjl0YXkGy6TPKrd-ws7naUczd132KQr7_xqAhA0OhJrAhGXiA4OzEdBbQxm7cqTaschgA7NDR386g5RI_lpXJanAlLVc1y6jJyWGv3Fl0uCrzFrJmxQs19nvQi43V7JRNFzo_ZJIUEU",
	},
	{
		id: "2",
		title: "Building Modern Web Applications",
		excerpt: "A comprehensive guide to building scalable and performant web applications...",
		content: "Modern web applications require a delicate balance between performance, scalability, and user experience. In this comprehensive guide, we'll explore the key principles and best practices that every developer should know. From choosing the right architecture to implementing efficient state management, we'll cover everything you need to build applications that stand the test of time...",
		author: {
			name: "Jane Smith",
			avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuDI6PhjRTYv5lKoEn8TVesppVrXWlNvTrRl4uym7nS9rDjCRe5e-g1LnqVqXqCArcsv7eBbNIjDrRXuFsmfIMHKyBICVB8wrFJKUHHi_7TMiXHUeUXoHaubT5JxXe7kRaeigjl0YXkGy6TPKrd-ws7naUczd132KQr7_xqAhA0OhJrAhGXiA4OzEdBbQxm7cqTaschgA7NDR386g5RI_lpXJanAlLVc1y6jJyWGv3Fl0uCrzFrJmxQs19nvQi43V7JRNFzo_ZJIUEU",
		},
		category: "Development",
		tags: ["Next.js", "React", "Web Development"],
		readTime: "7 min read",
		date: "2024-03-14",
		image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDI6PhjRTYv5lKoEn8TVesppVrXWlNvTrRl4uym7nS9rDjCRe5e-g1LnqVqXqCArcsv7eBbNIjDrRXuFsmfIMHKyBICVB8wrFJKUHHi_7TMiXHUeUXoHaubT5JxXe7kRaeigjl0YXkGy6TPKrd-ws7naUczd132KQr7_xqAhA0OhJrAhGXiA4OzEdBbQxm7cqTaschgA7NDR386g5RI_lpXJanAlLVc1y6jJyWGv3Fl0uCrzFrJmxQs19nvQi43V7JRNFzo_ZJIUEU",
	},
	{
		id: "3",
		title: "The Art of Minimalist Design",
		excerpt: "Exploring the principles of minimalist design and how to apply them in modern interfaces...",
		content: "Minimalist design isn't just about removing elements—it's about creating meaningful experiences through intentional simplicity. In this exploration of minimalist principles, we'll discover how to create interfaces that are both beautiful and functional. From typography choices to white space management, every decision plays a crucial role in crafting the perfect minimalist experience...",
		author: {
			name: "Mike Johnson",
			avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuDI6PhjRTYv5lKoEn8TVesppVrXWlNvTrRl4uym7nS9rDjCRe5e-g1LnqVqXqCArcsv7eBbNIjDrRXuFsmfIMHKyBICVB8wrFJKUHHi_7TMiXHUeUXoHaubT5JxXe7kRaeigjl0YXkGy6TPKrd-ws7naUczd132KQr7_xqAhA0OhJrAhGXiA4OzEdBbQxm7cqTaschgA7NDR386g5RI_lpXJanAlLVc1y6jJyWGv3Fl0uCrzFrJmxQs19nvQi43V7JRNFzo_ZJIUEU",
		},
		category: "Design",
		tags: ["Design", "UI/UX", "Minimalism"],
		readTime: "4 min read",
		date: "2024-03-13",
		image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDI6PhjRTYv5lKoEn8TVesppVrXWlNvTrRl4uym7nS9rDjCRe5e-g1LnqVqXqCArcsv7eBbNIjDrRXuFsmfIMHKyBICVB8wrFJKUHHi_7TMiXHUeUXoHaubT5JxXe7kRaeigjl0YXkGy6TPKrd-ws7naUczd132KQr7_xqAhA0OhJrAhGXiA4OzEdBbQxm7cqTaschgA7NDR386g5RI_lpXJanAlLVc1y6jJyWGv3Fl0uCrzFrJmxQs19nvQi43V7JRNFzo_ZJIUEU",
	},
];

const TRENDING_POSTS = [
	{
		id: "4",
		title: "Understanding TypeScript Generics",
		excerpt: "A deep dive into TypeScript generics and how they can improve your code's type safety...",
		author: {
			name: "Sarah Chen",
			avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuDI6PhjRTYv5lKoEn8TVesppVrXWlNvTrRl4uym7nS9rDjCRe5e-g1LnqVqXqCArcsv7eBbNIjDrRXuFsmfIMHKyBICVB8wrFJKUHHi_7TMiXHUeUXoHaubT5JxXe7kRaeigjl0YXkGy6TPKrd-ws7naUczd132KQr7_xqAhA0OhJrAhGXiA4OzEdBbQxm7cqTaschgA7NDR386g5RI_lpXJanAlLVc1y6jJyWGv3Fl0uCrzFrJmxQs19nvQi43V7JRNFzo_ZJIUEU",
		},
		category: "Programming",
		tags: ["TypeScript", "JavaScript", "Programming"],
		readTime: "7 min read",
		date: "2024-03-12",
		image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDI6PhjRTYv5lKoEn8TVesppVrXWlNvTrRl4uym7nS9rDjCRe5e-g1LnqVqXqCArcsv7eBbNIjDrRXuFsmfIMHKyBICVB8wrFJKUHHi_7TMiXHUeUXoHaubT5JxXe7kRaeigjl0YXkGy6TPKrd-ws7naUczd132KQr7_xqAhA0OhJrAhGXiA4OzEdBbQxm7cqTaschgA7NDR386g5RI_lpXJanAlLVc1y6jJyWGv3Fl0uCrzFrJmxQs19nvQi43V7JRNFzo_ZJIUEU",
	},
	{
		id: "5",
		title: "The Future of AI in Web Development",
		excerpt: "Exploring how artificial intelligence is transforming the way we build web applications...",
		author: {
			name: "Alex Rivera",
			avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuDI6PhjRTYv5lKoEn8TVesppVrXWlNvTrRl4uym7nS9rDjCRe5e-g1LnqVqXqCArcsv7eBbNIjDrRXuFsmfIMHKyBICVB8wrFJKUHHi_7TMiXHUeUXoHaubT5JxXe7kRaeigjl0YXkGy6TPKrd-ws7naUczd132KQr7_xqAhA0OhJrAhGXiA4OzEdBbQxm7cqTaschgA7NDR386g5RI_lpXJanAlLVc1y6jJyWGv3Fl0uCrzFrJmxQs19nvQi43V7JRNFzo_ZJIUEU",
		},
		category: "Technology",
		tags: ["AI", "Web Development", "Future Tech"],
		readTime: "8 min read",
		date: "2024-03-11",
		image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDI6PhjRTYv5lKoEn8TVesppVrXWlNvTrRl4uym7nS9rDjCRe5e-g1LnqVqXqCArcsv7eBbNIjDrRXuFsmfIMHKyBICVB8wrFJKUHHi_7TMiXHUeUXoHaubT5JxXe7kRaeigjl0YXkGy6TPKrd-ws7naUczd132KQr7_xqAhA0OhJrAhGXiA4OzEdBbQxm7cqTaschgA7NDR386g5RI_lpXJanAlLVc1y6jJyWGv3Fl0uCrzFrJmxQs19nvQi43V7JRNFzo_ZJIUEU",
	},
	{
		id: "6",
		title: "Building Accessible Web Applications",
		excerpt: "Learn the best practices for creating web applications that are accessible to everyone...",
		author: {
			name: "Emma Wilson",
			avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuDI6PhjRTYv5lKoEn8TVesppVrXWlNvTrRl4uym7nS9rDjCRe5e-g1LnqVqXqCArcsv7eBbNIjDrRXuFsmfIMHKyBICVB8wrFJKUHHi_7TMiXHUeUXoHaubT5JxXe7kRaeigjl0YXkGy6TPKrd-ws7naUczd132KQr7_xqAhA0OhJrAhGXiA4OzEdBbQxm7cqTaschgA7NDR386g5RI_lpXJanAlLVc1y6jJyWGv3Fl0uCrzFrJmxQs19nvQi43V7JRNFzo_ZJIUEU",
		},
		category: "Accessibility",
		tags: ["A11y", "Web Development", "Best Practices"],
		readTime: "9 min read",
		date: "2024-03-10",
		image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDI6PhjRTYv5lKoEn8TVesppVrXWlNvTrRl4uym7nS9rDjCRe5e-g1LnqVqXqCArcsv7eBbNIjDrRXuFsmfIMHKyBICVB8wrFJKUHHi_7TMiXHUeUXoHaubT5JxXe7kRaeigjl0YXkGy6TPKrd-ws7naUczd132KQr7_xqAhA0OhJrAhGXiA4OzEdBbQxm7cqTaschgA7NDR386g5RI_lpXJanAlLVc1y6jJyWGv3Fl0uCrzFrJmxQs19nvQi43V7JRNFzo_ZJIUEU",
	},
];

export default function HomePage() {
	const [currentSlide, setCurrentSlide] = useState(0);
	const [isAutoPlaying, setIsAutoPlaying] = useState(true);
	const [featuredPage, setFeaturedPage] = useState(0);
	const [trendingPage, setTrendingPage] = useState(0);
	const postsPerPage = 3;

	// Auto-play functionality
	useEffect(() => {
		if (!isAutoPlaying) return;

		const timer = setInterval(() => {
			setCurrentSlide((prev) => (prev + 1) % FEATURED_POSTS.length);
		}, 5000); // Change slide every 5 seconds

		return () => clearInterval(timer);
	}, [isAutoPlaying]);

	const nextSlide = () => {
		setCurrentSlide((prev) => (prev + 1) % FEATURED_POSTS.length);
		setIsAutoPlaying(false);
	};

	const prevSlide = () => {
		setCurrentSlide((prev) => (prev - 1 + FEATURED_POSTS.length) % FEATURED_POSTS.length);
		setIsAutoPlaying(false);
	};

	const goToSlide = (index: number) => {
		setCurrentSlide(index);
		setIsAutoPlaying(false);
	};

	const nextFeaturedPage = () => {
		setFeaturedPage((prev) => 
			prev + 1 >= Math.ceil(FEATURED_POSTS.length / postsPerPage) ? 0 : prev + 1
		);
	};

	const prevFeaturedPage = () => {
		setFeaturedPage((prev) => 
			prev - 1 < 0 ? Math.ceil(FEATURED_POSTS.length / postsPerPage) - 1 : prev - 1
		);
	};

	const nextTrendingPage = () => {
		setTrendingPage((prev) => 
			prev + 1 >= Math.ceil(TRENDING_POSTS.length / postsPerPage) ? 0 : prev + 1
		);
	};

	const prevTrendingPage = () => {
		setTrendingPage((prev) => 
			prev - 1 < 0 ? Math.ceil(TRENDING_POSTS.length / postsPerPage) - 1 : prev - 1
		);
	};

	return (
		<div className="min-h-screen bg-muted/30 pt-4">
			{/* Hero Carousel Section */}
			<section className="relative h-[70vh] flex items-center justify-center">
				<div className="w-[80vw] h-full relative rounded-2xl overflow-hidden shadow-lg">
					{/* Slides */}
					{FEATURED_POSTS.map((post, index) => (
						<div
							key={post.id}
							className={`absolute inset-0 transition-opacity duration-500 ${
								index === currentSlide ? "opacity-100" : "opacity-0 pointer-events-none"
							}`}
						>
							<div className="absolute inset-0">
								<Image
									src={post.image}
									alt={post.title}
									fill
									className="object-cover brightness-50"
								/>
							</div>
							<div className="absolute inset-0 bg-gradient-to-r from-background/80 via-background/20 to-transparent" />
							<div className="relative h-full flex items-center text-primary">
								<div className="w-[60%] pl-20 pr-12">
									<Link href={`/blog/${post.id}`} className="block">
										<div className="space-y-4">
											<div className="flex items-center gap-2 text-sm mb-4">
												<div className="flex items-center gap-1">
													<User className="h-4 w-4" />
													<span>{post.author.name}</span>
												</div>
												<span>•</span>
												<div className="flex items-center gap-1">
													<Clock className="h-4 w-4" />
													<span>{post.readTime}</span>
												</div>
												<span>•</span>
												<span>{post.date}</span>
											</div>
											<h1 className="text-5xl font-bold mb-4 hover:text-primary/80 transition-colors">
												{post.title}
											</h1>
											<p className="text-xl text-primary/90 mb-4 line-clamp-2">
												{post.excerpt}
											</p>
											<p className="text-primary/70 mb-6 line-clamp-3">
												{post.content}
											</p>
											<div className="flex flex-wrap gap-2">
												{post.tags.map((tag) => (
													<Badge key={tag} variant="secondary" className="bg-primary/10 hover:bg-primary/20">
														{tag}
													</Badge>
												))}
											</div>
											<div className="mt-8">
												<span className="inline-flex items-center gap-2 hover:text-primary/80 transition-colors">
													Read Article
													<ArrowRight className="h-4 w-4" />
												</span>
											</div>
										</div>
									</Link>
								</div>
							</div>
						</div>
					))}

					{/* Navigation Controls */}
					<div className="absolute inset-x-0 top-1/2 -translate-y-1/2 z-20 flex justify-between px-4">
						<button
							onClick={prevSlide}
							className="p-2 rounded-full bg-black/30 text-white hover:bg-black/50 transition-colors"
							aria-label="Previous slide"
						>
							<ChevronLeft className="h-6 w-6" />
						</button>
						<button
							onClick={nextSlide}
							className="p-2 rounded-full bg-black/30 text-white hover:bg-black/50 transition-colors"
							aria-label="Next slide"
						>
							<ChevronRight className="h-6 w-6" />
						</button>
					</div>

					{/* Slide Indicators */}
					<div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
						{FEATURED_POSTS.map((_, index) => (
							<button
								key={index}
								onClick={() => goToSlide(index)}
								className={`w-2 h-2 rounded-full transition-all ${
									index === currentSlide
										? "bg-white w-8"
										: "bg-white/50 hover:bg-white/75"
								}`}
								aria-label={`Go to slide ${index + 1}`}
							/>
						))}
					</div>
				</div>
			</section>

			{/* Featured Posts */}
			<section className="py-16">
				<div className="container max-w-6xl mx-auto px-4">
					<div className="flex items-center justify-between mb-8">
						<div className="flex items-center gap-2">
							<Star className="h-5 w-5 text-yellow-500" />
							<h2 className="text-2xl font-bold">Featured Posts</h2>
						</div>
						{FEATURED_POSTS.length > postsPerPage && (
							<div className="flex items-center gap-2">
								<button
									onClick={prevFeaturedPage}
									className="p-2 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
									aria-label="Previous featured posts"
								>
									<ChevronLeft className="h-5 w-5" />
								</button>
								<button
									onClick={nextFeaturedPage}
									className="p-2 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
									aria-label="Next featured posts"
								>
									<ChevronRight className="h-5 w-5" />
								</button>
							</div>
						)}
					</div>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
						{FEATURED_POSTS.slice(
							featuredPage * postsPerPage,
							(featuredPage + 1) * postsPerPage
						).map((post) => (
							<Link href={`/blog/${post.id}`} key={post.id}>
								<Card className="h-full pt-0 hover:shadow-lg transition-shadow">
									<div className="relative h-52">
										<Image
											src={post.image}
											alt={post.title}
											fill
											className="object-cover rounded-t-lg"
										/>
									</div>
									<CardHeader>
										<div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
											<div className="flex items-center gap-1">
												<User className="h-3 w-3" />
												<span>{post.author.name}</span>
											</div>
											<span>•</span>
											<div className="flex items-center gap-1">
												<Clock className="h-3 w-3" />
												<span>{post.readTime}</span>
											</div>
										</div>
										<CardTitle className="line-clamp-2">{post.title}</CardTitle>
										<CardDescription className="line-clamp-2">
											{post.excerpt}
										</CardDescription>
									</CardHeader>
									<CardContent>
										<div className="flex flex-wrap gap-2">
											{post.tags.map((tag) => (
												<Badge key={tag} variant="secondary">
													{tag}
												</Badge>
											))}
										</div>
									</CardContent>
								</Card>
							</Link>
						))}
					</div>
				</div>
			</section>

			{/* Trending Posts */}
			<section className="py-16 bg-background">
				<div className="container max-w-6xl mx-auto px-4">
					<div className="flex items-center justify-between mb-8">
						<div className="flex items-center gap-2">
							<TrendingUp className="h-5 w-5 text-orange-500" />
							<h2 className="text-2xl font-bold">Trending Now</h2>
						</div>
						{TRENDING_POSTS.length > postsPerPage && (
							<div className="flex items-center gap-2">
								<button
									onClick={prevTrendingPage}
									className="p-2 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
									aria-label="Previous trending posts"
								>
									<ChevronLeft className="h-5 w-5" />
								</button>
								<button
									onClick={nextTrendingPage}
									className="p-2 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
									aria-label="Next trending posts"
								>
									<ChevronRight className="h-5 w-5" />
								</button>
							</div>
						)}
					</div>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
						{TRENDING_POSTS.slice(
							trendingPage * postsPerPage,
							(trendingPage + 1) * postsPerPage
						).map((post) => (
							<Link href={`/blog/${post.id}`} key={post.id}>
								<Card className="h-full pt-0 hover:shadow-lg transition-shadow">
									<div className="relative h-52">
										<Image
											src={post.image}
											alt={post.title}
											fill
											className="object-cover rounded-t-lg"
										/>
									</div>
									<CardHeader>
										<div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
											<div className="flex items-center gap-1">
												<User className="h-3 w-3" />
												<span>{post.author.name}</span>
											</div>
											<span>•</span>
											<div className="flex items-center gap-1">
												<Clock className="h-3 w-3" />
												<span>{post.readTime}</span>
											</div>
										</div>
										<CardTitle className="line-clamp-2">{post.title}</CardTitle>
										<CardDescription className="line-clamp-2">
											{post.excerpt}
										</CardDescription>
									</CardHeader>
									<CardContent>
										<div className="flex flex-wrap gap-2">
											{post.tags.map((tag) => (
												<Badge key={tag} variant="secondary">
													{tag}
												</Badge>
											))}
										</div>
									</CardContent>
								</Card>
							</Link>
						))}
					</div>
				</div>
			</section>

			{/* Newsletter Section */}
			<section className="py-16">
				<div className="container max-w-4xl mx-auto px-4 text-center">
					<h2 className="text-3xl font-bold mb-4">Stay Updated</h2>
					<p className="text-muted-foreground mb-8">
						Subscribe to our newsletter for the latest articles and updates
					</p>
					<div className="flex gap-4 max-w-md mx-auto">
						<input
							type="email"
							placeholder="Enter your email"
							className="flex-1 px-4 py-2 rounded-lg border bg-background"
						/>
						<button className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
							Subscribe
						</button>
					</div>
				</div>
			</section>
		</div>
	);
}
