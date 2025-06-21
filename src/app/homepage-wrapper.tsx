import { getHomepageDataAction } from '@/app/actions/homepage';
import HomePage from './homepage-client';

export default async function HomePageWrapper() {
  const { featured, trending } = await getHomepageDataAction();
  
  return <HomePage featuredPosts={featured} trendingPosts={trending} />;
}