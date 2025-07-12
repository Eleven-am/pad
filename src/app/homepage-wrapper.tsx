import HomePage from './homepage-client-real';
import { getHomepageDataAction } from '@/app/actions/homepage';

export default async function HomePageWrapper() {
  // Fetch real data from database
  const { featured, trending } = await getHomepageDataAction();
  
  return <HomePage featuredPosts={featured} trendingPosts={trending} />;
}