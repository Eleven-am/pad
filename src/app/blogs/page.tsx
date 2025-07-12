import { Metadata } from "next";
import BlogsArchive from "./blogs-archive-refactored";
import { getRecentPostsAction } from "@/app/actions/homepage";
// import BlogsArchiveMock from "./blogs-archive-mock-refactored";

export const metadata: Metadata = {
  title: "All Articles - Explore Our Blog",
  description: "Browse through all our articles, insights, and stories in one place",
};

export default async function BlogsPage() {
  // Fetch all posts from database (you can increase limit if needed)
  const posts = await getRecentPostsAction(100);
  return <BlogsArchive initialPosts={posts} />;
  
  // Mock version for testing:
  // return <BlogsArchiveMock />;
}