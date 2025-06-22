"use client";

import {forwardRef} from "react";
import {cn} from "@/lib/utils";
import {BlogWrapperProps} from "./types";
import {BlogHeader} from "./components/BlogHeader";
import {BlogFooter} from "./components/BlogFooter";

export const BlogWrapper = forwardRef<HTMLElement, BlogWrapperProps> (
	({post, children, analysis, avatarUrl, authorsPromise, className}, ref) => {
		return (
			<section
				ref={ref}
				className={cn ("space-y-6 p-0 max-w-2xl mx-auto relative", className)}
			>
				<BlogHeader post={post} analysis={analysis} authorsPromise={authorsPromise}/>
				{children}
				<BlogFooter post={post} avatarUrl={avatarUrl}/>
			</section>
		);
	}
);

BlogWrapper.displayName = "BlogWrapper";