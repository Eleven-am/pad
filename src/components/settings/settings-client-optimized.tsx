'use client';

import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { User as UserType } from '@/generated/prisma';
import { cn } from '@/lib/utils';

// Optimized components
import { useSettingsState } from './hooks/useSettingsState';
import { AccountSection } from './components/AccountSection';
import { NotificationSection } from './components/NotificationSection';
import { SiteConfigSection } from './components/SiteConfigSection';

interface SettingsClientProps {
  user: Partial<UserType> | null;
}

// Memoized navigation sidebar
const SettingsNavigation = React.memo<{
  sections: Array<{ id: string; label: string }>;
  activeSection: string;
  onSectionChange: (section: string) => void;
}>(({ sections, activeSection, onSectionChange }) => (
  <aside className="lg:w-64">
    <nav className="space-y-1">
      {sections.map((section) => (
        <button
          key={section.id}
          onClick={() => onSectionChange(section.id)}
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
));

// Memoized privacy section
const PrivacySection = React.memo(() => {
  return (
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

      <div className="border-t pt-6">
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
    </div>
  );
});

export const SettingsClientOptimized = React.memo<SettingsClientProps>(({ user }) => {
  const {
    isLoading,
    activeSection,
    notifications,
    siteConfig,
    canManageSite,
    footerLinks,
    navLinks,
    setActiveSection,
    setNotifications,
    setSiteConfig,
    handleSiteConfigUpdate,
    handleNotificationUpdate,
    handleDeleteAccount,
    addFooterLink,
    updateFooterLink,
    removeFooterLink,
    addNavLink,
    updateNavLink,
    removeNavLink,
  } = useSettingsState();

  // Memoized sections configuration
  const sections = React.useMemo(() => [
    { id: 'account', label: 'Account' },
    { id: 'notifications', label: 'Notifications' },
    { id: 'privacy', label: 'Privacy' },
    ...(canManageSite ? [{ id: 'site', label: 'Site Configuration' }] : []),
  ], [canManageSite]);

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

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-6xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-foreground mb-2">Settings</h1>
          <p className="text-muted-foreground">Manage your account preferences</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <SettingsNavigation
            sections={sections}
            activeSection={activeSection}
            onSectionChange={setActiveSection}
          />

          <main className="flex-1 max-w-2xl">
            {activeSection === 'account' && (
              <AccountSection
                user={user}
                onDeleteAccount={handleDeleteAccount}
              />
            )}

            {activeSection === 'site' && canManageSite && (
              <SiteConfigSection
                siteConfig={siteConfig}
                footerLinks={footerLinks}
                navLinks={navLinks}
                onSiteConfigChange={setSiteConfig}
                onAddFooterLink={addFooterLink}
                onUpdateFooterLink={updateFooterLink}
                onRemoveFooterLink={removeFooterLink}
                onAddNavLink={addNavLink}
                onUpdateNavLink={updateNavLink}
                onRemoveNavLink={removeNavLink}
                onSave={handleSiteConfigUpdate}
                isLoading={isLoading}
              />
            )}

            {activeSection === 'notifications' && (
              <NotificationSection
                notifications={notifications}
                onNotificationsChange={setNotifications}
                onSave={handleNotificationUpdate}
                isLoading={isLoading}
              />
            )}

            {activeSection === 'privacy' && <PrivacySection />}
          </main>
        </div>
      </div>
    </div>
  );
});

SettingsNavigation.displayName = 'SettingsNavigation';
PrivacySection.displayName = 'PrivacySection';
SettingsClientOptimized.displayName = 'SettingsClientOptimized';