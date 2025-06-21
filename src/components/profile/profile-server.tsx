import { getCurrentUserProfile } from '@/app/actions/profile';
import { ProfileClient } from './profile-client';
import { redirect } from 'next/navigation';
import { getPublicUrl, unwrap } from '@/lib/data';

export async function ProfileServer() {
  const profileData = await getCurrentUserProfile();

  if (!profileData) {
    redirect('/auth');
  }

  // Get avatar URL using the same pattern as posts
  const avatarUrl = profileData.user.avatarFileId 
    ? await unwrap(getPublicUrl(profileData.user.avatarFileId)) as string 
    : profileData.user.image || null;

  // Add the avatar URL to the profile data
  const profileDataWithAvatar = {
    ...profileData,
    user: {
      ...profileData.user,
      avatarUrl
    }
  };

  return <ProfileClient initialData={profileDataWithAvatar} />;
}