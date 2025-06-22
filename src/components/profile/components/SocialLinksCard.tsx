import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Globe, Github, Linkedin, Instagram } from 'lucide-react';
import { SocialLinks } from '../hooks/useProfileState';

interface SocialLinksCardProps {
  socialLinks: SocialLinks;
  handleSocialLinkChange: (platform: keyof SocialLinks, value: string) => void;
}

interface SocialFieldProps {
  icon: React.ReactNode;
  label: string;
  platform: keyof SocialLinks;
  value: string;
  placeholder: string;
  onChange: (platform: keyof SocialLinks, value: string) => void;
}

const SocialField = React.memo<SocialFieldProps>(({
  icon,
  label,
  platform,
  value,
  placeholder,
  onChange,
}) => {
  const handleChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(platform, e.target.value);
  }, [platform, onChange]);

  return (
    <div className="space-y-2">
      <Label htmlFor={platform} className="flex items-center gap-2 text-sm font-medium">
        {icon}
        {label}
      </Label>
      <Input
        id={platform}
        type="url"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className="text-sm"
      />
    </div>
  );
});

export const SocialLinksCard = React.memo<SocialLinksCardProps>(({
  socialLinks,
  handleSocialLinkChange,
}) => {
  const socialFields = React.useMemo(() => [
    {
      icon: <Globe className="w-4 h-4" />,
      label: 'Website',
      platform: 'website' as const,
      placeholder: 'https://yourwebsite.com',
    },
    {
      icon: <Github className="w-4 h-4" />,
      label: 'GitHub',
      platform: 'github' as const,
      placeholder: 'https://github.com/username',
    },
    {
      icon: <Linkedin className="w-4 h-4" />,
      label: 'LinkedIn',
      platform: 'linkedin' as const,
      placeholder: 'https://linkedin.com/in/username',
    },
    {
      icon: <Instagram className="w-4 h-4" />,
      label: 'Instagram',
      platform: 'instagram' as const,
      placeholder: 'https://instagram.com/username',
    },
  ], []);

  return (
    <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-card/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold">Social Links</CardTitle>
        <CardDescription>Connect your social media profiles</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {socialFields.map((field) => (
          <SocialField
            key={field.platform}
            icon={field.icon}
            label={field.label}
            platform={field.platform}
            value={socialLinks[field.platform]}
            placeholder={field.placeholder}
            onChange={handleSocialLinkChange}
          />
        ))}
      </CardContent>
    </Card>
  );
});

SocialField.displayName = 'SocialField';
SocialLinksCard.displayName = 'SocialLinksCard';