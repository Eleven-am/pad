import HomePageWrapper from './homepage-wrapper';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pad - Professional Block-Based Blogging Platform',
  description: 'Create rich, interactive content with Pad\'s advanced block editor. Features 13 content blocks, comprehensive analytics, and professional publishing tools.',
  keywords: ['blogging platform', 'content management', 'block editor', 'analytics', 'publishing'],
  openGraph: {
    title: 'Pad - Professional Block-Based Blogging Platform',
    description: 'Create rich, interactive content with Pad\'s advanced block editor. Features 13 content blocks, comprehensive analytics, and professional publishing tools.',
    type: 'website',
    siteName: 'Pad',
    images: [{
      url: '/og-image.png', // TODO: Create an Open Graph image
      width: 1200,
      height: 630,
      alt: 'Pad - Professional Blogging Platform'
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pad - Professional Block-Based Blogging Platform',
    description: 'Create rich, interactive content with advanced block editor and analytics.',
    images: ['/og-image.png'], // TODO: Create an Open Graph image
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function Page() {
  return <HomePageWrapper />;
}