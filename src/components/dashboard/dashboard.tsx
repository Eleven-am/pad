"use client";

import {FC, useState} from "react";
import {dashboardData} from "@/data/dashboard-mock-data";
import {Card} from "@/components/ui/card";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {ScrollArea} from "@/components/ui/scroll-area";
import {Activity, AlertCircle, BookOpen, Calendar, Clock, Code, Layers, Settings, Share2, TrendingUp, Users, Zap} from "lucide-react";
import {DashboardCharts} from "./dashboard-charts";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

// Metric Card Component
function MetricCard ({
	                     title,
	                     value,
	                     icon: Icon,
	                     trend,
	                     className = ""
                     }: {
	title: string;
	value: string | number;
	icon: FC<{ className?: string }>;
	trend?: { value: number; direction: "up" | "down" };
	className?: string;
}) {
	return (
		<Card className={`p-4 ${className}`}>
			<div className="flex items-center justify-between">
				<div>
					<p className="text-sm text-muted-foreground">{title}</p>
					<h3 className="text-2xl font-bold mt-1">{value}</h3>
					{trend && (
						<p className={`text-sm mt-1 ${trend.direction === "up" ? "text-green-500" : "text-red-500"}`}>
							{trend.direction === "up" ? "↑" : "↓"} {trend.value}%
						</p>
					)}
				</div>
				<Icon className="w-8 h-8 text-muted-foreground"/>
			</div>
		</Card>
	);
}

function SectionHeader ({title, icon: Icon}: { title: string; icon: FC<{ className?: string }> }) {
	return (
		<div className="flex items-center gap-2 mb-4">
			<Icon className="w-5 h-5"/>
			<h2 className="text-xl font-semibold">{title}</h2>
		</div>
	);
}

