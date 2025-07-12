import { PrismaClient } from '@/generated/prisma';
import { systemLogger } from '@/lib/logger';
export async function initializeDatabase() {
  const prisma = new PrismaClient();
  
  try {
    systemLogger.info('Initializing database');
    
    const existingConfig = await prisma.siteConfig.findFirst();
    
    if (!existingConfig) {
      systemLogger.info('Creating default site configuration');
      
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
      
      systemLogger.info('Default site configuration created');
    } else {
      systemLogger.info('Site configuration already exists');
    }
    
    
    systemLogger.info('Database initialization complete');
  } catch (error) {
    systemLogger.error({ error }, 'Database initialization failed');
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  initializeDatabase()
    .then(() => process.exit(0))
    .catch((error) => {
      systemLogger.error({ error }, 'Database initialization error');
      process.exit(1);
    });
}