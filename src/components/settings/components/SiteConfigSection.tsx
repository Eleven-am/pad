import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { SiteConfig } from '@/generated/prisma';
import { LinkItem } from '../hooks/useSettingsState';

interface SiteConfigSectionProps {
  siteConfig: Partial<SiteConfig>;
  footerLinks: LinkItem[];
  navLinks: LinkItem[];
  onSiteConfigChange: (config: Partial<SiteConfig>) => void;
  onAddFooterLink: () => void;
  onUpdateFooterLink: (index: number, field: 'label' | 'href', value: string) => void;
  onRemoveFooterLink: (index: number) => void;
  onAddNavLink: () => void;
  onUpdateNavLink: (index: number, field: 'label' | 'href', value: string) => void;
  onRemoveNavLink: (index: number) => void;
  onSave: () => void;
  isLoading: boolean;
}

interface LinkManagerProps {
  title: string;
  description?: string;
  links: LinkItem[];
  onAdd: () => void;
  onUpdate: (index: number, field: 'label' | 'href', value: string) => void;
  onRemove: (index: number) => void;
}

const LinkManager = React.memo<LinkManagerProps>(({
  title,
  description,
  links,
  onAdd,
  onUpdate,
  onRemove,
}) => (
  <section>
    <h2 className="text-lg font-medium mb-4">{title}</h2>
    {description && (
      <p className="text-sm text-muted-foreground mb-4">{description}</p>
    )}
    <div className="space-y-4">
      {links.map((link, index) => (
        <div key={index} className="flex gap-2 items-end">
          <div className="flex-1 space-y-2">
            <Label>Label</Label>
            <Input
              value={link.label}
              onChange={(e) => onUpdate(index, 'label', e.target.value)}
              placeholder="Link label"
            />
          </div>
          <div className="flex-1 space-y-2">
            <Label>URL</Label>
            <Input
              value={link.href}
              onChange={(e) => onUpdate(index, 'href', e.target.value)}
              placeholder="/page or https://example.com"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onRemove(index)}
          >
            Remove
          </Button>
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={onAdd}>
        Add {title.includes('Footer') ? 'Footer' : 'Navigation'} Link
      </Button>
    </div>
  </section>
));

export const SiteConfigSection = React.memo<SiteConfigSectionProps>(({
  siteConfig,
  footerLinks,
  navLinks,
  onSiteConfigChange,
  onAddFooterLink,
  onUpdateFooterLink,
  onRemoveFooterLink,
  onAddNavLink,
  onUpdateNavLink,
  onRemoveNavLink,
  onSave,
  isLoading,
}) => {
  const handleInputChange = React.useCallback((field: keyof SiteConfig) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    onSiteConfigChange({ ...siteConfig, [field]: e.target.value });
  }, [siteConfig, onSiteConfigChange]);

  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-lg font-medium mb-4">Basic Information</h2>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="site-name">Site Name</Label>
            <Input
              id="site-name"
              value={siteConfig.siteName || ''}
              onChange={handleInputChange('siteName')}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="site-tagline">Tagline</Label>
            <Input
              id="site-tagline"
              value={siteConfig.siteTagline || ''}
              onChange={handleInputChange('siteTagline')}
              placeholder="A short description of your site"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="site-description">Description</Label>
            <Input
              id="site-description"
              value={siteConfig.siteDescription || ''}
              onChange={handleInputChange('siteDescription')}
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
                onChange={handleInputChange('twitterUrl')}
                placeholder="https://twitter.com/username"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="github-url">GitHub URL</Label>
              <Input
                id="github-url"
                value={siteConfig.githubUrl || ''}
                onChange={handleInputChange('githubUrl')}
                placeholder="https://github.com/username"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="linkedin-url">LinkedIn URL</Label>
              <Input
                id="linkedin-url"
                value={siteConfig.linkedinUrl || ''}
                onChange={handleInputChange('linkedinUrl')}
                placeholder="https://linkedin.com/in/username"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact-email">Contact Email</Label>
              <Input
                id="contact-email"
                type="email"
                value={siteConfig.contactEmail || ''}
                onChange={handleInputChange('contactEmail')}
                placeholder="contact@yoursite.com"
              />
            </div>
          </div>
        </div>
      </section>

      <Separator />

      <LinkManager
        title="Footer Links"
        links={footerLinks}
        onAdd={onAddFooterLink}
        onUpdate={onUpdateFooterLink}
        onRemove={onRemoveFooterLink}
      />

      <Separator />

      <LinkManager
        title="Navigation Links"
        description="Configure the main navigation menu. &quot;Home&quot; is always included automatically as the first link."
        links={navLinks}
        onAdd={onAddNavLink}
        onUpdate={onUpdateNavLink}
        onRemove={onRemoveNavLink}
      />

      <Button 
        onClick={onSave} 
        disabled={isLoading}
        size="sm"
      >
        Save Site Configuration
      </Button>
    </div>
  );
});

LinkManager.displayName = 'LinkManager';
SiteConfigSection.displayName = 'SiteConfigSection';