export function Dashboard () {
	const [activeTab, setActiveTab] = useState ("overview");
	
	return (
		<div className="container mx-auto p-6 space-y-6">
			<div className="flex justify-between items-center">
				<h1 className="text-3xl font-bold">Dashboard</h1>
				<div className="flex gap-2">
					<Select defaultValue="7">
						<SelectTrigger className="w-[180px]">
							<SelectValue placeholder="Select period" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="7">Last 7 days</SelectItem>
							<SelectItem value="30">Last 30 days</SelectItem>
							<SelectItem value="90">Last 90 days</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</div>
			
			<Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
				<TabsList className="w-full grid grid-cols-6">
					<TabsTrigger value="overview" className="flex-1">Overview</TabsTrigger>
					<TabsTrigger value="content" className="flex-1">Content</TabsTrigger>
					<TabsTrigger value="audience" className="flex-1">Audience</TabsTrigger>
					<TabsTrigger value="blocks" className="flex-1">Blocks</TabsTrigger>
					<TabsTrigger value="planning" className="flex-1">Planning</TabsTrigger>
					<TabsTrigger value="technical" className="flex-1">Technical</TabsTrigger>
				</TabsList>
				
				<TabsContent value="overview" className="space-y-6">
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
						<MetricCard
							title="Total Posts"
							value={dashboardData.contentMetrics.postLevel.totalPublished}
							icon={BookOpen}
							trend={{value: 12, direction: "up"}}
							className="bg-blue-50 dark:bg-blue-950/20"
						/>
						<MetricCard
							title="Total Views"
							value={dashboardData.audience.demographics.totalVisitors.monthly.toLocaleString()}
							icon={Users}
							trend={{value: 8, direction: "up"}}
							className="bg-indigo-50 dark:bg-indigo-950/20"
						/>
						<MetricCard
							title="Avg. Read Time"
							value={dashboardData.contentMetrics.qualityIndicators.avgReadingTime}
							icon={Clock}
							className="bg-emerald-50 dark:bg-emerald-950/20"
						/>
						<MetricCard
							title="Engagement Rate"
							value={`${dashboardData.audience.engagement.commentRate}%`}
							icon={Activity}
							trend={{value: 5, direction: "up"}}
							className="bg-amber-50 dark:bg-amber-950/20"
						/>
					</div>
					
                    <DashboardCharts />
					
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<Card className="p-6">
							<SectionHeader title="Content Pipeline" icon={TrendingUp}/>
							<div className="space-y-6">
								<div className="grid grid-cols-4 gap-4">
									<div className="text-center p-4 bg-muted/50 rounded-lg">
										<h3 className="text-2xl font-bold text-primary">{dashboardData.publishing.pipeline.draft}</h3>
										<p className="text-sm text-muted-foreground mt-1">Drafts</p>
										<p className="text-xs text-muted-foreground mt-2">In progress</p>
									</div>
									<div className="text-center p-4 bg-muted/50 rounded-lg">
										<h3 className="text-2xl font-bold text-yellow-500">{dashboardData.publishing.pipeline.review}</h3>
										<p className="text-sm text-muted-foreground mt-1">In Review</p>
										<p className="text-xs text-muted-foreground mt-2">Awaiting feedback</p>
									</div>
									<div className="text-center p-4 bg-muted/50 rounded-lg">
										<h3 className="text-2xl font-bold text-blue-500">{dashboardData.publishing.pipeline.scheduled}</h3>
										<p className="text-sm text-muted-foreground mt-1">Scheduled</p>
										<p className="text-xs text-muted-foreground mt-2">Ready to publish</p>
									</div>
									<div className="text-center p-4 bg-muted/50 rounded-lg">
										<h3 className="text-2xl font-bold text-green-500">{dashboardData.publishing.pipeline.published}</h3>
										<p className="text-sm text-muted-foreground mt-1">Published</p>
										<p className="text-xs text-muted-foreground mt-2">Live content</p>
									</div>
								</div>
								
								<div className="grid grid-cols-2 gap-4 pt-4 border-t">
									<div className="p-4 bg-muted/30 rounded-lg">
										<h4 className="text-sm font-medium mb-2">Average Time in Pipeline</h4>
										<div className="space-y-2">
											<div className="flex justify-between text-sm">
												<span>Draft to Review</span>
												<span className="font-medium">2.5 days</span>
											</div>
											<div className="flex justify-between text-sm">
												<span>Review to Publish</span>
												<span className="font-medium">1.8 days</span>
											</div>
										</div>
									</div>
									<div className="p-4 bg-muted/30 rounded-lg">
										<h4 className="text-sm font-medium mb-2">Pipeline Health</h4>
										<div className="space-y-2">
											<div className="flex justify-between text-sm">
												<span>Completion Rate</span>
												<span className="font-medium text-green-500">92%</span>
											</div>
											<div className="flex justify-between text-sm">
												<span>Stuck Content</span>
												<span className="font-medium text-yellow-500">3 posts</span>
											</div>
										</div>
									</div>
								</div>
								<div className="grid grid-cols-2 gap-4 pt-4 border-t">
									<div className="p-4 bg-muted/30 rounded-lg">
										<h4 className="text-sm font-medium mb-2">Content Quality</h4>
										<div className="space-y-2">
											<div className="flex justify-between text-sm">
												<span>SEO Score</span>
												<span className="font-medium text-blue-500">85%</span>
											</div>
											<div className="flex justify-between text-sm">
												<span>Readability</span>
												<span className="font-medium text-green-500">92%</span>
											</div>
										</div>
									</div>
									<div className="p-4 bg-muted/30 rounded-lg">
										<h4 className="text-sm font-medium mb-2">Engagement Metrics</h4>
										<div className="space-y-2">
											<div className="flex justify-between text-sm">
												<span>Avg. Comments</span>
												<span className="font-medium">12 per post</span>
											</div>
											<div className="flex justify-between text-sm">
												<span>Share Rate</span>
												<span className="font-medium text-blue-500">8.5%</span>
											</div>
										</div>
									</div>
								</div>
							</div>
						</Card>
						
						<Card className="p-6">
							<SectionHeader title="Recent Activity" icon={Activity}/>
							<div className="space-y-6">
								<ScrollArea className="h-[300px]">
									<div className="space-y-4">
										{dashboardData.predictive.alerts.performance.map((alert, index) => (
											<div key={index} className="flex items-start gap-3 p-3 hover:bg-muted rounded-lg transition-colors">
												<div className="mt-1">
													<AlertCircle className="w-4 h-4 text-yellow-500"/>
												</div>
												<div>
													<p className="text-sm font-medium">Performance Alert</p>
													<p className="text-sm text-muted-foreground mt-1">{alert}</p>
													<p className="text-xs text-muted-foreground mt-2">2 hours ago</p>
												</div>
											</div>
										))}
									</div>
								</ScrollArea>
								
								<div className="grid grid-cols-2 gap-4 pt-4 border-t">
									<div className="p-4 bg-muted/30 rounded-lg">
										<h4 className="text-sm font-medium mb-2">Today's Activity</h4>
										<div className="space-y-2">
											<div className="flex justify-between text-sm">
												<span>New Posts</span>
												<span className="font-medium">3</span>
											</div>
											<div className="flex justify-between text-sm">
												<span>Comments</span>
												<span className="font-medium">12</span>
											</div>
										</div>
									</div>
									<div className="p-4 bg-muted/30 rounded-lg">
										<h4 className="text-sm font-medium mb-2">Engagement</h4>
										<div className="space-y-2">
											<div className="flex justify-between text-sm">
												<span>Avg. Response Time</span>
												<span className="font-medium">45m</span>
											</div>
											<div className="flex justify-between text-sm">
												<span>Active Users</span>
												<span className="font-medium">24</span>
											</div>
										</div>
									</div>
								</div>
							</div>
						</Card>
					</div>
				</TabsContent>
				
				<TabsContent value="content" className="space-y-6">
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
						<MetricCard
							title="Total Posts"
							value={dashboardData.contentMetrics.postLevel.totalPublished}
							icon={BookOpen}
							trend={{value: 12, direction: "up"}}
							className="bg-blue-50 dark:bg-blue-950/20"
						/>
						<MetricCard
							title="Avg. Read Time"
							value={dashboardData.contentMetrics.qualityIndicators.avgReadingTime}
							icon={Clock}
							className="bg-emerald-50 dark:bg-emerald-950/20"
						/>
						<MetricCard
							title="Content Velocity"
							value={`${dashboardData.contentMetrics.postLevel.contentVelocity.weekly}/week`}
							icon={TrendingUp}
							trend={{value: 8, direction: "up"}}
							className="bg-violet-50 dark:bg-violet-950/20"
						/>
						<MetricCard
							title="Completion Rate"
							value={`${dashboardData.contentMetrics.postLevel.completionRate}%`}
							icon={Activity}
							trend={{value: 5, direction: "up"}}
							className="bg-amber-50 dark:bg-amber-950/20"
						/>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<Card className="p-6">
							<SectionHeader title="Content Quality" icon={BookOpen}/>
							<div className="space-y-6">
								<div>
									<h4 className="text-sm font-medium mb-3">Quality Scores</h4>
									<div className="space-y-4">
										<div>
											<div className="flex justify-between text-sm mb-1">
												<span>SEO Score</span>
												<span>{dashboardData.contentMetrics.qualityIndicators.seoScores.excellent}%</span>
											</div>
											<div className="w-full bg-muted rounded-full h-2">
												<div
													className="bg-blue-500 h-2 rounded-full"
													style={{width: `${dashboardData.contentMetrics.qualityIndicators.seoScores.excellent}%`}}
												/>
											</div>
										</div>
										<div>
											<div className="flex justify-between text-sm mb-1">
												<span>Readability</span>
												<span>{dashboardData.contentMetrics.qualityIndicators.readabilityScores.excellent}%</span>
											</div>
											<div className="w-full bg-muted rounded-full h-2">
												<div
													className="bg-green-500 h-2 rounded-full"
													style={{width: `${dashboardData.contentMetrics.qualityIndicators.readabilityScores.excellent}%`}}
												/>
											</div>
										</div>
										<div>
											<div className="flex justify-between text-sm mb-1">
												<span>Image Optimization</span>
												<span>{dashboardData.contentMetrics.qualityIndicators.imageOptimization}%</span>
											</div>
											<div className="w-full bg-muted rounded-full h-2">
												<div
													className="bg-yellow-500 h-2 rounded-full"
													style={{width: `${dashboardData.contentMetrics.qualityIndicators.imageOptimization}%`}}
												/>
											</div>
										</div>
									</div>
								</div>

								<div>
									<h4 className="text-sm font-medium mb-3">Content Freshness</h4>
									<div className="grid grid-cols-4 gap-4">
										<div className="text-center p-3 bg-muted/30 rounded-lg">
											<p className="text-sm">Last Week</p>
											<p className="text-2xl font-bold mt-1">{dashboardData.contentMetrics.qualityIndicators.contentFreshness.updatedLastWeek}%</p>
										</div>
										<div className="text-center p-3 bg-muted/30 rounded-lg">
											<p className="text-sm">Last Month</p>
											<p className="text-2xl font-bold mt-1">{dashboardData.contentMetrics.qualityIndicators.contentFreshness.updatedLastMonth}%</p>
										</div>
										<div className="text-center p-3 bg-muted/30 rounded-lg">
											<p className="text-sm">Last Quarter</p>
											<p className="text-2xl font-bold mt-1">{dashboardData.contentMetrics.qualityIndicators.contentFreshness.updatedLastQuarter}%</p>
										</div>
										<div className="text-center p-3 bg-muted/30 rounded-lg">
											<p className="text-sm">Older</p>
											<p className="text-2xl font-bold mt-1">{dashboardData.contentMetrics.qualityIndicators.contentFreshness.older}%</p>
										</div>
									</div>
								</div>
							</div>
						</Card>

						<Card className="p-6">
							<SectionHeader title="Content Distribution" icon={TrendingUp}/>
							<div className="space-y-6">
								<div>
									<h4 className="text-sm font-medium mb-3">Word Count Distribution</h4>
									<div className="space-y-2">
										{Object.entries(dashboardData.contentMetrics.qualityIndicators.wordCountDistribution).map(([range, percentage]) => (
											<div key={range}>
												<div className="flex justify-between text-sm mb-1">
													<span>{range} words</span>
													<span>{percentage}%</span>
												</div>
												<div className="w-full bg-muted rounded-full h-2">
													<div
														className="bg-primary h-2 rounded-full"
														style={{width: `${percentage}%`}}
													/>
												</div>
											</div>
										))}
									</div>
								</div>

								<div>
									<h4 className="text-sm font-medium mb-3">Content Pipeline</h4>
									<div className="grid grid-cols-4 gap-4">
										<div className="text-center p-3 bg-muted/30 rounded-lg">
											<p className="text-sm">Drafts</p>
											<p className="text-2xl font-bold mt-1">{dashboardData.contentMetrics.postLevel.totalDrafts}</p>
										</div>
										<div className="text-center p-3 bg-muted/30 rounded-lg">
											<p className="text-sm">In Review</p>
											<p className="text-2xl font-bold mt-1">{dashboardData.contentMetrics.postLevel.pendingReview}</p>
										</div>
										<div className="text-center p-3 bg-muted/30 rounded-lg">
											<p className="text-sm">Scheduled</p>
											<p className="text-2xl font-bold mt-1">{dashboardData.contentMetrics.postLevel.totalScheduled}</p>
										</div>
										<div className="text-center p-3 bg-muted/30 rounded-lg">
											<p className="text-sm">Published</p>
											<p className="text-2xl font-bold mt-1">{dashboardData.contentMetrics.postLevel.totalPublished}</p>
										</div>
									</div>
								</div>
							</div>
						</Card>
					</div>

					<Card className="p-6">
						<SectionHeader title="Top Performing Posts" icon={TrendingUp}/>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div className="space-y-4">
								<ScrollArea className="h-[400px]">
									<div className="space-y-4">
										{dashboardData.contentMetrics.individualPosts.topPerforming.map((post) => (
											<div key={post.id} className="p-4 hover:bg-muted rounded-lg transition-colors">
												<h4 className="font-medium">{post.title}</h4>
												<div className="grid grid-cols-2 gap-4 mt-3">
													<div>
														<p className="text-sm text-muted-foreground">Views</p>
														<p className="font-medium">{post.views.monthly.toLocaleString()}</p>
													</div>
													<div>
														<p className="text-sm text-muted-foreground">Read Time</p>
														<p className="font-medium">{post.avgReadTime}</p>
													</div>
													<div>
														<p className="text-sm text-muted-foreground">Engagement</p>
														<p className="font-medium">{post.completionRate}%</p>
													</div>
													<div>
														<p className="text-sm text-muted-foreground">Social Shares</p>
														<p className="font-medium">{post.socialShares}</p>
													</div>
												</div>
											</div>
										))}
									</div>
								</ScrollArea>
							</div>
							<div className="space-y-6">
								<div>
									<h4 className="text-sm font-medium mb-3">Content Performance Metrics</h4>
									<div className="grid grid-cols-2 gap-4">
										<div className="p-4 bg-muted/30 rounded-lg">
											<p className="text-sm text-muted-foreground">Avg. Publish Time</p>
											<p className="text-2xl font-bold mt-1">{dashboardData.contentMetrics.postLevel.avgPublishTime}</p>
										</div>
										<div className="p-4 bg-muted/30 rounded-lg">
											<p className="text-sm text-muted-foreground">Featured Posts</p>
											<p className="text-2xl font-bold mt-1">{dashboardData.contentMetrics.postLevel.featuredPosts}</p>
										</div>
										<div className="p-4 bg-muted/30 rounded-lg">
											<p className="text-sm text-muted-foreground">SEO Optimized</p>
											<p className="text-2xl font-bold mt-1">{dashboardData.contentMetrics.postLevel.seoOptimized}%</p>
										</div>
										<div className="p-4 bg-muted/30 rounded-lg">
											<p className="text-sm text-muted-foreground">Mobile Score</p>
											<p className="text-2xl font-bold mt-1">{dashboardData.contentMetrics.qualityIndicators.mobileResponsiveness}%</p>
										</div>
									</div>
								</div>
								<div>
									<h4 className="text-sm font-medium mb-3">Recent Activity</h4>
									<div className="space-y-2">
										<div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
											<div>
												<p className="font-medium">Last 7 Days</p>
												<p className="text-sm text-muted-foreground">{dashboardData.contentMetrics.postLevel.recentPosts.last7Days} posts</p>
											</div>
											<div className="text-right">
												<p className="font-medium">Last 30 Days</p>
												<p className="text-sm text-muted-foreground">{dashboardData.contentMetrics.postLevel.recentPosts.last30Days} posts</p>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</Card>
				</TabsContent>
				
				<TabsContent value="blocks" className="space-y-6">
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
						<MetricCard
							title="Total Blocks"
							value={dashboardData.blockAnalytics.usage.totalBlocks}
							icon={Code}
							trend={{value: 8, direction: "up"}}
							className="bg-violet-50 dark:bg-violet-950/20"
						/>
						<MetricCard
							title="Avg. Blocks/Post"
							value={dashboardData.blockAnalytics.usage.avgBlocksPerPost}
							icon={BookOpen}
							className="bg-blue-50 dark:bg-blue-950/20"
						/>
						<MetricCard
							title="Deletion Rate"
							value={`${dashboardData.blockAnalytics.usage.deletionRate}%`}
							icon={Activity}
							trend={{value: 2, direction: "down"}}
							className="bg-rose-50 dark:bg-rose-950/20"
						/>
						<MetricCard
							title="Chart Views"
							value={dashboardData.blockAnalytics.performance.chartViewDuration}
							icon={TrendingUp}
							className="bg-amber-50 dark:bg-amber-950/20"
						/>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<Card className="p-6">
							<SectionHeader title="Block Usage Distribution" icon={Code}/>
							<div className="space-y-6">
								<div>
									<h4 className="text-sm font-medium mb-3">Type Distribution</h4>
									<div className="space-y-4">
										{Object.entries(dashboardData.blockAnalytics.usage.typeDistribution).map(([type, percentage]) => (
											<div key={type}>
												<div className="flex justify-between text-sm mb-1">
													<span className="capitalize">{type}</span>
													<span>{percentage}%</span>
												</div>
												<div className="w-full bg-muted rounded-full h-2">
													<div
														className="bg-primary h-2 rounded-full"
														style={{width: `${percentage}%`}}
													/>
												</div>
											</div>
										))}
									</div>
								</div>

								<div>
									<h4 className="text-sm font-medium mb-3">Most Used Blocks</h4>
									<div className="grid grid-cols-3 gap-4">
										{dashboardData.blockAnalytics.usage.mostUsed.map((block) => {
											const percentage = dashboardData.blockAnalytics.usage.typeDistribution[block as keyof typeof dashboardData.blockAnalytics.usage.typeDistribution];
											return (
												<div key={block} className="text-center p-3 bg-muted/30 rounded-lg">
													<p className="text-sm capitalize">{block}</p>
													<p className="text-2xl font-bold mt-1">
														{percentage}%
													</p>
												</div>
											);
										})}
									</div>
								</div>
							</div>
						</Card>

						<Card className="p-6">
							<SectionHeader title="Block Performance" icon={Activity}/>
							<div className="space-y-6">
								<div>
									<h4 className="text-sm font-medium mb-3">Engagement Time</h4>
									<div className="space-y-4">
										{Object.entries(dashboardData.blockAnalytics.performance.engagementTime).map(([type, time]) => (
											<div key={type} className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
												<span className="capitalize text-sm">{type}</span>
												<span className="text-sm font-medium">{time}</span>
											</div>
										))}
									</div>
								</div>

								<div>
									<h4 className="text-sm font-medium mb-3">Interaction Rates</h4>
									<div className="grid grid-cols-2 gap-4">
										<div className="p-3 bg-muted/30 rounded-lg">
											<p className="text-sm text-muted-foreground">Code Copy Rate</p>
											<p className="text-2xl font-bold mt-1">{dashboardData.blockAnalytics.performance.codeCopyRate}%</p>
										</div>
										<div className="p-3 bg-muted/30 rounded-lg">
											<p className="text-sm text-muted-foreground">Image Zoom Rate</p>
											<p className="text-2xl font-bold mt-1">{dashboardData.blockAnalytics.performance.imageZoomRate}%</p>
										</div>
										<div className="p-3 bg-muted/30 rounded-lg">
											<p className="text-sm text-muted-foreground">Video Play Rate</p>
											<p className="text-2xl font-bold mt-1">{dashboardData.blockAnalytics.performance.videoPlayRate}%</p>
										</div>
										<div className="p-3 bg-muted/30 rounded-lg">
											<p className="text-sm text-muted-foreground">Poll Participation</p>
											<p className="text-2xl font-bold mt-1">{dashboardData.blockAnalytics.performance.pollParticipation}%</p>
										</div>
									</div>
								</div>
							</div>
						</Card>
					</div>

					<Card className="p-6">
						<SectionHeader title="Block-Specific Analytics" icon={TrendingUp}/>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div className="space-y-6">
								<div>
									<h4 className="text-sm font-medium mb-3">Social Media Blocks</h4>
									<div className="grid grid-cols-2 gap-4">
										<div className="p-4 bg-muted/30 rounded-lg">
											<p className="text-sm font-medium mb-2">Instagram</p>
											<div className="space-y-2">
												<div className="flex justify-between text-sm">
													<span>Fetch Success</span>
													<span>{dashboardData.blockAnalytics.specificData.instagram.fetchSuccess}%</span>
												</div>
												<div className="flex justify-between text-sm">
													<span>Avg. Likes</span>
													<span>{dashboardData.blockAnalytics.specificData.instagram.avgLikes}</span>
												</div>
												<div className="flex justify-between text-sm">
													<span>Avg. Comments</span>
													<span>{dashboardData.blockAnalytics.specificData.instagram.avgComments}</span>
												</div>
											</div>
										</div>
										<div className="p-4 bg-muted/30 rounded-lg">
											<p className="text-sm font-medium mb-2">Twitter</p>
											<div className="space-y-2">
												<div className="flex justify-between text-sm">
													<span>Engagement Accuracy</span>
													<span>{dashboardData.blockAnalytics.specificData.twitter.engagementAccuracy}%</span>
												</div>
												<div className="flex justify-between text-sm">
													<span>Avg. Retweets</span>
													<span>{dashboardData.blockAnalytics.specificData.twitter.avgRetweets}</span>
												</div>
												<div className="flex justify-between text-sm">
													<span>Avg. Likes</span>
													<span>{dashboardData.blockAnalytics.specificData.twitter.avgLikes}</span>
												</div>
											</div>
										</div>
									</div>
								</div>

								<div>
									<h4 className="text-sm font-medium mb-3">Chart Block Analytics</h4>
									<div className="p-4 bg-muted/30 rounded-lg">
										<div className="grid grid-cols-2 gap-4">
											<div>
												<p className="text-sm text-muted-foreground">Avg. File Size</p>
												<p className="text-lg font-bold mt-1">{dashboardData.blockAnalytics.specificData.chart.avgFileSize}</p>
											</div>
											<div>
												<p className="text-sm text-muted-foreground">Type Preferences</p>
												<div className="space-y-1 mt-2">
													{Object.entries(dashboardData.blockAnalytics.specificData.chart.typePreferences).map(([type, percentage]) => (
														<div key={type} className="flex justify-between text-sm">
															<span className="capitalize">{type}</span>
															<span>{percentage}%</span>
														</div>
													))}
												</div>
											</div>
										</div>
									</div>
								</div>
							</div>

							<div className="space-y-6">
								<div>
									<h4 className="text-sm font-medium mb-3">Code Block Analytics</h4>
									<div className="p-4 bg-muted/30 rounded-lg">
										<div className="space-y-4">
											<div>
												<p className="text-sm text-muted-foreground">Language Distribution</p>
												<div className="space-y-2 mt-2">
													{Object.entries(dashboardData.blockAnalytics.specificData.code.languageDistribution).map(([lang, percentage]) => (
														<div key={lang}>
															<div className="flex justify-between text-sm mb-1">
																<span className="capitalize">{lang}</span>
																<span>{percentage}%</span>
															</div>
															<div className="w-full bg-muted rounded-full h-1.5">
																<div
																	className="bg-primary h-1.5 rounded-full"
																	style={{width: `${percentage}%`}}
																/>
															</div>
														</div>
													))}
												</div>
											</div>
											<div>
												<p className="text-sm text-muted-foreground">Copy Rate</p>
												<p className="text-2xl font-bold mt-1">{dashboardData.blockAnalytics.specificData.code.copyRate}%</p>
											</div>
										</div>
									</div>
								</div>

								<div>
									<h4 className="text-sm font-medium mb-3">Media Block Analytics</h4>
									<div className="grid grid-cols-2 gap-4">
										<div className="p-4 bg-muted/30 rounded-lg">
											<p className="text-sm font-medium mb-2">Images</p>
											<div className="space-y-2">
												<div className="flex justify-between text-sm">
													<span>Avg. File Size</span>
													<span>{dashboardData.blockAnalytics.specificData.image.avgFileSize}</span>
												</div>
												<div className="flex justify-between text-sm">
													<span>Avg. Load Time</span>
													<span>{dashboardData.blockAnalytics.specificData.image.avgLoadTime}</span>
												</div>
												<div className="flex justify-between text-sm">
													<span>Alt Text Completion</span>
													<span>{dashboardData.blockAnalytics.specificData.image.altTextCompletion}%</span>
												</div>
											</div>
										</div>
										<div className="p-4 bg-muted/30 rounded-lg">
											<p className="text-sm font-medium mb-2">Videos</p>
											<div className="space-y-2">
												<div className="flex justify-between text-sm">
													<span>Avg. File Size</span>
													<span>{dashboardData.blockAnalytics.specificData.video.avgFileSize}</span>
												</div>
												<div className="flex justify-between text-sm">
													<span>Poster Optimization</span>
													<span>{dashboardData.blockAnalytics.specificData.video.posterOptimization}%</span>
												</div>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</Card>
				</TabsContent>
				
				<TabsContent value="planning" className="space-y-6">
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
						<MetricCard
							title="Scheduled Posts"
							value={dashboardData.publishing.pipeline.scheduled}
							icon={Calendar}
							trend={{value: 5, direction: "up"}}
							className="bg-blue-50 dark:bg-blue-950/20"
						/>
						<MetricCard
							title="Content Gaps"
							value={dashboardData.predictive.recommendations.contentGaps.length}
							icon={AlertCircle}
							className="bg-rose-50 dark:bg-rose-950/20"
						/>
						<MetricCard
							title="Topic Clusters"
							value={Object.keys(dashboardData.strategy.contentType.topicTrending).length}
							icon={Layers}
							className="bg-violet-50 dark:bg-violet-950/20"
						/>
						<MetricCard
							title="Evergreen Content"
							value={`${dashboardData.strategy.contentType.evergreen.performance}%`}
							icon={TrendingUp}
							trend={{value: 8, direction: "up"}}
							className="bg-emerald-50 dark:bg-emerald-950/20"
						/>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<Card className="p-6">
							<SectionHeader title="Content Calendar" icon={Calendar}/>
							<div className="space-y-6">
								<div className="grid grid-cols-7 gap-2">
									{Object.entries(dashboardData.publishing.timing.optimalPublishing).map(([day, percentage]) => (
										<div key={day} className="text-center p-3 bg-muted/30 rounded-lg">
											<p className="text-sm font-medium capitalize">{day}</p>
											<p className="text-2xl font-bold mt-1">{percentage}%</p>
										</div>
									))}
								</div>
								<div>
									<h4 className="text-sm font-medium mb-3">Publishing Schedule</h4>
									<div className="space-y-2">
										{Object.entries(dashboardData.publishing.timing.optimalPublishing).map(([day, time]) => (
											<div key={day} className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
												<span className="capitalize text-sm">{day}</span>
												<span className="text-sm font-medium">{time}</span>
											</div>
										))}
									</div>
								</div>
							</div>
						</Card>

						<Card className="p-6">
							<SectionHeader title="Topic Analysis" icon={Layers}/>
							<div className="space-y-6">
								<div>
									<h4 className="text-sm font-medium mb-3">Topic Clusters</h4>
									<div className="space-y-4">
										{Object.entries(dashboardData.strategy.contentType.topicTrending).map(([topic, percentage]) => (
											<div key={topic}>
												<div className="flex justify-between text-sm mb-1">
													<span className="capitalize">{topic}</span>
													<span>{percentage}%</span>
												</div>
												<div className="w-full bg-muted rounded-full h-2">
													<div
														className="bg-primary h-2 rounded-full"
														style={{width: `${percentage}%`}}
													/>
												</div>
											</div>
										))}
									</div>
								</div>

								<div>
									<h4 className="text-sm font-medium mb-3">Content Gaps</h4>
									<div className="space-y-2">
										{dashboardData.predictive.recommendations.contentGaps.map((gap, index) => (
											<div key={index} className="p-3 bg-muted/30 rounded-lg">
												<p className="text-sm">{gap}</p>
											</div>
										))}
									</div>
								</div>
							</div>
						</Card>
					</div>

					<Card className="p-6">
						<SectionHeader title="Content Strategy" icon={TrendingUp}/>
						<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
							<div>
								<h4 className="text-sm font-medium mb-3">Content Types</h4>
								<div className="space-y-4">
									{Object.entries(dashboardData.strategy.contentType.byLength).map(([type, percentage]) => (
										<div key={type}>
											<div className="flex justify-between text-sm mb-1">
												<span className="capitalize">{type}</span>
												<span>{percentage}%</span>
											</div>
											<div className="w-full bg-muted rounded-full h-2">
												<div
													className="bg-primary h-2 rounded-full"
													style={{width: `${percentage}%`}}
												/>
											</div>
										</div>
									))}
								</div>
							</div>

							<div>
								<h4 className="text-sm font-medium mb-3">Seasonal Performance</h4>
								<div className="space-y-4">
									{Object.entries(dashboardData.strategy.contentType.seasonal).map(([season, percentage]) => (
										<div key={season}>
											<div className="flex justify-between text-sm mb-1">
												<span className="capitalize">{season}</span>
												<span>{percentage}%</span>
											</div>
											<div className="w-full bg-muted rounded-full h-2">
												<div
													className="bg-primary h-2 rounded-full"
													style={{width: `${percentage}%`}}
												/>
											</div>
										</div>
									))}
								</div>
							</div>

							<div>
								<h4 className="text-sm font-medium mb-3">Series Performance</h4>
								<div className="space-y-4">
									<div className="p-4 bg-muted/30 rounded-lg">
										<div className="space-y-2">
											<div className="flex justify-between text-sm">
												<span>Performance</span>
												<span>{dashboardData.strategy.contentType.series.performance}%</span>
											</div>
											<div className="flex justify-between text-sm">
												<span>Engagement</span>
												<span>{dashboardData.strategy.contentType.series.engagement}%</span>
											</div>
											<div className="flex justify-between text-sm">
												<span>Completion</span>
												<span>{dashboardData.strategy.contentType.series.completion}%</span>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</Card>
				</TabsContent>
				
				<TabsContent value="audience" className="space-y-6">
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
						<MetricCard
							title="Total Visitors"
							value={dashboardData.audience.demographics.totalVisitors.monthly.toLocaleString()}
							icon={Users}
							trend={{value: 12, direction: "up"}}
							className="bg-indigo-50 dark:bg-indigo-950/20"
						/>
						<MetricCard
							title="Avg. Session"
							value={`${dashboardData.audience.engagement.avgSessionDuration} min`}
							icon={Clock}
							trend={{value: 5, direction: "up"}}
							className="bg-emerald-50 dark:bg-emerald-950/20"
						/>
						<MetricCard
							title="Bounce Rate"
							value={`${dashboardData.audience.engagement.bounceRate}%`}
							icon={Activity}
							trend={{value: 3, direction: "down"}}
							className="bg-rose-50 dark:bg-rose-950/20"
						/>
						<MetricCard
							title="Return Rate"
							value={`${dashboardData.audience.engagement.returnRate}%`}
							icon={TrendingUp}
							trend={{value: 8, direction: "up"}}
							className="bg-amber-50 dark:bg-amber-950/20"
						/>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<Card className="p-6">
							<SectionHeader title="Audience Demographics" icon={Users}/>
							<div className="space-y-6">
								<div>
									<h4 className="text-sm font-medium mb-3">Age Distribution</h4>
									<div className="space-y-2">
										{Object.entries(dashboardData.audience.demographics.ageGroups).map(([age, percentage]) => (
											<div key={age}>
												<div className="flex justify-between text-sm mb-1">
													<span>{age}</span>
													<span>{percentage}%</span>
												</div>
												<div className="w-full bg-muted rounded-full h-2">
													<div
														className="bg-primary h-2 rounded-full"
														style={{width: `${percentage}%`}}
													/>
												</div>
											</div>
										))}
									</div>
								</div>

								<div>
									<h4 className="text-sm font-medium mb-3">Top Locations</h4>
									<div className="space-y-2">
										{Object.entries(dashboardData.audience.demographics.geographicDistribution).map(([location, percentage]) => (
											<div key={location} className="flex justify-between items-center">
												<span className="text-sm">{location}</span>
												<span className="text-sm font-medium">{percentage}%</span>
											</div>
										))}
									</div>
								</div>
							</div>
						</Card>

						<Card className="p-6">
							<SectionHeader title="Engagement Metrics" icon={Activity}/>
							<div className="space-y-6">
								<div>
									<h4 className="text-sm font-medium mb-3">Engagement Rates</h4>
									<div className="space-y-4">
										<div>
											<div className="flex justify-between text-sm mb-1">
												<span>Comments</span>
												<span>{dashboardData.audience.engagement.commentRate}%</span>
											</div>
											<div className="w-full bg-muted rounded-full h-2">
												<div
													className="bg-blue-500 h-2 rounded-full"
													style={{width: `${dashboardData.audience.engagement.commentRate}%`}}
												/>
											</div>
										</div>
										<div>
											<div className="flex justify-between text-sm mb-1">
												<span>Shares</span>
												<span>{dashboardData.audience.engagement.shareRate}%</span>
											</div>
											<div className="w-full bg-muted rounded-full h-2">
												<div
													className="bg-green-500 h-2 rounded-full"
													style={{width: `${dashboardData.audience.engagement.shareRate}%`}}
												/>
											</div>
										</div>
										<div>
											<div className="flex justify-between text-sm mb-1">
												<span>Likes</span>
												<span>{dashboardData.audience.engagement.likeRate}%</span>
											</div>
											<div className="w-full bg-muted rounded-full h-2">
												<div
													className="bg-yellow-500 h-2 rounded-full"
													style={{width: `${dashboardData.audience.engagement.likeRate}%`}}
												/>
											</div>
										</div>
									</div>
								</div>

								<div>
									<h4 className="text-sm font-medium mb-3">Device Usage</h4>
									<div className="grid grid-cols-3 gap-4">
										{Object.entries(dashboardData.audience.demographics.deviceUsage).map(([device, percentage]) => (
											<div key={device} className="text-center p-3 bg-muted/30 rounded-lg">
												<p className="text-sm font-medium">{device}</p>
												<p className="text-2xl font-bold mt-1">{percentage}%</p>
											</div>
										))}
									</div>
								</div>
							</div>
						</Card>
					</div>

					<Card className="p-6">
						<SectionHeader title="Audience Insights" icon={TrendingUp}/>
						<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
							<div>
								<h4 className="text-sm font-medium mb-3">Peak Activity Hours</h4>
								<div className="space-y-2">
									{Object.entries(dashboardData.audience.engagement.peakHours).map(([hour, percentage]) => (
										<div key={hour} className="flex justify-between items-center">
											<span className="text-sm">{hour}</span>
											<span className="text-sm font-medium">{percentage}%</span>
										</div>
									))}
								</div>
							</div>

							<div>
								<h4 className="text-sm font-medium mb-3">Content Preferences</h4>
								<div className="space-y-2">
									{Object.entries(dashboardData.audience.engagement.contentPreferences).map(([type, percentage]) => (
										<div key={type}>
											<div className="flex justify-between text-sm mb-1">
												<span className="capitalize">{type}</span>
												<span>{percentage}%</span>
											</div>
											<div className="w-full bg-muted rounded-full h-2">
												<div
													className="bg-primary h-2 rounded-full"
													style={{width: `${percentage}%`}}
												/>
											</div>
										</div>
									))}
								</div>
							</div>

							<div>
								<h4 className="text-sm font-medium mb-3">User Behavior</h4>
								<div className="space-y-4">
									<div>
										<p className="text-sm text-muted-foreground">Avg. Pages per Visit</p>
										<p className="text-2xl font-bold mt-1">{dashboardData.audience.engagement.avgPagesPerVisit}</p>
									</div>
									<div>
										<p className="text-sm text-muted-foreground">Returning Visitors</p>
										<p className="text-2xl font-bold mt-1">{dashboardData.audience.engagement.returnRate}%</p>
									</div>
									<div>
										<p className="text-sm text-muted-foreground">New vs Returning</p>
										<div className="flex gap-2 mt-2">
											<div className="flex-1 p-2 bg-muted/30 rounded-lg text-center">
												<p className="text-sm">New</p>
												<p className="font-medium">{100 - dashboardData.audience.engagement.returnRate}%</p>
											</div>
											<div className="flex-1 p-2 bg-muted/30 rounded-lg text-center">
												<p className="text-sm">Returning</p>
												<p className="font-medium">{dashboardData.audience.engagement.returnRate}%</p>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</Card>
				</TabsContent>
                                    
				<TabsContent value="technical" className="space-y-6">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<Card className="p-6">
							<SectionHeader title="Site Performance" icon={Zap}/>
							<div className="space-y-4">
								<div>
									<p className="text-sm text-muted-foreground">Load Speed</p>
									<div className="w-full bg-muted rounded-full h-2 mt-1">
										<div
											className="bg-primary h-2 rounded-full"
											style={{width: `${(parseFloat (dashboardData.technical.site.avgLoadSpeed) / 2) * 100}%`}}
										/>
									</div>
								</div>
								<div>
									<p className="text-sm text-muted-foreground">Mobile Score</p>
									<div className="w-full bg-muted rounded-full h-2 mt-1">
										<div
											className="bg-primary h-2 rounded-full"
											style={{width: `${dashboardData.technical.site.mobileScore}%`}}
										/>
									</div>
								</div>
								<div>
									<p className="text-sm text-muted-foreground">Image Optimization</p>
									<div className="w-full bg-muted rounded-full h-2 mt-1">
										<div
											className="bg-primary h-2 rounded-full"
											style={{width: `${dashboardData.technical.site.imageOptimization}%`}}
										/>
									</div>
								</div>
							</div>
						</Card>
                                    
						<Card className="p-6">
							<SectionHeader title="System Health" icon={Settings}/>
							<div className="space-y-4">
								<div>
									<p className="text-sm text-muted-foreground">Uptime</p>
									<div className="w-full bg-muted rounded-full h-2 mt-1">
										<div
											className="bg-primary h-2 rounded-full"
											style={{width: `${dashboardData.technical.health.uptime}%`}}
										/>
									</div>
								</div>
								<div>
									<p className="text-sm text-muted-foreground">Storage Usage</p>
									<div className="w-full bg-muted rounded-full h-2 mt-1">
										<div
											className="bg-primary h-2 rounded-full"
											style={{width: `${(parseFloat (dashboardData.technical.health.storageUsage) / 5) * 100}%`}}
										/>
									</div>
								</div>
								<div>
									<p className="text-sm text-muted-foreground">Security Score</p>
									<div className="w-full bg-muted rounded-full h-2 mt-1">
										<div
											className="bg-primary h-2 rounded-full"
											style={{width: `${dashboardData.technical.health.securityScore}%`}}
										/>
									</div>
								</div>
							</div>
						</Card>
					</div>
				</TabsContent>
			</Tabs>
		</div>
	);
} 