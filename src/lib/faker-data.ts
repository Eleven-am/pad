export const siteConfig = {
	name: "Orin", // Keeping Orin as per existing code, can be changed to Pad if this is the platform name
	footerLinks: [
		{ label: "About This Blog", href: "/about-this-instance" },
		{ label: "featured Posts", href: "/blog/featured" },
		{ label: "Contact", href: "/instance-contact" },
		{ label: "Privacy", href: "/instance-privacy" },
	],
	padPlatform: {
		name: "Pad",
		projectUrl: "https://github.com/your-username/pad", // Replace with your Pad project URL
		githubUrl: "https://github.com/your-username/pad", // Replace with your Pad GitHub repo URL
	},
	navLinks: [
		{ label: "Home", href: "/" },
		{ label: "Archives", href: "/archives" },
		{ label: "Categories", href: "/categories" },
		{ label: "About", href: "/about" },
	],
}
