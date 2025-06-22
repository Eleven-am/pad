import { PrismaClient } from '@/generated/prisma';

/**
 * Initialize database with required data
 * This ensures the app can start even with a fresh database
 */
export async function initializeDatabase() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔧 Initializing database...');
    
    // Check if site config exists
    const existingConfig = await prisma.siteConfig.findFirst();
    
    if (!existingConfig) {
      console.log('📝 Creating default site configuration...');
      
      // Create default site config
      await prisma.siteConfig.create({
        data: {
          siteName: 'Pad',
          siteDescription: 'A professional-grade, block-based content management and blogging platform',
          siteTagline: 'Create. Publish. Analyze.',
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
          allowComments: true,
          allowRegistration: true,
          enableAnalytics: false,
        },
      });
      
      console.log('✅ Default site configuration created');
    } else {
      console.log('✅ Site configuration already exists');
    }
    
    // You can add more initialization logic here
    // For example: creating default categories, tags, etc.
    
    console.log('✅ Database initialization complete');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run if this file is executed directly
if (require.main === module) {
  initializeDatabase()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}