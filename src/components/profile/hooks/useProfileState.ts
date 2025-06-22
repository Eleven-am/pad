import { useState, useCallback } from 'react';
import { File as FileModel } from '@/generated/prisma';

export interface ProfileData {
  name: string;
  email: string;
  bio: string;
  website: string;
  location: string;
  company: string;
  timezone: string;
}

export interface SocialLinks {
  website: string;
  github: string;
  linkedin: string;
  instagram: string;
}

export interface ContentSettings {
  defaultVisibility: string;
  defaultTemplate: string;
  defaultCategory: string;
  enableComments: boolean;
  enableSharing: boolean;
  showReadingTime: boolean;
}

export interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  weeklyDigest: boolean;
  followerNotifications: boolean;
  commentNotifications: boolean;
  mentionNotifications: boolean;
}

export function useProfileState() {
  const [profile, setProfile] = useState<ProfileData>({
    name: "Olivia Martin",
    email: "olivia.martin@example.com",
    bio: "Senior Software Engineer passionate about creating innovative solutions and mentoring junior developers. Love exploring new technologies and contributing to open source projects.",
    website: "https://oliviamartin.dev",
    location: "San Francisco, CA",
    company: "TechCorp Inc.",
    timezone: "Pacific Standard Time (PST)"
  });

  const [profilePicture, setProfilePicture] = useState<FileModel | null>(null);

  const [socialLinks, setSocialLinks] = useState<SocialLinks>({
    website: "https://oliviamartin.dev",
    github: "https://github.com/oliviamartin",
    linkedin: "https://linkedin.com/in/oliviamartin",
    instagram: "https://instagram.com/olivia_codes"
  });

  const [contentSettings, setContentSettings] = useState<ContentSettings>({
    defaultVisibility: "public",
    defaultTemplate: "standard",
    defaultCategory: "technology",
    enableComments: true,
    enableSharing: true,
    showReadingTime: true
  });

  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    emailNotifications: true,
    pushNotifications: false,
    weeklyDigest: true,
    followerNotifications: true,
    commentNotifications: true,
    mentionNotifications: true
  });

  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  // Memoized handlers
  const updateProfile = useCallback((updates: Partial<ProfileData>) => {
    setProfile(prev => ({ ...prev, ...updates }));
  }, []);

  const updateSocialLinks = useCallback((updates: Partial<SocialLinks>) => {
    setSocialLinks(prev => ({ ...prev, ...updates }));
  }, []);

  const updateContentSettings = useCallback((updates: Partial<ContentSettings>) => {
    setContentSettings(prev => ({ ...prev, ...updates }));
  }, []);

  const updateNotificationSettings = useCallback((updates: Partial<NotificationSettings>) => {
    setNotificationSettings(prev => ({ ...prev, ...updates }));
  }, []);

  const handleSocialLinkChange = useCallback((platform: keyof SocialLinks, value: string) => {
    updateSocialLinks({ [platform]: value });
  }, [updateSocialLinks]);

  const handleFileUpload = useCallback((file: FileModel) => {
    setProfilePicture(file);
  }, []);

  return {
    // State
    profile,
    profilePicture,
    socialLinks,
    contentSettings,
    notificationSettings,
    twoFactorEnabled,
    
    // Setters
    setProfile,
    setProfilePicture,
    setSocialLinks,
    setContentSettings,
    setNotificationSettings,
    setTwoFactorEnabled,
    
    // Handlers
    updateProfile,
    updateSocialLinks,
    updateContentSettings,
    updateNotificationSettings,
    handleSocialLinkChange,
    handleFileUpload,
  };
}