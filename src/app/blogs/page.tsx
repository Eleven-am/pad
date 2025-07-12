import { Metadata } from "next";
import BlogsArchive from "./blogs-archive-refactored";
import { getRecentPostsAction } from "@/app/actions/homepage";

export const metadata: Metadata = {
  title: "All Articles - Explore Our Blog",
  description: "Browse through all our articles, insights, and stories in one place",
};

export default async function BlogsPage() {
  const posts = await getRecentPostsAction(100);
  return <BlogsArchive initialPosts={posts} />;
}