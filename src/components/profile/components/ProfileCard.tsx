import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera } from 'lucide-react';
import { File as FileModel } from '@/generated/prisma';
import { UploadComponent } from '@/components/upload-component';

interface ProfileCardProps {
  name: string;
  email: string;
  profilePictureUrl?: string;
  handleCameraClick: () => void;
  handleFileUpload: (file: FileModel) => void;
}

export const ProfileCard = React.memo<ProfileCardProps>(({
  name,
  email,
  profilePictureUrl,
  handleCameraClick,
  handleFileUpload,
}) => {
  const avatarFallback = React.useMemo(() => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }, [name]);

  return (
    <Card className="h-full border-0 shadow-lg bg-gradient-to-br from-card to-card/50">
      <CardHeader className="text-center pb-2">
        <div className="relative mx-auto mb-4">
          <Avatar className="w-24 h-24 border-4 border-primary/10">
            <AvatarImage 
              src={profilePictureUrl} 
              alt={name} 
              className="object-cover"
            />
            <AvatarFallback className="text-xl font-semibold bg-primary/5">
              {avatarFallback}
            </AvatarFallback>
          </Avatar>
          <button
            onClick={handleCameraClick}
            className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground p-2 rounded-full shadow-lg hover:bg-primary/90 transition-colors"
            aria-label="Change profile picture"
          >
            <Camera className="w-4 h-4" />
          </button>
        </div>
        <CardTitle className="text-2xl font-bold text-foreground">{name}</CardTitle>
        <CardDescription className="text-muted-foreground">{email}</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="hidden">
          <UploadComponent 
            onFileUpload={handleFileUpload}
            fileTypes={[".jpg", ".jpeg", ".png", ".gif", ".webp"]}
            label="Upload profile picture"
          />
        </div>
      </CardContent>
    </Card>
  );
});

ProfileCard.displayName = 'ProfileCard';