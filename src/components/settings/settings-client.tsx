'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import {
  updateNotificationSettings,
  deleteAccount
} from '@/app/actions/settings';
import {
  getSiteConfiguration,
  updateSiteConfiguration,
  checkSiteConfigPermission
} from '@/app/actions/site-config';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { User as UserType, SiteConfig } from '@/generated/prisma';
import { cn } from '@/lib/utils';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface SettingsClientProps {
  user: Partial<UserType> | null;
}

export function SettingsClient({ user }: SettingsClientProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [activeSection, setActiveSection] = useState('account');
  const [notifications, setNotifications] = useState({
    emailComments: true,
    emailFollowers: true,
    emailWeeklyDigest: false,
    emailNewPosts: true
  });
  const [siteConfig, setSiteConfig] = useState<Partial<SiteConfig>>({});
  const [canManageSite, setCanManageSite] = useState(false);
  const [footerLinks, setFooterLinks] = useState<Array<{ label: string; href: string }>>([]);
  const [navLinks, setNavLinks] = useState<Array<{ label: string; href: string }>>([]);
  const router = useRouter();

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
            ? configResult.config.footerLinks as Array<{ label: string; href: string }>
            : JSON.parse(configResult.config.footerLinks as string || '[]');
          setFooterLinks(footerLinksData);
          
          const navLinksData = Array.isArray(configResult.config.navLinks)
            ? configResult.config.navLinks as Array<{ label: string; href: string }>
            : JSON.parse(configResult.config.navLinks as string || '[]');
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

  // Show placeholder for development when no user
  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container max-w-6xl mx-auto px-4 py-12">
          <div className="mb-8">
            <h1 className="text-3xl font-semibold text-foreground mb-2">Settings</h1>
            <p className="text-muted-foreground">Manage your account preferences</p>
          </div>
          <div className="text-center py-12">
            <p className="text-muted-foreground">Please log in to view settings.</p>
          </div>
        </div>
      </div>
    );
  }

  const handleSiteConfigUpdate = async () => {
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
        // Refresh the page to update navigation and other cached config
        router.refresh();
      } else {
        toast.error(result.error || 'Failed to update site configuration');
      }
    } catch {
      toast.error('Failed to update site configuration');
    } finally {
      setIsLoading(false);
    }
  };

  const addFooterLink = () => {
    setFooterLinks([...footerLinks, { label: '', href: '' }]);
  };

  const updateFooterLink = (index: number, field: 'label' | 'href', value: string) => {
    const updated = footerLinks.map((link, i) => 
      i === index ? { ...link, [field]: value } : link
    );
    setFooterLinks(updated);
  };

  const removeFooterLink = (index: number) => {
    setFooterLinks(footerLinks.filter((_, i) => i !== index));
  };

  const addNavLink = () => {
    setNavLinks([...navLinks, { label: '', href: '' }]);
  };

  const updateNavLink = (index: number, field: 'label' | 'href', value: string) => {
    const updated = navLinks.map((link, i) => 
      i === index ? { ...link, [field]: value } : link
    );
    setNavLinks(updated);
  };

  const removeNavLink = (index: number) => {
    setNavLinks(navLinks.filter((_, i) => i !== index));
  };

  const handleNotificationUpdate = async () => {
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
  };

  const handleDeleteAccount = async () => {
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
  };

  const sections = [
    { id: 'account', label: 'Account' },
    { id: 'notifications', label: 'Notifications' },
    { id: 'privacy', label: 'Privacy' },
    ...(canManageSite ? [{ id: 'site', label: 'Site Configuration' }] : []),
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-6xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-foreground mb-2">Settings</h1>
          <p className="text-muted-foreground">Manage your account preferences</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <aside className="lg:w-64">
            <nav className="space-y-1">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={cn(
                    "w-full text-left px-3 py-2 text-sm font-medium rounded-md transition-colors",
                    activeSection === section.id
                      ? "bg-muted text-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  {section.label}
                </button>
              ))}
            </nav>
          </aside>

          {/* Content Area */}
          <main className="flex-1 max-w-2xl">
            {activeSection === 'account' && (
              <div className="space-y-6">
                <section>
                  <h2 className="text-lg font-medium mb-4">Account Information</h2>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm text-muted-foreground">Email Address</Label>
                      <p className="text-sm font-medium mt-1">{user.email}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">Account ID</Label>
                      <p className="text-sm font-mono mt-1">{user.id}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">Member Since</Label>
                      <p className="text-sm font-medium mt-1">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : ''}
                      </p>
                    </div>
                  </div>
                </section>

                <Separator />

                <section>
                  <h2 className="text-lg font-medium mb-4">Delete Account</h2>
                  <p className="text-sm text-muted-foreground mb-4">
                    Permanently delete your account and all associated data. This action cannot be undone.
                  </p>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        Delete Account
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Account</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete your account and all of your data. This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDeleteAccount}
                          className="bg-destructive hover:bg-destructive/90"
                        >
                          Delete Account
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </section>
              </div>
            )}

            {activeSection === 'site' && canManageSite && (
              <div className="space-y-6">
                <section>
                  <h2 className="text-lg font-medium mb-4">Basic Information</h2>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="site-name">Site Name</Label>
                      <Input
                        id="site-name"
                        value={siteConfig.siteName || ''}
                        onChange={(e) => setSiteConfig({ ...siteConfig, siteName: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="site-tagline">Tagline</Label>
                      <Input
                        id="site-tagline"
                        value={siteConfig.siteTagline || ''}
                        onChange={(e) => setSiteConfig({ ...siteConfig, siteTagline: e.target.value })}
                        placeholder="A short description of your site"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="site-description">Description</Label>
                      <Input
                        id="site-description"
                        value={siteConfig.siteDescription || ''}
                        onChange={(e) => setSiteConfig({ ...siteConfig, siteDescription: e.target.value })}
                        placeholder="Detailed description for SEO"
                      />
                    </div>
                  </div>
                </section>

                <Separator />

                <section>
                  <h2 className="text-lg font-medium mb-4">Social Media</h2>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="twitter-url">Twitter URL</Label>
                        <Input
                          id="twitter-url"
                          value={siteConfig.twitterUrl || ''}
                          onChange={(e) => setSiteConfig({ ...siteConfig, twitterUrl: e.target.value })}
                          placeholder="https://twitter.com/username"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="github-url">GitHub URL</Label>
                        <Input
                          id="github-url"
                          value={siteConfig.githubUrl || ''}
                          onChange={(e) => setSiteConfig({ ...siteConfig, githubUrl: e.target.value })}
                          placeholder="https://github.com/username"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="linkedin-url">LinkedIn URL</Label>
                        <Input
                          id="linkedin-url"
                          value={siteConfig.linkedinUrl || ''}
                          onChange={(e) => setSiteConfig({ ...siteConfig, linkedinUrl: e.target.value })}
                          placeholder="https://linkedin.com/in/username"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contact-email">Contact Email</Label>
                        <Input
                          id="contact-email"
                          type="email"
                          value={siteConfig.contactEmail || ''}
                          onChange={(e) => setSiteConfig({ ...siteConfig, contactEmail: e.target.value })}
                          placeholder="contact@yoursite.com"
                        />
                      </div>
                    </div>
                  </div>
                </section>

                <Separator />

                <section>
                  <h2 className="text-lg font-medium mb-4">Footer Links</h2>
                  <div className="space-y-4">
                    {footerLinks.map((link, index) => (
                      <div key={index} className="flex gap-2 items-end">
                        <div className="flex-1 space-y-2">
                          <Label>Label</Label>
                          <Input
                            value={link.label}
                            onChange={(e) => updateFooterLink(index, 'label', e.target.value)}
                            placeholder="Link label"
                          />
                        </div>
                        <div className="flex-1 space-y-2">
                          <Label>URL</Label>
                          <Input
                            value={link.href}
                            onChange={(e) => updateFooterLink(index, 'href', e.target.value)}
                            placeholder="/page or https://example.com"
                          />
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeFooterLink(index)}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                    <Button variant="outline" size="sm" onClick={addFooterLink}>
                      Add Footer Link
                    </Button>
                  </div>
                </section>

                <Separator />

                <section>
                  <h2 className="text-lg font-medium mb-4">Navigation Links</h2>
                  <p className="text-sm text-muted-foreground mb-4">
                    Configure the main navigation menu. &quot;Home&quot; is always included automatically as the first link.
                  </p>
                  <div className="space-y-4">
                    {navLinks.map((link, index) => (
                      <div key={index} className="flex gap-2 items-end">
                        <div className="flex-1 space-y-2">
                          <Label>Label</Label>
                          <Input
                            value={link.label}
                            onChange={(e) => updateNavLink(index, 'label', e.target.value)}
                            placeholder="Dashboard, Archives, etc."
                          />
                        </div>
                        <div className="flex-1 space-y-2">
                          <Label>URL</Label>
                          <Input
                            value={link.href}
                            onChange={(e) => updateNavLink(index, 'href', e.target.value)}
                            placeholder="/dashboard, /archives, etc."
                          />
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeNavLink(index)}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                    <Button variant="outline" size="sm" onClick={addNavLink}>
                      Add Navigation Link
                    </Button>
                  </div>
                </section>


                <Button 
                  onClick={handleSiteConfigUpdate} 
                  disabled={isLoading}
                  size="sm"
                >
                  Save Site Configuration
                </Button>
              </div>
            )}

            {activeSection === 'notifications' && (
              <div className="space-y-6">
                <section>
                  <h2 className="text-lg font-medium mb-4">Email Notifications</h2>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="email-comments" className="text-sm font-medium">
                          Comments
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          When someone comments on your posts
                        </p>
                      </div>
                      <Switch
                        id="email-comments"
                        checked={notifications.emailComments}
                        onCheckedChange={(checked) => 
                          setNotifications({ ...notifications, emailComments: checked })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="email-followers" className="text-sm font-medium">
                          New followers
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          When someone follows you
                        </p>
                      </div>
                      <Switch
                        id="email-followers"
                        checked={notifications.emailFollowers}
                        onCheckedChange={(checked) => 
                          setNotifications({ ...notifications, emailFollowers: checked })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="email-weekly" className="text-sm font-medium">
                          Weekly digest
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Summary of your content performance
                        </p>
                      </div>
                      <Switch
                        id="email-weekly"
                        checked={notifications.emailWeeklyDigest}
                        onCheckedChange={(checked) => 
                          setNotifications({ ...notifications, emailWeeklyDigest: checked })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="email-posts" className="text-sm font-medium">
                          New posts
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          From authors you follow
                        </p>
                      </div>
                      <Switch
                        id="email-posts"
                        checked={notifications.emailNewPosts}
                        onCheckedChange={(checked) => 
                          setNotifications({ ...notifications, emailNewPosts: checked })
                        }
                      />
                    </div>

                    <Button 
                      onClick={handleNotificationUpdate} 
                      disabled={isLoading}
                      size="sm"
                    >
                      Save Preferences
                    </Button>
                  </div>
                </section>
              </div>
            )}

            {activeSection === 'privacy' && (
              <div className="space-y-6">
                <section>
                  <h2 className="text-lg font-medium mb-4">Privacy Settings</h2>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-sm font-medium">
                          Public Profile
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Make your profile visible to search engines
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-sm font-medium">
                          Show Email
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Display email on your public profile
                        </p>
                      </div>
                      <Switch />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-sm font-medium">
                          Analytics
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Help us improve with anonymous usage data
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </section>

                <Separator />

                <section>
                  <h2 className="text-lg font-medium mb-4">Data Export</h2>
                  <p className="text-sm text-muted-foreground mb-4">
                    Download a copy of your posts, comments, and profile information.
                  </p>
                  <Button variant="outline" size="sm">
                    Request Export
                  </Button>
                </section>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}