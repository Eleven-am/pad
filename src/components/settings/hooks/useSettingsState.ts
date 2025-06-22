import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SiteConfig } from '@/generated/prisma';
import { toast } from 'sonner';
import {
  getSiteConfiguration,
  updateSiteConfiguration,
  checkSiteConfigPermission
} from '@/app/actions/site-config';
import {
  updateNotificationSettings,
  deleteAccount
} from '@/app/actions/settings';

export interface NotificationSettings {
  emailComments: boolean;
  emailFollowers: boolean;
  emailWeeklyDigest: boolean;
  emailNewPosts: boolean;
}

export interface LinkItem {
  label: string;
  href: string;
}

export function useSettingsState() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [activeSection, setActiveSection] = useState('account');
  
  const [notifications, setNotifications] = useState<NotificationSettings>({
    emailComments: true,
    emailFollowers: true,
    emailWeeklyDigest: false,
    emailNewPosts: true
  });
  
  const [siteConfig, setSiteConfig] = useState<Partial<SiteConfig>>({});
  const [canManageSite, setCanManageSite] = useState(false);
  const [footerLinks, setFooterLinks] = useState<LinkItem[]>([]);
  const [navLinks, setNavLinks] = useState<LinkItem[]>([]);

  // Load site configuration and check permissions
  useEffect(() => {
    const loadSiteConfig = async () => {
      try {
        const [configResult, permissionResult] = await Promise.all([
          getSiteConfiguration(),
          checkSiteConfigPermission()
        ]);

        if (configResult.success && configResult.config) {
          setSiteConfig(configResult.config);
          const footerLinksData = Array.isArray(configResult.config.footerLinks) 
            ? configResult.config.footerLinks as unknown as LinkItem[]
            : JSON.parse(configResult.config.footerLinks as string || '[]') as LinkItem[];
          setFooterLinks(footerLinksData);
          
          const navLinksData = Array.isArray(configResult.config.navLinks)
            ? configResult.config.navLinks as unknown as LinkItem[]
            : JSON.parse(configResult.config.navLinks as string || '[]') as LinkItem[];
          setNavLinks(navLinksData);
        }

        if (permissionResult.success) {
          setCanManageSite(permissionResult.hasPermission);
        }
      } catch (error) {
        console.error('Failed to load site configuration:', error);
      }
    };

    loadSiteConfig();
  }, []);

  const handleSiteConfigUpdate = useCallback(async () => {
    setIsLoading(true);
    try {
      const cleanedConfig = Object.fromEntries(
        Object.entries(siteConfig).map(([key, value]) => [key, value === null ? undefined : value])
      );
      
      const result = await updateSiteConfiguration({
        ...cleanedConfig,
        footerLinks: footerLinks,
        navLinks: navLinks
      });
      
      if (result.success) {
        toast.success('Site configuration updated successfully');
        if (result.config) {
          setSiteConfig(result.config);
        }
        router.refresh();
      } else {
        toast.error(result.error || 'Failed to update site configuration');
      }
    } catch {
      toast.error('Failed to update site configuration');
    } finally {
      setIsLoading(false);
    }
  }, [siteConfig, footerLinks, navLinks, router]);

  const handleNotificationUpdate = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await updateNotificationSettings(notifications);
      if (result.success) {
        toast.success('Notification settings updated');
      } else {
        toast.error(result.error || 'Failed to update notification settings');
      }
    } catch {
      toast.error('Failed to update notification settings');
    } finally {
      setIsLoading(false);
    }
  }, [notifications]);

  const handleDeleteAccount = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await deleteAccount();
      if (result.success) {
        toast.success('Account deletion initiated');
      } else {
        toast.error(result.error || 'Failed to delete account');
      }
    } catch {
      toast.error('Failed to delete account');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addFooterLink = useCallback(() => {
    setFooterLinks(prev => [...prev, { label: '', href: '' }]);
  }, []);

  const updateFooterLink = useCallback((index: number, field: 'label' | 'href', value: string) => {
    setFooterLinks(prev => prev.map((link, i) => 
      i === index ? { ...link, [field]: value } : link
    ));
  }, []);

  const removeFooterLink = useCallback((index: number) => {
    setFooterLinks(prev => prev.filter((_, i) => i !== index));
  }, []);

  const addNavLink = useCallback(() => {
    setNavLinks(prev => [...prev, { label: '', href: '' }]);
  }, []);

  const updateNavLink = useCallback((index: number, field: 'label' | 'href', value: string) => {
    setNavLinks(prev => prev.map((link, i) => 
      i === index ? { ...link, [field]: value } : link
    ));
  }, []);

  const removeNavLink = useCallback((index: number) => {
    setNavLinks(prev => prev.filter((_, i) => i !== index));
  }, []);

  return {
    // State
    isLoading,
    activeSection,
    notifications,
    siteConfig,
    canManageSite,
    footerLinks,
    navLinks,
    
    // Setters
    setActiveSection,
    setNotifications,
    setSiteConfig,
    
    // Handlers
    handleSiteConfigUpdate,
    handleNotificationUpdate,
    handleDeleteAccount,
    addFooterLink,
    updateFooterLink,
    removeFooterLink,
    addNavLink,
    updateNavLink,
    removeNavLink,
  };
}