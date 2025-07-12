"use client"

import { RefObject, useEffect, useState, ForwardedRef } from 'react'
import { motion, useScroll, useSpring } from 'motion/react'
import { cn } from "@/lib/utils"
import { $Enums, ProgressTracker as PrismaProgressTracker } from '@/generated/prisma'
import ProgressVariant = $Enums.ProgressVariant;

interface CircularReadingProgressProps {
	size?: number;
	strokeWidth?: number;
	className?: string;
	showPercentage?: boolean;
}

interface BlogReadingProgressProps {
	variant?: ProgressVariant;
	contentSelector?: ForwardedRef<HTMLElement>;
	className?: string;
}

interface ProgressTrackerProps {
	block: PrismaProgressTracker | null;
	contentSelector?: ForwardedRef<HTMLElement>;
}

function BlogReadingProgress({
    className,
	contentSelector,
	variant = ProgressVariant.SUBTLE
}: BlogReadingProgressProps) {
	const { scrollYProgress } = useScroll({
		target: contentSelector as RefObject<HTMLElement>,
		offset: ["start start", "end end"]
	})
	
	const scaleX = useSpring(scrollYProgress, {
		stiffness: 100,
		damping: 30,
		restDelta: 0.001
	})
	
	return (
		<div className={`fixed top-0 left-0 right-0 z-50 ${className || ''}`}>
			<div className="h-1 bg-gradient-to-r from-transparent via-border/50 to-transparent">
				<motion.div
					className={cn(
						'h-full origin-left',
						{
							'bg-gradient-to-r from-primary via-primary/85 to-primary/70': variant === ProgressVariant.SUBTLE,
							'bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500': variant === ProgressVariant.VIBRANT,
							'bg-primary': variant === ProgressVariant.NONE,
						}
					)}
					style={{ scaleX }}
				/>
			</div>
		</div>
	)
}

function CircularReadingProgress({
    className,
    size = 48,
    strokeWidth = 3,
	showPercentage = false
}: CircularReadingProgressProps) {
	const { scrollYProgress } = useScroll()
	const [percentage, setPercentage] = useState(0)
	
	useEffect(() => {
		return scrollYProgress.on('change', (latest) => {
			setPercentage(Math.round(latest * 100))
		})
	}, [scrollYProgress])
	
	const radius = (size - strokeWidth) / 2
	const circumference = radius * 2 * Math.PI
	const strokeDashoffset = circumference - (percentage / 100) * circumference
	
	return (
		<motion.div
			className={`fixed bottom-8 right-8 ${className || ''}`}
			initial={{ opacity: 0, scale: 0.8 }}
			animate={{
				opacity: percentage > 5 ? 1 : 0,
				scale: percentage > 5 ? 1 : 0.8
			}}
			transition={{ duration: 0.3 }}
		>
			<div className="relative">
				<svg width="80" height="80" viewBox="0 0 100 100">
					<circle
						cx="50"
						cy="50"
						r="30"
						fill="none"
						stroke="hsl(var(--muted))"
						strokeWidth="3"
					/>
					<motion.circle
						cx="50"
						cy="50"
						r="30"
						fill="none"
						stroke="hsl(var(--primary))"
						strokeWidth="3"
						strokeLinecap="round"
						strokeDasharray={circumference}
						strokeDashoffset={strokeDashoffset}
						style={{
							pathLength: scrollYProgress,
							rotate: -90,
							transformOrigin: "50% 50%"
						}}
					/>
				</svg>
				
				{showPercentage && (
					<div className="absolute inset-0 flex items-center justify-center">
						<span className="text-xs font-medium text-muted-foreground">
							{percentage}%
						</span>
					</div>
				)}
			</div>
		</motion.div>
	)
}

export function ProgressTracker({ block, contentSelector }: ProgressTrackerProps) {
	if (!block) {
		return <BlogReadingProgress contentSelector={contentSelector} />
	}
	
	const { variant , showPercentage } = block;
	
	switch (variant) {
		case ProgressVariant.CIRCULAR:
			return <CircularReadingProgress showPercentage={showPercentage} />
		default:
			return <BlogReadingProgress variant={variant} contentSelector={contentSelector} />
	}
}
