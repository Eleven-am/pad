import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	// Enable standalone output for optimized Docker builds
	output: 'standalone',
	
	images: {
		remotePatterns: [
			{
				protocol: 'https',
				hostname: 'lh3.googleusercontent.com',
				port: '',
				pathname: '/**',
			},
		],
	},
	
	// Optimize for production builds
	experimental: {
		// Enable build-time optimizations
		optimizePackageImports: ['@prisma/client'],
	},
};

export default nextConfig;
