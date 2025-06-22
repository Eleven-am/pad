"use client";

import React, { useCallback } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Bell, FileText, Settings, User } from "lucide-react";
import Link from "next/link";
import { useFileId } from "@/hooks/useFileId";

// Optimized components
import { useProfileState } from "./hooks/useProfileState";
import { ProfileCard } from "./components/ProfileCard";
import { SocialLinksCard } from "./components/SocialLinksCard";
import { FormField } from "./components/FormField";

import { ProfileData, ContentSettings, NotificationSettings } from "./hooks/useProfileState";

// Memoized tab content components
const ProfileTabContent = React.memo<{
  profile: ProfileData;
  updateProfile: (updates: Partial<ProfileData>) => void;
}>(({ profile, updateProfile }) => {
  const handleFieldChange = useCallback((field: string) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    updateProfile({ [field]: e.target.value });
  }, [updateProfile]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          label="Full Name"
          id="name"
          value={profile.name}
          onChange={handleFieldChange('name')}
          placeholder="Enter your full name"
        />
        <FormField
          label="Email"
          id="email"
          type="email"
          value={profile.email}
          onChange={handleFieldChange('email')}
          placeholder="Enter your email"
        />
      </div>
      
      <FormField
        label="Bio"
        id="bio"
        as="textarea"
        value={profile.bio}
        onChange={handleFieldChange('bio')}
        placeholder="Tell us about yourself"
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          label="Website"
          id="website"
          type="url"
          value={profile.website}
          onChange={handleFieldChange('website')}
          placeholder="https://yourwebsite.com"
        />
        <FormField
          label="Location"
          id="location"
          value={profile.location}
          onChange={handleFieldChange('location')}
          placeholder="City, Country"
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          label="Company"
          id="company"
          value={profile.company}
          onChange={handleFieldChange('company')}
          placeholder="Your company name"
        />
        <FormField
          label="Timezone"
          id="timezone"
          value={profile.timezone}
          onChange={handleFieldChange('timezone')}
          placeholder="Your timezone"
        />
      </div>
    </div>
  );
});

const ContentTabContent = React.memo<{
  contentSettings: ContentSettings;
  updateContentSettings: (updates: Partial<ContentSettings>) => void;
}>(({ contentSettings, updateContentSettings }) => {
  const handleSelectChange = useCallback((field: string) => (value: string) => {
    updateContentSettings({ [field]: value });
  }, [updateContentSettings]);

  const handleSwitchChange = useCallback((field: string) => (checked: boolean) => {
    updateContentSettings({ [field]: checked });
  }, [updateContentSettings]);

  const visibilityOptions = React.useMemo(() => [
    { value: "public", label: "Public" },
    { value: "private", label: "Private" },
    { value: "draft", label: "Draft" }
  ], []);

  const templateOptions = React.useMemo(() => [
    { value: "standard", label: "Standard" },
    { value: "featured", label: "Featured" },
    { value: "minimal", label: "Minimal" }
  ], []);

  const categoryOptions = React.useMemo(() => [
    { value: "technology", label: "Technology" },
    { value: "lifestyle", label: "Lifestyle" },
    { value: "business", label: "Business" }
  ], []);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Default Visibility</Label>
          <Select 
            value={contentSettings.defaultVisibility} 
            onValueChange={handleSelectChange('defaultVisibility')}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {visibilityOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label>Default Template</Label>
          <Select 
            value={contentSettings.defaultTemplate} 
            onValueChange={handleSelectChange('defaultTemplate')}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {templateOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label>Default Category</Label>
          <Select 
            value={contentSettings.defaultCategory} 
            onValueChange={handleSelectChange('defaultCategory')}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categoryOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Enable Comments</Label>
          <Switch
            checked={contentSettings.enableComments}
            onCheckedChange={handleSwitchChange('enableComments')}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <Label>Enable Sharing</Label>
          <Switch
            checked={contentSettings.enableSharing}
            onCheckedChange={handleSwitchChange('enableSharing')}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <Label>Show Reading Time</Label>
          <Switch
            checked={contentSettings.showReadingTime}
            onCheckedChange={handleSwitchChange('showReadingTime')}
          />
        </div>
      </div>
    </div>
  );
});

const NotificationsTabContent = React.memo<{
  notificationSettings: NotificationSettings;
  updateNotificationSettings: (updates: Partial<NotificationSettings>) => void;
  twoFactorEnabled: boolean;
  setTwoFactorEnabled: (enabled: boolean) => void;
}>(({ notificationSettings, updateNotificationSettings, twoFactorEnabled, setTwoFactorEnabled }) => {
  const handleSwitchChange = useCallback((field: keyof NotificationSettings) => (checked: boolean) => {
    updateNotificationSettings({ [field]: checked });
  }, [updateNotificationSettings]);

  const notificationOptions = React.useMemo(() => [
    { key: 'emailNotifications' as keyof NotificationSettings, label: 'Email Notifications' },
    { key: 'pushNotifications' as keyof NotificationSettings, label: 'Push Notifications' },
    { key: 'weeklyDigest' as keyof NotificationSettings, label: 'Weekly Digest' },
    { key: 'followerNotifications' as keyof NotificationSettings, label: 'New Followers' },
    { key: 'commentNotifications' as keyof NotificationSettings, label: 'Comments' },
    { key: 'mentionNotifications' as keyof NotificationSettings, label: 'Mentions' },
  ], []);

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {notificationOptions.map(option => (
          <div key={option.key} className="flex items-center justify-between">
            <Label>{option.label}</Label>
            <Switch
              checked={notificationSettings[option.key]}
              onCheckedChange={handleSwitchChange(option.key)}
            />
          </div>
        ))}
      </div>
      
      <div className="border-t pt-6">
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-base">Two-Factor Authentication</Label>
            <p className="text-sm text-muted-foreground">
              Add an extra layer of security to your account
            </p>
          </div>
          <Switch
            checked={twoFactorEnabled}
            onCheckedChange={setTwoFactorEnabled}
          />
        </div>
      </div>
    </div>
  );
});

