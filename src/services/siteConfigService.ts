import {$Enums, PrismaClient, SiteConfig} from '@/generated/prisma';
import {BaseService} from '@/services/baseService';
import {createUnauthorizedError, TaskEither} from '@eleven-am/fp';
import UserRole = $Enums.UserRole;

export interface SiteConfigData {
	siteName: string;
	siteDescription?: string;
	siteTagline?: string;
	logoFileId?: string;
	faviconFileId?: string;
	twitterUrl?: string;
	githubUrl?: string;
	linkedinUrl?: string;
	facebookUrl?: string;
	instagramUrl?: string;
	seoKeywords?: string;
	googleAnalytics?: string;
	gtmId?: string;
	footerLinks?: Array<{ label: string; href: string }>;
	navLinks?: Array<{ label: string; href: string }>;
	contactEmail?: string;
	adminEmail?: string;
	allowComments: boolean;
	allowRegistration: boolean;
	enableAnalytics: boolean;
}

export interface LegacySiteConfig {
	name: string;
	footerLinks: Array<{ label: string; href: string }>;
	navLinks: Array<{ label: string; href: string }>;
	padPlatform: {
		name: string;
		projectUrl: string;
		githubUrl: string;
	};
}

/**
 * Site Configuration Service
 * Manages site-wide configuration settings
 */
export class SiteConfigService extends BaseService {
	
	constructor (prisma: PrismaClient) {
		super (prisma);
	}
	
	/**
	 * Gets the current site configuration, creating default if none exists
	 */
	getSiteConfig (): TaskEither<SiteConfig> {
		// During build time, return a default config if database is not available
		if (process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL) {
			return TaskEither.of(this.getDefaultConfig());
		}
		
		return TaskEither
			.tryCatch(
				() => this.prisma.siteConfig.findFirst (),
			)
			.nonNullable('Site configuration not found')
			.orElse(() => this.createDefaultSiteConfig ())
			.orElse(() => TaskEither.of(this.getDefaultConfig()));
	}
	
	/**
	 * Returns a default configuration for build time
	 */
	private getDefaultConfig(): SiteConfig {
		return {
			id: 'default',
			siteName: 'Pad',
			siteDescription: 'A professional-grade, block-based content management and blogging platform',
			siteTagline: 'Create. Publish. Analyze.',
			logoFileId: null,
			faviconFileId: null,
			twitterUrl: null,
			githubUrl: null,
			linkedinUrl: null,
			facebookUrl: null,
			instagramUrl: null,
			seoKeywords: null,
			googleAnalytics: null,
			gtmId: null,
			footerLinks: JSON.stringify([
				{ label: "Privacy Policy", href: "/privacy" },
				{ label: "Terms of Service", href: "/terms" },
			]),
			navLinks: JSON.stringify([
				{ label: "Dashboard", href: "/dashboard" },
				{ label: "Archives", href: "/archives" },
				{ label: "Categories", href: "/categories" },
				{ label: "Profile", href: "/profile" },
				{ label: "Settings", href: "/settings" },
			]),
			contactEmail: null,
			adminEmail: null,
			allowComments: true,
			allowRegistration: true,
			enableAnalytics: false,
			createdAt: new Date(),
			updatedAt: new Date(),
		};
	}
	
	/**
	 * Updates site configuration
	 * Only accessible by ADMIN users
	 */
	updateSiteConfig (data: Partial<SiteConfigData>): TaskEither<SiteConfig> {
		return TaskEither
			.tryCatch (
				() => this.prisma.siteConfig.findFirst (),
			)
			.match ([
				{
					predicate: (config): config is SiteConfig => !! config,
					run: (config) => this.prisma.siteConfig.update ({
						where: {id: config!.id},
						data: {
							...data,
							footerLinks: data.footerLinks ? JSON.stringify (data.footerLinks) : config?.footerLinks ? config.footerLinks : "[]",
							navLinks: data.navLinks ? JSON.stringify (data.navLinks) : config?.navLinks ? config.navLinks : "[]",
						}
					})
				},
				{
					predicate: (config) => config === null,
					run: () => this.prisma.siteConfig.create ({
						data: {
							siteName: data.siteName || 'Pad Blog',
							siteDescription: data.siteDescription,
							siteTagline: data.siteTagline,
							logoFileId: data.logoFileId,
							faviconFileId: data.faviconFileId,
							twitterUrl: data.twitterUrl,
							githubUrl: data.githubUrl,
							linkedinUrl: data.linkedinUrl,
							facebookUrl: data.facebookUrl,
							instagramUrl: data.instagramUrl,
							seoKeywords: data.seoKeywords,
							googleAnalytics: data.googleAnalytics,
							gtmId: data.gtmId,
							footerLinks: data.footerLinks ? JSON.stringify (data.footerLinks) : "[]",
							navLinks: data.navLinks ? JSON.stringify (data.navLinks) : "[]",
							contactEmail: data.contactEmail,
							adminEmail: data.adminEmail,
							allowComments: data.allowComments ?? true,
							allowRegistration: data.allowRegistration ?? true,
							enableAnalytics: data.enableAnalytics ?? false,
						}
					})
				}
			])
	}
	
	/**
	 * Converts database config to legacy format for compatibility
	 */
	convertToLegacyFormat (config: SiteConfig): LegacySiteConfig {
		const footerLinks = Array.isArray (config.footerLinks)
			? config.footerLinks as Array<{ label: string; href: string }>
			: JSON.parse (config.footerLinks as string || '[]');
		
		const configNavLinks = Array.isArray (config.navLinks)
			? config.navLinks as Array<{ label: string; href: string }>
			: JSON.parse (config.navLinks as string || '[]');
		
		// Always include Home as the first nav link, then add configured links
		const navLinks = [
			{label: "Home", href: "/"},
			...configNavLinks
		];
		
		return {
			name: config.siteName,
			footerLinks,
			navLinks,
			padPlatform: {
				name: 'Pad',
				projectUrl: 'https://github.com/eleven-am/pad',
				githubUrl: 'https://github.com/eleven-am'
			}
		};
	}
	
	/**
	 * Checks if a user is authorized to modify site configuration
	 * Only ADMIN users can modify site config
	 */
	isAuthorizedToModify (userId: string): TaskEither<boolean> {
		return TaskEither
			.tryCatch(
				() => this.prisma.user.findUnique({
					where: {id: userId},
					select: {role: true},
				})
			)
			.filter(
				(user) => user?.role === UserRole.ADMIN,
				() => createUnauthorizedError('You do not have permission to modify site configuration')
			)
			.map(() => true);
	}
	
	/**
	 * Creates default site configuration
	 */
	private createDefaultSiteConfig (): TaskEither<SiteConfig> {
		return TaskEither
			.tryCatch (
				() => this.prisma.siteConfig.create ({
					data: {
						siteName: 'Pad',
						footerLinks: JSON.stringify ([
							{label: "Privacy Policy", href: "/privacy"},
							{label: "Terms of Service", href: "/terms"},
						]),
						navLinks: JSON.stringify ([
							{label: "Dashboard", href: "/dashboard"},
							{label: "Archives", href: "/archives"},
							{label: "Categories", href: "/categories"},
							{label: "Profile", href: "/profile"},
							{label: "Settings", href: "/settings"},
						]),
						allowComments: true,
						allowRegistration: true,
						enableAnalytics: false,
					},
				}),
				'Failed to create default site configuration'
			);
	}
}