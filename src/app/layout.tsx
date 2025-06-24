import type {Metadata} from "next";
import {Inter, JetBrains_Mono, Newsreader, Noto_Sans} from "next/font/google";
import "./globals.css";
import {cn} from "@/lib/utils";
import {ReactNode, Suspense} from "react";
import {ThemeProvider} from "next-themes";
import {WebsiteWrapper} from "@/components/website-wrapper";
import {getSiteConfig} from "@/lib/data";
import {Loading} from "@/components/loading";
import {Toaster} from "sonner";
import {InvitationProcessor} from "@/components/invitation-processor";
import {auth} from "@/lib/better-auth/server";
import {headers} from "next/headers";

export const metadata: Metadata = {
	title: {
		default: 'Pad - Professional Block-Based Blogging Platform',
		template: '%s | Pad'
	},
	description: 'Create rich, interactive content with Pad\'s advanced block editor. Features 13 content blocks, comprehensive analytics, and professional publishing tools.',
	keywords: ['blogging platform', 'content management', 'block editor', 'analytics', 'publishing'],
	authors: [{ name: 'Pad Team' }],
	creator: 'Pad',
	publisher: 'Pad',
	formatDetection: {
		email: false,
		address: false,
		telephone: false,
	},
	metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://pad.com'),
	openGraph: {
		type: 'website',
		locale: 'en_US',
		url: '/',
		siteName: 'Pad',
		images: [{
			url: '/og-image.png',
			width: 1200,
			height: 630,
			alt: 'Pad - Professional Blogging Platform'
		}],
	},
	twitter: {
		card: 'summary_large_image',
		site: '@pad', // TODO: Add Twitter handle
		creator: '@pad',
	},
	robots: {
		index: true,
		follow: true,
		googleBot: {
			index: true,
			follow: true,
			'max-video-preview': -1,
			'max-image-preview': 'large',
			'max-snippet': -1,
		},
	},
	verification: {
		// TODO: Add verification codes when available
		// google: 'google-site-verification-code',
		// yandex: 'yandex-verification-code',
		// bing: 'bing-verification-code',
	},
};

const inter = Inter ({
	subsets: ['latin'],
	weight: ['300', '400', '500', '600', '700'],
	variable: '--font-inter',
})

const jetbrainsMono = JetBrains_Mono ({
	subsets: ['latin'],
	weight: ['400', '500', '600'],
	variable: '--font-jetbrains-mono',
})

const newsreader = Newsreader ({
	subsets: ['latin'],
	weight: ['400', '500', '700', '800'],
	variable: '--font-newsreader',
})

const notoSans = Noto_Sans ({
	subsets: ['latin'],
	weight: ['400', '500', '700', '900'],
	variable: '--font-noto-sans',
})

export default async function RootLayout ({children}: { children: ReactNode }) {
	return (
		<html lang="en">
			<body
				className={cn (
					inter.variable,
					jetbrainsMono.variable,
					newsreader.variable,
					notoSans.variable,
					"antialiased",
				)}
			>
				<ThemeProvider
					attribute="class"
					defaultTheme="system"
					disableTransitionOnChange
				>
					<Suspense fallback={<Loading />}>
						<WebsiteWrapper 
							configPromise={getSiteConfig()} 
							sessionPromise={(async () => auth.api.getSession({headers: await headers()}))()}
						>
							{children}
						</WebsiteWrapper>
					</Suspense>
					<InvitationProcessor />
					<Toaster 
						position="top-right"
						closeButton
						richColors
						theme="system"
					/>
				</ThemeProvider>
			</body>
		</html>
	);
}