const ProfileTabs = React.memo<{
  profile: ProfileData;
  updateProfile: (updates: Partial<ProfileData>) => void;
  contentSettings: ContentSettings;
  updateContentSettings: (updates: Partial<ContentSettings>) => void;
  notificationSettings: NotificationSettings;
  updateNotificationSettings: (updates: Partial<NotificationSettings>) => void;
  twoFactorEnabled: boolean;
  setTwoFactorEnabled: (enabled: boolean) => void;
}>(({
  profile,
  updateProfile,
  contentSettings,
  updateContentSettings,
  notificationSettings,
  updateNotificationSettings,
  twoFactorEnabled,
  setTwoFactorEnabled,
}) => {
  const saveButtonContent = React.useMemo(() => (
    <div className="mt-6 flex justify-end">
      <Button>Save Changes</Button>
    </div>
  ), []);

  return (
    <Card className="h-full border-0 shadow-lg bg-gradient-to-br from-card to-card/50">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Profile Settings</CardTitle>
        <CardDescription>Manage your profile and preferences</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="profile" className="h-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
            <TabsTrigger value="content" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Content</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              <span className="hidden sm:inline">Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="advanced" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Advanced</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile">
            <ProfileTabContent profile={profile} updateProfile={updateProfile} />
            {saveButtonContent}
          </TabsContent>
          
          <TabsContent value="content">
            <ContentTabContent 
              contentSettings={contentSettings} 
              updateContentSettings={updateContentSettings} 
            />
            {saveButtonContent}
          </TabsContent>
          
          <TabsContent value="notifications">
            <NotificationsTabContent
              notificationSettings={notificationSettings}
              updateNotificationSettings={updateNotificationSettings}
              twoFactorEnabled={twoFactorEnabled}
              setTwoFactorEnabled={setTwoFactorEnabled}
            />
            {saveButtonContent}
          </TabsContent>
          
          <TabsContent value="advanced">
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Account Management</h3>
                <div className="space-y-2">
                  <Link href="/settings">
                    <Button variant="outline" className="w-full justify-start">
                      <Settings className="w-4 h-4 mr-2" />
                      Advanced Settings
                    </Button>
                  </Link>
                  <Button variant="outline" className="w-full justify-start">
                    Export Data
                  </Button>
                  <Button variant="destructive" className="w-full justify-start">
                    Delete Account
                  </Button>
                </div>
              </div>
            </div>
            {saveButtonContent}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
});

export const ProfilePageOptimized = React.memo(() => {
  const {
    profile,
    profilePicture,
    socialLinks,
    contentSettings,
    notificationSettings,
    twoFactorEnabled,
    setTwoFactorEnabled,
    updateProfile,
    updateContentSettings,
    updateNotificationSettings,
    handleSocialLinkChange,
    handleFileUpload,
  } = useProfileState();

  const { url: profilePictureUrl } = useFileId(profilePicture?.id || "");

  const handleCameraClick = useCallback(() => {
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    fileInput?.click();
  }, []);

  return (
    <div className="bg-gradient-to-br from-background to-muted/20">
      <div className="container max-w-5xl mx-auto py-8 px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 min-h-[600px]">
          <div className="md:col-span-1 flex flex-col h-full gap-6">
            <div className="flex-1 flex flex-col">
              <ProfileCard
                name={profile.name}
                email={profile.email}
                profilePictureUrl={profilePictureUrl}
                handleCameraClick={handleCameraClick}
                handleFileUpload={handleFileUpload}
              />
            </div>
            <div>
              <SocialLinksCard
                socialLinks={socialLinks}
                handleSocialLinkChange={handleSocialLinkChange}
              />
            </div>
          </div>
          <div className="md:col-span-2 flex flex-col h-full">
            <ProfileTabs
              profile={profile}
              updateProfile={updateProfile}
              contentSettings={contentSettings}
              updateContentSettings={updateContentSettings}
              notificationSettings={notificationSettings}
              updateNotificationSettings={updateNotificationSettings}
              twoFactorEnabled={twoFactorEnabled}
              setTwoFactorEnabled={setTwoFactorEnabled}
            />
          </div>
        </div>
      </div>
    </div>
  );
});

// Set display names for better debugging
ProfileTabContent.displayName = 'ProfileTabContent';
ContentTabContent.displayName = 'ContentTabContent';
NotificationsTabContent.displayName = 'NotificationsTabContent';
ProfileTabs.displayName = 'ProfileTabs';
ProfilePageOptimized.displayName = 'ProfilePageOptimized';