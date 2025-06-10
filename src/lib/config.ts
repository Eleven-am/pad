export interface SiteConfig {
	name: string;
	footerLinks: { label: string; href: string }[];
	padPlatform: {
		name: string;
		projectUrl: string;
		githubUrl: string;
	};
	navLinks: { label: string; href: string }[];
}