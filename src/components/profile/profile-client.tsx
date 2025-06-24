'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { 
  Calendar,
  Camera,
  FileText
} from 'lucide-react';
import { ProfileData, updateUserProfile, uploadUserAvatar, removeUserAvatar } from '@/app/actions/profile';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

interface ProfileClientProps {
  initialData: ProfileData;
}

export function ProfileClient({ initialData }: ProfileClientProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'social' | 'stats'>('profile');
  const [profileData, setProfileData] = useState({
    name: initialData.user.name || '',
    email: initialData.user.email || '',
    bio: initialData.user.bio || '',
    website: initialData.user.website || '',
    twitter: initialData.user.twitter || '',
    linkedin: initialData.user.linkedin || '',
    github: initialData.user.github || '',
    instagram: initialData.user.instagram || '',
  });

  const handleInputChange = (field: string, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = async () => {
    setIsLoading(true);
    try {
      const result = await updateUserProfile({
        name: profileData.name,
        bio: profileData.bio,
        website: profileData.website,
        twitter: profileData.twitter,
        linkedin: profileData.linkedin,
        github: profileData.github,
        instagram: profileData.instagram,
      });

      if (result.success) {
        toast.success('Profile updated successfully');
        router.refresh();
      } else {
        toast.error(result.error || 'Failed to update profile');
      }
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const result = await uploadUserAvatar(formData);
      if (result.success) {
        toast.success('Avatar uploaded successfully');
        router.refresh();
      } else {
        toast.error(result.error || 'Failed to upload avatar');
      }
    } catch {
      toast.error('Failed to upload avatar');
    } finally {
      setIsUploading(false);
    }
  };

  const _handleRemoveAvatar = async () => {
    if (!confirm('Are you sure you want to remove your avatar?')) return;

    setIsUploading(true);
    try {
      const result = await removeUserAvatar();
      if (result.success) {
        toast.success('Avatar removed successfully');
        router.refresh();
      } else {
        toast.error(result.error || 'Failed to remove avatar');
      }
    } catch {
      toast.error('Failed to remove avatar');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Minimal Background */}
      <div className="fixed inset-0 -z-10">
        {/* Subtle gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-muted/20 to-background" />
      </div>

      {/* Hero Section */}
      <div className="relative container max-w-5xl mx-auto px-4 py-12">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-2xl font-semibold text-foreground mb-1">
            Profile
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage your account settings and public profile
          </p>
        </motion.div>

        {/* Profile Header Card */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8"
        >
          <Card className="border-border/50 shadow-sm">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                {/* Avatar Section */}
                <div className="relative group flex-shrink-0">
                  <Avatar className="h-20 w-20 ring-2 ring-border/50">
                    <AvatarImage 
                      src={initialData.user.avatarUrl || undefined}
                      className="object-cover"
                    />
                    <AvatarFallback className="text-base font-medium bg-muted">
                      {profileData.name?.charAt(0)?.toUpperCase() || profileData.email?.charAt(0)?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <input
                    type="file"
                    id="avatar-upload"
                    className="hidden"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    disabled={isUploading}
                  />
                  <Label htmlFor="avatar-upload">
                    <Button
                      variant="secondary"
                      size="icon"
                      className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full shadow-sm"
                      disabled={isUploading}
                      asChild
                    >
                      <span>
                        <Camera className="h-3 w-3" />
                      </span>
                    </Button>
                  </Label>
                </div>

                {/* User Info */}
                <div className="flex-1">
                  <h2 className="text-xl font-semibold">
                    {profileData.name || 'Your Name'}
                  </h2>
                  <p className="text-sm text-muted-foreground mb-3">{profileData.email}</p>
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      Joined {new Date(initialData.user.createdAt || Date.now()).getFullYear()}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <FileText className="h-3.5 w-3.5" />
                      {initialData.stats.totalPosts} posts
                    </span>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="flex gap-6 ml-auto">
                  <div className="text-center">
                    <div className="text-xl font-semibold">
                      {(initialData.stats.totalPosts || 0).toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Posts
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-semibold">
                      {(initialData.stats.totalReads || 0).toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Reads
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-semibold">
                      {(initialData.stats.totalLikes || 0).toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Likes
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Tab Navigation */}
        <div className="border-b border-border mb-8">
          <div className="flex gap-8">
            {(['profile', 'social', 'stats'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "pb-4 text-sm font-medium transition-colors relative",
                  activeTab === tab
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                {activeTab === tab && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground"
                    initial={false}
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Content Sections */}
        <div>
          {activeTab === 'profile' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">Basic Information</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Display Name</Label>
                      <Input
                        id="name"
                        value={profileData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="Your name"
                        className="border-input"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        value={profileData.email}
                        disabled
                        className="bg-muted"
                      />
                      <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">About</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        value={profileData.bio}
                        onChange={(e) => handleInputChange('bio', e.target.value)}
                        placeholder="Tell the world about yourself..."
                        rows={5}
                        className="border-input resize-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'social' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">Professional Links</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="website">Website</Label>
                      <Input
                        id="website"
                        type="url"
                        value={profileData.website}
                        onChange={(e) => handleInputChange('website', e.target.value)}
                        placeholder="https://your-website.com"
                        className="border-input"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="linkedin">LinkedIn</Label>
                      <Input
                        id="linkedin"
                        value={profileData.linkedin}
                        onChange={(e) => handleInputChange('linkedin', e.target.value)}
                        placeholder="linkedin.com/in/username"
                        className="border-input"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">Social Media</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="twitter">Twitter/X</Label>
                      <Input
                        id="twitter"
                        value={profileData.twitter}
                        onChange={(e) => handleInputChange('twitter', e.target.value)}
                        placeholder="@username"
                        className="border-input"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="github">GitHub</Label>
                      <Input
                        id="github"
                        value={profileData.github}
                        onChange={(e) => handleInputChange('github', e.target.value)}
                        placeholder="@username"
                        className="border-input"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="instagram">Instagram</Label>
                      <Input
                        id="instagram"
                        value={profileData.instagram}
                        onChange={(e) => handleInputChange('instagram', e.target.value)}
                        placeholder="@username"
                        className="border-input"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'stats' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="col-span-1">
                <h3 className="text-lg font-medium mb-4">Overview</h3>
                <div className="space-y-4">
                  <div className="pb-4 border-b">
                    <p className="text-sm text-muted-foreground">Total Content</p>
                    <p className="text-2xl font-semibold">{initialData.stats.totalPosts} posts</p>
                  </div>
                  <div className="pb-4 border-b">
                    <p className="text-sm text-muted-foreground">Total Reach</p>
                    <p className="text-2xl font-semibold">{(initialData.stats.totalReads || 0).toLocaleString()} reads</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Engagement</p>
                    <p className="text-2xl font-semibold">{(initialData.stats.totalLikes || 0).toLocaleString()} likes</p>
                  </div>
                </div>
              </div>
              
              <div className="col-span-1 lg:col-span-2">
                <h3 className="text-lg font-medium mb-4">Performance Details</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-3">Content Metrics</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Posts Published</span>
                        <span className="text-sm font-medium">{initialData.stats.totalPosts}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Avg. Reads per Post</span>
                        <span className="text-sm font-medium">
                          {Math.round((initialData.stats.totalReads || 0) / Math.max(initialData.stats.totalPosts || 1, 1))}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Most Active Day</span>
                        <span className="text-sm font-medium">Monday</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-3">Engagement Metrics</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Total Likes</span>
                        <span className="text-sm font-medium">{initialData.stats.totalLikes}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Engagement Rate</span>
                        <span className="text-sm font-medium">
                          {Math.round(((initialData.stats.totalLikes || 0) / Math.max(initialData.stats.totalReads || 1, 1)) * 100)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Avg. Reading Time</span>
                        <span className="text-sm font-medium">3.2 min</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Save Button */}
        <div className="mt-8">
          <Button
            onClick={handleSaveProfile}
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </div>
  );
}