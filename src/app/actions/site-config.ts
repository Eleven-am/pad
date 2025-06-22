'use server';

import { auth } from '@/lib/better-auth/server';
import { headers } from 'next/headers';
import { siteConfigService } from '@/services/di';
import { SiteConfigData } from '@/services/siteConfigService';

export async function getSiteConfiguration() {
  try {
    const config = await siteConfigService.getSiteConfig().toPromise();
    return { success: true, config };
  } catch {
    return { success: false, error: 'Failed to get site configuration' };
  }
}

export async function updateSiteConfiguration(data: Partial<SiteConfigData>) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return { success: false, error: 'Not authenticated' };
    }

    // Check if user is authorized to modify site config
    const isAuthorized = await siteConfigService.isAuthorizedToModify(session.user.id).toPromise();
    
    if (!isAuthorized) {
      return { success: false, error: 'Not authorized to modify site configuration' };
    }

    const updatedConfig = await siteConfigService.updateSiteConfig(data).toPromise();
    
    return { success: true, config: updatedConfig };
  } catch {
    return { success: false, error: 'Failed to update site configuration' };
  }
}

export async function checkSiteConfigPermission() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return { success: true, hasPermission: false };
    }

    const isAuthorized = await siteConfigService.isAuthorizedToModify(session.user.id).toPromise();
    
    return { success: true, hasPermission: isAuthorized };
  } catch {
    return { success: false, hasPermission: false, error: 'Failed to check permissions' };
  }
}