"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, User, TrendingUp, Star, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { HomepagePost } from "@/app/actions/homepage";

interface HomePageProps {
  featuredPosts: HomepagePost[];
  trendingPosts: HomepagePost[];
}

// Default placeholder image for posts without images
const DEFAULT_POST_IMAGE = "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&q=80";

function SuggestedPost({ post }: { post: HomepagePost }) {
	return (
		<Link href={`/blogs/${post.slug}`} key={post.id}>
			<Card className="h-full pt-0 hover:shadow-lg transition-shadow">
				<div className="relative h-52 overflow-hidden">
					<img
						src={post.image || DEFAULT_POST_IMAGE}
						alt={post.title}
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
	)
}

export default function HomePage({ featuredPosts, trendingPosts }: HomePageProps) {
	const [currentSlide, setCurrentSlide] = useState(0);
	const [isAutoPlaying, setIsAutoPlaying] = useState(true);
	const [featuredPage, setFeaturedPage] = useState(0);
	const [trendingPage, setTrendingPage] = useState(0);
	const postsPerPage = 3;

	// Auto-play functionality
	useEffect(() => {
		if (!isAutoPlaying || featuredPosts.length === 0) return;

		const timer = setInterval(() => {
			setCurrentSlide((prev) => (prev + 1) % featuredPosts.length);
		}, 5000); // Change slide every 5 seconds

		return () => clearInterval(timer);
	}, [isAutoPlaying, featuredPosts.length]);

	const nextSlide = () => {
		setCurrentSlide((prev) => (prev + 1) % featuredPosts.length);
		setIsAutoPlaying(false);
	};

	const prevSlide = () => {
		setCurrentSlide((prev) => (prev - 1 + featuredPosts.length) % featuredPosts.length);
		setIsAutoPlaying(false);
	};

	const goToSlide = (index: number) => {
		setCurrentSlide(index);
		setIsAutoPlaying(false);
	};

	const nextFeaturedPage = () => {
		setFeaturedPage((prev) => 
			prev + 1 >= Math.ceil(featuredPosts.length / postsPerPage) ? 0 : prev + 1
		);
	};

	const prevFeaturedPage = () => {
		setFeaturedPage((prev) => 
			prev - 1 < 0 ? Math.ceil(featuredPosts.length / postsPerPage) - 1 : prev - 1
		);
	};

	const nextTrendingPage = () => {
		setTrendingPage((prev) => 
			prev + 1 >= Math.ceil(trendingPosts.length / postsPerPage) ? 0 : prev + 1
		);
	};

	const prevTrendingPage = () => {
		setTrendingPage((prev) => 
			prev - 1 < 0 ? Math.ceil(trendingPosts.length / postsPerPage) - 1 : prev - 1
		);
	};

	return (
		<div className="min-h-screen bg-muted/30 pt-4">
			{/* Hero Carousel Section */}
			<section className="relative h-[70vh] flex items-center justify-center">
				<div className="w-[80vw] h-full relative rounded-2xl overflow-hidden shadow-lg">
					{/* Slides */}
					{featuredPosts.length > 0 ? featuredPosts.map((post, index) => (
						<div
							key={post.id}
							className={`absolute inset-0 transition-opacity duration-500 ${
								index === currentSlide ? "opacity-100" : "opacity-0 pointer-events-none"
							}`}
						>
							<div className="absolute inset-0">
								<img
									src={post.image || DEFAULT_POST_IMAGE}
									alt={post.title}
									className="object-cover brightness-50"
								/>
							</div>
							<div className="absolute inset-0 bg-gradient-to-r from-background/80 via-background/20 to-transparent" />
							<div className="relative h-full flex items-center text-primary">
								<div className="w-[60%] pl-20 pr-12">
									<Link href={`/blogs/${post.slug}`} className="block">
										<div className="space-y-4">
											<div className="flex items-center gap-2 text-sm mb-4">
												<div className="flex items-center gap-1">
													<User className="h-4 w-4" />
													<span>{post.author.name || 'Anonymous'}</span>
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
												{post.excerpt || 'Click to read more...'}
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
					)) : (
						<div className="absolute inset-0 flex items-center justify-center">
							<p className="text-2xl text-white/60">No featured posts available</p>
						</div>
					)}

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
					{featuredPosts.length > 0 && (
						<div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
							{featuredPosts.map((_, index) => (
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
					)}
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
						{featuredPosts.length > postsPerPage && (
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
						{featuredPosts.length > 0 ? featuredPosts.slice(
							featuredPage * postsPerPage,
							(featuredPage + 1) * postsPerPage
						).map((post) => (
							<SuggestedPost key={post.id} post={post} />
						)) : (
							<div className="col-span-3 text-center py-8">
								<p className="text-muted-foreground">No featured posts available</p>
							</div>
						)}
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
						{trendingPosts.length > postsPerPage && (
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
						{trendingPosts.length > 0 ? trendingPosts.slice(
							trendingPage * postsPerPage,
							(trendingPage + 1) * postsPerPage
						).map((post) => (
							<SuggestedPost key={post.id} post={post} />
						)) : (
							<div className="col-span-3 text-center py-8">
								<p className="text-muted-foreground">No trending posts available</p>
							</div>
						)}
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
